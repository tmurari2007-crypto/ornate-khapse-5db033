import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { dependenciesMet, planHeroActions } from './action-planner'
import { extractEntities, linkContext } from './context-engine'
import { CALL_SCRIPT, stepsFor } from './execution'
import {
  HERO_EMAIL_ID,
  RAHUL_COMMITMENT_ID,
  seedAlerts,
  seedCommitments,
  seedEmails,
  seedPermissions,
} from './seed'
import { verificationFor } from './verification'
import type {
  ActionRecord,
  CallTurn,
  Commitment,
  ContextNode,
  DemoPhase,
  Entity,
  Permission,
  PipelineStage,
  ProactiveAlert,
} from './types'

/**
 * NEXUS runtime store.
 *
 * The orchestrator is a plain async walk over the plan. Every await is guarded
 * by a generation counter so "Reset Demo" instantly abandons in-flight work
 * instead of letting a stale timer write into fresh state.
 */

type VoiceStage = 'listening' | 'understanding' | 'context' | 'planning' | null

interface NexusState {
  phase: DemoPhase
  entities: Entity[]
  contextNodes: ContextNode[]
  actions: ActionRecord[]
  released: string[]
  commitments: Commitment[]
  alerts: ProactiveAlert[]
  permissions: Permission[]
  emailRead: string[]
  call: {
    active: boolean
    ended: boolean
    turns: CallTurn[]
    extracted: { who: string; what: string; when: string } | null
  }
  voice: { open: boolean; stage: VoiceStage; transcript: string; live: boolean }
}

const CANCELLED = Symbol('cancelled')

function initialState(): NexusState {
  return {
    phase: 'idle',
    entities: [],
    contextNodes: [],
    actions: [],
    released: [],
    commitments: seedCommitments.map((c) => ({ ...c })),
    alerts: seedAlerts.map((a) => ({ ...a })),
    permissions: seedPermissions.map((p) => ({ ...p })),
    emailRead: [],
    call: { active: false, ended: false, turns: [], extracted: null },
    voice: { open: false, stage: null, transcript: '', live: false },
  }
}

/**
 * Single source of truth for what an action is allowed to do next. Derived, so
 * dependencies and approvals can never drift out of sync with each other.
 */
function resolveStatuses(actions: ActionRecord[], released: string[]): ActionRecord[] {
  return actions.map((action) => {
    if (
      action.executionStatus === 'done' ||
      action.executionStatus === 'executing' ||
      action.executionStatus === 'skipped'
    ) {
      return action
    }
    let next: ActionRecord['executionStatus']
    if (!dependenciesMet(action, actions)) next = 'blocked'
    else if (released.includes(action.id)) next = 'approved'
    else if (action.approvalRequired) next = 'awaiting_approval'
    else next = 'queued'
    return next === action.executionStatus ? action : { ...action, executionStatus: next }
  })
}

interface NexusApi extends NexusState {
  heroEmailId: string
  stageState: Record<PipelineStage, 'idle' | 'active' | 'done'>
  aiStatus: { label: string; detail: string; busy: boolean }
  safeCount: number
  pendingApprovals: ActionRecord[]
  completed: ActionRecord[]
  startDemo: (opts?: { releaseSafe?: boolean }) => void
  handleAll: () => void
  release: (id: string) => void
  resetDemo: () => void
  openVoice: () => void
  closeVoice: () => void
  markEmailRead: (id: string) => void
  dismissAlert: (id: string) => void
  togglePermission: (id: string) => void
}

const NexusContext = createContext<NexusApi | null>(null)

