import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  Clock,
  Inbox,
  ListChecks,
  Mic,
  Play,
  RotateCcw,
  Sparkles,
  Timer,
  TriangleAlert,
  Zap,
} from 'lucide-react'
import { ActionCard } from '../components/ActionCard'
import { PipelineRail } from '../components/PipelineRail'
import { Avatar, Button, EmptyState, Meter, Panel, PanelHead, RiskChip } from '../components/ui'
import { HERO_BODY, OPERATOR, seedEmails, todaysPriorities } from '../lib/seed'
import { useNexus } from '../lib/store'
import { COMPLETION_SUMMARY } from '../lib/verification'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

const heroEmail = seedEmails[0]

function Dashboard() {
  const nexus = useNexus()
  const {
    phase,
    actions,
    entities,
    contextNodes,
    completed,
    pendingApprovals,
    commitments,
    alerts,
    aiStatus,
    startDemo,
    handleAll,
    release,
    resetDemo,
    openVoice,
    dismissAlert,
  } = nexus

  const started = phase !== 'idle'
  const safeReadyCount = actions.filter(
    (a) => !a.approvalRequired && a.executionStatus !== 'done' && a.executionStatus !== 'executing',
  ).length
  const progress = actions.length ? (completed.length / actions.length) * 100 : 0
  const liveAlerts = alerts.filter((a) => !a.dismissed && !a.resolved)
  const followUps = commitments.filter((c) => c.followUpAt)

  return (
    <div className="flex flex-col gap-5">
      {/* ── header ─────────────────────────────────────────── */}
      <header className="rise flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker">Today · 08:47</p>
            <h1 className="display mt-2 text-[30px] leading-[1.05] text-text sm:text-[38px]">
              Good morning, {OPERATOR.name.split(' ')[0]}.
            </h1>
            <p className="mt-2 max-w-[54ch] text-[14px] leading-relaxed text-dim">
              Project Alpha moved to 11 AM tomorrow. NEXUS read the mail, pulled the context and
              has a six-step plan waiting — three steps need nothing from you.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="primary" onClick={handleAll}>
              <Zap size={15} strokeWidth={2.2} />
              Handle All
              {safeReadyCount > 0 && (
                <span className="rounded-full bg-black/15 px-1.5 py-0.5 font-mono text-[10px]">
                  {safeReadyCount}
                </span>
              )}
            </Button>
            {started ? (
              <Button onClick={resetDemo}>
                <RotateCcw size={14} />
                Reset demo
              </Button>
            ) : (
              <Button onClick={() => startDemo()}>
                <Play size={14} />
                Run the demo
              </Button>
            )}
            <button
              type="button"
              onClick={openVoice}
              aria-label="Talk to NEXUS"
              className="focus-ring grid h-10 w-10 place-items-center rounded-full border border-line text-dim transition-colors hover:border-brand/50 hover:text-brand"
            >
              <Mic size={16} />
            </button>
          </div>
        </div>

        <div className="card flex flex-col gap-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span
                className={`h-2 w-2 rounded-full ${aiStatus.busy ? 'bg-brand breathe' : 'bg-mint'}`}
              />
              <p className="text-[13.5px] text-text">
                {aiStatus.label}
                <span className="mx-2 text-faint">·</span>
                <span className="text-dim">{aiStatus.detail}</span>
              </p>
            </div>
            <p className="font-mono text-[10.5px] tracking-[0.12em] text-faint uppercase">
              {completed.length}/{actions.length || 6} actions executed
            </p>
          </div>
          <PipelineRail />
          {actions.length > 0 && <Meter value={progress} />}
        </div>
      </header>

      {/* ── proactive alerts ───────────────────────────────── */}
      {liveAlerts.length > 0 && (
        <div className="flex flex-col gap-3">
          {liveAlerts.map((alert, i) => (
            <div
              key={alert.id}
              className="rise card flex flex-col gap-3.5 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5"
              style={{ ['--i' as string]: i }}
            >
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1 ${
                  alert.severity === 'warning'
                    ? 'bg-coral/12 text-coral ring-coral/25'
                    : 'bg-brand/12 text-brand ring-brand/25'
                }`}
              >
                {alert.severity === 'warning' ? (
                  <TriangleAlert size={16} strokeWidth={2} />
                ) : (
                  <BellRing size={16} strokeWidth={2} />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="kicker">Proactive alert</p>
                <p className="mt-1 text-[14px] leading-snug text-text">{alert.title}</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-faint">{alert.body}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {alert.id === 'alert-alpha-deck' ? (
                  <>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        startDemo({ releaseSafe: true })
                        release('act-04')
                      }}
                    >
                      Send now
                    </Button>
                    <Button size="sm" onClick={() => startDemo({ releaseSafe: true })}>
                      Draft
                    </Button>
                  </>
                ) : (
                  <Button size="sm" onClick={() => dismissAlert(alert.id)}>
                    Review
                  </Button>
                )}
                <Button size="sm" variant="quiet" onClick={() => dismissAlert(alert.id)}>
                  Snooze
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── main grid ──────────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          {/* observed email + extraction */}
          <Panel className="rise">
            <PanelHead
              kicker="Observe · Understand · Connect"
              title="What NEXUS is working from"
              right={
                <Link
                  to="/email"
                  className="focus-ring inline-flex items-center gap-1 rounded-full text-[12.5px] text-dim transition-colors hover:text-brand"
                >
                  Inbox
                  <ArrowRight size={13} />
                </Link>
              }
            />

            <div
              className={`card-quiet p-4 transition-all duration-500 ${
                started ? 'ring-1 ring-brand/25' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <Avatar initials={heroEmail.initials} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-[13.5px] font-medium text-text">{heroEmail.from}</p>
                    <span className="font-mono text-[10px] text-faint">
                      {heroEmail.fromRole} · {heroEmail.receivedAt}
                    </span>
                    {started && (
                      <span className="pop ml-auto inline-flex items-center gap-1.5 rounded-full border border-brand/35 bg-brand/[0.1] px-2 py-0.5 font-mono text-[9.5px] tracking-[0.12em] text-brand uppercase">
                        <Sparkles size={10} strokeWidth={2.4} />
                        Detected
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-[14px] leading-relaxed text-text/90">"{HERO_BODY}"</p>
                </div>
              </div>
            </div>

            {!started && (
              <div className="mt-4 flex flex-col items-start gap-3 rounded-2xl border border-dashed border-line p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-[46ch] text-[13px] leading-relaxed text-dim">
                  Nothing has been touched yet. Start the run to watch entity extraction, context
                  linking, planning, approval and verification happen in sequence.
                </p>
                <Button variant="primary" size="sm" onClick={() => startDemo()}>
                  <Play size={13} />
                  Start
                </Button>
              </div>
            )}

            {entities.length > 0 && (
              <div className="mt-5">
                <p className="kicker">Extracted · {entities.length} entities</p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {entities.map((e, i) => (
                    <span
                      key={e.id}
                      className="pop rounded-full border border-line bg-white/[0.03] px-3 py-1.5 text-[12.5px] text-text"
                      style={{ animationDelay: `${i * 45}ms` }}
                    >
                      <span className="font-mono text-[9.5px] tracking-[0.12em] text-brand uppercase">
                        {e.kind}
                      </span>
                      <span className="mx-1.5 text-faint">·</span>
                      {e.value}
                      <span className="ml-2 font-mono text-[9.5px] text-faint">
                        {Math.round(e.confidence * 100)}%
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {contextNodes.length > 0 && (
              <div className="mt-5">
                <p className="kicker">Context connected · {contextNodes.length} sources</p>
                <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
                  {contextNodes.map((node, i) => (
                    <div
                      key={node.id}
                      className="pop card-quiet p-3.5"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <p className="font-mono text-[9.5px] tracking-[0.12em] text-mint uppercase">
                        {node.source}
                      </p>
                      <p className="mt-1.5 text-[13.5px] font-medium text-text">{node.title}</p>
                      <p className="mt-0.5 text-[12px] leading-snug text-faint">{node.subtitle}</p>
                      <ul className="mt-2 flex flex-col gap-1">
                        {node.facts.slice(0, 2).map((f) => (
                          <li key={f} className="text-[11.5px] leading-snug text-dim">
                            <span className="mr-1.5 text-faint">—</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Panel>

          {/* action queue */}
          <Panel className="rise" style={{ ['--i' as string]: 1 }}>
            <PanelHead
              kicker="Plan · Approve · Execute"
              title="AI action queue"
              right={
                actions.length > 0 ? (
                  <Button size="sm" onClick={handleAll}>
                    <Zap size={13} />
                    Handle all safe
                  </Button>
                ) : undefined
              }
            />
            {actions.length === 0 ? (
              <EmptyState
                icon={<ListChecks size={19} />}
                title="No actions planned yet"
                body="NEXUS plans only from something it has actually observed. Run the demo and six dependency-linked actions appear here."
                action={
                  <Button size="sm" variant="primary" onClick={() => startDemo()}>
                    <Play size={13} />
                    Run the demo
                  </Button>
                }
              />
            ) : (
              <div className="flex flex-col gap-3">
                {actions.map((action, i) => (
                  <ActionCard key={action.id} action={action} index={i} />
                ))}
              </div>
            )}
          </Panel>

          {/* completion */}
          {phase === 'complete' && (
            <Panel className="pop border-mint/30">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-mint/15 text-mint ring-1 ring-mint/30">
                    <CheckCircle2 size={19} strokeWidth={2.2} />
                  </span>
                  <div>
                    <p className="kicker">Verify · Follow up</p>
                    <h2 className="display text-[22px] text-text">Execution Complete</h2>
                  </div>
                </div>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {COMPLETION_SUMMARY.map((item, i) => (
                    <li
                      key={item}
                      className="pop flex items-center gap-2.5 rounded-xl border border-mint/25 bg-mint/[0.06] px-3.5 py-2.5 text-[13.5px] text-text"
                      style={{ animationDelay: `${i * 90}ms` }}
                    >
                      <CheckCircle2 size={15} className="shrink-0 text-mint" strokeWidth={2.4} />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap items-center gap-2.5 border-t border-line pt-4">
                  <Link to="/commitments">
                    <Button size="sm">
                      See the follow-up
                      <ArrowRight size={13} />
                    </Button>
                  </Link>
                  <Button size="sm" variant="quiet" onClick={resetDemo}>
                    <RotateCcw size={13} />
                    Replay from the top
                  </Button>
                </div>
              </div>
            </Panel>
          )}
        </div>

        {/* ── right rail ───────────────────────────────────── */}
        <div className="flex flex-col gap-5">
          <Panel className="rise" style={{ ['--i' as string]: 1 }}>
            <PanelHead kicker="Priorities" title="Today" />
            <ul className="flex flex-col">
              {todaysPriorities.map((p, i) => (
                <li
                  key={p.id}
                  className={`flex items-start gap-3 py-3 ${i > 0 ? 'border-t border-line' : 'pt-0'}`}
                >
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                      p.weight === 'Critical'
                        ? 'bg-coral'
                        : p.weight === 'High'
                          ? 'bg-brand'
                          : 'bg-sky'
                    }`}
                  />
                  <div>
                    <p className="text-[13.5px] leading-snug text-text">{p.title}</p>
                    <p className="mt-1 font-mono text-[10.5px] tracking-[0.06em] text-faint">
                      {p.weight} · {p.meta}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel className="rise" style={{ ['--i' as string]: 2 }}>
            <PanelHead
              kicker="Trust gate"
              title="Pending approvals"
              right={
                <span className="font-mono text-[11px] text-coral">{pendingApprovals.length}</span>
              }
            />
            {pendingApprovals.length === 0 ? (
              <p className="text-[13px] leading-relaxed text-faint">
                Nothing is waiting on you. External actions — email, calls, messages — always land
                here first.
              </p>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {pendingApprovals.map((a) => (
                  <li key={a.id} className="card-quiet p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13.5px] text-text">{a.intent}</p>
                      <RiskChip risk={a.risk} />
                    </div>
                    <p className="mt-1 truncate font-mono text-[10.5px] text-faint">
                      {a.operation.target}
                    </p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={a.executionStatus !== 'awaiting_approval'}
                        onClick={() => release(a.id)}
                      >
                        {a.executionStatus === 'blocked'
                          ? 'Waiting on deps'
                          : a.executionStatus === 'approved' || a.executionStatus === 'executing'
                            ? 'Approved'
                            : 'Approve'}
                      </Button>
                      <Link
                        to="/actions"
                        className="focus-ring text-[12px] text-dim transition-colors hover:text-text"
                      >
                        Inspect
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel className="rise" style={{ ['--i' as string]: 3 }}>
            <PanelHead
              kicker="Trail"
              title="Completed actions"
              right={
                <span className="font-mono text-[11px] text-mint">{completed.length}</span>
              }
            />
            {completed.length === 0 ? (
              <p className="text-[13px] leading-relaxed text-faint">
                Executed actions land here with the verification that proves they actually landed.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {completed.map((a) => (
                  <li key={a.id} className="rise-fast flex items-start gap-2.5">
                    <CheckCircle2
                      size={15}
                      className={`mt-0.5 shrink-0 ${
                        a.verificationStatus === 'verified' ? 'text-mint' : 'text-faint'
                      }`}
                      strokeWidth={2.2}
                    />
                    <div>
                      <p className="text-[13px] text-text">{a.intent}</p>
                      <p className="font-mono text-[10px] tracking-[0.1em] text-faint uppercase">
                        {a.verificationStatus === 'verified' ? 'verified' : 'verifying…'}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel className="rise" style={{ ['--i' as string]: 4 }}>
            <PanelHead
              kicker="Loop closed"
              title="Commitments & follow-ups"
              right={
                <Link
                  to="/commitments"
                  className="focus-ring inline-flex items-center gap-1 text-[12.5px] text-dim transition-colors hover:text-brand"
                >
                  All
                  <ArrowRight size={13} />
                </Link>
              }
            />
            <ul className="flex flex-col gap-2.5">
              {commitments.slice(0, 3).map((c) => (
                <li
                  key={c.id}
                  className={`card-quiet p-3.5 ${c.fromDemo ? 'pop border-mint/30' : ''}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-[10px] tracking-[0.12em] text-faint uppercase">
                      {c.owner === 'me' ? 'Mine' : 'Theirs'}
                    </p>
                    <p
                      className={`inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] uppercase ${
                        c.status === 'waiting' ? 'text-sky' : 'text-brand'
                      }`}
                    >
                      <Clock size={10} />
                      {c.due}
                    </p>
                  </div>
                  <p className="mt-1.5 text-[13.5px] leading-snug text-text">{c.what}</p>
                  <p className="mt-1 text-[11.5px] text-faint">{c.who}</p>
                </li>
              ))}
            </ul>
            {followUps.length > 0 && (
              <p className="mt-3 flex items-center gap-2 border-t border-line pt-3 font-mono text-[10.5px] tracking-[0.1em] text-mint uppercase">
                <Timer size={12} />
                {followUps.length} follow-up armed
              </p>
            )}
          </Panel>

          <Panel className="rise" style={{ ['--i' as string]: 5 }}>
            <PanelHead kicker="Sources" title="Watching" />
            <ul className="flex flex-col gap-2.5">
              {[
                { icon: Inbox, label: '4 inboxes', detail: 'Mail · 2 unread, 1 acted on' },
                { icon: Clock, label: 'Calendar', detail: '1 event moved today' },
                { icon: ListChecks, label: 'Documents', detail: '1 file matched to a request' },
              ].map(({ icon: Icon, label, detail }) => (
                <li key={label} className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.04] text-faint ring-1 ring-white/[0.06]">
                    <Icon size={14} strokeWidth={1.9} />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-[13px] text-text">{label}</span>
                    <span className="block text-[11.5px] text-faint">{detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  )
}
