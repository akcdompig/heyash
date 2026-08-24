import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOperator } from "@/lib/auth/dal";
import { prisma } from "@/lib/db/prisma";
import { SAFETY_CATEGORIES } from "@/lib/safety/categories";

const bodySchema = z.object({
  sessionId: z.string(),
  category: z.enum(SAFETY_CATEGORIES.map((c) => c.code) as [string, ...string[]]),
  description: z.string().trim().max(2000).optional(),
});

export async function POST(request: Request) {
  const operator = await requireOperator();
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

  const report = await prisma.safetyReport.create({
    data: {
      sessionId: session.id,
      reportedById: operator.id,
      reportedUserId: session.userId,
      category: parsed.data.category,
      description: parsed.data.description,
    },
  });

  return NextResponse.json({ id: report.id });
}
