'use client'

type Props = {
  name: string
  amount: number
  usdValue: number
  percent: number
  onClose: () => void
}

export function TokenPopup({ name, amount, usdValue, percent, onClose }: Props) {
  return (
    <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs shadow-xl">
      <div className="mb-1 text-[11px] font-semibold text-slate-100">
        {name}
      </div>

      <div className="space-y-1 text-[11px] text-slate-300">
        <div>Holdings: {amount.toFixed(2)}</div>
        <div>Value: ${usdValue.toFixed(2)}</div>
        <div>Portfolio: {percent.toFixed(1)}%</div>
      </div>

      <button
        onClick={onClose}
        className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-900 py-1 text-[11px] text-slate-300 hover:border-violet-500 hover:text-violet-300"
      >
        close
      </button>
    </div>
  )
}
