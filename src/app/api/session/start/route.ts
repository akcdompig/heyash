import { NextResponse } from "next/server";
import { requireAgeConfirmed } from "@/lib/auth/dal";
import {
  startConversation,
  AlreadyInConversationError,
  UserBlockedError,
} from "@/lib/sessions/state";

export async function POST() {
  const user = await requireAgeConfirmed();

  try {
    const session = await startConversation(user.id);
    return NextResponse.json({ sessionId: session.id, status: session.status });
  } catch (error) {
    if (error instanceof AlreadyInConversationError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error instanceof UserBlockedError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    throw error;
  }
}
