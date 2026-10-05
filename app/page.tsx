"use client";

import { useState } from "react";

type Task = {
  id: number;
  goal: string;
  title: string;
  sub: string;
  done: boolean;
};

const INITIAL_TASKS: Task[] = [
  { id: 1, goal: "Launch coaching business", title: "Write down 1 person to help", sub: "~5 min · quick win", done: false },
  { id: 2, goal: "Launch coaching business", title: "Draft offer in 3 sentences", sub: "~15 min", done: false },
  { id: 3, goal: "Exercise routine", title: "20-minute workout", sub: "Tiny step: put on workout clothes", done: false },
  { id: 4, goal: "Data analyst cert", title: "Review 1 lesson's key terms", sub: "~10 min", done: false },
];

const GOALS = [
  { name: "Launch coaching business", pct: 20 },
  { name: "Exercise routine", pct: 45 },
  { name: "Data analyst cert", pct: 10 },
];

const NAV = ["Today", "Goals", "Tasks", "Calendar", "Automations", "Assistant"];

let toastTimer: number | undefined;

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [activeNav, setActiveNav] = useState("Today");
  const [toast, setToast] = useState<string | null>(null);
  const [assistantMsg, setAssistantMsg] = useState(
    "“Let’s figure out what happened and what’s next.” Try: complete a task below and watch the status bar move."
  );

  const done = tasks.filter((t) => t.done).length;
  const pct = Math.round((done / tasks.length) * 100);

  function showToast(msg: string) {
    setToast(msg);
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => setToast(null), 2200);
  }

  function toggleDone(id: number) {
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
      const changed = next.find((t) => t.id === id);
      if (changed) {
        setAssistantMsg(
          changed.done
            ? `Nice — “${changed.title}” moved ${changed.goal} forward. What’s next?`
            : "No guilt. It’s back on today’s list — shrink it or take the tiny step."
        );
      }
      return next;
    });
  }

  function automation(kind: "calendar" | "reminder" | "email") {
    showToast(
      kind === "calendar"
        ? "Calendar automation: slots proposed (Phase 4)."
        : kind === "reminder"
          ? "Reminder automation: contextual nudge set (Phase 4)."
          : "Email automation: draft in your voice ready (Phase 5)."
    );
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="logo">
            Plan<span>nly</span>
          </div>
          <nav className="nav">
            {NAV.map((n) => (
              <button
                key={n}
                className={n === activeNav ? "active" : ""}
                onClick={() => {
                  setActiveNav(n);
                  if (n !== "Today") showToast(`${n} view lands in its phase — Today works now.`);
                }}
              >
                {n}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <div className="statusbar">
        <div className="statusbar-inner">
          <div className="statusbar-label">
            <span>
              Today&apos;s progress — {done} of {tasks.length} done
            </span>
            <span>{pct}%</span>
          </div>
          <div className="track">
            <div className="fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className="grid">
          <div>
            <div className="card">
              <h2>Today&apos;s priorities</h2>
              {tasks.map((t) => (
                <div className="task" key={t.id}>
                  <span className="goal-pill">{t.goal}</span>
                  <div className="title">{t.title}</div>
                  <div className="sub">{t.sub}</div>
                  <button
                    className={t.done ? "btn btn-done" : "btn btn-primary"}
                    onClick={() => toggleDone(t.id)}
                  >
                    {t.done ? "✓ Done" : "Complete"}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => showToast("Split into smaller steps — smallest next step shown.")}
                  >
                    Break it down
                  </button>
                </div>
              ))}
              <p className="note">No defer button by design — complete it, break it down smaller, or replan in the Assistant.</p>
            </div>

            <div className="card auto">
              <h2>Automations (Phase 4–6 preview)</h2>
              <button className="btn btn-secondary" onClick={() => automation("calendar")}>
                📅 Schedule follow-up → propose slots
              </button>
              <button className="btn btn-secondary" onClick={() => automation("reminder")}>
                ⏰ Set contextual reminder
              </button>
              <button className="btn btn-secondary" onClick={() => automation("email")}>
                ✉️ Draft reply in my voice
              </button>
              <p className="note">Full automation (calendar, reminders, email from your template/voice) lands in Phases 4–6.</p>
            </div>
          </div>

          <div>
            <div className="card">
              <h2>Goals at a glance</h2>
              {GOALS.map((g) => (
                <div className="goal-row" key={g.name}>
                  <span>{g.name}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="mini-track">
                      <span className="mini-fill" style={{ width: `${g.pct}%` }} />
                    </span>
                    <b>{g.pct}%</b>
                  </span>
                </div>
              ))}
              <p className="note">Always visible — out of sight is out of mind.</p>
            </div>

            <div className="card">
              <h2>Assistant</h2>
              <p className="note">{assistantMsg}</p>
            </div>
          </div>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
