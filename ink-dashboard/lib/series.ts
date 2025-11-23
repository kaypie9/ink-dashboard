export type SeriesPoint = {
  t: string // time label like 'day 1'
  v: number // value
}

export function getMockVaultSeries(): SeriesPoint[] {
  // fake "portfolio over last 7 days"
  return [
    { t: 'day 1', v: 1000 },
    { t: 'day 2', v: 1040 },
    { t: 'day 3', v: 1025 },
    { t: 'day 4', v: 1080 },
    { t: 'day 5', v: 1120 },
    { t: 'day 6', v: 1155 },
    { t: 'day 7', v: 1188 },
  ]
}
