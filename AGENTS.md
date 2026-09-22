# AGENTS.md

NEXUS — an AI execution-layer prototype. Built on TanStack Start (React 19, Vite 7, Tailwind 4).
Read this before changing anything; the module boundaries are deliberate.

## Architecture

The product is a client-side simulation with no backend. State lives in one provider
(`src/lib/store.tsx`) and the pipeline is a plain async walk over a plan.

```
src/lib/
  types.ts            domain model — ActionRecord is the contract everything else agrees on
  seed.ts             all seeded data: emails, context graph, commitments, permissions, alerts
  context-engine.ts   Understand + Connect — entity extraction and context linking
  action-planner.ts   Plan — the six-action Project Alpha plan and dependency resolution
  risk-engine.ts      the only place risk / approvalRequired policy is decided
  execution.ts        Execute — per-operation log scripts and the call transcript
  verification.ts     Verify — what was re-checked after each action, plus the completion summary
  store.tsx           orchestrator: provider, state machine, approvals, voice, reset
src/components/       AppShell, ActionCard, PipelineRail, VoiceOverlay, CallOverlay, ui primitives
src/routes/           __root (shell + provider) and the five screens
```

## Non-obvious decisions

- **Status is derived, never assigned.** `resolveStatuses()` in `store.tsx` recomputes every
  action's `executionStatus` from its dependencies plus a `released` id list. Approving something
  only appends to `released`; blocked/queued/awaiting_approval/approved fall out of that. Never set
  those statuses by hand — dependencies and approvals would drift apart.
- **Risk lives in one module.** `action-planner.ts` does not author `risk` or `approvalRequired`;
  it calls the risk engine. Change policy there and every screen follows.
- **Generation-guarded async.** Every `await` in the orchestrator carries a generation number.
  `resetDemo()` bumps it, so in-flight timers abandon their writes instead of corrupting fresh
  state. Any new async work must take `gen` and go through `patch`/`sleep`.
- **No persistence, on purpose.** In-memory state means a half-executed run can never be rehydrated
  into a stuck spinner. If persistence is added, normalise `executing` / `verifying` on load.
- **Pre-release works before planning.** `release(id)` on an action that does not exist yet is
  valid — the planner applies `released` as actions are created. That is how the alert's "Send now"
  reaches `act-04`.
- Voice attempts `SpeechRecognition` but always advances on its own timers; the demo cannot stall
  on a denied microphone.

## Conventions

- Components PascalCase, modules camelCase, routes kebab-case files.
- Tailwind utilities only; design tokens are `@theme` variables in `src/styles.css`
  (`brand` amber, `mint`, `coral`, `sky`, warm graphite surfaces). Do not introduce new raw colours.
- Motion: `.rise` / `.pop` with `--i` for stagger; animate transform and opacity only.
- Type-only imports use the `type` keyword. Strict mode is on.
- Copy is specific and un-marketing; no emoji in UI text.

## Quality bar

Every button on every screen does something. Before finishing a change, walk the full flow:
email → entities → context → plan → approval → execution → call → commitment → follow-up →
verification → reset, on both a narrow and a wide viewport.
