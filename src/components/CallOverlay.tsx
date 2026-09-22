import { useEffect, useState } from 'react'
import { Phone, PhoneOff, Sparkles, X } from 'lucide-react'
import { useNexus } from '../lib/store'
import { Avatar } from './ui'

/**
 * Simulated assisted call. Stays on screen a few seconds after hang-up so the
 * extracted commitment is readable, and can be dismissed at any time.
 */
export function CallOverlay() {
  const { call } = useNexus()
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (call.active) setDismissed(false)
  }, [call.active])

  useEffect(() => {
    if (!call.ended || call.active) return
    const t = setTimeout(() => setDismissed(true), 6000)
    return () => clearTimeout(t)
  }, [call.ended, call.active])

  if (dismissed) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/80 px-4 pb-24 backdrop-blur-md sm:items-center sm:pb-4">
      <div className="card pop flex w-full max-w-[520px] flex-col p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar initials="RM" />
            <div>
              <p className="display text-[17px] text-text">Rahul Menon</p>
              <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] uppercase">
                {call.active ? (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-mint breathe" />
                    <span className="text-mint">Assisted call · live</span>
                  </>
                ) : (
                  <span className="text-faint">Call ended · 2m 14s</span>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Close call"
            className="focus-ring rounded-full p-1.5 text-faint transition-colors hover:text-text"
          >
            <X size={17} />
          </button>
        </div>

        <div className="mt-5 flex max-h-[42vh] flex-col gap-2.5 overflow-y-auto no-scrollbar sm:max-h-[300px]">
          {call.turns.map((turn, i) => (
            <div
              key={i}
              className={`rise-fast max-w-[86%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                turn.speaker === 'nexus'
                  ? 'self-start border border-line bg-white/[0.035] text-dim'
                  : 'self-end bg-brand/[0.13] text-text ring-1 ring-brand/25'
              }`}
            >
              <span className="mb-1 block font-mono text-[9.5px] tracking-[0.14em] text-faint uppercase">
                {turn.speaker === 'nexus' ? 'NEXUS' : 'Rahul'}
              </span>
              {turn.text}
            </div>
          ))}
          {call.active && call.turns.length === 0 && (
            <p className="py-4 text-center font-mono text-[11px] tracking-[0.14em] text-faint uppercase">
              Dialling…
            </p>
          )}
          {call.active && call.turns.length > 0 && (
            <div className="flex items-center gap-1 self-start px-2 py-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="wave-bar h-1.5 w-1.5 rounded-full bg-brand/70"
                  style={{ animationDelay: `${i * 140}ms` }}
                />
              ))}
            </div>
          )}
        </div>

        {call.extracted && (
          <div className="rise-fast mt-4 rounded-2xl border border-mint/30 bg-mint/[0.07] p-4">
            <p className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] text-mint uppercase">
              <Sparkles size={11} strokeWidth={2.4} />
              Commitment extracted
            </p>
            <p className="mt-2 text-[14.5px] text-text">
              {call.extracted.who}
              <span className="mx-2 text-faint">→</span>
              {call.extracted.what}
              <span className="mx-2 text-faint">→</span>
              <span className="text-mint">{call.extracted.when}</span>
            </p>
            <p className="mt-1.5 text-[12px] text-faint">
              Recorded under Commitments with a follow-up armed for 3:15 PM.
            </p>
          </div>
        )}

        <div className="mt-5 flex items-center justify-center gap-3 border-t border-line pt-4">
          <span
            className={`grid h-11 w-11 place-items-center rounded-full ${
              call.active ? 'bg-mint/15 text-mint' : 'bg-white/[0.05] text-faint'
            }`}
          >
            {call.active ? <Phone size={17} /> : <PhoneOff size={17} />}
          </span>
          <p className="text-[12px] text-faint">
            {call.active
              ? 'NEXUS is speaking on your behalf. You approved this call.'
              : 'Transcript kept with the action trail.'}
          </p>
        </div>
      </div>
    </div>
  )
}
