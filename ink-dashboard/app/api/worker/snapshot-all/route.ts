import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const APP_URL =
  process.env.APP_BASE_URL || 'http://localhost:3000'

async function getNetWorthUsdForWallet(wallet: string): Promise<number> {
  try {
    const url = `${APP_URL}/api/portfolio?wallet=${wallet}`
    const res = await fetch(url)

    if (!res.ok) {
      console.error('worker portfolio status', res.status)
      return 0
    }

    const json: any = await res.json()
    const raw =
      json.totalValueUsd ??
      json.total_value_usd ??
      0

    const value = Number(raw)
    return Number.isFinite(value) ? value : 0
  } catch (err) {
    console.error(
      'worker getNetWorthUsdForWallet error',
      wallet,
      err,
    )
    return 0
  }
}

export async function POST() {
  try {
    const { data: wallets, error } = await supabaseAdmin
      .from('tracked_wallets')
      .select('wallet_address')

    if (error) {
      console.error('load tracked wallets error', error)
      return NextResponse.json(
        { error: 'load tracked wallets failed' },
        { status: 500 },
      )
    }

    if (!wallets || wallets.length === 0) {
      return NextResponse.json({ ok: true, processed: 0 })
    }

    let processed = 0

    for (const row of wallets) {
      const wallet = (row as any).wallet_address as string
      if (!wallet) continue

      try {
        const netWorthUsd = await getNetWorthUsdForWallet(wallet)

        await supabaseAdmin
          .from('wallet_networth_snapshots')
          .insert({
            wallet_address: wallet.toLowerCase(),
            net_worth_usd: netWorthUsd,
          })

        processed += 1
      } catch (err) {
        console.error(
          'worker snapshot failed for wallet',
          wallet,
          err,
        )
      }
    }

    return NextResponse.json({ ok: true, processed })
  } catch (err) {
    console.error('worker snapshot-all error', err)
    return NextResponse.json(
      { error: 'internal worker error' },
      { status: 500 },
    )
  }
}
