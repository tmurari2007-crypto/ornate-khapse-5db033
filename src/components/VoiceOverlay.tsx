import { Check, Loader2, Mic, X } from 'lucide-react'
import { useNexus } from '../lib/store'

const STAGES = [
  { key: 'listening', label: 'Listening' },
  { key: 'understanding', label: 'Understanding' },
  { key: 'context', label: 'Finding context' },
  { key: 'planning', label: 'Planning' },
] as const

export function VoiceOverlay() {
  const { voice, closeVoice } = useNexus()
  const activeIndex = STAGES.findIndex((s) => s.key === voice.stage)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/78 px-4 pb-24 backdrop-blur-md sm:items-center sm:pb-4">
      <div className="card pop w-full max-w-[460px] p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="relative grid h-11 w-11 place-items-center rounded-full bg-brand/15 ring-1 ring-brand/30">
              <span className="absolute inset-0 rounded-full bg-brand/20 ripple" />
              <Mic size={18} className="text-brand" />
            </span>
            <div>
              <p className="kicker">{voice.live ? 'Microphone live' : 'Voice command'}</p>
              <p className="display mt-0.5 text-[17px] text-text">Talking to NEXUS</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeVoice}
            aria-label="Close"
            className="focus-ring rounded-full p-1.5 text-faint transition-colors hover:text-text"
          >
            <X size={17} />
          </button>
        </div>

        <div className="mt-5 flex h-8 items-end justify-center gap-[3px]">
          {Array.from({ length: 28 }).map((_, i) => (
            <span
              key={i}
              className="wave-bar w-[3px] rounded-full bg-brand/70"
              style={{
                height: `${12 + ((i * 7) % 20)}px`,
                animationDelay: `${(i % 9) * 90}ms`,
                opacity: voice.stage === 'listening' ? 1 : 0.28,
              }}
            />
          ))}
        </div>

        <p
          className={`mt-5 min-h-[52px] text-center text-[15.5px] leading-relaxed text-text ${
            voice.stage === 'listening' ? 'caret' : ''
          }`}
        >
          {voice.transcript || <span className="text-faint">Say something…</span>}
        </p>

        <ul className="mt-5 flex flex-col gap-1.5 border-t border-line pt-4">
          {STAGES.map((stage, i) => {
            const state = i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'idle'
            return (
              <li
                key={stage.key}
                className={`flex items-center gap-2.5 text-[13px] transition-colors duration-300 ${
                  state === 'idle' ? 'text-faint' : 'text-text'
                }`}
              >
                {state === 'done' ? (
                  <Check size={14} className="text-mint" strokeWidth={3} />
                ) : state === 'active' ? (
                  <Loader2 size={14} className="spin-slow text-brand" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-faint/60" />
                )}
                {stage.label}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
