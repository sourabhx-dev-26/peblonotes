export type NoteListItem = {
  id: string;
  title: string;
  tags: string[];
  archived: boolean;
  updatedAt: string;
  createdAt: string;
  isPublic: boolean;
  shareId: string | null;
};

export async function listNotes(params: {
  q?: string;
  tag?: string;
  archived?: boolean;
}): Promise<NoteListItem[]> {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.tag) sp.set("tag", params.tag);
  if (typeof params.archived === "boolean")
    sp.set("archived", String(params.archived));

  const resp = await fetch(`/api/notes?${sp.toString()}`, { method: "GET" });
  if (!resp.ok) throw new Error("Failed to load notes");
  const data = await resp.json();
  return data.notes as NoteListItem[];
}

export async function createNote(input: {
  title: string;
  content?: string;
  tags?: string[];
}) {
  const resp = await fetch("/api/notes", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data?.error || "Failed to create note");
  return data.note as { id: string };
}