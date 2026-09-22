import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ArrowRight,
  CheckCircle2,
  CornerUpLeft,
  Lock,
  Play,
  Sparkles,
  Target,
  Timer,
} from 'lucide-react'
import { Avatar, Button, Panel, PanelHead } from '../components/ui'
import { extractEntities } from '../lib/context-engine'
import { seedEmails } from '../lib/seed'
import { useNexus } from '../lib/store'

export const Route = createFileRoute('/email')({
  component: EmailPage,
})

function EmailPage() {
  const { heroEmailId, emailRead, markEmailRead, startDemo, actions } = useNexus()
  const [selectedId, setSelectedId] = useState(heroEmailId)
  const [replyState, setReplyState] = useState<'idle' | 'confirm' | 'sent'>('idle')

  const email = seedEmails.find((e) => e.id === selectedId)!
  const entities = extractEntities(email.body)

  const select = (id: string) => {
    setSelectedId(id)
    setReplyState('idle')
    markEmailRead(id)
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="rise">
        <p className="kicker">Email intelligence</p>
        <h1 className="display mt-2 text-[27px] leading-tight text-text sm:text-[32px]">
          Read once, understood completely
        </h1>
        <p className="mt-2 max-w-[62ch] text-[14px] leading-relaxed text-dim">
          Every message is reduced to what it asks of you: intent, entities, the deadline hiding in
          the prose, and the actions that would actually close it.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        {/* list */}
        <Panel className="rise p-0! sm:p-0!">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <p className="kicker">Inbox</p>
              <h2 className="display mt-1 text-[17px] text-text">{seedEmails.length} messages</h2>
            </div>
            <span className="font-mono text-[10px] tracking-[0.12em] text-brand uppercase">
              {seedEmails.filter((e) => e.unread && !emailRead.includes(e.id)).length} unread
            </span>
          </div>
          <ul>
            {seedEmails.map((e, i) => {
              const active = e.id === selectedId
              const unread = e.unread && !emailRead.includes(e.id)
              return (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => select(e.id)}
                    className={`focus-ring rise w-full border-b border-line px-5 py-4 text-left transition-colors duration-200 ${
                      active ? 'bg-brand/[0.07]' : 'hover:bg-white/[0.025]'
                    }`}
                    style={{ ['--i' as string]: i }}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar initials={e.initials} tone={active ? 'brand' : 'neutral'} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`truncate text-[13.5px] ${
                              unread ? 'font-semibold text-text' : 'text-dim'
                            }`}
                          >
                            {e.from}
                          </p>
                          <span className="shrink-0 font-mono text-[10px] text-faint">
                            {e.receivedAt}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-[13px] text-text/85">{e.subject}</p>
                        <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-faint">
                          {e.body}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          {unread && <span className="h-1.5 w-1.5 rounded-full bg-brand" />}
                          {e.hero && (
                            <span className="rounded-full border border-coral/35 bg-coral/[0.1] px-2 py-0.5 font-mono text-[9px] tracking-[0.12em] text-coral uppercase">
                              Deadline today
                            </span>
                          )}
                          {e.priority === 'low' && (
                            <span className="font-mono text-[9.5px] tracking-[0.12em] text-faint uppercase">
                              No action
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </Panel>

        {/* intelligence */}
        <div className="flex flex-col gap-5">
          <Panel className="rise" style={{ ['--i' as string]: 1 }}>
            <div className="flex items-start gap-3">
              <Avatar initials={email.initials} />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium text-text">{email.subject}</p>
                <p className="mt-0.5 font-mono text-[10.5px] text-faint">
                  {email.from} · {email.fromRole} · {email.receivedAt}
                </p>
              </div>
            </div>
            <p className="mt-4 text-[14px] leading-relaxed text-text/90">{email.body}</p>

            <div className="mt-5 grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
              <div>
                <p className="kicker">Summary</p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-text">
                  {email.intelligence.summary}
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <p className="kicker">Intent</p>
                  <p className="mt-1.5 flex items-start gap-2 text-[13.5px] leading-snug text-text">
                    <Target size={14} className="mt-0.5 shrink-0 text-brand" />
                    {email.intelligence.intent}
                  </p>
                </div>
                <div>
                  <p className="kicker">Deadline</p>
                  <p
                    className={`mt-1.5 flex items-center gap-2 text-[13.5px] ${
                      email.intelligence.deadline ? 'text-coral' : 'text-faint'
                    }`}
                  >
                    <Timer size={14} className="shrink-0" />
                    {email.intelligence.deadline ?? 'None detected'}
                  </p>
                </div>
              </div>
            </div>

            {entities.length > 0 && (
              <div className="mt-5 border-t border-line pt-4">
                <p className="kicker">Important entities</p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {entities.map((e) => (
                    <span
                      key={e.id}
                      className="rounded-full border border-line bg-white/[0.03] px-3 py-1.5 text-[12.5px] text-text"
                      title={e.note}
                    >
                      <span className="font-mono text-[9.5px] tracking-[0.12em] text-brand uppercase">
                        {e.kind}
                      </span>
                      <span className="mx-1.5 text-faint">·</span>
                      {e.value}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Panel>

          <Panel className="rise" style={{ ['--i' as string]: 2 }}>
            <PanelHead kicker="Suggested" title="Actions NEXUS would take" />
            <ul className="flex flex-col gap-2">
              {email.intelligence.suggestedActions.map((a, i) => (
                <li
                  key={a}
                  className="flex items-start gap-2.5 rounded-xl border border-line bg-white/[0.02] px-3.5 py-2.5 text-[13.5px] text-text"
                >
                  <span className="mt-0.5 font-mono text-[10px] text-faint">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {a}
                </li>
              ))}
            </ul>

            {email.id === heroEmailId && (
              <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-line pt-4">
                {actions.length === 0 ? (
                  <Button variant="primary" size="sm" onClick={() => startDemo()}>
                    <Play size={13} />
                    Plan these actions
                  </Button>
                ) : (
                  <Link to="/actions">
                    <Button variant="primary" size="sm">
                      <Sparkles size={13} />
                      {actions.length} actions planned
                      <ArrowRight size={13} />
                    </Button>
                  </Link>
                )}
                <span className="text-[12px] text-faint">
                  Planning is free. Nothing leaves your workspace without approval.
                </span>
              </div>
            )}
          </Panel>

          <Panel className="rise" style={{ ['--i' as string]: 3 }}>
            <PanelHead
              kicker="Suggested reply"
              title="Drafted, not sent"
              right={
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] text-coral uppercase">
                  <Lock size={11} />
                  Needs approval
                </span>
              }
            />
            <div className="card-quiet p-4">
              <p className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-text">
                <CornerUpLeft size={15} className="mt-0.5 shrink-0 text-faint" />
                {email.intelligence.suggestedReply}
              </p>
            </div>

            {replyState === 'sent' ? (
              <p className="pop mt-4 flex items-center gap-2 rounded-xl border border-mint/25 bg-mint/[0.06] px-3.5 py-2.5 text-[13px] text-mint">
                <CheckCircle2 size={15} strokeWidth={2.2} />
                Reply sent to {email.from.split(' ')[0]} · delivery verified
              </p>
            ) : replyState === 'confirm' ? (
              <div className="pop mt-4 rounded-xl border border-coral/30 bg-coral/[0.07] p-3.5">
                <p className="text-[13px] leading-relaxed text-text">
                  This leaves your workspace and reaches {email.from}. Approve to send?
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Button size="sm" variant="primary" onClick={() => setReplyState('sent')}>
                    Approve & send
                  </Button>
                  <Button size="sm" variant="quiet" onClick={() => setReplyState('idle')}>
                    Keep as draft
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-2.5">
                <Button size="sm" onClick={() => setReplyState('confirm')}>
                  Send reply
                </Button>
                <span className="text-[12px] text-faint">Held as a draft until you approve.</span>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}
