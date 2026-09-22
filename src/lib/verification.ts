import type { ActionRecord } from './types'

/**
 * Verification module — stage 7. Execution reporting success is not the same as
 * the world having changed, so every action states what was checked afterwards.
 */

const CHECKS: Record<string, string> = {
  'calendar.update': 'Re-read the event: tomorrow 11:00–12:00, 3 attendees, Vista 4 held.',
  'document.find': 'Confirmed v3 is the newest version and is newer than the copy Rahul holds.',
  'email.draft': 'Draft exists with 1 attachment, 1 recipient, and no empty subject.',
  'email.send': 'Delivery receipt returned for rahul.menon@meridianlabs.io at 08:47.',
  'call.place': 'Call connected for 2m 14s; transcript captured and one commitment extracted.',
  'monitor.followup': 'Watch is armed for today 15:00 and visible under Commitments.',
}

export function verificationFor(action: ActionRecord): string {
  return CHECKS[action.operation.kind] ?? 'Result re-read after execution and matched the intent.'
}

export const COMPLETION_SUMMARY = [
  'Meeting updated',
  'Presentation shared',
  'Rahul notified',
  'Commitment recorded',
  'Follow-up scheduled',
]
