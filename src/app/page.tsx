"use client";

import { useEffect, useState } from "react";

type Task = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  priority: "high" | "medium" | "low";
  due_date: string | null;
  source_author: string | null;
  source_context: string | null;
  created_at: string;
};

const PRIORITY_COLOR: Record<string, string> = {
  high: "text-red-400 bg-red-500/10 border-red-500/30",
  medium: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
};

const CATEGORY_COLOR: Record<string, string> = {
  Work: "bg-violet-500/20 text-violet-300 border-violet-500/40",
  Personal: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
  "Follow-up": "bg-amber-500/20 text-amber-300 border-amber-500/40",
  Meeting: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40",
  Review: "bg-sky-500/20 text-sky-300 border-sky-500/40",
  Other: "bg-zinc-500/20 text-zinc-300 border-zinc-500/40",
};

function formatDate(s: string | null) {
  if (!s) return "—";
  const d = new Date(s);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setTasks(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const runSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Sync failed");
      await fetchTasks();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-semibold tracking-tight">Action Items</h1>
          <button
            onClick={runSync}
            disabled={syncing}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {syncing ? "Syncing…" : "Sync from Slack"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-[var(--muted)]">Loading tasks…</p>
        ) : tasks.length === 0 ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-[var(--muted)]">
            <p className="mb-2">No action items yet.</p>
            <p className="text-sm">
              Click &quot;Sync from Slack&quot; to scan your DMs, groups, and channels and extract
              tasks with Claude. Everything from Dhara Tanwani is marked top priority.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {tasks.map((t) => (
              <li
                key={t.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-[var(--accent)]/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="font-medium">{t.title}</h2>
                    {t.description && (
                      <p className="mt-1 text-sm text-[var(--muted)]">{t.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span
                        className={`rounded border px-2 py-0.5 text-xs font-medium ${PRIORITY_COLOR[t.priority] ?? PRIORITY_COLOR.medium}`}
                      >
                        {t.priority}
                      </span>
                      <span
                        className={`rounded border px-2 py-0.5 text-xs ${CATEGORY_COLOR[t.category] ?? CATEGORY_COLOR.Other}`}
                      >
                        {t.category}
                      </span>
                      {t.due_date && (
                        <span className="text-xs text-[var(--muted)]">
                          Due {formatDate(t.due_date)}
                        </span>
                      )}
                    </div>
                    {(t.source_author || t.source_context) && (
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        From {t.source_author ?? "?"}
                        {t.source_context && ` · ${t.source_context}`}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteTask(t.id)}
                    className="shrink-0 rounded p-1 text-[var(--muted)] hover:bg-white/10 hover:text-red-400"
                    aria-label="Delete task"
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
