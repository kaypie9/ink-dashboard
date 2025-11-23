type StatCardProps = {
  label: string
  value: string
  hint?: string
  accent?: string
}


export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className='rounded-2xl bg-slate-900/50 backdrop-blur border border-slate-800 px-5 py-4 shadow-md flex flex-col gap-1'>
      <div className='text-[12px] text-slate-400 uppercase tracking-wide'>{label}</div>
      <div className='text-2xl font-bold text-slate-100'>{value}</div>
      {hint && (
        <div className='text-[11px] text-slate-500'>{hint}</div>
      )}
    </div>
  )
}
