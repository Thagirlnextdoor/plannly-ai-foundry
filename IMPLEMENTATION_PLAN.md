# Plannly — Implementation Plan

Source: `Docx/Plannly-Product Requirements Document (PRD).md`
North star: Before "I don't know where to start" → After "Here's the smallest next step. I've done it. I'm making progress."
Core loop: **Goal → Breakdown → Action → Reminder → Completion → Progress → Adaptation**

## How to read this plan

- Ordered phases. Each phase ships a usable increment.
- Each phase lists **concrete outputs** (schema, API, UI, AI behavior) and **acceptance criteria**.
- Stack is not locked. Recommended default: web app (e.g. Next.js + Postgres + background jobs + LLM API + email/calendar OAuth). Phases are stack-agnostic.

## Locked stack (local-first)

- **Framework:** Next.js (App Router, TypeScript) — UI + API routes in one repo.
- **Database:** SQLite via Prisma, file-based. **App & DB run locally for now** (`npm run dev`, no cloud DB).
- **Authentication:** Auth.js (NextAuth) credentials provider, local sessions. OAuth later.
- **File storage:** Local filesystem (`./storage/`, gitignored) behind a `Storage` interface (swap to S3 later).

---

## Phase 0 — Foundation

**Goal:** Runnable repo, agreed data model, auth, deployable skeleton. App & DB run locally for now.

**Outputs:**
- `app/` scaffold (Next.js): routing, `Today / Goals / Tasks / Calendar / Automations / Assistant` shells (empty states OK)
- Auth (Auth.js credentials, local sessions), per-user data isolation
- DB schema v0 on local SQLite via Prisma: `users, goals, milestones, monthly_outcomes, weekly_objectives, daily_actions, tasks, task_links(goal_id), progress_events`
- Local file storage at `./storage/` (gitignored) behind `Storage` interface
- CI: lint, typecheck, test, preview deploy
- Seed script: 1 demo goal with full breakdown chain
- `.env.example`, logging, error tracking

**Accept:**
- New user signs up, sees empty Today/Goals, no errors
- Seed demo loads and renders goal → month → week → today chain

---

## Phase 1 — Goal-to-Action System (PRD Priority 1, part 1)

**Goal:** Natural-language goal → clarified goal → suggested breakdown.

**Outputs:**
- `POST /api/goals` (raw text + target date + time availability + context)
- Clarification flow: 2–4 questions (deadline, time/day, starting point) — skippable
- `POST /api/goals/:id/breakdown` → generates: 3–7 milestones, monthly outcomes, weekly objectives, daily actions, tiny next step
- Breakdown rules: avoid task explosion; each node has `why` (parent link), `size` (est. minutes), `definition_of_done`
- UI: Goal create wizard → Plan review screen (accept / edit / remove / move date / simplify)
- AI: breakdown prompt v1 with JSON schema validation + fallback to safe template on parse failure

**Accept:**
- "I want to start exercising regularly" → milestones + month + week + today + tiny step ("Put on workout clothes") in <15s
- User can edit/remove/defer any node before accepting
- Every daily action shows parent goal + "what comes next"

---

## Phase 2 — Daily Focus + Progress (PRD Priority 1, part 2)

**Goal:** Answer "What do I actually need to focus on today?" and show progress.

**Outputs:**
- `GET /api/today` → priorities (max 3–5), quick wins (<10 min), scheduled commitments, per-item goal link
- Task actions: complete, skip-today, shrink ("break this down further"), push to tomorrow
- `tasks` recursion: any task → subtasks until actionable (<15 min); store depth, cap at e.g. 3 levels + "still too big" path
- `POST /api/actions/:id/complete` writes `progress_events`; rollups: today % → week % → month % → goal %
- UI: Today view + Goal detail with progress chain + "tiny action" affordance
- Rules: Today never dumps full backlog; selection algorithm v1 (due + goal weight + user time available)

**Accept:**
- Completing today's action visibly advances week/month/goal
- "Break this down further" on "Prepare presentation" yields ordered subtasks ending in an obvious next step
- Day with 50 backlog tasks still shows ≤5 priorities + quick wins

---

## Phase 3 — Assistant + Recovery (PRD Priority 2)

**Goal:** Natural-language control + non-judgmental recovery.