export function NexusProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<NexusState>(initialState)
  const genRef = useRef(0)
  const stateRef = useRef(state)
  const runningRef = useRef(false)
  stateRef.current = state

  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([])
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout)
    },
    [],
  )

  const sleep = useCallback((ms: number, gen: number) => {
    return new Promise<void>((resolve, reject) => {
      const t = setTimeout(() => {
        if (gen !== genRef.current) reject(CANCELLED)
        else resolve()
      }, ms)
      timers.current.push(t)
    })
  }, [])

  const patch = useCallback((gen: number, fn: (s: NexusState) => NexusState) => {
    if (gen !== genRef.current) return
    setState((s) => fn(s))
  }, [])

  const updateAction = useCallback(
    (gen: number, id: string, fn: (a: ActionRecord) => ActionRecord) => {
      patch(gen, (s) => {
        const actions = s.actions.map((a) => (a.id === id ? fn(a) : a))
        return { ...s, actions: resolveStatuses(actions, s.released) }
      })
    },
    [patch],
  )

  /** Stage 6 + 7 for a single action, including the call sub-flow. */
  const executeAction = useCallback(
    async (gen: number, action: ActionRecord) => {
      updateAction(gen, action.id, (a) => ({
        ...a,
        executionStatus: 'executing',
        log: [],
      }))

      const steps = stepsFor(action)
      const isCall = action.operation.kind === 'call.place'
      if (isCall) {
        patch(gen, (s) => ({
          ...s,
          phase: 'calling',
          call: { active: true, ended: false, turns: [], extracted: null },
        }))
      }

      for (let i = 0; i < steps.length; i++) {
        await sleep(Math.max(420, action.durationMs / steps.length), gen)
        const text = steps[i]
        updateAction(gen, action.id, (a) => ({
          ...a,
          log: [...a.log, { at: Date.now(), text }],
        }))

        // The call transcript plays while the call action is mid-flight.
        if (isCall && i === 1) {
          let last = 0
          for (const turn of CALL_SCRIPT) {
            await sleep(turn.atMs - last, gen)
            last = turn.atMs
            patch(gen, (s) => ({
              ...s,
              call: { ...s.call, turns: [...s.call.turns, turn] },
            }))
          }
          await sleep(700, gen)
          patch(gen, (s) => ({
            ...s,
            phase: 'recording',
            call: {
              ...s.call,
              ended: true,
              extracted: {
                who: 'Rahul Menon',
                what: 'Review Project Alpha Presentation v3',
                when: 'Today, 3:00 PM',
              },
            },
            commitments: s.commitments.some((c) => c.id === RAHUL_COMMITMENT_ID)
              ? s.commitments
              : [
                  {
                    id: RAHUL_COMMITMENT_ID,
                    owner: 'other',
                    who: 'Rahul Menon → You',
                    what: 'Review Project Alpha Presentation v3',
                    due: 'Today, 3:00 PM',
                    dueNote: 'Said so on the assisted call',
                    status: 'open',
                    origin: 'Assisted call · 2m 14s',
                    followUpAt: 'Today, 3:15 PM',
                    fromDemo: true,
                  },
                  ...s.commitments,
                ],
            })
          )
          await sleep(900, gen)
        }
      }

      if (isCall) {
        patch(gen, (s) => ({
          ...s,
          phase: 'executing',
          call: { ...s.call, active: false },
        }))
      }

      updateAction(gen, action.id, (a) => ({
        ...a,
        executionStatus: 'done',
        verificationStatus: 'verifying',
      }))
      await sleep(650, gen)
      updateAction(gen, action.id, (a) => ({
        ...a,
        verificationStatus: 'verified',
        verification: verificationFor(a),
      }))

      if (action.operation.kind === 'email.send') {
        patch(gen, (s) => ({
          ...s,
          alerts: s.alerts.map((al) =>
            al.id === 'alert-alpha-deck' ? { ...al, resolved: true } : al,
          ),
        }))
      }
    },
    [patch, sleep, updateAction],
  )

  /** Drains every released action whose dependencies are satisfied. */
  const drain = useCallback(
    async (gen: number) => {
      if (runningRef.current) return
      runningRef.current = true
      try {
        for (;;) {
          if (gen !== genRef.current) break
          const snapshot = stateRef.current
          const next = snapshot.actions.find(
            (a) => a.executionStatus === 'approved' && dependenciesMet(a, snapshot.actions),
          )
          if (!next) break
          patch(gen, (s) => (s.phase === 'complete' ? s : { ...s, phase: 'executing' }))
          await executeAction(gen, next)
          await sleep(180, gen)
        }
        if (gen === genRef.current) {
          const all = stateRef.current.actions
          const everythingDone = all.length > 0 && all.every((a) => a.executionStatus === 'done')
          patch(gen, (s) => ({
            ...s,
            phase: everythingDone ? 'complete' : s.actions.length ? 'awaiting' : s.phase,
          }))
        }
      } catch (err) {
        if (err !== CANCELLED) throw err
      } finally {
        runningRef.current = false
      }
    },
    [executeAction, patch, sleep],
  )

  /** Stages 1–4: Observe, Understand, Connect, Plan. */
  const startDemo = useCallback(
    (opts?: { releaseSafe?: boolean }) => {
      if (stateRef.current.actions.length > 0) {
        if (opts?.releaseSafe) {
          patch(genRef.current, (s) => ({
            ...s,
            released: Array.from(
              new Set([
                ...s.released,
                ...s.actions.filter((a) => !a.approvalRequired).map((a) => a.id),
              ]),
            ),
          }))
        }
        return
      }
      const gen = genRef.current
      void (async () => {
        try {
          patch(gen, (s) => ({ ...s, phase: 'observing', emailRead: [HERO_EMAIL_ID] }))
          await sleep(1100, gen)

          const email = seedEmails.find((e) => e.id === HERO_EMAIL_ID)!
          const entities = extractEntities(email.body)
          patch(gen, (s) => ({ ...s, phase: 'understanding' }))
          for (let i = 0; i < entities.length; i++) {
            await sleep(320, gen)
            patch(gen, (s) => ({ ...s, entities: entities.slice(0, i + 1) }))
          }

          await sleep(400, gen)
          const nodes = linkContext(entities)
          patch(gen, (s) => ({ ...s, phase: 'connecting' }))
          for (let i = 0; i < nodes.length; i++) {
            await sleep(360, gen)
            patch(gen, (s) => ({ ...s, contextNodes: nodes.slice(0, i + 1) }))
          }

          await sleep(450, gen)
          patch(gen, (s) => ({ ...s, phase: 'planning' }))
          const plan = planHeroActions(nodes)
          for (let i = 0; i < plan.length; i++) {
            await sleep(300, gen)
            patch(gen, (s) => ({
              ...s,
              actions: resolveStatuses(plan.slice(0, i + 1), s.released),
            }))
          }

          await sleep(400, gen)
          patch(gen, (s) => ({
            ...s,
            phase: 'awaiting',
            released: opts?.releaseSafe
              ? Array.from(
                  new Set([
                    ...s.released,
                    ...s.actions.filter((a) => !a.approvalRequired).map((a) => a.id),
                  ]),
                )
              : s.released,
          }))
        } catch (err) {
          if (err !== CANCELLED) throw err
        }
      })()
    },
    [patch, sleep],
  )

  // Whenever something becomes released and unblocked, the executor picks it up.
  useEffect(() => {
    const hasWork = state.actions.some((a) => a.executionStatus === 'approved')
    if (hasWork && !runningRef.current) void drain(genRef.current)
  }, [state.actions, drain])

  const release = useCallback(
    (id: string) => {
      patch(genRef.current, (s) => {
        const released = s.released.includes(id) ? s.released : [...s.released, id]
        return { ...s, released, actions: resolveStatuses(s.actions, released) }
      })
    },
    [patch],
  )

  const handleAll = useCallback(() => {
    if (stateRef.current.actions.length === 0) {
      startDemo({ releaseSafe: true })
      return
    }
    patch(genRef.current, (s) => {
      const released = Array.from(
        new Set([...s.released, ...s.actions.filter((a) => !a.approvalRequired).map((a) => a.id)]),
      )
      return { ...s, released, actions: resolveStatuses(s.actions, released) }
    })
  }, [patch, startDemo])

  const resetDemo = useCallback(() => {
    genRef.current += 1
    runningRef.current = false
    timers.current.forEach(clearTimeout)
    timers.current = []
    setState(initialState())
  }, [])

  const openVoice = useCallback(() => {
    const gen = genRef.current
    const phrase = "Handle Rahul's Project Alpha update."
    patch(gen, (s) => ({
      ...s,
      voice: { open: true, stage: 'listening', transcript: '', live: false },
    }))

    // Use real speech recognition when the browser offers it; the simulated
    // transcript runs either way so the demo never stalls on a denied mic.
    let recognition: any = null
    if (typeof window !== 'undefined') {
      const Ctor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (Ctor) {
        try {
          recognition = new Ctor()
          recognition.lang = 'en-US'
          recognition.interimResults = true
          recognition.continuous = false
          recognition.onresult = (event: any) => {
            const said = Array.from(event.results as ArrayLike<any>)
              .map((r: any) => r[0].transcript)
              .join(' ')
              .trim()
            if (said) {
              patch(gen, (s) =>
                s.voice.open ? { ...s, voice: { ...s.voice, transcript: said, live: true } } : s,
              )
            }
          }
          recognition.onerror = () => {}
          recognition.start()
        } catch {
          recognition = null
        }
      }
    }

    void (async () => {
      try {
        for (let i = 1; i <= phrase.length; i += 2) {
          await sleep(28, gen)
          patch(gen, (s) =>
            s.voice.open && !s.voice.live
              ? { ...s, voice: { ...s.voice, transcript: phrase.slice(0, i) } }
              : s,
          )
        }
        patch(gen, (s) =>
          s.voice.open ? { ...s, voice: { ...s.voice, transcript: s.voice.transcript || phrase } } : s,
        )
        await sleep(650, gen)
        try {
          recognition?.stop()
        } catch {}
        patch(gen, (s) => ({ ...s, voice: { ...s.voice, stage: 'understanding' } }))
        await sleep(900, gen)
        patch(gen, (s) => ({ ...s, voice: { ...s.voice, stage: 'context' } }))
        await sleep(950, gen)
        patch(gen, (s) => ({ ...s, voice: { ...s.voice, stage: 'planning' } }))
        await sleep(950, gen)
        patch(gen, (s) => ({
          ...s,
          voice: { open: false, stage: null, transcript: '', live: false },
        }))
        startDemo()
      } catch (err) {
        if (err !== CANCELLED) throw err
      }
    })()
  }, [patch, sleep, startDemo])

  const closeVoice = useCallback(() => {
    patch(genRef.current, (s) => ({
      ...s,
      voice: { open: false, stage: null, transcript: '', live: false },
    }))
  }, [patch])

  const markEmailRead = useCallback(
    (id: string) => {
      patch(genRef.current, (s) =>
        s.emailRead.includes(id) ? s : { ...s, emailRead: [...s.emailRead, id] },
      )
    },
    [patch],
  )

  const dismissAlert = useCallback(
    (id: string) => {
      patch(genRef.current, (s) => ({
        ...s,
        alerts: s.alerts.map((a) => (a.id === id ? { ...a, dismissed: true } : a)),
      }))
    },
    [patch],
  )

  const togglePermission = useCallback(
    (id: string) => {
      patch(genRef.current, (s) => ({
        ...s,
        permissions: s.permissions.map((p) =>
          p.id === id ? { ...p, granted: !p.granted } : p,
        ),
      }))
    },
    [patch],
  )

  const api = useMemo<NexusApi>(() => {
    const stageState = deriveStages(state)
    return {
      ...state,
      heroEmailId: HERO_EMAIL_ID,
      stageState,
      aiStatus: deriveAiStatus(state),
      safeCount: state.actions.filter(
        (a) => !a.approvalRequired && a.executionStatus !== 'done',
      ).length,
      pendingApprovals: state.actions.filter(
        (a) => a.approvalRequired && a.executionStatus !== 'done',
      ),
      completed: state.actions.filter((a) => a.executionStatus === 'done'),
      startDemo,
      handleAll,
      release,
      resetDemo,
      openVoice,
      closeVoice,
      markEmailRead,
      dismissAlert,
      togglePermission,
    }
  }, [
    state,
    startDemo,
    handleAll,
    release,
    resetDemo,
    openVoice,
    closeVoice,
    markEmailRead,
    dismissAlert,
    togglePermission,
  ])

  return <NexusContext.Provider value={api}>{children}</NexusContext.Provider>
}

