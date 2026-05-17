import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";
import { getOpenAIClient } from "@/lib/openai";

function safeStringArray(x: unknown): string[] {
  if (!Array.isArray(x)) return [];
  return x
    .filter((v) => typeof v === "string")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;

  const note = await prisma.note.findFirst({
    where: { id, userId: user.id },
    select: { id: true, title: true, content: true },
  });

  if (!note) return NextResponse.json({ error: "not found" }, { status: 404 });

  const client = getOpenAIClient();
  if (!client) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set" },
      { status: 500 }
    );
  }

  const prompt = `
You are an assistant for a notes app.

Given the note below, produce STRICT JSON with this shape:
{
  "summary": string,
  "action_items": string[],
  "suggested_title": string
}

Rules:
- summary: 2-4 sentences
- action_items: 0-7 bullets, imperative verbs
- suggested_title: short, 3-8 words
- Output ONLY valid JSON (no markdown)

NOTE TITLE: ${note.title}

NOTE CONTENT:
${note.content}
`.trim();

  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const text = resp.choices[0]?.message?.content || "{}";

  let parsed: any = {};
  try {
    parsed = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { error: "failed to parse AI response", raw: text },
      { status: 502 }
    );
  }

  const summary = typeof parsed.summary === "string" ? parsed.summary.trim() : "";
  const actionItems = safeStringArray(parsed.action_items);
  const suggestedTitle =
    typeof parsed.suggested_title === "string" ? parsed.suggested_title.trim() : "";

  const updated = await prisma.note.update({
    where: { id: note.id },
    data: {
      summary: summary || null,
      actionItems,
      aiSuggestedTitle: suggestedTitle || null,
      aiGeneratedAt: new Date(),
      aiUsageCount: { increment: 1 },
    },
    select: {
      id: true,
      summary: true,
      actionItems: true,
      aiSuggestedTitle: true,
      aiGeneratedAt: true,
      aiUsageCount: true,
    },
  });

  return NextResponse.json(updated, { status: 200 });
}