import type { PortfolioSummary } from './portfolio'

export function calculateHealthScore(p: PortfolioSummary): number {
  let score = 50

  // diversification
  const bal = p.balances
  const walletValue = bal.nativeInk + bal.stables + bal.lpTokens

  if (walletValue > 0) {
    const ratioInk = bal.nativeInk / walletValue
    const ratioStables = bal.stables / walletValue
    const ratioLP = bal.lpTokens / walletValue

    // reward if no single token dominates
    if (ratioInk < 0.7 && ratioStables < 0.7 && ratioLP < 0.7) {
      score += 10
    }
  }

  // vault usage
  if (p.vaults.length > 0) score += 10

  // unclaimed yield exists
  if (p.unclaimedYieldUsd > 50) score += 10

  // large total value gives confidence
  if (p.totalValueUsd > 2000) score += 10
  if (p.totalValueUsd > 5000) score += 10

  // clamp
  if (score < 0) score = 0
  if (score > 100) score = 100

  return score
}
