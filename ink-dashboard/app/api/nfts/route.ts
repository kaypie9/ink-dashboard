import { NextResponse } from 'next/server'

const BLOCKSCOUT_BASE = 'https://explorer.inkonchain.com/api/v2'

type NftToken = {
  contract: string
  tokenId: string
  name: string
  imageUrl?: string
}

type NftCollection = {
  address: string
  name: string
  symbol: string
  ownedCount: number
  tokens: NftToken[]
}

async function fetchNftCollections(address: string): Promise<NftCollection[]> {
  try {
    const res = await fetch(
      `${BLOCKSCOUT_BASE}/addresses/${address}/nft/collections?type=ERC-721`,
      {
        next: { revalidate: 30 },
      },
    )

    if (!res.ok) {
      console.error('blockscout nft collections status', res.status)
      return []
    }

    const data = await res.json()

    const items = Array.isArray(data.items)
      ? data.items
      : Array.isArray((data as any).collections)
      ? (data as any).collections
      : []

    return items.map((item: any) => {
      const token = item.token || {}

      const addrRaw =
        token.address ||
        token.address_hash ||
        item.contract_address ||
        item.address ||
        ''

      const addr = String(addrRaw).toLowerCase()

      const amountStr = String(
        item.amount ?? item.value ?? item.owned_token_count ?? '0',
      )
      const owned = Number(amountStr)
      const ownedCount = Number.isFinite(owned) ? owned : 0

      const instances =
        Array.isArray(item.token_instances) && item.token_instances.length > 0
          ? item.token_instances
          : Array.isArray((item as any).tokenInstances)
          ? (item as any).tokenInstances
          : []

      const tokens: NftToken[] = instances.map((inst: any) => {
        const id = String(inst.token_id ?? inst.id ?? '')
        const meta =
          inst.metadata ||
          inst.token_metadata ||
          inst.token ||
          inst ||
          {}

        const img =
          typeof meta.image_url === 'string'
            ? meta.image_url
            : typeof meta.imageUrl === 'string'
            ? meta.imageUrl
            : typeof inst.image_url === 'string'
            ? inst.image_url
            : undefined

        const nameRaw = meta.name || `#${id}`

        return {
          contract: addr,
          tokenId: id,
          name: String(nameRaw),
          imageUrl: img,
        }
      })

      return {
        address: addr,
        name: String(token.name || 'unknown collection'),
        symbol: String(token.symbol || ''),
        ownedCount,
        tokens,
      }
    })
  } catch (err) {
    console.error('blockscout nft collections fetch failed', err)
    return []
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

  const collections = await fetchNftCollections(wallet)

  return NextResponse.json({
    address: wallet,
    collections,
  })
}
