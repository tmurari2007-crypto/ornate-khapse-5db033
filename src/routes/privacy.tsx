import { createFileRoute } from '@tanstack/react-router'
import {
  CalendarClock,
  Check,
  FileText,
  Mail,
  PhoneCall,
  ShieldHalf,
  Users,
  X,
} from 'lucide-react'
import { Panel, PanelHead } from '../components/ui'
import { useNexus } from '../lib/store'

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
})

const ICONS: Record<string, typeof Mail> = {
  'perm-email': Mail,
  'perm-calendar': CalendarClock,
  'perm-contacts': Users,
  'perm-documents': FileText,
  'perm-calls': PhoneCall,
}

const RULES = [
  {
    allowed: true,
    text: 'Reads your mail, calendar, contacts and documents to build context',
  },
  { allowed: true, text: 'Moves events you own, and keeps them reversible for 24 hours' },
  { allowed: true, text: 'Drafts replies, notes and call scripts and holds them for you' },
  { allowed: false, text: 'Sends email, messages or documents outside your workspace unprompted' },
  { allowed: false, text: 'Places a call on your behalf without an approval on that exact call' },
  { allowed: false, text: 'Shares context between projects, or with anyone else' },
]

function PrivacyPage() {
  const { permissions, togglePermission } = useNexus()

  return (
    <div className="flex flex-col gap-5">
      <header className="rise">
        <p className="kicker">Trust</p>
        <h1 className="display mt-2 text-[27px] leading-tight text-text sm:text-[32px]">
          NEXUS acts inside a box you drew
        </h1>
        <p className="mt-2 max-w-[62ch] text-[14px] leading-relaxed text-dim">
          Reading is cheap and reversible. Anything that reaches another person is not, so it stops
          at an approval every time — including during a live demo.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {permissions.map((perm, i) => {
          const Icon = ICONS[perm.id] ?? ShieldHalf
          return (
            <Panel key={perm.id} className="rise" style={{ ['--i' as string]: i }}>
              <div className="flex items-start gap-3.5">
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 transition-colors ${
                    perm.granted
                      ? 'bg-brand/12 text-brand ring-brand/25'
                      : 'bg-white/[0.03] text-faint ring-white/10'
                  }`}
                >
                  <Icon size={17} strokeWidth={1.9} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[15px] font-medium text-text">{perm.label}</p>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={perm.granted}
                      aria-label={`${perm.granted ? 'Revoke' : 'Grant'} ${perm.label} access`}
                      onClick={() => togglePermission(perm.id)}
                      className={`focus-ring relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${
                        perm.granted ? 'bg-brand/80' : 'bg-white/[0.09]'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-ink transition-transform duration-300 ${
                          perm.granted ? 'translate-x-[22px]' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="mt-1 text-[12.5px] leading-snug text-dim">{perm.scope}</p>
                  <p className="mt-2.5 font-mono text-[10px] tracking-[0.12em] text-faint uppercase">
                    {perm.mode}
                    <span className="mx-2">·</span>
                    {perm.granted ? perm.lastUsed : 'Revoked'}
                  </p>
                  <p className="mt-2.5 border-t border-line pt-2.5 text-[12px] leading-relaxed text-faint">
                    {perm.detail}
                  </p>
                </div>
              </div>
            </Panel>
          )
        })}
      </div>

      <Panel className="rise">
        <PanelHead kicker="Boundaries" title="What NEXUS will and will not do" />
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {RULES.map((rule) => (
            <li
              key={rule.text}
              className="flex items-start gap-2.5 rounded-xl border border-line bg-white/[0.02] px-3.5 py-3 text-[13px] leading-relaxed text-dim"
            >
              <span
                className={`mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full ${
                  rule.allowed ? 'bg-mint/15 text-mint' : 'bg-coral/15 text-coral'
                }`}
              >
                {rule.allowed ? (
                  <Check size={11} strokeWidth={3} />
                ) : (
                  <X size={11} strokeWidth={3} />
                )}
              </span>
              {rule.text}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel className="rise">
        <PanelHead kicker="Data" title="Where things live" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: 'Context',
              body: 'Contacts, calendar entries and document summaries stay in this session and are discarded on reset.',
            },
            {
              title: 'Action trail',
              body: 'Every action keeps its source, the context it used, who approved it and what verification returned.',
            },
            {
              title: 'Transcripts',
              body: 'Assisted-call transcripts stay attached to the action that produced them, not to a separate log.',
            },
          ].map((item) => (
            <div key={item.title}>
              <p className="text-[13.5px] font-medium text-text">{item.title}</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-faint">{item.body}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
