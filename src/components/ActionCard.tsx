import { useState } from 'react'
import {
  CalendarClock,
  ChevronDown,
  Eye,
  FileSearch,
  Link2,
  Loader2,
  PenLine,
  PhoneCall,
  Send,
  ShieldCheck,
} from 'lucide-react'
import { contextGraph } from '../lib/seed'
import { useNexus } from '../lib/store'
import type { ActionRecord } from '../lib/types'
import { Button, RiskChip, StatusPill } from './ui'

const ICONS = {
  'calendar.update': CalendarClock,
  'document.find': FileSearch,
  'email.draft': PenLine,
  'email.send': Send,
  'call.place': PhoneCall,
  'monitor.followup': Eye,
} as const

const CTA: Record<string, string> = {
  'calendar.update': 'Update calendar',
  'document.find': 'Find document',
  'email.draft': 'Draft it',
  'email.send': 'Approve & send',
  'call.place': 'Approve & call',
  'monitor.followup': 'Arm follow-up',
}

export function ActionCard({
  action,
  index,
  defaultOpen = false,
}: {
  action: ActionRecord
  index: number
  defaultOpen?: boolean
}) {
  const { release, actions } = useNexus()
  const [open, setOpen] = useState(defaultOpen)
  const Icon = ICONS[action.operation.kind]
  const status = action.executionStatus
  const blockedBy = action.dependencies
    .map((d) => actions.find((a) => a.id === d))
    .filter((a) => a && a.executionStatus !== 'done')

  const contextNodes = contextGraph.filter((n) => action.context.includes(n.id))
  const canRun = status === 'queued' || status === 'awaiting_approval'

  return (
    <article
      className={`rise card p-4 transition-colors duration-500 sm:p-5 ${
        status === 'executing'
          ? 'ring-1 ring-brand/35'
          : status === 'awaiting_approval'
            ? 'ring-1 ring-coral/25'
            : ''
      }`}
      style={{ ['--i' as string]: index }}
    >
      <div className="flex items-start gap-3.5">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 transition-colors duration-500 ${
            status === 'done'
              ? 'bg-mint/12 text-mint ring-mint/25'
              : status === 'executing'
                ? 'bg-brand/15 text-brand ring-brand/30'
                : 'bg-white/[0.04] text-dim ring-white/10'
          }`}
        >
          {status === 'executing' ? (
            <Loader2 size={17} className="spin-slow" />
          ) : (
            <Icon size={17} strokeWidth={1.9} />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
            <h3 className="text-[15px] font-medium text-text">{action.intent}</h3>
            <span className="font-mono text-[10px] text-faint">{action.id}</span>
          </div>
          <p className="mt-1 text-[13px] leading-snug text-dim">{action.operation.detail}</p>
          <p className="mt-1 truncate font-mono text-[11px] text-faint">
            {action.operation.kind} → {action.operation.target}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            <RiskChip risk={action.risk} withBlurb />
            <StatusPill status={status} verification={action.verificationStatus} />
            {action.dependencies.length > 0 && (
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] text-faint uppercase">
                <Link2 size={11} />
                {action.dependencies.join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* live execution log */}
      {action.log.length > 0 && (
        <ul className="mt-3.5 flex flex-col gap-1 border-l border-line pl-3.5">
          {action.log.map((entry, i) => (
            <li
              key={`${entry.at}-${i}`}
              className="rise-fast font-mono text-[11.5px] leading-relaxed text-dim"
            >
              <span className="mr-2 text-brand">›</span>
              {entry.text}
            </li>
          ))}
        </ul>
      )}

      {action.verificationStatus === 'verified' && action.verification && (
        <p className="rise-fast mt-3 flex items-start gap-2 rounded-xl border border-mint/25 bg-mint/[0.06] px-3 py-2.5 text-[12.5px] leading-relaxed text-mint/95">
          <ShieldCheck size={14} className="mt-0.5 shrink-0" strokeWidth={2.2} />
          <span>
            <span className="font-mono text-[10px] tracking-[0.12em] uppercase">Verified · </span>
            {action.verification}
          </span>
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        {canRun && (
          <Button
            variant={action.approvalRequired ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => release(action.id)}
          >
            {CTA[action.operation.kind]}
          </Button>
        )}
        {status === 'blocked' && (
          <span className="text-[12px] text-faint">
            Waiting on {blockedBy.map((a) => a!.intent).join(' · ')}
          </span>
        )}
        {status === 'approved' && (
          <span className="font-mono text-[10.5px] tracking-[0.12em] text-mint uppercase">
            In queue
          </span>
        )}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="focus-ring ml-auto inline-flex items-center gap-1 rounded-full px-2 py-1 text-[12px] text-dim transition-colors hover:text-text"
        >
          Why?
          <ChevronDown
            size={13}
            className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {open && (
        <div className="rise-fast mt-3 flex flex-col gap-3 border-t border-line pt-4">
          <div>
            <p className="kicker">Why this action</p>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-text">{action.why}</p>
          </div>
          <div>
            <p className="kicker">Risk decision</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-dim">{action.riskRationale}</p>
          </div>
          {contextNodes.length > 0 && (
            <div>
              <p className="kicker">Context used</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {contextNodes.map((n) => (
                  <span
                    key={n.id}
                    className="rounded-full border border-line bg-white/[0.03] px-2.5 py-1 text-[11.5px] text-dim"
                  >
                    <span className="font-mono text-[9.5px] tracking-[0.1em] text-faint uppercase">
                      {n.kind}
                    </span>
                    <span className="mx-1.5 text-faint">·</span>
                    {n.title}
                  </span>
                ))}
              </div>
            </div>
          )}
          {action.operation.preview && (
            <div className="card-quiet p-3.5">
              <p className="kicker">{action.operation.preview.label}</p>
              <pre className="mt-2 overflow-x-auto font-mono text-[11.5px] leading-relaxed whitespace-pre-wrap text-dim">
                {action.operation.preview.lines.join('\n')}
              </pre>
            </div>
          )}
        </div>
      )}
    </article>
  )
}