**Outputs:**
- `POST /api/assistant/chat` with tool calls: `list_today, breakdown_task, move_task, simplify_plan, replan_goal, explain_why`
- Supported intents: "What should I focus on?", "I'm overwhelmed, what first?", "Move this to next week", "Why is this on my list?", "I don't have time today, rework my plan", "I finished this, what's next?"
- Recovery flow: "I fell behind" → review missed → keep/drop/reschedule → rebuilt upcoming plan + one manageable next action
- Tone guardrails: calm, encouraging, no guilt ("Let's figure out what happened and what's next")
- UI: Assistant panel/drawer available from Today/Goals/Tasks; shows proposed plan diffs before applying

**Accept:**
- All 8 sample utterances from PRD §19 resolve to correct tool + visible result
- Fallen-behind goal recovers without deleting history; user gets one clear next action

---

## Phase 4 — Reminders & Scheduling (PRD Priority 3)

**Goal:** Follow-through, not nagging notifications.

**Outputs:**
- `reminders` + `calendar_events` tables; `POST /api/reminders`, worker for due checks
- Contextual copy: "You planned 3 client contacts, did 1. Do the next one now?" + action buttons (Do now / Later / Shrink / Drop)
- Snooze/adjust per reminder; ignored-repeat detector → suggests reschedule/simplify/drop
- Scheduling: "Schedule with Sarah next week" → propose slots → create event + invite; follow-up reminders ("follow up with John in 3 days")
- UI: Upcoming list in Today + Calendar view (read-first; write behind explicit confirm)
- Integrations: start with one calendar provider (Google or Outlook) behind interface

**Accept:**
- Reminder fires with context + one-tap next action
- 3x-ignored reminder triggers "reconsider?" suggestion, not a 4th identical nudge
- Meeting request creates event + invite in <3 user steps

---

## Phase 5 — Personalized Communication (PRD Priority 4)

**Goal:** Drafts that sound like the user, user stays in control of send.

**Outputs:**
- `email_profiles`: tone, formality, greetings, sign-offs, sentence style, sample sends (user-provided)
- `templates`: meeting confirm, follow-up, check-in, info request, thank-you — user-editable
- `POST /api/emails/draft` (goal/context + template + tone) → draft only; explicit Send stays outside Plannly v1
- Follow-up assistant: detect unreplied threads user flagged → draft nudge
- UI: Draft composer with tone preview + "use my voice" correction ("make it shorter / less formal")

**Accept:**
- Two users get recognizably different drafts from same prompt
- Correction ("use my usual sign-off") persists to profile
- No email sends without explicit user action

---

## Phase 6 — Workflows & Templates (PRD Priority 5)

**Goal:** Reusable routines replace repeated thinking.

**Outputs:**
- `workflows, workflow_steps, workflow_runs`: e.g. "Monday Weekly Reset" (review last week → unfinished → upcoming → inbox → priorities → schedule → daily actions)
- Plain-language creation: "Every Monday I need to…" → saved repeatable workflow with schedule
- `goal_templates`: learn skill, start business, fitness, finance, certification prep
- UI: Automations list → run → checklist with progress; Templates gallery → instantiate to goal/workflow

**Accept:**
- User saves Monday Reset once, runs it weekly without rebuilding
- Instantiating "Certification prep" template yields full breakdown chain from Phase 1

---

## Phase 7 — Dashboard, Focus Protection, Hardening

**Goal:** Clarity over density; ship-quality MVP.

**Outputs:**
- Dashboard answers 4 questions: working toward / matters today / coming up / making progress — no widget sprawl
- Focus mode: current task shows Goal → Today → Next only; unrelated lists hidden
- Flexible planning: "I can't do this today" → move / shrink / deprioritize / change goal / swap — bigger picture preserved
- Accountability copy pass, empty states, onboarding (1 sample goal), accessibility, mobile-today first
- Metrics events: goals created/active, daily completions, plan completion %, recovery rate, reminder→completion, workflow runs, email assists, overwhelm self-report
- Privacy: data export/delete; AI data-use disclosure; OAuth scopes minimal

**Accept:**
- New user goes idea → accepted plan → completed tiny step in one session
- Lighthouse/accessibility baseline passes; core flows covered by e2e tests

---

## Build order summary

`0 Foundation → 1 Breakdown → 2 Today+Progress → 3 Assistant+Recovery → 4 Reminders/Scheduling → 5 Email/Voice → 6 Workflows/Templates → 7 Dashboard/Hardening`

Each phase is demoable. Do not start Phase N+1 until prior phase's Accept checks pass.
