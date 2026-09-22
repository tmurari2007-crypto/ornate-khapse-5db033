/**
 * NEXUS domain model.
 * Everything downstream of `ActionRecord` is simulated deterministically so the
 * demo replays identically for every judge.
 */

export type Risk = 'low' | 'medium' | 'high'

export type ExecutionStatus =
  | 'blocked' // a dependency has not completed
  | 'queued' // ready for the executor
  | 'awaiting_approval'
  | 'approved'
  | 'executing'
  | 'done'
  | 'skipped'

export type VerificationStatus = 'pending' | 'verifying' | 'verified' | 'failed'

export type OperationKind =
  | 'calendar.update'
  | 'document.find'
  | 'email.draft'
  | 'email.send'
  | 'call.place'
  | 'monitor.followup'

export interface ActionSource {
  kind: 'email' | 'voice' | 'call' | 'alert'
  ref: string
  label: string
}

export interface ActionOperation {
  kind: OperationKind
  target: string
  detail: string
  /** Rendered as a preview panel (draft body, calendar diff, file card). */
  preview?: { label: string; lines: string[] }
}

export interface LogEntry {
  at: number
  text: string
}

export interface ActionRecord {
  id: string
  source: ActionSource
  intent: string
  /** ids into the context graph that justify this action */
  context: string[]
  operation: ActionOperation
  dependencies: string[]
  risk: Risk
  approvalRequired: boolean
  executionStatus: ExecutionStatus
  verificationStatus: VerificationStatus
  /** short, human "Why?" rationale */
  why: string
  /** what the risk engine decided and why */
  riskRationale: string
  /** simulated work duration in ms */
  durationMs: number
  log: LogEntry[]
  verification?: string
}

export type EntityKind =
  | 'person'
  | 'project'
  | 'event'
  | 'datetime'
  | 'artifact'
  | 'constraint'

export interface Entity {
  id: string
  kind: EntityKind
  value: string
  note: string
  confidence: number
}

export type ContextKind = 'contact' | 'meeting' | 'document' | 'project'

export interface ContextNode {
  id: string
  kind: ContextKind
  title: string
  subtitle: string
  facts: string[]
  /** entity ids this node was matched from */
  matchedFrom: string[]
  source: string
}

export interface EmailIntelligence {
  summary: string
  intent: string
  deadline: string | null
  entities: Entity[]
  suggestedActions: string[]
  suggestedReply: string
}

export interface EmailRecord {
  id: string
  from: string
  fromRole: string
  initials: string
  subject: string
  body: string
  receivedAt: string
  unread: boolean
  priority: 'high' | 'normal' | 'low'
  hero?: boolean
  intelligence: EmailIntelligence
}

export interface Commitment {
  id: string
  owner: 'me' | 'other'
  who: string
  what: string
  due: string
  dueNote: string
  status: 'open' | 'waiting' | 'done'
  origin: string
  followUpAt?: string
  fromDemo?: boolean
}

export interface CallTurn {
  speaker: 'nexus' | 'rahul'
  text: string
  atMs: number
}

export type DemoPhase =
  | 'idle'
  | 'observing'
  | 'understanding'
  | 'connecting'
  | 'planning'
  | 'awaiting'
  | 'executing'
  | 'calling'
  | 'recording'
  | 'complete'

export const PIPELINE_STAGES = [
  'Observe',
  'Understand',
  'Connect',
  'Plan',
  'Approve',
  'Execute',
  'Verify',
  'Follow Up',
] as const

export type PipelineStage = (typeof PIPELINE_STAGES)[number]

export interface Permission {
  id: string
  label: string
  scope: string
  granted: boolean
  mode: 'read' | 'read+write' | 'read+write w/ approval'
  lastUsed: string
  detail: string
}

export interface ProactiveAlert {
  id: string
  severity: 'warning' | 'info'
  title: string
  body: string
  dismissed: boolean
  resolved: boolean
}
