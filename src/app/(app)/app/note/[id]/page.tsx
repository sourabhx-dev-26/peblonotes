"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  deleteNote,
  getNote,
  NoteDetail,
  patchNote,
  runAi,
  shareNote,
} from "@/lib/note-editor-client";

function normalizeTags(raw: string) {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export default function NoteEditorPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [note, setNote] = useState<NoteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // editor state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [archived, setArchived] = useState(false);

  // ui state
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const dirtyRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);

  const tags = useMemo(() => normalizeTags(tagsText), [tagsText]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const n = await getNote(id);
      setNote(n);
      setTitle(n.title || "");
      setContent(n.content || "");
      setTagsText((n.tags || []).join(", "));
      setArchived(!!n.archived);

      if (n.shareId) setShareUrl(`${window.location.origin}/share/${n.shareId}`);
    } catch (e: any) {
      setError(e?.message || "Failed to load note");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // debounced autosave
  function scheduleSave() {
    dirtyRef.current = true;
    setSavedAt(null);

    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(async () => {
      if (!dirtyRef.current) return;

      setSaving(true);
      try {
        const updated = await patchNote(id, {
          title: title.trim(),
          content,
          tags,
          archived,
        });
        setNote(updated);
        dirtyRef.current = false;
        setSavedAt(new Date().toLocaleTimeString());
      } catch (e: any) {
        setError(e?.message || "Failed to save");
      } finally {
        setSaving(false);
      }
    }, 800);
  }

  // trigger autosave on changes
  useEffect(() => {
    if (!note) return; // don't save before initial load
    scheduleSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, tagsText, archived]);

  async function onDelete() {
    if (!confirm("Delete this note? This cannot be undone.")) return;
    try {
      await deleteNote(id);
      router.push("/app");
      router.refresh();
    } catch (e: any) {
      setError(e?.message || "Failed to delete");
    }
  }

  async function onShare() {
    setError(null);
    try {
      const { url } = await shareNote(id);
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
    } catch (e: any) {
      setError(e?.message || "Failed to share");
    }
  }

  async function onAi() {
    setAiLoading(true);
    setError(null);
    try {
      const updated = await runAi(id);
      setNote(updated);
      if (updated.aiSuggestedTitle) {
        // keep current title; user can apply suggested title manually
      }
    } catch (e: any) {
      setError(e?.message || "AI failed");
    } finally {
      setAiLoading(false);
    }
  }

  function applySuggestedTitle() {
    if (!note?.aiSuggestedTitle) return;
    setTitle(note.aiSuggestedTitle);
  }

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm text-sm text-gray-600">
        Loading…
      </div>
    );
  }

  if (error && !note) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-sm text-red-700">{error}</div>
        <button
          className="mt-4 rounded-lg border px-3 py-2 text-sm font-medium"
          onClick={() => load()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">Edit note</h1>
            <div className="mt-1 text-xs text-gray-500">
              {saving ? "Saving…" : savedAt ? `Saved at ${savedAt}` : " "}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push("/app")}
              className="rounded-lg border px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
            >
              Back
            </button>

            <button
              onClick={onShare}
              className="rounded-lg border px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
            >
              Share
            </button>

            <button
              onClick={onAi}
              disabled={aiLoading}
              className="rounded-lg bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {aiLoading ? "AI…" : "AI generate"}
            </button>

            <button
              onClick={onDelete}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              Delete
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {shareUrl ? (
          <div className="mt-4 rounded-lg border bg-gray-50 p-3 text-sm">
            <div className="font-medium text-gray-900">Share link</div>
            <div className="mt-1 break-all text-gray-700">{shareUrl}</div>
            <div className="mt-2 flex gap-2">
              <a
                className="rounded-lg border bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
                href={shareUrl}
                target="_blank"
              >
                Open
              </a>
              <button
                className="rounded-lg border bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
                onClick={async () => {
                  await navigator.clipboard.writeText(shareUrl);
                }}
              >
                Copy
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-6 space-y-3">
          <label className="block">
            <span className="text-sm text-gray-700">Title</span>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 bg-white"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title…"
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Content</span>
            <textarea
              className="mt-1 min-h-56 w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 bg-white"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note…"
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Tags (comma separated)</span>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 bg-white"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="e.g. work, ideas, personal"
            />
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={archived}
              onChange={(e) => setArchived(e.target.checked)}
            />
            Archived
          </label>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">AI output</h2>

        {!note?.summary && !note?.actionItems && !note?.aiSuggestedTitle ? (
          <p className="mt-2 text-sm text-gray-600">
            Click <b>AI generate</b> to produce summary, action items and a suggested title.
          </p>
        ) : (
          <div className="mt-3 space-y-4 text-sm">
            {note?.aiSuggestedTitle ? (
              <div>
                <div className="font-medium text-gray-900">Suggested title</div>
                <div className="mt-1 text-gray-700">{note.aiSuggestedTitle}</div>
                <button
                  className="mt-2 rounded-lg border px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
                  onClick={applySuggestedTitle}
                >
                  Apply title
                </button>
              </div>
            ) : null}

            {note?.summary ? (
              <div>
                <div className="font-medium text-gray-900">Summary</div>
                <div className="mt-1 whitespace-pre-wrap text-gray-700">
                  {note.summary}
                </div>
              </div>
            ) : null}

            {note?.actionItems ? (
              <div>
                <div className="font-medium text-gray-900">Action items</div>
                <div className="mt-1 whitespace-pre-wrap text-gray-700">
                  {note.actionItems}
                </div>
              </div>
            ) : null}

            <div className="text-xs text-gray-500">
              AI usage count: {note?.aiUsageCount ?? 0}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}