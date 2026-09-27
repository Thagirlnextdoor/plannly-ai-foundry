# Plannly AI Foundry

> **Big goals. Small steps. Real progress.**

Plannly is a personal productivity and execution assistant that helps people turn goals and intentions into small, actionable daily steps — reducing the mental burden of planning, remembering, organizing, communicating, and following through.

Designed for anyone who struggles with organization and follow-through, with particular consideration for people with ADHD and executive-function challenges.

**Core promise:** Tell us what you want to accomplish. We'll help you figure out what needs to happen next — and help you follow through.

## The Problem

The gap is rarely knowing *what* you want. It's the execution gap:

**Intention → Planning → Action → Follow-through → Completion**

People struggle with breaking large goals down, knowing where to start, remembering out-of-sight tasks, deciding what matters today, overwhelm from vague tasks, follow-ups, emails, scheduling, and sustaining momentum.

Traditional tools make the user do the organizational thinking. Plannly does more of that thinking for you.

## How It Works

1. **Tell Plannly what you want** — e.g. "I want to launch my online coaching business this year."
2. **Get a suggested plan** — milestones → monthly outcomes → weekly objectives → daily actions → next tiny step.
3. **Review and adjust** — accept, edit, defer, simplify: "This is too much", "Break this down further", "I fell behind, help me restart."
4. **Focus today** — a small set of priorities, quick wins, scheduled commitments, each linked to its larger goal.
5. **Complete and see progress** — today → week → month → goal. What you do today matters.
6. **Get execution help** — reminders, scheduling, email drafts in your voice, reusable workflows and templates.

## Key Features (per PRD)

- **Goal creation** in natural language, with clarification
- **Intelligent goal breakdown** to daily action and tiny next step
- **Plan review and collaboration** — adaptive, never rigid
- **Daily Focus** — "What do I actually need to focus on today?"
- **Task simplification** — break any task down until the next action is obvious
- **Progress visualization** across day / week / month / goal
- **Smart contextual reminders** oriented to follow-through
- **Goal recovery** — restart without rebuilding, no guilt
- **Personalized email assistant** — drafts that sound like you, plus templates and follow-ups
- **Scheduling assistant** — meetings, follow-ups, invitations with fewer steps
- **Workflow automation** — e.g. "Monday Weekly Reset" as a reusable routine
- **Assistant chat** — "What should I focus on?", "I'm overwhelmed, what first?", "Why is this on my list?"
- **Dashboard** — what I'm working toward, what matters today, what's coming up, am I progressing
- **Focus protection, flexible planning, accountability without pressure**

## Product Areas

- **Today** — what needs attention now
- **Goals** — what you're trying to achieve
- **Tasks** — actionable steps forward
- **Calendar** — appointments, deadlines, commitments
- **Automations** — recurring workflows
- **Assistant** — natural-language control

## What Plannly Is Not

Not a complicated project-management platform, generic chatbot, basic to-do list, calendar replacement, overwhelming dashboard, or rigid methodology. It creates clarity, not more organizational work.

## Personality

Calm, helpful, intelligent, encouraging, non-judgmental, practical, clear, personal, action-oriented.

## MVP Priorities

1. Goal-to-Action system
2. Personal assistant interaction
3. Reminders and scheduling
4. Personalized communication
5. Workflow automation

Full spec: `Docx/Plannly-Product Requirements Document (PRD).md`
Plan: `IMPLEMENTATION_PLAN.md`

## Stack (local-first)

- **Framework:** Next.js (App Router, TypeScript)
- **Database:** SQLite via Prisma (file-based). **App & DB run locally for now.**
- **Authentication:** Auth.js (NextAuth), credentials provider, local sessions
- **File storage:** Local filesystem (`./storage/`), behind a swappable `Storage` interface

## Repo Status

- `v0.1` — initial version: PRD + product README. No app scaffold yet.

## Structure

```text
./
  README.md
  .gitignore
  Docx/
    Plannly-Product Requirements Document (PRD).md
```
