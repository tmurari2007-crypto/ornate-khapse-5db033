import type { ActionOperation, Risk } from './types'

/**
 * Risk engine — decides what NEXUS may do on its own.
 *
 *  low     internal, reversible, no one outside sees it     → automatic
 *  medium  prepares something a human will send or act on   → prepare only
 *  high    leaves the building (email, call, message)       → approval required
 */

const HIGH: ActionOperation['kind'][] = ['email.send', 'call.place']
const MEDIUM: ActionOperation['kind'][] = ['email.draft']

export function classifyRisk(kind: ActionOperation['kind']): Risk {
  if (HIGH.includes(kind)) return 'high'
  if (MEDIUM.includes(kind)) return 'medium'
  return 'low'
}

export function requiresApproval(risk: Risk): boolean {
  return risk === 'high'
}

export function riskRationale(kind: ActionOperation['kind']): string {
  switch (kind) {
    case 'calendar.update':
      return 'Internal calendar you own. Reversible for 24 hours, so NEXUS proceeds automatically.'
    case 'document.find':
      return 'Read-only lookup inside your own workspace. Nothing leaves the device.'
    case 'email.draft':
      return 'Prepares content for you. Held as a draft — never delivered without approval.'
    case 'email.send':
      return 'Leaves your workspace and reaches a colleague. Explicit approval required.'
    case 'call.place':
      return 'An assisted voice call on your behalf. Explicit approval required, transcript retained.'
    case 'monitor.followup':
      return 'Passive watch on a thread you already own. No outbound side effects.'
  }
}

export const RISK_COPY: Record<Risk, { label: string; blurb: string }> = {
  low: { label: 'Low', blurb: 'Safe · runs automatically' },
  medium: { label: 'Medium', blurb: 'Prepared · held for you' },
  high: { label: 'High', blurb: 'External · needs approval' },
}
