import type { ReactNode } from 'react'
import { Check, Loader2, Lock, ShieldCheck, Zap } from 'lucide-react'
import { RISK_COPY } from '../lib/risk-engine'
import type { ExecutionStatus, Risk, VerificationStatus } from '../lib/types'

export function Panel({
  children,
  className = '',
  style,
}: {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <section className={`card p-5 sm:p-6 ${className}`} style={style}>
      {children}
    </section>
  )
}

export function PanelHead({
  kicker,
  title,
  right,
}: {
  kicker: string
  title: string
  right?: ReactNode
}) {
  return (
    <header className="mb-4 flex items-start justify-between gap-4">
      <div>
        <p className="kicker">{kicker}</p>
        <h2 className="display mt-1 text-[19px] leading-tight text-text">{title}</h2>
      </div>
      {right}
    </header>
  )
}

const buttonBase =
  'focus-ring inline-flex items-center justify-center gap-2 rounded-full text-[13px] font-medium transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100'

export function Button({
  children,
  variant = 'ghost',
  size = 'md',
  onClick,
  disabled,
  className = '',
  title,
}: {
  children: ReactNode
  variant?: 'primary' | 'ghost' | 'danger' | 'quiet'
  size?: 'sm' | 'md'
  onClick?: () => void
  disabled?: boolean
  className?: string
  title?: string
}) {
  const variants = {
    primary:
      'bg-brand text-[#1a1206] hover:bg-[#f2b155] shadow-[0_10px_30px_-14px_rgba(232,161,58,0.8)]',
    ghost:
      'border border-line bg-white/[0.03] text-text hover:border-brand/55 hover:bg-brand/[0.08]',
    danger:
      'border border-coral/45 bg-coral/[0.1] text-coral hover:bg-coral/[0.16]',
    quiet: 'text-dim hover:text-text',
  }
  const sizes = { sm: 'h-8 px-3', md: 'h-10 px-4' }
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`${buttonBase} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}

export function RiskChip({ risk, withBlurb = false }: { risk: Risk; withBlurb?: boolean }) {
  const map = {
    low: { cls: 'text-mint border-mint/35 bg-mint/[0.09]', icon: Zap },
    medium: { cls: 'text-brand border-brand/35 bg-brand/[0.09]', icon: ShieldCheck },
    high: { cls: 'text-coral border-coral/40 bg-coral/[0.1]', icon: Lock },
  }[risk]
  const Icon = map.icon
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] uppercase ${map.cls}`}
    >
      <Icon size={11} strokeWidth={2.4} />
      {RISK_COPY[risk].label}
      {withBlurb && (
        <span className="hidden font-sans text-[10px] tracking-normal normal-case opacity-75 sm:inline">
          · {RISK_COPY[risk].blurb}
        </span>
      )}
    </span>
  )
}

export const EXEC_COPY: Record<ExecutionStatus, { label: string; cls: string }> = {
  blocked: { label: 'Blocked', cls: 'text-faint' },
  queued: { label: 'Queued', cls: 'text-sky' },
  awaiting_approval: { label: 'Needs approval', cls: 'text-coral' },
  approved: { label: 'Approved', cls: 'text-mint' },
  executing: { label: 'Executing', cls: 'text-brand' },
  done: { label: 'Executed', cls: 'text-mint' },
  skipped: { label: 'Skipped', cls: 'text-faint' },
}

export function StatusPill({
  status,
  verification,
}: {
  status: ExecutionStatus
  verification: VerificationStatus
}) {
  const copy = EXEC_COPY[status]
  const showVerified = status === 'done' && verification === 'verified'
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase">
      {status === 'executing' ? (
        <Loader2 size={12} className="spin-slow text-brand" />
      ) : showVerified ? (
        <Check size={12} className="text-mint" strokeWidth={3} />
      ) : (
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            status === 'done'
              ? 'bg-mint'
              : status === 'awaiting_approval'
                ? 'bg-coral breathe'
                : status === 'approved'
                  ? 'bg-mint'
                  : status === 'queued'
                    ? 'bg-sky'
                    : 'bg-faint'
          }`}
        />
      )}
      <span className={copy.cls}>
        {showVerified ? 'Verified' : copy.label}
        {status === 'done' && verification === 'verifying' && ' · verifying'}
      </span>
    </span>
  )
}

export function Avatar({ initials, tone = 'brand' }: { initials: string; tone?: 'brand' | 'neutral' }) {
  return (
    <span
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-mono text-[11px] tracking-wide ${
        tone === 'brand'
          ? 'bg-brand/15 text-brand ring-1 ring-brand/25'
          : 'bg-white/[0.06] text-dim ring-1 ring-white/10'
      }`}
    >
      {initials}
    </span>
  )
}

export function Meter({ value }: { value: number }) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.07]">
      <div
        className="h-full rounded-full bg-gradient-to-r from-brand-deep to-brand transition-[width] duration-700 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line px-6 py-10 text-center">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-white/[0.04] text-faint">
        {icon}
      </span>
      <div>
        <p className="text-[14px] text-text">{title}</p>
        <p className="mx-auto mt-1 max-w-[42ch] text-[13px] leading-relaxed text-faint">{body}</p>
      </div>
      {action}
    </div>
  )
}
