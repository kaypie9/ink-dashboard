export type VaultPosition = {
  id: string
  name: string
  strategy: string
  depositUsd: number
  pnlUsd: number
  apy: number
  status: 'active' | 'maturing' | 'completed'
  nextAction?: string
}

export type Balances = {
  nativeInk: number
  stables: number
  lpTokens: number
}

export type PortfolioSummary = {
  walletAddress: string
  totalValueUsd: number
  vaultDepositsUsd: number
  unclaimedYieldUsd: number
  vaults: VaultPosition[]
  balances: Balances
  mock: boolean
}

export function getMockPortfolio(walletAddress: string): PortfolioSummary {
  const vaults: VaultPosition[] = [
    {
      id: 'ink-vault-1',
      name: 'hydrothermal vault',
      strategy: 'yield on stables',
      depositUsd: 2450.32,
      pnlUsd: 128.44,
      apy: 7.2,
      status: 'active',
      nextAction: 'claim in 2d 4h',
    },
    {
      id: 'ink-vault-2',
      name: 'xstocks yield stream',
      strategy: 'tokenized stocks yield',
      depositUsd: 1200.0,
      pnlUsd: 56.11,
      apy: 5.8,
      status: 'maturing',
      nextAction: 'review position',
    },
  ]

  const balances: Balances = {
    nativeInk: 312.45,
    stables: 1780.0,
    lpTokens: 542.12,
  }

  const vaultDepositsUsd = vaults.reduce((sum, v) => sum + v.depositUsd, 0)
  const unclaimedYieldUsd = vaults.reduce((sum, v) => sum + v.pnlUsd, 0)
  const walletValueUsd =
    balances.nativeInk + balances.stables + balances.lpTokens

  const totalValueUsd = vaultDepositsUsd + walletValueUsd + unclaimedYieldUsd

  return {
    walletAddress,
    totalValueUsd,
    vaultDepositsUsd,
    unclaimedYieldUsd,
    vaults,
    balances,
    mock: true,
  }
}
