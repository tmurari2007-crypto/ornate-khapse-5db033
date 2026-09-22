import type {
  Commitment,
  ContextNode,
  EmailRecord,
  Permission,
  ProactiveAlert,
} from './types'

export const OPERATOR = {
  name: 'Arjun Varma',
  role: 'Product Lead · Meridian Labs',
  initials: 'AV',
}

export const HERO_EMAIL_ID = 'em-alpha-01'

/** The body the whole demo is built around. */
export const HERO_BODY =
  "Hi, tomorrow's Project Alpha review has moved to 11 AM. Please send the updated presentation to Rahul before the meeting."

export const seedEmails: EmailRecord[] = [
  {
    id: HERO_EMAIL_ID,
    from: 'Ananya Krishnan',
    fromRole: 'Program Manager',
    initials: 'AK',
    subject: 'Project Alpha review — time change',
    body: HERO_BODY,
    receivedAt: '08:42',
    unread: true,
    priority: 'high',
    hero: true,
    intelligence: {
      summary:
        'The Project Alpha review moves to 11:00 AM tomorrow and the updated presentation must reach Rahul before it starts.',
      intent: 'Reschedule + deliver document before a deadline',
      deadline: 'Tomorrow, before 11:00 AM',
      entities: [],
      suggestedActions: [
        'Move Project Alpha Review to 11:00 AM',
        'Attach Project Alpha Presentation v3',
        'Send to Rahul Menon with a short note',
        'Confirm receipt before the meeting',
      ],
      suggestedReply:
        "Thanks Ananya — 11 AM works. I'm sending Rahul the updated deck today and will confirm once he has reviewed it.",
    },
  },
  {
    id: 'em-invoice-02',
    from: 'Tobias Lindqvist',
    fromRole: 'Finance Ops',
    initials: 'TL',
    subject: 'Vendor invoice #40872 needs your sign-off',
    body:
      'Arjun — invoice #40872 from Kestrel Analytics (₹2,84,500) is sitting in the approval queue. Finance closes the Q3 batch Thursday 6 PM, so I need your sign-off before then.',
    receivedAt: 'Yesterday',
    unread: true,
    priority: 'normal',
    intelligence: {
      summary:
        'Invoice #40872 from Kestrel Analytics needs your approval before the Q3 batch closes Thursday 6 PM.',
      intent: 'Approval request with a hard financial cut-off',
      deadline: 'Thursday, 18:00',
      entities: [],
      suggestedActions: [
        'Open invoice #40872 for review',
        'Reply confirming sign-off timing',
        'Set a reminder for Wednesday afternoon',
      ],
      suggestedReply:
        "Got it Tobias — I'll review #40872 and sign off by Wednesday evening, ahead of the Thursday batch.",
    },
  },
  {
    id: 'em-pricing-03',
    from: 'Daniel Osei',
    fromRole: 'Customer · Longwave Retail',
    initials: 'DO',
    subject: 'Revised pricing for the 3-region rollout?',
    body:
      "We're close on the rollout but our procurement team pushed back on the per-region tier. Could you send a revised sheet for 3 regions, and are you free for a 20-minute call Tuesday?",
    receivedAt: 'Yesterday',
    unread: false,
    priority: 'normal',
    intelligence: {
      summary:
        'Longwave Retail wants a revised 3-region pricing sheet and a 20-minute call on Tuesday.',
      intent: 'Commercial request + meeting request',
      deadline: 'Tuesday call, sheet before it',
      entities: [],
      suggestedActions: [
        'Build revised 3-region pricing sheet',
        'Offer two Tuesday slots',
        'Loop in Meera for tier approval',
      ],
      suggestedReply:
        'Happy to help — sending a revised 3-region sheet this week. Tuesday 2:30 PM or 4 PM both work for the call.',
    },
  },
  {
    id: 'em-design-04',
    from: 'Meera Iyer',
    fromRole: 'Design Systems',
    initials: 'MI',
    subject: 'Handoff notes for the settings refactor',
    body:
      'Specs are in Figma, tokens renamed to match the new scale. Nothing needed from you — flagging it so the engineering review has context.',
    receivedAt: 'Mon',
    unread: false,
    priority: 'low',
    intelligence: {
      summary: 'Design handoff for the settings refactor is complete; tokens were renamed.',
      intent: 'Informational — no action required',
      deadline: null,
      entities: [],
      suggestedActions: ['Archive', 'Forward to engineering review thread'],
      suggestedReply: 'Thanks Meera — passing this to the engineering review thread.',
    },
  },
]

