import { NextResponse } from 'next/server'

const RPC_URL =
  process.env.NEXT_PUBLIC_INK_RPC || 'https://rpc-gel.inkonchain.com'

const BLOCKSCOUT_BASE = 'https://explorer.inkonchain.com/api/v2'

type TokenHolding = {
  address: string
  symbol: string
  decimals: number
  rawBalance: string
  balance: number
  priceUsd?: number
  valueUsd?: number
  iconUrl?: string
}


async function getNativeBalance(address: string): Promise<number> {
  try {
    const res = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
      }),
    })

    const data = await res.json()
    if (!data.result) return 0

    return Number(BigInt(data.result)) / 1e18
  } catch {
    return 0
  }
}

async function fetchErc20Tokens(address: string): Promise<TokenHolding[]> {
  try {
    const res = await fetch(
      `${BLOCKSCOUT_BASE}/addresses/${address}/tokens?type=ERC-20`,
      {
        next: { revalidate: 30 },
      },
    )

    if (!res.ok) {
      console.error('blockscout error status', res.status)
      return []
    }

    const data = await res.json()

    if (!Array.isArray(data.items)) return []

    return data.items.map((item: any, idx: number) => {
      const token = item.token || {}
      const raw = String(item.value ?? '0')
      const decimals = Number(token.decimals ?? 18)

      let balance = 0
      try {
        balance = Number(BigInt(raw)) / 10 ** decimals
      } catch {
        balance = 0
      }

      // try all possible address fields from blockscout
      const rawAddr =
        token.address ||
        token.address_hash ||
        token.contractAddress ||
        item.token_address ||
        item.address ||
        item.contract_address ||
        ''

      let addr = String(rawAddr).toLowerCase()
      const symbol = String(token.symbol || '')

      // logo from explorer if available
      const iconUrl = typeof token.icon_url === 'string' ? token.icon_url : ''

      // backup fix for anita if explorer still misses it
      if (!addr && symbol.toUpperCase() === 'ANITA') {
        addr = '0x0606fc632ee812ba970af72f8489baaa443c4b98'.toLowerCase()
      }

      return {
        address: addr,
        symbol,
        decimals,
        rawBalance: raw,
        balance,
        iconUrl,
      }

    })
  } catch (err) {
    console.error('blockscout fetch failed', err)
    return []
  }
}

async function getEthUsdPrice(): Promise<number> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
      { next: { revalidate: 60 } },
    )

    if (!res.ok) {
      console.error('price api status', res.status)
      return 0
    }

    const data = await res.json()
    const price = data.ethereum?.usd
    if (typeof price !== 'number') return 0
    return price
  } catch (err) {
    console.error('price api failed', err)
    return 0
  }
}

type TokenMarketData = {
  priceUsd: number
  logoUrl?: string
}

async function getTokenMarketData(address: string): Promise<TokenMarketData> {
  try {
    if (!address) {
      return { priceUsd: 0 }
    }

    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${address}`,
      { next: { revalidate: 60 } },
    )

    if (!res.ok) {
      console.error('dexscreener status', res.status)
      return { priceUsd: 0 }
    }

    const data = await res.json()
    const pair = Array.isArray(data.pairs) ? data.pairs[0] : undefined
    if (!pair) {
      return { priceUsd: 0 }
    }

    const price = Number(pair.priceUsd || 0)
    const info = pair.info || {}
    const logoUrl =
      typeof info.imageUrl === 'string' && info.imageUrl.length > 0
        ? info.imageUrl
        : undefined

    return {
      priceUsd: Number.isFinite(price) ? price : 0,
      logoUrl,
    }
  } catch (err) {
    console.error('dexscreener failed', err)
    return { priceUsd: 0 }
  }
}


export async function GET(req: Request) {
  const url = new URL(req.url)
  const wallet = url.searchParams.get('wallet')

  if (!wallet) {
    return NextResponse.json(
      { error: 'wallet param is required' },
      { status: 400 },
    )
  }

  const [nativeInk, tokens, ethUsd] = await Promise.all([
    getNativeBalance(wallet),
    fetchErc20Tokens(wallet),
    getEthUsdPrice(),
  ])

  const stableSymbols = new Set(['USDC', 'USDT', 'DAI', 'GHO', 'FRAX', 'SUSD'])

  // fetch usd prices and logos for tokens that have an address
  const addrList = Array.from(
    new Set(
      tokens
        .map((t) => t.address)
        .filter((addr) => addr && addr !== 'native'),
    ),
  ).slice(0, 20)

  const marketResults = await Promise.all(
    addrList.map((addr) => getTokenMarketData(addr)),
  )

  const priceMap: Record<string, number> = {}
  const logoMap: Record<string, string> = {}

  addrList.forEach((addr, i) => {
    const m = marketResults[i]
    if (!m) return
    priceMap[addr] = m.priceUsd || 0
    if (m.logoUrl) {
      logoMap[addr] = m.logoUrl
    }
  })


  // attach price, usd value, and optional dex logo to each token
  const pricedTokens: TokenHolding[] = tokens.map((t) => {
    const upper = t.symbol.toUpperCase()
    let price = priceMap[t.address] || 0

    if (stableSymbols.has(upper) && price === 0) {
      price = 1
    }

    const value = price > 0 ? t.balance * price : 0

    // prefer explorer icon, fall back to dexscreener logo if missing
    const iconUrl = t.iconUrl && t.iconUrl.length > 0
      ? t.iconUrl
      : logoMap[t.address] || undefined

    return {
      ...t,
      priceUsd: price,
      valueUsd: value,
      iconUrl,
    }
  })


// total usd value for stables
const stablesUsd = pricedTokens
  .filter((t) => stableSymbols.has(t.symbol.toUpperCase()))
  .reduce((sum, t) => sum + (t.valueUsd || 0), 0)

// native eth usd
const nativeUsd = nativeInk * ethUsd

// total usd for all tokens (including stables)
const tokensUsd = pricedTokens.reduce(
  (sum, t) => sum + (t.valueUsd || 0),
  0,
)

// final total value
const totalValueUsd = nativeUsd + tokensUsd


  const portfolio = {
    mock: false,
    address: wallet,

    totalValueUsd,

    balances: {
      nativeInk,
      stables: stablesUsd,
      lpTokens: 0,
    },

    vaults: [],
    vaultDepositsUsd: 0,
    unclaimedYieldUsd: 0,

    tokens: pricedTokens,
  }

  return NextResponse.json(portfolio)
}
