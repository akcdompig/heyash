import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/dal";
import { prisma } from "@/lib/db/prisma";
import { recomputeSession } from "@/lib/sessions/timer";

const bodySchema = z.object({ sessionId: z.string() });

// Polled by the client every ~15s while a chat is open. Its only real job is
// to trigger the server-side billing recompute — the response it returns is
// just a resync point for the client's cosmetic countdown, never the source
// of truth itself.
export async function POST(request: Request) {
  const user = await requireUser();
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldig verzoek" }, { status: 400 });
  }

  const session = await prisma.conversationSession.findUnique({
    where: { id: parsed.data.sessionId },
  });
  if (!session) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }
  if (session.userId !== user.id && session.operatorId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await recomputeSession(session.id);
  return NextResponse.json({
    status: updated.status,
    startedAt: updated.startedAt?.toISOString() ?? null,
    endsAt: updated.endsAt?.toISOString() ?? null,
  });
}
