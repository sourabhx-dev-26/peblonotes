import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";

function newShareId() {
  return crypto.randomBytes(12).toString("hex");
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;

  // ensure note belongs to user
  const note = await prisma.note.findFirst({
    where: { id, userId: user.id },
    select: { id: true, shareId: true, isPublic: true },
  });

  if (!note) return NextResponse.json({ error: "not found" }, { status: 404 });

  const shareId = note.shareId ?? newShareId();

  const updated = await prisma.note.update({
    where: { id },
    data: { shareId, isPublic: true },
    select: { id: true, shareId: true, isPublic: true },
  });

  return NextResponse.json({ shareId: updated.shareId }, { status: 200 });
}