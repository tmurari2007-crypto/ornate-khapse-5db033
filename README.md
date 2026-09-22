# NEXUS — Your AI Execution Layer

NEXUS turns incoming information — email, meetings, documents, calls — into actions that are
planned, risk-classified, approved, executed and then verified. It is a working prototype of the
full loop:

**Observe → Understand → Connect Context → Plan → Approve → Execute → Verify → Follow Up**

## The demo

The hero flow starts from one seeded email:

> "Hi, tomorrow's Project Alpha review has moved to 11 AM. Please send the updated presentation to
> Rahul before the meeting."

Pressing **Handle All** (or **Run the demo**) walks the whole pipeline: six entities are extracted,
four context sources are linked (Rahul's contact, the calendar event, Presentation v3, the project),
and a six-action plan appears with dependencies intact. Low-risk actions run automatically, the
draft is prepared and held, and the two external actions — sending the deck and calling Rahul —
stop at an approval. Approving the call plays a transcript in which Rahul says "I'll review it by
3 PM"; that sentence becomes a tracked commitment with a follow-up armed for 3:15 PM, and the run
ends on **Execution Complete**.

**Reset demo** (sidebar, mobile header, Actions page, and the completion card) replays it instantly.

## Screens

| Route | What it does |
|---|---|
| `/` | Dashboard — priorities, AI action queue, pending approvals, completed actions, commitments, proactive alerts, AI status, voice button |
| `/email` | Email intelligence — summary, intent, entities, deadline, suggested actions, suggested reply behind an approval |
| `/actions` | Full action queue with dependency chain, risk breakdown and status filters |
| `/commitments` | Mine, theirs, waiting on a reply, follow-ups — including Rahul's 3 PM commitment |
| `/privacy` | Live permission toggles for Email, Calendar, Contacts, Documents and Calls, plus the trust boundaries |

## Stack

React 19 · TanStack Start (file-based routing) · Vite 7 · Tailwind CSS 4 · lucide-react · TypeScript.
No new dependencies were added beyond the template's. Every integration is simulated deterministically
in-process — there is no Gmail, telephony or database dependency.

## Run locally

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

Or through the Netlify CLI for platform emulation:

```bash
netlify dev --port 8889
```

## Notes

- Voice uses the browser Speech Recognition API when available and falls back to a scripted
  transcript, so the microphone button behaves the same way with the mic denied.
- Demo state lives in memory for the session; a page refresh returns to the starting position,
  which is the same thing **Reset demo** does.

## What could come next

- Persisting runs and the action trail so a completed flow survives a refresh
- Real connectors behind the same action model (the risk and approval gates already assume them)
- Meeting and document intelligence as additional observers feeding the same planner