function deriveStages(s: NexusState): Record<PipelineStage, 'idle' | 'active' | 'done'> {
  const out: Record<PipelineStage, 'idle' | 'active' | 'done'> = {
    Observe: 'idle',
    Understand: 'idle',
    Connect: 'idle',
    Plan: 'idle',
    Approve: 'idle',
    Execute: 'idle',
    Verify: 'idle',
    'Follow Up': 'idle',
  }
  const p = s.phase
  if (p === 'idle') return out
  const order: DemoPhase[] = [
    'observing',
    'understanding',
    'connecting',
    'planning',
    'awaiting',
    'executing',
    'calling',
    'recording',
    'complete',
  ]
  const idx = order.indexOf(p)
  const mark = (stage: PipelineStage, at: number) => {
    if (idx > at) out[stage] = 'done'
    else if (idx === at) out[stage] = 'active'
  }
  mark('Observe', 0)
  mark('Understand', 1)
  mark('Connect', 2)
  mark('Plan', 3)
  if (s.entities.length) out.Understand = idx > 1 ? 'done' : 'active'
  if (s.contextNodes.length) out.Connect = idx > 2 ? 'done' : 'active'
  if (s.actions.length) out.Plan = idx > 3 ? 'done' : 'active'

  const approvedAll = s.actions.length > 0 && s.actions.every((a) => s.released.includes(a.id))
  if (s.actions.length) out.Approve = approvedAll ? 'done' : idx >= 4 ? 'active' : 'idle'

  const executing = s.actions.some((a) => a.executionStatus === 'executing')
  const anyDone = s.actions.some((a) => a.executionStatus === 'done')
  const allDone = s.actions.length > 0 && s.actions.every((a) => a.executionStatus === 'done')
  if (executing) out.Execute = 'active'
  else if (allDone) out.Execute = 'done'
  else if (anyDone) out.Execute = 'active'

  const verified = s.actions.filter((a) => a.verificationStatus === 'verified').length
  if (verified > 0) out.Verify = allDone && verified === s.actions.length ? 'done' : 'active'

  const followUp = s.commitments.find((c) => c.id === RAHUL_COMMITMENT_ID)
  if (followUp) out['Follow Up'] = p === 'complete' ? 'done' : 'active'
  return out
}

