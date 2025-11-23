import type { PortfolioSummary } from '@/lib/portfolio'

type WalletTokenLite = {
  symbol: string
  valueUsd?: number
}

type PortfolioWithTokens = PortfolioSummary & {
  tokens?: WalletTokenLite[]
}

function formatUsd(v: number) {
  if (!v || isNaN(v)) return '$0.00'
  return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

export function PortfolioComposition({
  portfolio,
}: {
  portfolio: PortfolioWithTokens
}) {
  const total = portfolio.totalValueUsd || 0
  const tokens = portfolio.tokens ?? []

  const tokensUsd = tokens.reduce((sum, t) => sum + (t.valueUsd || 0), 0)
  let nativeUsd = total - tokensUsd
  if (!isFinite(nativeUsd) || nativeUsd < 0.01) nativeUsd = 0

  type Slice = {
    label: string
    valueUsd: number
  }

  const slices: Slice[] = []

  if (nativeUsd > 0) slices.push({ label: 'ETH', valueUsd: nativeUsd })

  tokens.forEach((t) => {
    const v = t.valueUsd ?? 0
    if (v > 0.01) slices.push({ label: t.symbol, valueUsd: v })
  })

  if (!total || total <= 0 || slices.length === 0) {
    return (
      <div className='text-xs text-slate-400'>
        no usd-valued tokens detected yet.
      </div>
    )
  }

  slices.sort((a, b) => b.valueUsd - a.valueUsd)

  const colors = [
    'bg-violet-500',
    'bg-emerald-500',
    'bg-sky-500',
    'bg-amber-500',
    'bg-fuchsia-500',
    'bg-cyan-500',
  ]

  return (
    <div className='space-y-4 text-xs'>
      {/* stacked bar */}
      <div className='h-3 w-full overflow-hidden rounded-full bg-slate-800'>
        <div className='flex h-full w-full'>
          {slices.map((slice, idx) => {
            const pct = (slice.valueUsd / total) * 100
            const width = Math.max(pct, 4)
            const color = colors[idx % colors.length]
            return (
              <div
                key={slice.label + idx}
                className={color}
                style={{ width: `${width}%` }}
              />
            )
          })}
        </div>
      </div>

      {/* legend */}
      <div className='space-y-2'>
        {slices.map((slice, idx) => {
          const pct = (slice.valueUsd / total) * 100
          const color = colors[idx % colors.length]

          return (
            <div
              key={slice.label + idx}
              className='flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2'
            >
              <div className='flex items-center gap-2'>
                <span className={`h-3 w-3 rounded-full ${color}`} />
                <span className='text-slate-200'>{slice.label}</span>
              </div>

              <div className='flex items-center gap-4 text-right'>
                <span className='text-slate-300'>{formatUsd(slice.valueUsd)}</span>
                <span className='text-slate-500'>
                  {pct.toFixed(1)}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
