'use client'

import { useState } from 'react'
import { useWalletContext } from '@/components/wallet-context'

function shortenAddress(addr: string) {
  if (addr.length <= 10) return addr
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

export function WalletSelector() {
  const { address, setAddress } = useWalletContext()
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConnect() {
    try {
      setError(null)
      setConnecting(true)

      // check if wallet extension exists
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        setError('no wallet found in this browser')
        return
      }

      const ethereum = (window as any).ethereum

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      })

      if (accounts && accounts.length > 0) {
        setAddress(accounts[0])
      } else {
        setError('no account returned')
      }
    } catch (e) {
      setError('connection cancelled or failed')
    } finally {
      setConnecting(false)
    }
  }

  // if not connected: show connect button
  if (!address) {
    return (
      <div className='flex flex-col items-end gap-1'>
        <button
          onClick={handleConnect}
          className='rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 hover:border-violet-500/80 hover:text-violet-100'
        >
          {connecting ? 'connecting...' : 'connect wallet'}
        </button>
        {error && (
          <div className='text-[10px] text-red-300 max-w-[180px] text-right'>
            {error}
          </div>
        )}
      </div>
    )
  }

  // if connected: show address pill
  return (
    <div className='flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5'>
      <div className='flex flex-col text-[11px] leading-tight'>
        <span className='text-xs text-slate-100'>
          connected wallet
        </span>
        <span className='text-[10px] text-slate-400'>
          {shortenAddress(address)}
        </span>
      </div>
    </div>
  )
}
