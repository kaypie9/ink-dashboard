type SectionCardProps = {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export function SectionCard({ title, subtitle, children }: SectionCardProps) {
  return (
    <section className='rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm shadow-lg px-6 py-5 space-y-3'>
      <header>
        <h2 className='text-lg font-semibold text-slate-100'>{title}</h2>
        {subtitle && (
          <p className='text-[12px] text-slate-400 mt-1'>{subtitle}</p>
        )}
      </header>

      <div className='pt-1'>
        {children}
      </div>
    </section>
  )
}
