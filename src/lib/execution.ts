import type { ActionRecord, CallTurn } from './types'

/**
 * Execution module — stage 6. Each operation has a short script of log lines so
 * the user sees work happening rather than a spinner.
 */

export const EXECUTION_STEPS: Record<string, string[]> = {
  'calendar.update': [
    'Opening Project Alpha — Review',
    'Shifting 14:00 → 11:00, holding Vista 4',
    'Calendar updated',
  ],
  'document.find': [
    'Searching Documents for "Alpha presentation"',
    'Comparing v1 · v2 · v3 by modified time',
    'Presentation found — v3 selected',
  ],
  'email.draft': [
    'Composing cover note for Rahul Menon',
    'Attaching Project Alpha Presentation v3.pdf',
    'Email drafted — held for your approval',
  ],
  'email.send': [
    'Approval recorded',
    'Delivering to rahul.menon@meridianlabs.io',
    'Email sent',
  ],
  'call.place': [
    'Placing assisted call to Rahul Menon',
    'Connected — NEXUS speaking on your behalf',
    'Rahul notified',
  ],
  'monitor.followup': [
    'Registering watch on Rahul · review of v3',
    'Follow-up scheduled',
  ],
}

export function stepsFor(action: ActionRecord): string[] {
  return EXECUTION_STEPS[action.operation.kind] ?? ['Working', 'Done']
}

/** The simulated assisted call. Timings are offsets in ms from call start. */
export const CALL_SCRIPT: CallTurn[] = [
  {
    speaker: 'nexus',
    text: "Hi Rahul, this is Arjun's assistant. The Project Alpha review moved to 11 AM tomorrow.",
    atMs: 900,
  },
  { speaker: 'rahul', text: 'Got it — 11 AM tomorrow, noted.', atMs: 4200 },
  {
    speaker: 'nexus',
    text: "I've also sent you Presentation v3. Slides 14 to 17 are the ones that changed.",
    atMs: 6600,
  },
  { speaker: 'rahul', text: "I'll review it by 3 PM.", atMs: 10200 },
  {
    speaker: 'nexus',
    text: "Recorded — 3 PM today. I'll check in if anything slips. Thanks Rahul.",
    atMs: 12600,
  },
]

export const CALL_DURATION_MS = 14600
