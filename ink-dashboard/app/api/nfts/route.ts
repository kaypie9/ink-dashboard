import { NextResponse } from 'next/server'

const BLOCKSCOUT_BASE = 'https://explorer.inkonchain.com/api/v2'

async function fetchCollections(wallet: string) {
  try {
    const res = await fetch(
      `${BLOCKSCOUT_BASE}/addresses/${wallet}/nft/collections?type=ERC-721`
    )
    const json = await res.json()

    const items = Array.isArray(json.items)
      ? json.items
      : Array.isArray(json.collections)
      ? json.collections
      : []

    return items.map((i: any) => {
      const token = i.token || {}
      const addr =
        token.address ||
        token.address_hash ||
        i.contract_address ||
        i.address ||
        ''

      const owned =
        Number(i.amount ?? i.value ?? i.owned_token_count ?? 0) || 0

      const instances =
        Array.isArray(i.token_instances)
          ? i.token_instances
          : Array.isArray(i.tokenInstances)
          ? i.tokenInstances
          : []

      const tokens = instances.map((t: any) => {
        const id = String(t.token_id ?? t.id ?? '')
        const meta =
          t.metadata || t.token_metadata || t.token || t || {}

        const img =
          meta.image_url ||
          meta.imageUrl ||
          t.image_url ||
          undefined

        return {
          contract: addr.toLowerCase(),
          tokenId: id,
          name: meta.name || `#${id}`,
          imageUrl: img
        }
      })

      return {
        address: addr.toLowerCase(),
        name: token.name || 'unknown collection',
        symbol: token.symbol || '',
        ownedCount: owned,
        tokens
      }
    })
  } catch (err) {
    return []
  }
}

async function fetchTotalSpent(wallet: string) {
  try {
    const txRes = await fetch(
      `${BLOCKSCOUT_BASE}/addresses/${wallet}/transactions?filter=token_transfer,erc721`
    )
    const json = await txRes.json()

    let totalInk = 0
    const perCol: Record<string, number> = {}

    json.items.forEach((tx: any) => {
      const incoming = tx.to?.hash?.toLowerCase() === wallet.toLowerCase()
      const val = Number(tx.value || 0)

      if (incoming && val > 0) {
        const ink = val / 1e18
        totalInk += ink

        const addr =
          tx.token?.contract?.address ||
          tx.contract_address ||
          tx.to?.hash

        if (addr) {
          const c = addr.toLowerCase()
          perCol[c] = (perCol[c] || 0) + ink
        }
      }
    })

    const pRes = await fetch(`https://api.inkonchain.com/v1/price`)
    const price = await pRes.json()
    const usd = price.usd || 0

    const perColUsd: Record<string, number> = {}
    Object.keys(perCol).forEach(a => {
      perColUsd[a] = perCol[a] * usd
    })

    return {
      totalSpentUsd: totalInk * usd,
      perCollectionSpentUsd: perColUsd
    }
  } catch (err) {
    return {
      totalSpentUsd: 0,
      perCollectionSpentUsd: {}
    }
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const wallet = url.searchParams.get('wallet')

  if (!wallet) {
    return NextResponse.json({ error: 'wallet missing' }, { status: 400 })
  }

  const collections = await fetchCollections(wallet)
  const spent = await fetchTotalSpent(wallet)

  return NextResponse.json({
    address: wallet,
    collections,
    totalSpentUsd: spent.totalSpentUsd,
    perCollectionSpentUsd: spent.perCollectionSpentUsd
  })
}
