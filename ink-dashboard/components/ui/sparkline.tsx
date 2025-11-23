'use client'

import { useState } from 'react'
import type { SeriesPoint } from '@/lib/series'

type SparklineProps = {
  points: SeriesPoint[]
}

export function Sparkline({ points }: SparklineProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  if (!points.length) return null

  const values = points.map((p) => p.v)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const width = 100
  const height = 30

  // path for main sparkline
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1 || 1)) * width
      const y = height - ((p.v - min) / range) * height
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  return (
    <div className="relative w-full">
      {/* sparkline svg */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-16 w-full text-violet-400"
        preserveAspectRatio="none"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        />

        {/* area under line */}
        <path
          d={`${path} L ${width} ${height} L 0 ${height} Z`}
          fill="currentColor"
          opacity={0.15}
        />

        {/* draw interactive circles */}
        {points.map((p, i) => {
          const x = (i / (points.length - 1 || 1)) * width
          const y = height - ((p.v - min) / range) * height

          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={hoverIndex === i ? 2.8 : 1.5}
              fill="currentColor"
              opacity={hoverIndex === i ? 1 : 0.4}
              onMouseEnter={() => setHoverIndex(i)}
            />
          )
        })}
      </svg>

      {/* Tooltip */}
      {hoverIndex !== null && (
        <div className="absolute -top-1 left-0 translate-x-2 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[10px] text-slate-300 shadow-xl">
          {points[hoverIndex].t}: {points[hoverIndex].v.toFixed(2)} usd
        </div>
      )}
    </div>
  )
}
