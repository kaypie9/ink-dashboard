// app/api/history/route.ts

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const ONE_HOUR_MS = 60 * 60 * 1000
const ONE_DAY_MS = 24 * ONE_HOUR_MS

type RangeKey = '1w' | '1m' | '1y'

function getRangeConfig(rangeParam: string | null) {
  let key: RangeKey = '1w'
  if (rangeParam === '1m' || rangeParam === '1y') {
    key = rangeParam
  }

  if (key === '1w') {
    return {
      key,
      totalHours: 24 * 7,      // show last 7 days
      bucketMs: ONE_HOUR_MS,   // 1 hour candles
    }
  }

  if (key === '1m') {
    return {
      key,
      totalHours: 24 * 30,     // last 30 days
      bucketMs: ONE_DAY_MS,    // 1 day candles
    }
  }

  // 1y
  return {
    key: '1y',
    totalHours: 24 * 365,      // last 365 days
    bucketMs: ONE_DAY_MS,      // 1 day candles
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const wallet = url.searchParams.get('wallet')
  const rangeParam = url.searchParams.get('range')

  if (!wallet) {
    return NextResponse.json(
      { error: 'wallet param is required' },
      { status: 400 },
    )
  }

  const { totalHours, bucketMs } = getRangeConfig(rangeParam)

  try {
    const now = Date.now()
    const fromMs = now - totalHours * ONE_HOUR_MS
    const fromIso = new Date(fromMs).toISOString()

    const { data, error } = await supabaseAdmin
      .from('wallet_networth_snapshots')
      .select('net_worth_usd, taken_at')
      .eq('wallet_address', wallet.toLowerCase())
      .gte('taken_at', fromIso)
      .order('taken_at', { ascending: true })

    if (error) {
      console.error('history query error', error)
      return NextResponse.json(
        { error: 'history query failed' },
        { status: 500 },
      )
    }

    const rows =
      (data || []).map((row: any) => ({
        t: new Date(row.taken_at).getTime(),
        v: Number(row.net_worth_usd ?? 0),
      })) ?? []

    const points: { timestamp: string; value_usd: number }[] = []

    if (rows.length === 0) {
      // no data yet  flat line
      for (let t = fromMs; t <= now; t += bucketMs) {
        points.push({
          timestamp: new Date(t).toISOString(),
          value_usd: 0,
        })
      }
      return NextResponse.json(points)
    }

    let rowIndex = 0
    let lastValue = rows[0].v

    for (let t = fromMs; t <= now; t += bucketMs) {
      while (rowIndex < rows.length && rows[rowIndex].t <= t) {
        lastValue = rows[rowIndex].v
        rowIndex += 1
      }

      points.push({
        timestamp: new Date(t).toISOString(),
        value_usd: lastValue,
      })
    }

    // remove leading zeros so chart starts at first real value
    const firstNonZeroIndex = points.findIndex((p) => p.value_usd > 0)
    const trimmed =
      firstNonZeroIndex > 0 ? points.slice(firstNonZeroIndex) : points

    return NextResponse.json(trimmed)
  } catch (err) {
    console.error('history api crashed', err)
    return NextResponse.json(
      { error: 'history api error' },
      { status: 500 },
    )
  }
}
