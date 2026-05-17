"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createNote, listNotes, NoteListItem } from "@/lib/notes-client";

function uniqueTags(notes: NoteListItem[]) {
  const set = new Set<string>();
  for (const n of notes) for (const t of n.tags || []) set.add(t);
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export default function NotesWorkspacePage() {
  const router = useRouter();

  const [notes, setNotes] = useState<NoteListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [tag, setTag] = useState("");
  const [archived, setArchived] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const tags = useMemo(() => uniqueTags(notes), [notes]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const items = await listNotes({ q: q.trim(), tag: tag || undefined, archived });
      setNotes(items);
    } catch (e: any) {
      setError(e?.message || "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [archived]);

  // basic debounce for search
  useEffect(() => {
    const t = setTimeout(() => refresh(), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, tag]);

  async function onCreate() {
    const title = newTitle.trim();
    if (!title) return;

    setCreating(true);
    try {
      const created = await createNote({ title, content: "", tags: [] });
      setNewTitle("");
      router.push(`/app/note/${created.id}`);
    } catch (e: any) {
      setError(e?.message || "Failed to create note");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">Notes</h1>
            <p className="mt-1 text-sm text-gray-600">
              Search, filter by tags, and open a note to edit (auto-save comes next).
            </p>
          </div>

          <div className="flex gap-2">
            <input
              className="w-full sm:w-64 rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
              placeholder="New note title…"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onCreate();
              }}
            />
            <button
              onClick={onCreate}
              disabled={creating}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create"}
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            className="w-full sm:flex-1 rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
            placeholder="Search notes…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <select
            className="w-full sm:w-56 rounded-lg border px-3 py-2 text-sm text-gray-900 bg-white"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          >
            <option value="">All tags</option>
            {tags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={archived}
              onChange={(e) => setArchived(e.target.checked)}
            />
            Show archived
          </label>
        </div>

        {error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b px-6 py-3 text-sm text-gray-600">
          {loading ? "Loading…" : `${notes.length} note(s)`}
        </div>

        <div className="divide-y">
          {notes.map((n) => (
            <button
              key={n.id}
              onClick={() => router.push(`/app/note/${n.id}`)}
              className="w-full text-left px-6 py-4 hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <div className="font-medium text-gray-900">{n.title}</div>
                {n.archived ? (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                    archived
                  </span>
                ) : null}
                {n.isPublic ? (
                  <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">
                    public
                  </span>
                ) : null}
              </div>

              <div className="mt-1 flex flex-wrap gap-1">
                {(n.tags || []).slice(0, 6).map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              <div className="mt-2 text-xs text-gray-500">
                Updated: {new Date(n.updatedAt).toLocaleString()}
              </div>
            </button>
          ))}

          {!loading && notes.length === 0 ? (
            <div className="px-6 py-10 text-sm text-gray-600">
              No notes found. Create one above.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}