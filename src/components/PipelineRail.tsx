import { Check } from 'lucide-react'
import { PIPELINE_STAGES } from '../lib/types'
import { useNexus } from '../lib/store'

/** The eight-stage spine of the product, always visible during a run. */
export function PipelineRail() {
  const { stageState } = useNexus()
  return (
    <div className="-mx-4 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:px-0">
      <ol className="flex min-w-max items-center gap-0 sm:min-w-0 sm:justify-between">
        {PIPELINE_STAGES.map((stage, i) => {
          const state = stageState[stage]
          return (
            <li key={stage} className="flex items-center">
              <div className="flex items-center gap-2">
                <span
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-all duration-500 ${
                    state === 'done'
                      ? 'border-mint/50 bg-mint/15 text-mint'
                      : state === 'active'
                        ? 'border-brand bg-brand/20 text-brand'
                        : 'border-line text-faint'
                  }`}
                >
                  {state === 'done' ? (
                    <Check size={11} strokeWidth={3.2} />
                  ) : (
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        state === 'active' ? 'bg-brand breathe' : 'bg-faint/70'
                      }`}
                    />
                  )}
                </span>
                <span
                  className={`font-mono text-[10px] tracking-[0.12em] uppercase transition-colors duration-500 ${
                    state === 'idle' ? 'text-faint' : state === 'active' ? 'text-brand' : 'text-dim'
                  }`}
                >
                  {stage}
                </span>
              </div>
              {i < PIPELINE_STAGES.length - 1 && (
                <span
                  className={`mx-2.5 h-px w-7 transition-colors duration-500 sm:w-5 lg:w-8 ${
                    stageState[PIPELINE_STAGES[i + 1]] !== 'idle' ? 'bg-mint/40' : 'bg-line'
                  }`}
                />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