/** Context graph NEXUS can reach into. Only a subset is linked during the demo. */
export const contextGraph: ContextNode[] = [
  {
    id: 'ctx-contact-rahul',
    kind: 'contact',
    title: 'Rahul Menon',
    subtitle: 'Engineering Director · reviewer on Project Alpha',
    facts: [
      'rahul.menon@meridianlabs.io',
      '+91 98••• ••412',
      'Last exchange: 6 days ago — Alpha scope cut',
      'Prefers documents 12+ hours before a review',
    ],
    matchedFrom: ['ent-person'],
    source: 'Contacts',
  },
  {
    id: 'ctx-meeting-alpha',
    kind: 'meeting',
    title: 'Project Alpha — Review',
    subtitle: 'Tomorrow · was 14:00, moving to 11:00',
    facts: [
      'Attendees: Arjun Varma, Rahul Menon, Ananya Krishnan',
      'Room: Vista 4 / Meet link attached',
      'Agenda item 2 requires the current deck',
    ],
    matchedFrom: ['ent-event', 'ent-datetime'],
    source: 'Calendar',
  },
  {
    id: 'ctx-doc-deck',
    kind: 'document',
    title: 'Project Alpha Presentation v3',
    subtitle: 'Updated 19 hours ago by Arjun Varma · 24 slides',
    facts: [
      'v3 supersedes v2 shared with Rahul on the 12th',
      'Includes revised Q3 burn-down + rollout map',
      'Slides 14–17 changed since v2',
    ],
    matchedFrom: ['ent-artifact'],
    source: 'Documents',
  },
  {
    id: 'ctx-project-alpha',
    kind: 'project',
    title: 'Project Alpha',
    subtitle: 'Phase 2 · 71% complete · review gate open',
    facts: [
      'Gate needs reviewer sign-off before build freeze',
      '3 open risks, 1 owned by Rahul',
      'Next milestone: pilot cutover in 9 days',
    ],
    matchedFrom: ['ent-project'],
    source: 'Projects',
  },
]

export const seedCommitments: Commitment[] = [
  {
    id: 'cm-01',
    owner: 'me',
    who: 'You → Tobias Lindqvist',
    what: 'Sign off vendor invoice #40872',
    due: 'Wed, 6:00 PM',
    dueNote: 'Ahead of the Thursday Q3 batch',
    status: 'open',
    origin: 'Email · Finance Ops',
  },
  {
    id: 'cm-02',
    owner: 'me',
    who: 'You → Daniel Osei',
    what: 'Send revised 3-region pricing sheet',
    due: 'Thu',
    dueNote: 'Before the Tuesday call',
    status: 'open',
    origin: 'Email · Longwave Retail',
  },
  {
    id: 'cm-03',
    owner: 'other',
    who: 'Meera Iyer → You',
    what: 'Confirm token migration for settings refactor',
    due: 'Wed',
    dueNote: 'Blocking the engineering review',
    status: 'waiting',
    origin: 'Email · Design Systems',
  },
  {
    id: 'cm-04',
    owner: 'other',
    who: 'Daniel Osei → You',
    what: 'Confirm procurement sign-off window',
    due: 'No date given',
    dueNote: 'Waiting 2 days for a reply',
    status: 'waiting',
    origin: 'Email · Longwave Retail',
  },
]

export const RAHUL_COMMITMENT_ID = 'cm-rahul-review'

export const seedPermissions: Permission[] = [
  {
    id: 'perm-email',
    label: 'Email',
    scope: 'Read threads · draft replies · send with approval',
    granted: true,
    mode: 'read+write w/ approval',
    lastUsed: 'Used 4 minutes ago',
    detail: 'NEXUS never sends outbound mail without an explicit approval tap.',
  },
  {
    id: 'perm-calendar',
    label: 'Calendar',
    scope: 'Read events · move events you own',
    granted: true,
    mode: 'read+write',
    lastUsed: 'Used 4 minutes ago',
    detail: 'Moves are reversible for 24 hours and logged in the action trail.',
  },
  {
    id: 'perm-contacts',
    label: 'Contacts',
    scope: 'Read names, roles, and reachability',
    granted: true,
    mode: 'read',
    lastUsed: 'Used 4 minutes ago',
    detail: 'Phone numbers stay masked in the interface until a call is approved.',
  },
  {
    id: 'perm-documents',
    label: 'Documents',
    scope: 'Search and attach · no edits',
    granted: true,
    mode: 'read',
    lastUsed: 'Used 4 minutes ago',
    detail: 'File contents are summarised locally; nothing is copied off-device.',
  },
  {
    id: 'perm-calls',
    label: 'Calls',
    scope: 'Place assisted calls after approval',
    granted: true,
    mode: 'read+write w/ approval',
    lastUsed: 'Used 2 minutes ago',
    detail: 'Every assisted call is transcribed and the transcript stays with the action.',
  },
]

export const seedAlerts: ProactiveAlert[] = [
  {
    id: 'alert-alpha-deck',
    severity: 'warning',
    title: 'Project Alpha presentation has not been sent and the meeting is tomorrow',
    body: 'Rahul Menon reviews at 11:00 AM. v3 has been ready for 19 hours and nothing has gone out.',
    dismissed: false,
    resolved: false,
  },
  {
    id: 'alert-invoice',
    severity: 'info',
    title: 'Invoice #40872 sign-off closes in 2 days',
    body: 'Finance batches Q3 on Thursday at 6 PM. One approval stands between you and the cut-off.',
    dismissed: false,
    resolved: false,
  },
]

export const todaysPriorities = [
  {
    id: 'pr-01',
    title: 'Get Alpha deck to Rahul before the 11:00 review',
    meta: 'Moved this morning · 6 actions planned',
    weight: 'Critical',
  },
  {
    id: 'pr-02',
    title: 'Sign off invoice #40872',
    meta: 'Hard cut-off Thursday 6:00 PM',
    weight: 'High',
  },
  {
    id: 'pr-03',
    title: 'Revised 3-region pricing for Longwave',
    meta: 'Needed before the Tuesday call',
    weight: 'Medium',
  },
]
