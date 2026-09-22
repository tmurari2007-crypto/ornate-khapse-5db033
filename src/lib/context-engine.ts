import { contextGraph } from './seed'
import type { ContextNode, Entity } from './types'

/**
 * Context engine — stage 2 and 3 of the pipeline (Understand, Connect).
 *
 * The extraction is rule-driven against the seeded corpus rather than a live
 * model call: the same sentence always yields the same six entities, which is
 * what makes the demo replayable.
 */

const HERO_ENTITIES: Entity[] = [
  {
    id: 'ent-person',
    kind: 'person',
    value: 'Rahul',
    note: 'Recipient — resolved to Rahul Menon',
    confidence: 0.98,
  },
  {
    id: 'ent-project',
    kind: 'project',
    value: 'Project Alpha',
    note: 'Active project, phase 2',
    confidence: 0.99,
  },
  {
    id: 'ent-event',
    kind: 'event',
    value: 'Review meeting',
    note: 'Existing calendar event, being moved',
    confidence: 0.96,
  },
  {
    id: 'ent-datetime',
    kind: 'datetime',
    value: 'Tomorrow 11:00 AM',
    note: 'Absolute time resolved from "tomorrow"',
    confidence: 0.97,
  },
  {
    id: 'ent-artifact',
    kind: 'artifact',
    value: 'Presentation required',
    note: '"updated presentation" → latest version needed',
    confidence: 0.94,
  },
  {
    id: 'ent-constraint',
    kind: 'constraint',
    value: 'Deadline: before the meeting',
    note: 'Delivery must complete before 11:00 AM',
    confidence: 0.95,
  },
]

export function extractEntities(body: string): Entity[] {
  const lower = body.toLowerCase()
  if (lower.includes('project alpha') && lower.includes('presentation')) {
    return HERO_ENTITIES
  }
  // Generic fallback so non-hero emails still show something honest.
  const found: Entity[] = []
  if (/invoice #?\d+/i.test(body)) {
    const match = body.match(/invoice #?\d+/i)
    found.push({
      id: 'ent-generic-doc',
      kind: 'artifact',
      value: match ? match[0] : 'Invoice',
      note: 'Financial document awaiting approval',
      confidence: 0.91,
    })
  }
  if (/thursday|tuesday|wednesday|monday|friday/i.test(lower)) {
    const match = lower.match(/thursday|tuesday|wednesday|monday|friday/)
    found.push({
      id: 'ent-generic-date',
      kind: 'datetime',
      value: match ? match[0].replace(/^./, (c) => c.toUpperCase()) : 'This week',
      note: 'Deadline referenced in the message',
      confidence: 0.88,
    })
  }
  return found
}

/** Link extracted entities to nodes already known in the workspace. */
export function linkContext(entities: Entity[]): ContextNode[] {
  const ids = new Set(entities.map((e) => e.id))
  return contextGraph.filter((node) => node.matchedFrom.some((m) => ids.has(m)))
}

export const CONTEXT_ORDER: Array<ContextNode['kind']> = [
  'contact',
  'meeting',
  'document',
  'project',
]
