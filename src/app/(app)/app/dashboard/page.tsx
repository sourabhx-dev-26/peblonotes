"use client";

import { useEffect, useState } from "react";

type RecentNote = {
  id: string;
  title: string;
  updatedAt: string;
  archived: boolean;
  tags: string[];
};

type DashboardData = {
  totalNotes: number;
  archivedNotes: number;
  recentNotes: RecentNote[];
  mostUsedTags: { tag: string; count: number }[];
  aiUsageTotal: number;
  aiGeneratedNotes: number;
  weeklyActivity: { date: string; count: number }[];
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/dashboard", { cache: "no-store" });
        if (!res.ok) throw new Error(await res.text());
        const json = (await res.json()) as DashboardData;
        if (alive) setData(json);
      } catch (e: any) {
        if (alive) setError(e?.message || "Failed to load dashboard");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      {error ? (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      ) : !data ? (
        <p className="mt-4 text-sm text-gray-600">Loading…</p>
      ) : (
        <>
          <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card title="Total notes" value={data.totalNotes} />
            <Card title="Archived" value={data.archivedNotes} />
            <Card title="AI usage (total)" value={data.aiUsageTotal} />
            <Card title="AI-generated notes" value={data.aiGeneratedNotes} />
          </section>

          <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border bg-white p-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent notes</h2>
              <div className="mt-3 space-y-2">
                {data.recentNotes.length === 0 ? (
                  <p className="text-sm text-gray-600">No notes yet.</p>
                ) : (
                  data.recentNotes.map((n) => (
                    <div key={n.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {n.title || "(Untitled)"}
                        </p>
                        <p className="text-xs text-gray-600">
                          Updated {new Date(n.updatedAt).toLocaleString()}
                          {n.archived ? " • Archived" : ""}
                        </p>
                      </div>
                      <a
                        href={`/app/note/${n.id}`}
                        className="shrink-0 text-sm text-blue-600 hover:underline"
                      >
                        Open
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-lg border bg-white p-4">
              <h2 className="text-lg font-semibold text-gray-900">Most-used tags</h2>
              <div className="mt-3 space-y-2">
                {data.mostUsedTags.length === 0 ? (
                  <p className="text-sm text-gray-600">No tags yet.</p>
                ) : (
                  data.mostUsedTags.map((t) => (
                    <div key={t.tag} className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">{t.tag}</span>
                      <span className="text-xs text-gray-600">{t.count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-lg border bg-white p-4">
            <h2 className="text-lg font-semibold text-gray-900">Weekly activity</h2>
            <div className="mt-4 grid grid-cols-7 gap-2">
              {data.weeklyActivity.map((d) => (
                <div key={d.date} className="text-center">
                  <div className="text-[11px] text-gray-600">
                    {d.date.slice(5)}
                  </div>
                  <div className="mt-1 rounded bg-gray-100 px-2 py-3 text-sm font-semibold text-gray-900">
                    {d.count}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}