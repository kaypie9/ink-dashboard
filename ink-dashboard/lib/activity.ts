export type ActivityItem = {
  id: string
  kind: 'deposit' | 'claim' | 'roll' | 'transfer'
  title: string
  subtitle: string
  amountUsd: number
  token: string
  when: string // simple text like '2h ago'
  vaultName?: string
}

export function getMockActivity(): ActivityItem[] {
  return [
    {
      id: 'a1',
      kind: 'deposit',
      title: 'vault deposit',
      subtitle: 'added funds into hydrothermal vault',
      amountUsd: 1000,
      token: 'USDC',
      when: '2h ago',
      vaultName: 'hydrothermal vault',
    },
    {
      id: 'a2',
      kind: 'claim',
      title: 'yield claimed',
      subtitle: 'claimed yield from xstocks stream',
      amountUsd: 32.45,
      token: 'USDC',
      when: '1d ago',
      vaultName: 'xstocks yield stream',
    },
    {
      id: 'a3',
      kind: 'roll',
      title: 'vault rolled',
      subtitle: 'extended term on hydrothermal vault',
      amountUsd: 0,
      token: 'USDC',
      when: '3d ago',
      vaultName: 'hydrothermal vault',
    },
    {
      id: 'a4',
      kind: 'transfer',
      title: 'wallet transfer',
      subtitle: 'sent funds to another ink wallet',
      amountUsd: 250,
      token: 'USDC',
      when: '5d ago',
    },
  ]
}

export function getClaimActivity(items: ActivityItem[]) {
  return items.filter((a) => a.kind === 'claim')
}

