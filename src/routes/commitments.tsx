import { createFileRoute } from '@tanstack/react-router'
import {
  ArrowUpRight,
  BellRing,
  CheckCircle2,
  Clock,
  Handshake,
  Hourglass,
  Play,
  Timer,
} from 'lucide-react'
import { Button, EmptyState, Panel, PanelHead } from '../components/ui'
import { useNexus } from '../lib/store'
import type { Commitment } from '../lib/types'

export const Route = createFileRoute('/commitments')({
  component: CommitmentsPage,
})

function CommitmentRow({ c }: { c: Commitment }) {
  return (
    <li
      className={`rise card-quiet p-4 ${c.fromDemo ? 'border-mint/35 bg-mint/[0.05]' : ''}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[14px] leading-snug text-text">{c.what}</p>
          <p className="mt-1 text-[12px] text-dim">{c.who}</p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-[0.1em] uppercase ${
            c.status === 'waiting'
              ? 'border-sky/35 bg-sky/[0.08] text-sky'
              : c.status === 'done'
                ? 'border-mint/35 bg-mint/[0.08] text-mint'
                : 'border-brand/35 bg-brand/[0.08] text-brand'
          }`}
        >
          <Clock size={10} />
          {c.due}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line pt-3">
        <p className="font-mono text-[10px] tracking-[0.1em] text-faint uppercase">{c.origin}</p>
        <p className="text-[11.5px] text-faint">{c.dueNote}</p>
        {c.followUpAt && (
          <p className="ml-auto inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] text-mint uppercase">
            <Timer size={11} />
            Follow-up {c.followUpAt}
          </p>
        )}
      </div>
    </li>
  )
}

function CommitmentsPage() {
  const { commitments, phase, startDemo } = useNexus()
  const mine = commitments.filter((c) => c.owner === 'me')
  const theirs = commitments.filter((c) => c.owner === 'other')
  const waiting = commitments.filter((c) => c.status === 'waiting')
  const followUps = commitments.filter((c) => c.followUpAt)
  const fromCall = commitments.find((c) => c.fromDemo)

  return (
    <div className="flex flex-col gap-5">
      <header className="rise">
        <p className="kicker">Commitments</p>
        <h1 className="display mt-2 text-[27px] leading-tight text-text sm:text-[32px]">
          Who owes what, and by when
        </h1>
        <p className="mt-2 max-w-[62ch] text-[14px] leading-relaxed text-dim">
          Promises made in email and on calls are extracted the moment they are spoken, so nothing
          depends on somebody remembering to write it down.
        </p>
      </header>

      <div className="rise grid gap-3 sm:grid-cols-4">
        {[
          { label: 'My commitments', value: mine.length, icon: Handshake, tone: 'text-brand' },
          { label: "Others' commitments", value: theirs.length, icon: ArrowUpRight, tone: 'text-text' },
          { label: 'Waiting on a reply', value: waiting.length, icon: Hourglass, tone: 'text-sky' },
          { label: 'Follow-ups armed', value: followUps.length, icon: BellRing, tone: 'text-mint' },
        ].map(({ label, value, icon: Icon, tone }, i) => (
          <div key={label} className="card rise p-4" style={{ ['--i' as string]: i }}>
            <Icon size={15} className={tone} strokeWidth={2} />
            <p className={`display mt-2 text-[26px] ${tone}`}>{value}</p>
            <p className="kicker mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {fromCall ? (
        <Panel className="pop border-mint/30">
          <PanelHead
            kicker="Extracted from the assisted call"
            title="Rahul's commitment"
            right={
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] text-mint uppercase">
                <CheckCircle2 size={12} strokeWidth={2.4} />
                Recorded
              </span>
            }
          />
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[17px] leading-snug text-text sm:text-[19px]">
            <span>Rahul Menon</span>
            <span className="font-mono text-faint">→</span>
            <span>Review presentation</span>
            <span className="font-mono text-faint">→</span>
            <span className="text-mint">Today 3:00 PM</span>
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-dim">
            He said "I'll review it by 3 PM" on a call that lasted 2m 14s. NEXUS turned that
            sentence into a tracked commitment and armed a follow-up for 3:15 PM — a reminder for
            you, not an automatic nudge to him.
          </p>
        </Panel>
      ) : (
        <Panel className="rise">
          <EmptyState
            icon={<Play size={19} />}
            title="No commitments captured from a call yet"
            body="Run the Project Alpha flow and the assisted call with Rahul produces a tracked 3 PM commitment plus a follow-up."
            action={
              <Button
                size="sm"
                variant="primary"
                onClick={() => startDemo({ releaseSafe: true })}
                disabled={phase !== 'idle'}
              >
                <Play size={13} />
                Run the demo
              </Button>
            }
          />
        </Panel>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel className="rise">
          <PanelHead kicker="Owed by you" title="My commitments" />
          <ul className="flex flex-col gap-2.5">
            {mine.map((c) => (
              <CommitmentRow key={c.id} c={c} />
            ))}
          </ul>
        </Panel>

        <Panel className="rise" style={{ ['--i' as string]: 1 }}>
          <PanelHead kicker="Owed to you" title="Others' commitments" />
          <ul className="flex flex-col gap-2.5">
            {theirs.map((c) => (
              <CommitmentRow key={c.id} c={c} />
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel className="rise">
          <PanelHead kicker="Silence" title="Waiting on a response" />
          {waiting.length === 0 ? (
            <p className="text-[13px] text-faint">Nothing is stuck waiting on somebody else.</p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {waiting.map((c) => (
                <li key={c.id} className="card-quiet flex items-center justify-between gap-3 p-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] text-text">{c.what}</p>
                    <p className="mt-0.5 text-[11.5px] text-faint">{c.who} · {c.dueNote}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] tracking-[0.1em] text-sky uppercase">
                    Waiting
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel className="rise" style={{ ['--i' as string]: 1 }}>
          <PanelHead kicker="Scheduled" title="Follow-ups" />
          {followUps.length === 0 ? (
            <p className="text-[13px] leading-relaxed text-faint">
              Follow-ups appear once a commitment carries a time. They surface as a reminder to
              you — NEXUS never chases anybody without your say-so.
            </p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {followUps.map((c) => (
                <li key={c.id} className="card-quiet p-3.5">
                  <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] text-mint uppercase">
                    <Timer size={11} />
                    {c.followUpAt}
                  </p>
                  <p className="mt-1.5 text-[13.5px] leading-snug text-text">
                    Check whether {c.who.split(' →')[0]} delivered: {c.what.toLowerCase()}
                  </p>
                  <p className="mt-1 text-[11.5px] text-faint">
                    If it has not landed, NEXUS offers a one-tap nudge for you to approve.
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  )
}
