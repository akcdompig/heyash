import { NextResponse } from "next/server";
import { requireOperator } from "@/lib/auth/dal";
import {
  acceptConversation,
  SessionUnavailableError,
  OperatorBusyError,
} from "@/lib/sessions/state";

export async function POST(_request: Request, { params }: RouteContext<"/api/session/[id]/accept">) {
  const operator = await requireOperator();
  const { id } = await params;

  try {
    const session = await acceptConversation(id, operator.id);
    return NextResponse.json({ status: session.status });
  } catch (error) {
    if (error instanceof SessionUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error instanceof OperatorBusyError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}
