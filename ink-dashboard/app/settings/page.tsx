import { WalletSelector } from '@/components/wallet-selector'
import { SectionCard } from '@/components/ui/section-card'
import { AlertToggle } from '@/components/ui/alert-toggle'

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      {/* top bar */}
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="space-y-1">
            <div className="text-xs text-slate-400">
              ink dashboard
            </div>
            <h1 className="text-lg font-semibold tracking-tight">
              settings
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <WalletSelector />
            <div className="hidden text-xs text-slate-400 sm:block">
              network
              <span className="ml-1 rounded-full bg-violet-600/20 px-2 py-0.5 text-[11px] text-violet-300">
                ink mainnet
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* content */}
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-4 py-4">
        <SectionCard
          title="notification channels"
          subtitle="how ink should contact you in the future"
        >
          <div className="space-y-2 text-xs text-slate-300">
            <AlertToggle
              title="email"
              description="future: send alerts like claim ready or vault maturity to your email."
            />
            <AlertToggle
              title="push"
              description="future: mobile app or browser notifications when something important happens."
            />
            <AlertToggle
              title="farcaster"
              description="future: opt in to a farcaster bot ping for critical events."
            />
          </div>
        </SectionCard>

        <SectionCard
          title="default wallet preference"
          subtitle="which wallet ink should show first on load"
        >
          <p className="text-xs text-slate-400 mb-3">
            right now this is only visual.
            later this will save to your profile so dashboard opens on your main ink wallet.
          </p>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
            <div className="mb-2 text-[11px] text-slate-400">
              pick default wallet
            </div>
            <WalletSelector />
          </div>
        </SectionCard>

        <SectionCard
          title="display"
          subtitle="small preferences for how ink dashboard feels"
        >
          <div className="grid gap-3 text-xs md:grid-cols-2">
            <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-3">
              <div className="text-xs font-medium text-slate-100">
                currency display
              </div>
              <p className="text-[11px] text-slate-400">
                for now we only mock usd in the ui.
                future setting to choose eur, gbp, or local.
              </p>
            </div>
            <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-3">
              <div className="text-xs font-medium text-slate-100">
                experimental features
              </div>
              <p className="text-[11px] text-slate-400">
                future toggle for beta features like new vault views, charts, and risk meters.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
