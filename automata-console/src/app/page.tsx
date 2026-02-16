"use client";

import { useState, useEffect } from "react";

interface AutomataResult {
  status: string;
  summary: string;
  detected_intent: string;
  suggested_actions: string[];
  confidence: number;
}

function StatusDot({ className = "" }: { className?: string }) {
  return (
    <span className={`relative flex h-2 w-2 ${className}`}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-50" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
    </span>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        className="opacity-80"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function SkeletonLoader() {
  return (
    <div className="rounded-xl border border-border bg-surface-raised/50 overflow-hidden">
      <div className="border-b border-border px-6 py-4">
        <div className="h-3 w-32 rounded bg-zinc-600/30 animate-shimmer" />
      </div>
      <div className="space-y-0 divide-y divide-border-subtle">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-6 py-4">
            <div className="h-2.5 w-20 rounded bg-zinc-600/25 mb-3 animate-shimmer" />
            <div className="h-3 w-full max-w-xs rounded bg-zinc-600/20 animate-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [task, setTask] = useState("");
  const [result, setResult] = useState<AutomataResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<string | null>(null);

  async function handleRun() {
    if (!task.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);
    setTimestamp(null);

    try {
      const res = await fetch("/api/automata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: task.trim() }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || `Request failed (${res.status})`);
      }

      const data: AutomataResult = await res.json();
      setResult(data);
      setTimestamp(new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && e.metaKey) {
      handleRun();
    }
  }

  // Animated confidence counter
  const [displayConfidence, setDisplayConfidence] = useState(0);
  useEffect(() => {
    if (!result) { setDisplayConfidence(0); return; }
    const target = Math.round(result.confidence * 100);
    let current = 0;
    const step = target / 30;
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        setDisplayConfidence(target);
        clearInterval(interval);
      } else {
        setDisplayConfidence(Math.round(current));
      }
    }, 20);
    return () => clearInterval(interval);
  }, [result]);

  return (
    <div className="min-h-screen bg-background bg-grid font-[family-name:var(--font-geist-sans)]">
      {/* Top gradient wash */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[500px] bg-gradient-to-b from-indigo-950/20 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-3xl px-6 py-12 sm:py-20">
        {/* Navigation bar */}
        <nav className="mb-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 ring-1 ring-indigo-500/20">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-indigo-400">
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight text-zinc-200">
              Automata Console
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-surface-raised/80 px-3 py-1.5 ring-1 ring-border">
            <StatusDot />
            <span className="text-[11px] font-medium text-zinc-400">System Online</span>
          </div>
        </nav>

        {/* Hero section */}
        <header className="mb-14">
          <h1 className="text-gradient text-4xl font-bold tracking-tight sm:text-5xl">
            AI Automation
            <br />
            Console
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-zinc-400">
            Submit a task to the orchestration layer. The system will classify your intent,
            generate an execution plan, and return structured analysis.
          </p>
        </header>

        {/* Input card */}
        <section className="mb-10">
          <div className="rounded-xl border border-border bg-surface/80 p-1 backdrop-blur-sm glow-accent">
            <div className="rounded-lg bg-surface-raised/60 p-5">
              <label
                htmlFor="task-input"
                className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-zinc-400"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-indigo-400">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
                Describe your task
              </label>
              <textarea
                id="task-input"
                rows={4}
                value={task}
                onChange={(e) => setTask(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Analyze incoming data streams, deploy the staging environment, run security audit..."
                className="w-full resize-none rounded-lg border-0 bg-transparent px-0 py-1 text-[15px] leading-relaxed text-white placeholder:text-zinc-500 focus:outline-none focus:ring-0"
              />
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500 font-[family-name:var(--font-geist-mono)]">
                  {task.length > 0 ? `${task.length} chars` : ""}
                </span>
                <div className="flex items-center gap-3">
                  <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
                    <span className="text-[11px]">&#8984;</span> Enter
                  </kbd>
                  <button
                    onClick={handleRun}
                    disabled={loading || !task.trim()}
                    className="group inline-flex items-center gap-2.5 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-indigo-600 disabled:hover:shadow-none"
                  >
                    {loading ? (
                      <>
                        <Spinner />
                        Processing...
                      </>
                    ) : (
                      <>
                        Run Automation
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="transition-transform group-hover:translate-x-0.5">
                          <path d="M5 12h14m-6-6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="animate-fade-in-up mb-10 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-950/20 px-5 py-4">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-red-400">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <div>
              <p className="text-sm font-medium text-red-400">Automation Failed</p>
              <p className="mt-1 text-sm text-red-300/90">{error}</p>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="animate-fade-in-up">
            <SkeletonLoader />
          </div>
        )}

        {/* Result panel */}
        {result && !loading && (
          <section className="animate-fade-in-up">
            <div className="rounded-xl border border-border bg-surface-raised/50 overflow-hidden backdrop-blur-sm border-gradient">
              {/* Result header */}
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-emerald-400">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h2 className="text-sm font-semibold text-zinc-100">Automation Result</h2>
                </div>
                {timestamp && (
                  <span className="text-[11px] text-zinc-400 font-[family-name:var(--font-geist-mono)]">
                    {timestamp}
                  </span>
                )}
              </div>

              <div className="stagger-children divide-y divide-border-subtle">
                {/* Status */}
                <div className="flex items-center justify-between px-6 py-4">
                  <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Status</span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {result.status}
                  </span>
                </div>

                {/* Summary */}
                <div className="px-6 py-4">
                  <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-400">Summary</span>
                  <p className="text-[15px] leading-relaxed text-zinc-200">{result.summary}</p>
                </div>

                {/* Detected Intent */}
                <div className="flex items-center justify-between px-6 py-4">
                  <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Detected Intent</span>
                  <code className="rounded-md bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-200 ring-1 ring-indigo-500/20 font-[family-name:var(--font-geist-mono)]">
                    {result.detected_intent}
                  </code>
                </div>

                {/* Suggested Actions */}
                <div className="px-6 py-4">
                  <span className="mb-3 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Suggested Actions
                  </span>
                  <div className="space-y-2">
                    {result.suggested_actions.map((action, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-lg bg-surface/60 px-4 py-2.5 ring-1 ring-border-subtle"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 text-[10px] font-bold text-indigo-400 font-[family-name:var(--font-geist-mono)]">
                          {i + 1}
                        </span>
                        <span className="text-sm text-zinc-200">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Confidence */}
                <div className="px-6 py-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Confidence</span>
                    <span className="text-lg font-semibold tabular-nums text-white font-[family-name:var(--font-geist-mono)]">
                      {displayConfidence}<span className="text-sm text-zinc-400">%</span>
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-600/30">
                    <div
                      className="confidence-bar h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${result.confidence * 100}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-[10px] text-zinc-500 font-[family-name:var(--font-geist-mono)]">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-20 flex items-center justify-center gap-2 text-[11px] text-zinc-500">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-zinc-500">
            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
          <span>Automata Console &middot; Internal Prototype</span>
        </footer>
      </div>
    </div>
  );
}
