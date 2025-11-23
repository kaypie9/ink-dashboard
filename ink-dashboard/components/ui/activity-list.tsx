'use client'

type ActivityListProps = {
  items: any[]
}

function directionMeta(item: any) {
  const dir = String(item.direction || item.type || '').toLowerCase()

  if (dir === 'in' || dir === 'received') {
    return {
      label: 'in',
      badgeClass:
        'bg-emerald-500/10 text-emerald-300 border-emerald-500/40',
      iconClass: 'rotate-90',
    }
  }

  return {
    label: 'out',
    badgeClass: 'bg-rose-500/10 text-rose-300 border-rose-500/40',
    iconClass: '-rotate-90',
  }
}

export function ActivityList({ items }: ActivityListProps) {
  if (!items || items.length === 0) {
    return (
      <p className='text-xs text-slate-500'>
        no recent onchain transfers detected for this wallet yet.
      </p>
    )
  }

  return (
    <div className='divide-y divide-slate-900 rounded-2xl border border-slate-800 bg-slate-950/70 text-xs'>
      {items.map((item, idx) => {
        const meta = directionMeta(item)

        const title =
          item.title ||
          item.label ||
          item.action ||
          (meta.label === 'in' ? 'received tokens' : 'sent tokens')

        const token = item.tokenSymbol || item.symbol || ''
        const amount =
          item.amountFormatted ||
          item.amountDisplay ||
          item.amount ||
          ''

        const timeAgo = item.timeAgo || item.age || ''
        const counterparty =
          item.counterparty ||
          item.otherAddressShort ||
          item.other ||
          ''

        const href =
          item.txUrl ||
          item.explorerUrl ||
          (item.hash
            ? `https://explorer.inkonchain.com/tx/${item.hash}`
            : '')

        const content = (
          <div className='flex items-center gap-3 px-3 py-2.5 hover:bg-slate-900/70'>
            {/* icon column */}
            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/80'>
              <svg
                className={`h-3.5 w-3.5 text-slate-200 ${meta.iconClass}`}
                viewBox='0 0 24 24'
              >
                <path
                  d='M5 12h14M13 6l6 6-6 6'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </div>

            {/* main text */}
            <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
              <div className='flex items-center justify-between gap-2'>
                <div className='flex flex-wrap items-center gap-1.5'>
                  <span className='text-[12px] font-medium text-slate-100'>
                    {title}
                  </span>
                  {token && (
                    <span className='rounded-full bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-200'>
                      {token}
                    </span>
                  )}
                  <span
                    className={
                      'rounded-full border px-1.5 py-0.5 text-[10px] ' +
                      meta.badgeClass
                    }
                  >
                    {meta.label}
                  </span>
                </div>
                {timeAgo && (
                  <span className='text-[10px] text-slate-500'>
                    {timeAgo}
                  </span>
                )}
              </div>

              <div className='flex items-center justify-between gap-2'>
                <div className='truncate text-[11px] text-slate-400'>
                  {counterparty && (
                    <span>
                      {meta.label === 'in' ? 'from ' : 'to '}
                      {counterparty}
                    </span>
                  )}
                </div>
                {amount && (
                  <div className='text-[11px] font-medium text-slate-100'>
                    {amount}
                  </div>
                )}
              </div>
            </div>
          </div>
        )

        if (href) {
          return (
            <a
              key={item.id || idx}
              href={href}
              target='_blank'
              rel='noreferrer'
              className='block'
            >
              {content}
            </a>
          )
        }

        return (
          <div key={item.id || idx}>
            {content}
          </div>
        )
      })}
    </div>
  )
}
