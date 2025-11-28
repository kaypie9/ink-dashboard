import { NextResponse } from 'next/server'

const BLOCKSCOUT_BASE = 'https://explorer.inkonchain.com/api/v2'

type TxToken = {
  symbol: string
  address: string
}

type TxItem = {
  hash: string
  timestamp: number
  direction: 'in' | 'out' | 'self'
  from: string
  to: string
  otherParty: string
  valueInk: number
  gasFeeInk: number
  gasFeeUsd: number
  details: string
  hasNft: boolean
  status: string
  tokens: TxToken[]
}

function addr(x: any): string {
  if (!x) return ''
  if (typeof x === 'string') return x.toLowerCase()
  if (typeof x.hash === 'string') return x.hash.toLowerCase()
  return ''
}

let cachedEthUsd = 0
let cachedEthUsdTs = 0

async function fetchEthUsd(): Promise<number> {
  try {
    const now = Date.now()
    if (cachedEthUsd > 0 && now - cachedEthUsdTs < 60_000) {
      return cachedEthUsd
    }

    const res = await fetch(
      'https://api.coinbase.com/v2/prices/ETH-USD/spot'
    )
    const json = await res.json()
    const val = Number(json?.data?.amount || 0) || 0
    if (val > 0) {
      cachedEthUsd = val
      cachedEthUsdTs = now
    }
    return val
  } catch (e) {
    console.error('fetchEthUsd failed', e)
    return 0
  }
}

function extractArray(json: any): any[] {
  if (!json) return []
  if (Array.isArray(json.items)) return json.items
  if (Array.isArray(json.transactions)) return json.transactions
  if (Array.isArray(json.transfers)) return json.transfers
  if (Array.isArray(json.token_transfers)) return json.token_transfers
  if (Array.isArray(json)) return json
  return []
}

