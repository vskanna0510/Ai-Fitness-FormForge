"use client";

import { trpc } from "../../lib/trpcClient";
import { motion } from "framer-motion";
import Link from "next/link";

const DEMO_USER_ID = "demo-user-id";

export default function DashboardPage() {
  const { data, isLoading } = trpc.analytics.summaryForUser.useQuery({
    userId: DEMO_USER_ID
  });

  const totalReps = data?.totalReps ?? 0;
  const avgFormScore = data?.avgFormScore ?? 0;
  const sessions = data?.recentSessions ?? [];

  return (
    <main className="min-h-screen bg-background px-6 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Training Log</h1>
          <p className="mt-1 text-sm text-neutral-400">
            High-frequency view of your reps, form quality, and momentum.
          </p>
        </div>
        <Link
          href="/workout"
          className="rounded-full bg-accent-blue px-5 py-2 text-sm font-medium shadow-glass transition hover:bg-accent-orange"
        >
          Back to HUD
        </Link>
      </header>

      {isLoading ? (
        <div className="mt-16 flex justify-center text-sm text-neutral-400">
          Loading analytics…
        </div>
      ) : (
        <section className="space-y-8">
          <div className="grid gap-6 md:grid-cols-3">
            <StatCard
              label="Total Reps Logged"
              value={totalReps.toLocaleString()}
              accent="blue"
            />
            <StatCard
              label="Average Form Score"
              value={`${avgFormScore.toFixed(1)} / 100`}
              accent="orange"
            />
            <StatCard
              label="Sessions Tracked"
              value={sessions.length.toString()}
              accent="blue"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <GlassPanel title="Rep Volume (Recent Sessions)">
              <MiniBarChart
                data={sessions.map(s => ({
                  id: s.id,
                  label: new Date(s.startedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric"
                  }),
                  value: s.totalReps
                }))}
                maxBars={14}
              />
            </GlassPanel>

            <GlassPanel title="Form Quality Trend">
              <MiniSparkline
                data={sessions
                  .slice()
                  .reverse()
                  .map(s => s.avgFormScore)}
              />
            </GlassPanel>
          </div>

          <GlassPanel title="Recent Sessions">
            <div className="max-h-72 overflow-auto pr-1">
              <table className="w-full text-left text-sm text-neutral-300">
                <thead className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                  <tr>
                    <th className="pb-3 font-medium">Started</th>
                    <th className="pb-3 font-medium">Exercise</th>
                    <th className="pb-3 font-medium text-right">Reps</th>
                    <th className="pb-3 font-medium text-right">Avg Form</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sessions.map(session => (
                    <tr key={session.id} className="align-middle">
                      <td className="py-2 text-neutral-300">
                        {new Date(session.startedAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                      <td className="py-2 text-neutral-400">
                        {session.exerciseId}
                      </td>
                      <td className="py-2 text-right">
                        {session.totalReps.toString()}
                      </td>
                      <td className="py-2 text-right text-accent-blue">
                        {session.avgFormScore.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                  {sessions.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-6 text-center text-sm text-neutral-500"
                      >
                        No sessions yet. Run a workout to see your analytics.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassPanel>
        </section>
      )}
    </main>
  );
}

function StatCard(props: {
  label: string;
  value: string;
  accent: "blue" | "orange";
}) {
  const accentClass =
    props.accent === "blue" ? "from-accent-blue/50" : "from-accent-orange/60";

  return (
    <motion.div
      className="glass-panel relative overflow-hidden rounded-2xl px-5 py-4 shadow-glass"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div
        className={`pointer-events-none absolute inset-x-0 -top-16 h-24 bg-gradient-to-b ${accentClass} to-transparent opacity-40`}
      />
      <div className="relative space-y-1">
        <div className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
          {props.label}
        </div>
        <div className="text-xl font-semibold text-white">{props.value}</div>
      </div>
    </motion.div>
  );
}

function GlassPanel({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass-panel rounded-2xl px-5 py-4 shadow-glass">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-neutral-100">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function MiniBarChart({
  data,
  maxBars
}: {
  data: { id: string; label: string; value: number }[];
  maxBars: number;
}) {
  const trimmed = data.slice(-maxBars);
  const maxVal = Math.max(1, ...trimmed.map(d => d.value));

  return (
    <div className="flex h-40 items-end gap-2">
      {trimmed.map((d, idx) => {
        const heightPct = (d.value / maxVal) * 100;
        return (
          <div
            key={d.id}
            className="flex flex-1 flex-col items-center justify-end gap-1"
          >
            <div className="relative w-full overflow-hidden rounded-full bg-slate-900/70">
              <div
                className="w-full rounded-full bg-gradient-to-t from-accent-blue/70 to-accent-orange/80"
                style={{ height: `${Math.max(6, heightPct)}%` }}
              />
            </div>
            <div className="h-6 text-center text-[10px] text-neutral-500">
              {idx % 2 === 0 ? d.label : ""}
            </div>
          </div>
        );
      })}
      {trimmed.length === 0 && (
        <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500">
          No data yet.
        </div>
      )}
    </div>
  );
}

function MiniSparkline({ data }: { data: number[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-xs text-neutral-500">
        No data yet.
      </div>
    );
  }

  const width = 260;
  const height = 80;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / Math.max(1, data.length - 1)) * width;
    const y = height - ((value - min) / span) * height;
    return { x, y };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");

  return (
    <div className="h-40">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="spark" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
        <path
          d={pathD}
          fill="none"
          stroke="url(#spark)"
          strokeWidth={2}
          strokeLinecap="round"
        />
      </svg>
      <div className="mt-2 text-xs text-neutral-500">
        Latest average form scores across sessions.
      </div>
    </div>
  );
}

