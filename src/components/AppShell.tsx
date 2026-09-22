import { Link, useRouterState } from '@tanstack/react-router'
import {
  CheckCircle2,
  Handshake,
  LayoutDashboard,
  ListChecks,
  Mail,
  Mic,
  RotateCcw,
  ShieldHalf,
} from 'lucide-react'
import { OPERATOR } from '../lib/seed'
import { useNexus } from '../lib/store'
import { Avatar } from './ui'
import { CallOverlay } from './CallOverlay'
import { VoiceOverlay } from './VoiceOverlay'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/email', label: 'Email', icon: Mail },
  { to: '/actions', label: 'Actions', icon: ListChecks },
  { to: '/commitments', label: 'Commitments', icon: Handshake },
  { to: '/privacy', label: 'Privacy', icon: ShieldHalf },
] as const

function Wordmark() {
  return (
    <div className="flex items-center gap-3">
      <span className="relative grid h-9 w-9 place-items-center rounded-[11px] bg-brand/15 ring-1 ring-brand/30">
        <span className="absolute inset-0 rounded-[11px] bg-brand/10 ripple" />
        <span className="h-2 w-2 rounded-full bg-brand" />
      </span>
      <span className="leading-none">
        <span className="display block text-[17px] tracking-[0.02em] text-text">NEXUS</span>
        <span className="mt-1 block font-mono text-[9px] tracking-[0.2em] text-faint uppercase">
          Execution Layer
        </span>
      </span>
    </div>
  )
}

function AiStatus() {
  const { aiStatus, completed, actions } = useNexus()
  return (
    <div className="card-quiet px-3.5 py-3">
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span
            className={`absolute inset-0 rounded-full ${aiStatus.busy ? 'bg-brand breathe' : 'bg-mint'}`}
          />
        </span>
        <p className="text-[12.5px] font-medium text-text">{aiStatus.label}</p>
      </div>
      <p className="mt-1.5 text-[11.5px] leading-snug text-faint">{aiStatus.detail}</p>
      {actions.length > 0 && (
        <p className="mt-2 flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] text-mint uppercase">
          <CheckCircle2 size={11} strokeWidth={2.4} />
          {completed.length}/{actions.length} executed
        </p>
      )}
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { openVoice, resetDemo, voice, call } = useNexus()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <div className="min-h-screen">
      {/* mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-ink/85 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Wordmark />
        <button
          type="button"
          onClick={resetDemo}
          className="focus-ring flex h-9 items-center gap-1.5 rounded-full border border-line px-3 font-mono text-[10px] tracking-[0.1em] text-dim uppercase"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </header>

      {/* desktop sidebar */}
      <aside className="fixed top-0 left-0 z-40 hidden h-screen w-[248px] flex-col justify-between border-r border-line bg-ink-2/70 px-5 py-6 backdrop-blur-xl lg:flex">
        <div>
          <Wordmark />
          <nav className="mt-9 flex flex-col gap-1">
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  className={`focus-ring group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] transition-colors duration-200 ${
                    active
                      ? 'bg-brand/[0.1] text-text ring-1 ring-brand/25'
                      : 'text-dim hover:bg-white/[0.035] hover:text-text'
                  }`}
                >
                  <Icon
                    size={16}
                    strokeWidth={1.9}
                    className={active ? 'text-brand' : 'text-faint group-hover:text-dim'}
                  />
                  {label}
                  {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand" />}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex flex-col gap-3">
          <AiStatus />
          <button
            type="button"
            onClick={resetDemo}
            className="focus-ring flex items-center justify-center gap-2 rounded-full border border-line py-2.5 font-mono text-[10px] tracking-[0.14em] text-dim uppercase transition-colors hover:border-coral/40 hover:text-coral"
          >
            <RotateCcw size={12} />
            Reset demo
          </button>
          <div className="flex items-center gap-2.5 border-t border-line pt-3">
            <Avatar initials={OPERATOR.initials} tone="neutral" />
            <span className="leading-tight">
              <span className="block text-[12.5px] text-text">{OPERATOR.name}</span>
              <span className="block text-[11px] text-faint">{OPERATOR.role}</span>
            </span>
          </div>
        </div>
      </aside>

      <main className="mx-auto w-full max-w-[1120px] px-4 pt-5 pb-28 sm:px-6 lg:pt-8 lg:pb-14 lg:pl-[280px]">
        {children}
      </main>

      {/* mobile tab bar */}
      <nav className="fixed bottom-0 left-0 z-40 w-full border-t border-line bg-ink/90 backdrop-blur-xl lg:hidden">
        <div className="flex items-stretch justify-around px-1 pt-1.5 pb-[max(env(safe-area-inset-bottom),6px)]">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={`focus-ring flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[9.5px] tracking-[0.08em] uppercase transition-colors ${
                  active ? 'text-brand' : 'text-faint'
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* voice trigger */}
      <button
        type="button"
        onClick={openVoice}
        aria-label="Talk to NEXUS"
        className="focus-ring fixed right-4 bottom-[86px] z-40 grid h-14 w-14 place-items-center rounded-full bg-brand text-[#1a1206] shadow-[0_18px_40px_-14px_rgba(232,161,58,0.85)] transition-transform duration-200 hover:scale-105 active:scale-95 lg:right-8 lg:bottom-8"
      >
        <span className="absolute inset-0 rounded-full bg-brand/30 ripple" />
        <Mic size={21} strokeWidth={2.1} />
      </button>

      {voice.open && <VoiceOverlay />}
      {(call.active || call.turns.length > 0) && <CallOverlay />}
    </div>
  )
}