// follow Blockscout next_page_params to fetch all pages
async function fetchAllPages(
  path: string,
  maxItems = 2000
): Promise<any[]> {
  const all: any[] = []
  let url = `${BLOCKSCOUT_BASE}${path}?items_count=50`
  let safety = 0

  while (url && safety < 50 && all.length < maxItems) {
    const res = await fetch(url)
    if (!res.ok) break

    const json = await res.json().catch(() => ({} as any))
    const pageItems = extractArray(json)
    if (!pageItems.length) break

    all.push(...pageItems)

    const next = (json as any).next_page_params
    if (
      !next ||
      typeof next !== 'object' ||
      Object.keys(next).length === 0
    ) {
      break
    }

    const params = new URLSearchParams()
    Object.entries(next).forEach(([k, v]) => {
      if (v == null || v === '') return
      params.set(k, String(v))
    })
    if (!params.has('items_count')) params.set('items_count', '50')

    url = `${BLOCKSCOUT_BASE}${path}?${params.toString()}`
    safety += 1
  }

  return all
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const wallet = url.searchParams.get('wallet')
  const pageParam = url.searchParams.get('page')

  // token filter from query
  const tokenFilterRaw =
    url.searchParams.get('token') ||
    url.searchParams.get('tokenSymbol') ||
    url.searchParams.get('tokenAddress')

  const tokenFilter = tokenFilterRaw ? tokenFilterRaw.toLowerCase() : ''

  if (!wallet) {
    return NextResponse.json({
      address: '',
      page: 1,
      hasMore: false,
      txs: [] as TxItem[],
      tokens: [] as TxToken[],
    })
  }

  const addrLc = wallet.toLowerCase()
  const page = Math.max(1, Number(pageParam || '1') || 1)
  const pageSize = 25

  try {
    const [items, transfersArr, ethUsd] = await Promise.all([
      fetchAllPages(`/addresses/${wallet}/transactions`, 5000),
      fetchAllPages(`/addresses/${wallet}/token-transfers`, 10000),
      fetchEthUsd(),
    ])

    // map tx hash -> transfers[]
    const transfersByTx: Record<string, any[]> = {}
    for (const tr of transfersArr) {
      const h = String(
        tr.tx_hash || tr.transaction_hash || tr.hash || ''
      ).toLowerCase()
      if (!h) continue
      if (!transfersByTx[h]) transfersByTx[h] = []
      transfersByTx[h].push(tr)
    }

    // map hash -> base tx from /transactions
    const txByHash: Record<string, any> = {}
    for (const tx of items) {
      const h = String(tx.hash || tx.tx_hash || '').toLowerCase()
      if (!h) continue
      txByHash[h] = tx
    }

    // add synthetic base txs for transfer only hashes
    for (const [hashLc, list] of Object.entries(transfersByTx)) {
      if (txByHash[hashLc]) continue

      const first = list[0]
      txByHash[hashLc] = {
        hash:
          first.tx_hash ||
          first.transaction_hash ||
          first.hash ||
          hashLc,
        from: first.from,
        to: first.to,
        timestamp:
          first.timestamp ??
          first.time ??
          first.block_timestamp ??
          null,
        value: 0,
        fee: 0,
        status: 'ok',
      }
    }

    // build array from union and sort by time desc
    const baseTxs: any[] = Object.values(txByHash)

    baseTxs.sort((a, b) => {
      const aRaw = a.timestamp ?? a.time ?? a.block_timestamp ?? 0
      const bRaw = b.timestamp ?? b.time ?? b.block_timestamp ?? 0

      const aTs =
        typeof aRaw === 'number'
          ? aRaw * 1000
          : aRaw
          ? new Date(aRaw).getTime()
          : 0
      const bTs =
        typeof bRaw === 'number'
          ? bRaw * 1000
          : bRaw
          ? new Date(bRaw).getTime()
          : 0

      return bTs - aTs
    })

    // build all txs from baseTxs
    const allTxs: TxItem[] = baseTxs.map((tx: any) => {
      const hash = String(tx.hash || tx.tx_hash || '')
      const hashLc = hash.toLowerCase()

      const from = addr(tx.from)
      const to = addr(tx.to)

      let direction: 'in' | 'out' | 'self' = 'out'
      if (from === addrLc && to === addrLc) direction = 'self'
      else if (to === addrLc) direction = 'in'
      else direction = 'out'

      const otherParty = direction === 'in' ? from : to

      const tsRaw = tx.timestamp ?? tx.time ?? tx.block_timestamp ?? null
      const ts =
        typeof tsRaw === 'number'
          ? tsRaw * 1000
          : tsRaw
          ? new Date(tsRaw).getTime()
          : Date.now()

      const rawVal =
        tx.value?.value != null ? tx.value.value : tx.value ?? 0
      const valueInk = Number(rawVal) / 1e18

      const feeRaw =
        tx.fee?.value != null ? tx.fee.value : tx.tx_fee ?? tx.fee ?? 0
      const gasFeeInk = Number(feeRaw) / 1e18
      const gasFeeUsd = ethUsd > 0 ? gasFeeInk * ethUsd : 0

      const status = tx.status || tx.tx_status || 'ok'

      const list = transfersByTx[hashLc] || []
      const outParts: string[] = []
      const inParts: string[] = []
      let hasNft = false
      const tokenMap: Record<string, TxToken> = {}

      for (const tr of list) {
        const fromT = addr(tr.from)
        const toT = addr(tr.to)

        let dir: 'in' | 'out' | 'self' = 'out'
        if (fromT === addrLc && toT === addrLc) dir = 'self'
        else if (toT === addrLc) dir = 'in'
        else dir = 'out'

        const typeRaw = String(
          tr.type || tr.token_type || tr.token?.type || ''
        ).toUpperCase()

        const isNft = typeRaw.includes('721') || typeRaw.includes('1155')
        if (isNft) hasNft = true

        const tokenAddr = String(
          tr.token?.address_hash ||
            tr.token?.address ||
            tr.contract_address ||
            tr.token_address ||
            tr.contract?.address ||
            ''
        ).toLowerCase()

        const symbol = tr.token?.symbol || 'TOKEN'
        if (tokenAddr) {
          tokenMap[tokenAddr] = {
            symbol,
            address: tokenAddr,
          }
        }

        const decimals = Number(tr.token?.decimals ?? 18)
        const rawAmount =
          tr.total?.value ??
          tr.value ??
          tr.amount ??
          tr.token_value ??
          0

        let part = ''

        if (isNft) {
          const id = tr.token_id ?? tr.id ?? tr.tokenId ?? ''
          if (dir === 'out') part = `Sent ${symbol} #${id}`
          else if (dir === 'in') part = `Received ${symbol} #${id}`
          else part = `${symbol} #${id}`
        } else {
          const denom = decimals > 0 ? Math.pow(10, decimals) : 1
          const amt = Number(rawAmount) / denom
          if (!amt || !isFinite(amt)) continue

          const amtStr = amt >= 1 ? amt.toFixed(4) : amt.toFixed(8)
          if (dir === 'out') part = `Sent ${parseFloat(amtStr)} ${symbol}`
          else if (dir === 'in')
            part = `Received ${parseFloat(amtStr)} ${symbol}`
          else part = `${parseFloat(amtStr)} ${symbol}`
        }

        if (!part) continue
        if (dir === 'out') outParts.push(part)
        else if (dir === 'in') inParts.push(part)
      }

      let details = [...outParts, ...inParts].join('; ')

      // approvals - if no token transfers but method looks like approve, attach token by contract address
      if (Object.keys(tokenMap).length === 0) {
        const method = String(
          tx.method || tx.call_method || ''
        ).toLowerCase()

        if (
          method.includes('approve') ||
          method.includes('increaseallowance') ||
          method.includes('decreaseallowance')
        ) {
          const tokenAddr = addr(tx.to)
          if (tokenAddr) {
            const symbol =
              tx.token?.symbol ||
              tx.token_symbol ||
              'TOKEN'

            tokenMap[tokenAddr] = {
              symbol,
              address: tokenAddr,
            }

            if (!details) {
              details = `Approve ${symbol}`
            }
          }
        }
      }

      const tokens = Object.values(tokenMap)

      return {
        hash,
        timestamp: ts,
        direction,
        from,
        to,
        otherParty,
        valueInk,
        gasFeeInk,
        gasFeeUsd,
        details,
        hasNft,
        status,
        tokens,
      }
    })

    // build global token index from allTxs
    const tokenIndexMap: Record<string, TxToken> = {}
    for (const tx of allTxs) {
      for (const t of tx.tokens) {
        const addrKey = (t.address || '').toLowerCase()
        if (!addrKey) continue
        if (!tokenIndexMap[addrKey]) {
          tokenIndexMap[addrKey] = {
            symbol: t.symbol,
            address: addrKey,
          }
        }
      }
    }
    const allTokens: TxToken[] = Object.values(tokenIndexMap)

    // token filter on full list
    let filteredTxs = allTxs

    if (tokenFilter) {
      const tf = tokenFilter
      const isAddress = tf.startsWith('0x')

      filteredTxs = allTxs.filter((tx) =>
        tx.tokens.some((t) => {
          const symLc = (t.symbol || '').toLowerCase()
          const addrLcToken = (t.address || '').toLowerCase()

          if (isAddress) {
            // searched by contract, match address only
            return addrLcToken === tf
          }

          // fallback: searched by symbol
          return symLc === tf
        })
      )
    }

    // paginate after filtering
    const total = filteredTxs.length
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const slice = filteredTxs.slice(start, end)
    const hasMore = end < total

    return NextResponse.json({
      address: wallet,
      page,
      hasMore,
      txs: slice,
      tokens: allTokens,
    })
  } catch (e) {
    console.error('transactions fetch crashed', e)
    return NextResponse.json({
      address: wallet,
      page,
      hasMore: false,
      txs: [] as TxItem[],
      tokens: [] as TxToken[],
    })
  }
}