function deriveAiStatus(s: NexusState): { label: string; detail: string; busy: boolean } {
  switch (s.phase) {
    case 'idle':
      return { label: 'Standing by', detail: '4 inboxes watched · 0 actions in flight', busy: false }
    case 'observing':
      return { label: 'Observing', detail: 'New mail from Ananya Krishnan', busy: true }
    case 'understanding':
      return { label: 'Understanding', detail: 'Extracting entities and intent', busy: true }
    case 'connecting':
      return { label: 'Connecting context', detail: 'Matching contacts, calendar, documents', busy: true }
    case 'planning':
      return { label: 'Planning', detail: 'Sequencing actions and dependencies', busy: true }
    case 'awaiting': {
      const pending = s.actions.filter(
        (a) => a.executionStatus === 'awaiting_approval',
      ).length
      return {
        label: pending ? 'Waiting on you' : 'Ready',
        detail: pending ? `${pending} action${pending > 1 ? 's' : ''} need approval` : 'Plan ready to run',
        busy: false,
      }
    }
    case 'executing':
      return { label: 'Executing', detail: 'Running approved actions', busy: true }
    case 'calling':
      return { label: 'On a call', detail: 'Assisted call with Rahul Menon', busy: true }
    case 'recording':
      return { label: 'Recording commitment', detail: 'Extracting what Rahul promised', busy: true }
    case 'complete':
      return { label: 'Execution complete', detail: 'All 6 actions verified', busy: false }
  }
}

export function useNexus(): NexusApi {
  const ctx = useContext(NexusContext)
  if (!ctx) throw new Error('useNexus must be used inside <NexusProvider>')
  return ctx
}
