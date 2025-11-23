import type { ActivityItem } from '@/lib/activity'

export function ClaimWidget({ claims }: { claims: ActivityItem[] }) {
  if (!claims.length) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-3 text-xs text-slate-400">
        no claims yet
        <br />
        once you have yield or rewards, they show here.
      </div>
    )
  }

  return (
    <ul className="space-y-2 text-xs">
      {claims.map((c) => (
        <li
          key={c.id}
          className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2"
        >
          <div className="space-y-0.5">
            <div className="text-[12px] font-medium text-slate-100">
              {c.title}
            </div>
            <div className="text-[11px] text-slate-400">{c.subtitle}</div>
            <div className="text-[10px] text-slate-500">{c.when}</div>
          </div>

          <div className="text-right">
            <div className="text-[12px] font-semibold text-slate-100">
              ${c.amountUsd.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-400">{c.token}</div>
          </div>
        </li>
      ))}
    </ul>
  )
}
