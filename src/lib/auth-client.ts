export type MeResponse =
  | { user: { id: string; email: string; name: string | null } | null }
  | { error: string };

export async function fetchMe(): Promise<
  | { ok: true; user: { id: string; email: string; name: string | null } }
  | { ok: false }
> {
  const resp = await fetch("/api/auth/me", { method: "GET" });
  if (!resp.ok) return { ok: false };

  const data = (await resp.json().catch(() => null)) as MeResponse | null;
  if (!data) return { ok: false };
  if ("error" in data) return { ok: false };
  if (!data.user) return { ok: false };

  return { ok: true, user: data.user };
}