import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sha256 } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) return NextResponse.json({ user: null }, { status: 200 });

  const tokenHash = sha256(token);

  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!session) return NextResponse.json({ user: null }, { status: 200 });

  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({ where: { tokenHash } }).catch(() => {});
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json(
    {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
    },
    { status: 200 }
  );
}