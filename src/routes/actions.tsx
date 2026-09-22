import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Play, RotateCcw, Zap } from 'lucide-react'
import { ActionCard } from '../components/ActionCard'
import { PipelineRail } from '../components/PipelineRail'
import { Button, EmptyState, Panel, PanelHead } from '../components/ui'
import { useNexus } from '../lib/store'
import type { Risk } from '../lib/types'

export const Route = createFileRoute('/actions')({
  component: ActionsPage,
})

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Needs approval' },
  { key: 'running', label: 'In flight' },
  { key: 'done', label: 'Executed' },
] as const

const CHAIN = [
  'Find document',
  'Draft email',
  'Approval',
  'Send',
  'Verify',
  'Follow-up',
]

export function ActionsPage() {
  const { actions, handleAll, startDemo, resetDemo, completed, pendingApprovals, released } =
    useNexus()
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('all')

  const filtered = actions.filter((a) => {
    if (filter === 'pending') return a.executionStatus === 'awaiting_approval'
    if (filter === 'running')
      return ['executing', 'approved', 'queued', 'blocked'].includes(a.executionStatus)
    if (filter === 'done') return a.executionStatus === 'done'
    return true
  })

  const byRisk = (risk: Risk) => actions.filter((a) => a.risk === risk).length

  return (
    <div className="flex flex-col gap-5">
      <header className="rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">Action queue</p>
          <h1 className="display mt-2 text-[27px] leading-tight text-text sm:text-[32px]">
            Every action, and what it is waiting for
          </h1>
          <p className="mt-2 max-w-[60ch] text-[14px] leading-relaxed text-dim">
            Actions carry their own source, context, dependencies, risk class and verification.
            Nothing runs until the thing before it has actually finished.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="primary" onClick={handleAll}>
            <Zap size={15} strokeWidth={2.2} />
            Handle All
          </Button>
          <Button onClick={resetDemo}>
            <RotateCcw size={14} />
            Reset demo
          </Button>
        </div>
      </header>

      <Panel className="rise">
        <div className="flex flex-col gap-4">
          <PipelineRail />
          <div className="grid gap-3 border-t border-line pt-4 sm:grid-cols-4">
            {[
              { label: 'Planned', value: actions.length, tone: 'text-text' },
              { label: 'Executed', value: completed.length, tone: 'text-mint' },
              { label: 'Needs approval', value: pendingApprovals.filter((a) => a.executionStatus === 'awaiting_approval').length, tone: 'text-coral' },
              { label: 'Approvals given', value: released.length, tone: 'text-brand' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className={`display text-[24px] ${stat.tone}`}>{stat.value}</p>
                <p className="kicker mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <Panel className="rise" style={{ ['--i' as string]: 1 }}>
        <PanelHead kicker="Dependency chain" title="How the plan is wired" />
        <div className="-mx-1 overflow-x-auto px-1 no-scrollbar">
          <ol className="flex min-w-max items-center gap-2">
            {CHAIN.map((step, i) => (
              <li key={step} className="flex items-center gap-2">
                <span className="rounded-full border border-line bg-white/[0.03] px-3 py-1.5 text-[12.5px] whitespace-nowrap text-dim">
                  {step}
                </span>
                {i < CHAIN.length - 1 && <span className="font-mono text-faint">→</span>}
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 border-t border-line pt-4">
          {(['low', 'medium', 'high'] as Risk[]).map((risk) => (
            <p key={risk} className="font-mono text-[10.5px] tracking-[0.12em] uppercase">
              <span
                className={
                  risk === 'low' ? 'text-mint' : risk === 'medium' ? 'text-brand' : 'text-coral'
                }
              >
                {risk}
              </span>
              <span className="mx-2 text-faint">·</span>
              <span className="text-dim">{byRisk(risk)} actions</span>
            </p>
          ))}
        </div>
      </Panel>

      {actions.length === 0 ? (
        <Panel className="rise">
          <EmptyState
            icon={<Play size={19} />}
            title="The queue is empty"
            body="NEXUS only plans from something it observed. Start the run and the Project Alpha plan appears here with its dependencies intact."
            action={
              <Button size="sm" variant="primary" onClick={() => startDemo()}>
                <Play size={13} />
                Run the demo
              </Button>
            }
          />
        </Panel>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`focus-ring rounded-full border px-3.5 py-1.5 font-mono text-[10.5px] tracking-[0.12em] uppercase transition-colors ${
                  filter === f.key
                    ? 'border-brand/45 bg-brand/[0.1] text-brand'
                    : 'border-line text-faint hover:text-dim'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <Panel>
              <EmptyState
                icon={<Zap size={19} />}
                title="Nothing in this view"
                body="Switch the filter, or run the remaining actions from the All tab."
              />
            </Panel>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((action, i) => (
                <ActionCard key={action.id} action={action} index={i} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
