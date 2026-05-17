import { prisma } from "@/lib/prisma";

export default async function Home() {
  const notes = await prisma.note.findMany({
    orderBy: { updatedAt: "desc" },
    include: { user: true },
    take: 20,
  });

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>PebloNotes</h1>
      <p>Notes in DB: {notes.length}</p>

      {notes.length === 0 ? (
        <p>No notes yet. Create one in Prisma Studio to test.</p>
      ) : (
        <ul style={{ paddingLeft: 16 }}>
          {notes.map((n) => (
            <li key={n.id} style={{ marginBottom: 12 }}>
              <div>
                <b>{n.title}</b>
              </div>
              <div>{n.content}</div>
              <div style={{ opacity: 0.7, fontSize: 12 }}>
                owner: {n.user.email}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}