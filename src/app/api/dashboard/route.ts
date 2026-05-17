import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const userId = user.id;

  const [totalNotes, archivedNotes, recentNotes, notesForTags, aiAgg, notesForWeek] =
    await Promise.all([
      prisma.note.count({ where: { userId } }),
      prisma.note.count({ where: { userId, archived: true } }),
      prisma.note.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 8,
        select: { id: true, title: true, updatedAt: true, archived: true, tags: true },
      }),
      prisma.note.findMany({
        where: { userId },
        select: { tags: true },
      }),
      prisma.note.aggregate({
        where: { userId },
        _sum: { aiUsageCount: true },
        _count: { aiGeneratedAt: true },
      }),
      prisma.note.findMany({
        where: { userId },
        select: { createdAt: true },
      }),
    ]);

  // most-used tags
  const tagCounts = new Map<string, number>();
  for (const n of notesForTags) {
    for (const t of n.tags || []) {
      const tag = String(t).trim();
      if (!tag) continue;
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  }
  const mostUsedTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));

  // last 7 days activity
  const today = startOfDay(new Date());
  const days = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - i));
    const key = date.toISOString().slice(0, 10);
    return { date: key, count: 0 };
  });

  const dayIndex = new Map(days.map((d, idx) => [d.date, idx]));

  for (const n of notesForWeek) {
    const key = startOfDay(n.createdAt).toISOString().slice(0, 10);
    const idx = dayIndex.get(key);
    if (idx !== undefined) days[idx].count += 1;
  }

  return NextResponse.json(
    {
      totalNotes,
      archivedNotes,
      recentNotes,
      mostUsedTags,
      aiUsageTotal: aiAgg._sum.aiUsageCount ?? 0,
      aiGeneratedNotes: aiAgg._count.aiGeneratedAt ?? 0,
      weeklyActivity: days,
    },
    { status: 200 }
  );
}
