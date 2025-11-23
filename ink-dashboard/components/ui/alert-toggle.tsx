import React from 'react'

type AlertToggleProps = {
  title: string
  description: string
  defaultOn?: boolean
}

export function AlertToggle({
  title,
  description,
  defaultOn = false,
}: AlertToggleProps) {
  return (
    <label className='flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2.5'>
      <div className='space-y-1'>
        <div className='text-xs font-medium text-slate-100'>
          {title}
        </div>
        <p className='text-[11px] leading-snug text-slate-400'>
          {description}
        </p>
      </div>
      <div className='flex items-center'>
        <input
          type='checkbox'
          defaultChecked={defaultOn}
          className='h-4 w-7 cursor-pointer appearance-none rounded-full border border-slate-600 bg-slate-800 outline-none transition-all checked:border-violet-500 checked:bg-violet-600'
        />
      </div>
    </label>
  )
}
