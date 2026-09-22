import { classifyRisk, requiresApproval, riskRationale } from './risk-engine'
import { HERO_EMAIL_ID } from './seed'
import type { ActionOperation, ActionRecord, ContextNode } from './types'

/**
 * Action planner — stage 4 (Plan).
 *
 * Turns the linked context into an ordered, dependency-aware plan. Risk and
 * approval are not authored here: they are derived by the risk engine so the
 * policy lives in exactly one place.
 */

interface PlanSpec {
  id: string
  intent: string
  context: string[]
  operation: ActionOperation
  dependencies: string[]
  why: string
  durationMs: number
}

const HERO_PLAN: PlanSpec[] = [
  {
    id: 'act-01',
    intent: 'Update calendar',
    context: ['ctx-meeting-alpha', 'ctx-project-alpha'],
    operation: {
      kind: 'calendar.update',
      target: 'Project Alpha — Review',
      detail: 'Move tomorrow 14:00 → 11:00, keep attendees and room',
      preview: {
        label: 'Calendar change',
        lines: [
          'Was  ·  Tomorrow 14:00 – 15:00 · Vista 4',
          'Now  ·  Tomorrow 11:00 – 12:00 · Vista 4',
          'Attendees unchanged · 3 people notified by the calendar itself',
        ],
      },
    },
    dependencies: [],
    why: 'Ananya states the review moved to 11 AM, and the event on your calendar still says 14:00.',
    durationMs: 1400,
  },
  {
    id: 'act-02',
    intent: 'Find presentation',
    context: ['ctx-doc-deck', 'ctx-project-alpha'],
    operation: {
      kind: 'document.find',
      target: 'Project Alpha Presentation v3',
      detail: 'Resolve "updated presentation" to the newest version',
      preview: {
        label: 'Matched document',
        lines: [
          'Project Alpha Presentation v3 · 24 slides · 8.4 MB',
          'Updated 19 hours ago by you — newer than the v2 Rahul has',
          'Slides 14–17 contain the changes he is reviewing',
        ],
      },
    },
    dependencies: [],
    why: '"Updated presentation" is ambiguous; v3 is the only version newer than what Rahul already received.',
    durationMs: 1100,
  },
  {
    id: 'act-03',
    intent: 'Draft email',
    context: ['ctx-contact-rahul', 'ctx-doc-deck', 'ctx-meeting-alpha'],
    operation: {
      kind: 'email.draft',
      target: 'To: Rahul Menon',
      detail: 'Short cover note with v3 attached, referencing the 11:00 review',
      preview: {
        label: 'Draft · held for approval',
        lines: [
          'Subject: Project Alpha deck (v3) ahead of tomorrow’s 11 AM review',
          '',
          'Hi Rahul — the Alpha review moved to 11:00 AM tomorrow. Attaching',
          'Presentation v3; slides 14–17 are what changed since the version you',
          'saw on the 12th. Shout if you want anything reframed before we start.',
          '',
          '— Arjun   ·   attachment: Project Alpha Presentation v3.pdf',
        ],
      },
    },
    dependencies: ['act-02'],
    why: 'Rahul asks for documents ahead of reviews, so the deck goes with a note naming exactly what changed.',
    durationMs: 1600,
  },
  {
    id: 'act-04',
    intent: 'Send presentation',
    context: ['ctx-contact-rahul', 'ctx-doc-deck'],
    operation: {
      kind: 'email.send',
      target: 'rahul.menon@meridianlabs.io',
      detail: 'Deliver the approved draft with v3 attached',
      preview: {
        label: 'Outbound',
        lines: [
          'One recipient · one attachment · no cc',
          'Delivery window: now, ~21 hours before the review',
        ],
      },
    },
    dependencies: ['act-03'],
    why: 'The email only counts once it is delivered before 11:00 — this is the action the deadline is attached to.',
    durationMs: 1500,
  },
  {
    id: 'act-05',
    intent: 'Notify Rahul',
    context: ['ctx-contact-rahul', 'ctx-meeting-alpha'],
    operation: {
      kind: 'call.place',
      target: 'Rahul Menon · +91 98••• ••412',
      detail: 'Assisted call to confirm the new time and the deck',
      preview: {
        label: 'Call plan',
        lines: [
          'Confirm the 11:00 move · confirm v3 arrived',
          'Ask when he can review, then record whatever he commits to',
        ],
      },
    },
    dependencies: ['act-04'],
    why: 'A time change inside 24 hours is the one case where email alone has burned this review before.',
    durationMs: 1200,
  },
  {
    id: 'act-06',
    intent: 'Monitor follow-up',
    context: ['ctx-contact-rahul', 'ctx-meeting-alpha', 'ctx-project-alpha'],
    operation: {
      kind: 'monitor.followup',
      target: 'Rahul · review of v3',
      detail: 'Watch for his review and nudge if it slips past what he promised',
      preview: {
        label: 'Watch',
        lines: [
          'Trigger: no review signal by the time Rahul commits to',
          'Then: remind you, offer a one-tap nudge — never auto-send',
        ],
      },
    },
    dependencies: ['act-05'],
    why: 'Sent is not done. The review gate needs his sign-off, so the thread stays watched until it arrives.',
    durationMs: 1000,
  },
]

export function planHeroActions(_context: ContextNode[]): ActionRecord[] {
  return HERO_PLAN.map((spec) => {
    const risk = classifyRisk(spec.operation.kind)
    const approvalRequired = requiresApproval(risk)
    return {
      id: spec.id,
      source: {
        kind: 'email',
        ref: HERO_EMAIL_ID,
        label: 'Email · Ananya Krishnan',
      },
      intent: spec.intent,
      context: spec.context,
      operation: spec.operation,
      dependencies: spec.dependencies,
      risk,
      approvalRequired,
      executionStatus: spec.dependencies.length
        ? 'blocked'
        : approvalRequired
          ? 'awaiting_approval'
          : 'queued',
      verificationStatus: 'pending',
      why: spec.why,
      riskRationale: riskRationale(spec.operation.kind),
      durationMs: spec.durationMs,
      log: [],
    } satisfies ActionRecord
  })
}

/** An action is runnable when every dependency has completed. */
export function dependenciesMet(action: ActionRecord, all: ActionRecord[]): boolean {
  return action.dependencies.every(
    (dep) => all.find((a) => a.id === dep)?.executionStatus === 'done',
  )
}

export function nextRunnable(all: ActionRecord[]): ActionRecord | undefined {
  return all.find(
    (a) =>
      (a.executionStatus === 'queued' || a.executionStatus === 'approved') &&
      dependenciesMet(a, all),
  )
}
