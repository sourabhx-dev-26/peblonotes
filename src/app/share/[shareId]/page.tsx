import { notFound } from "next/navigation";

type SharePageProps = {
  params: Promise<{ shareId: string }>;
};

export default async function SharePage({ params }: SharePageProps) {
  const { shareId } = await params;

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/share/${shareId}`, {
    cache: "no-store",
  });

  if (!res.ok) return notFound();

  const data = (await res.json()) as {
    note?: { title: string; content: string; updatedAt?: string };
  };

  if (!data.note) return notFound();

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>{data.note.title}</h1>
      <p style={{ opacity: 0.7, marginTop: 8 }}>Shared note</p>

      <article style={{ marginTop: 24, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
        {data.note.content}
      </article>
    </main>
  );
}
