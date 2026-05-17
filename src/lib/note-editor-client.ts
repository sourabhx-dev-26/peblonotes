export type NoteDetail = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  archived: boolean;
  updatedAt: string;
  createdAt: string;
  isPublic: boolean;
  shareId: string | null;

  summary?: string | null;
  actionItems?: string | null;
  aiSuggestedTitle?: string | null;
  aiGeneratedAt?: string | null;
  aiUsageCount?: number | null;
};

export async function getNote(id: string): Promise<NoteDetail> {
  const resp = await fetch(`/api/notes/${id}`, { method: "GET" });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data?.error || "Failed to load note");
  return data.note as NoteDetail;
}

export async function patchNote(
  id: string,
  input: Partial<Pick<NoteDetail, "title" | "content" | "tags" | "archived">>
): Promise<NoteDetail> {
  const resp = await fetch(`/api/notes/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data?.error || "Failed to save note");
  return data.note as NoteDetail;
}

export async function deleteNote(id: string): Promise<void> {
  const resp = await fetch(`/api/notes/${id}`, { method: "DELETE" });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data?.error || "Failed to delete note");
}

export async function shareNote(
  id: string
): Promise<{ shareId: string; url: string }> {
  const resp = await fetch(`/api/notes/${id}/share`, { method: "POST" });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data?.error || "Failed to share note");

  // backend might return {note} or {shareId}; support both
  const shareId = data?.shareId || data?.note?.shareId;
  if (!shareId) throw new Error("Share ID missing from server response");

  const url = `${window.location.origin}/share/${shareId}`;
  return { shareId, url };
}

export async function runAi(id: string): Promise<NoteDetail> {
  const resp = await fetch(`/api/notes/${id}/ai`, { method: "POST" });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data?.error || "AI generation failed");
  return data.note as NoteDetail;
}