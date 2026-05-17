import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await params;

  const note = await prisma.note.findFirst({
    where: { shareId, isPublic: true },
    select: {
      id: true,
      title: true,
      content: true,
      tags: true,
      updatedAt: true,
      createdAt: true,
    },
  });

  if (!note) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json({ note }, { status: 200 });
}