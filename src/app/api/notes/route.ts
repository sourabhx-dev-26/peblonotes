import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";

export async function GET(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const tag = (searchParams.get("tag") || "").trim();
  const archivedParam = searchParams.get("archived");
  const archived =
    archivedParam === null ? false : archivedParam === "true" ? true : false;

  const notes = await prisma.note.findMany({
    where: {
      userId: user.id,
      archived,
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { content: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(tag ? { tags: { has: tag } } : {}),
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      tags: true,
      archived: true,
      updatedAt: true,
      createdAt: true,
      isPublic: true,
      shareId: true,
    },
  });

  return NextResponse.json({ notes }, { status: 200 });
}

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content : "";
  const tags = Array.isArray(body.tags)
    ? body.tags.filter((t: unknown) => typeof t === "string").map((t: string) => t.trim()).filter(Boolean)
    : [];

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const note = await prisma.note.create({
    data: {
      title,
      content,
      tags,
      userId: user.id,
    },
    select: {
      id: true,
      title: true,
      content: true,
      tags: true,
      archived: true,
      updatedAt: true,
      createdAt: true,
      isPublic: true,
      shareId: true,
    },
  });

  return NextResponse.json({ note }, { status: 201 });
}