export function formatPercentage(value: number): string {
  if (!isFinite(value)) return '0%'
  const safe = Math.max(0, Math.min(100, value))
  return safe.toFixed(1) + '%'
}
