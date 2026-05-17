import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;

  const note = await prisma.note.findFirst({
    where: { id, userId: user.id },
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
      summary: true,
      actionItems: true,
      aiSuggestedTitle: true,
      aiGeneratedAt: true,
      aiUsageCount: true,
    },
  });

  if (!note) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json({ note }, { status: 200 });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const data: any = {};

  if (typeof body.title === "string") data.title = body.title.trim();
  if (typeof body.content === "string") data.content = body.content;
  if (typeof body.archived === "boolean") data.archived = body.archived;

  if (Array.isArray(body.tags)) {
    data.tags = body.tags
      .filter((t: unknown) => typeof t === "string")
      .map((t: string) => t.trim())
      .filter(Boolean);
  }

  const updated = await prisma.note.updateMany({
    where: { id, userId: user.id },
    data,
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const note = await prisma.note.findUnique({
    where: { id },
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
      summary: true,
      actionItems: true,
      aiSuggestedTitle: true,
      aiGeneratedAt: true,
      aiUsageCount: true,
    },
  });

  return NextResponse.json({ note }, { status: 200 });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;

  const deleted = await prisma.note.deleteMany({
    where: { id, userId: user.id },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}