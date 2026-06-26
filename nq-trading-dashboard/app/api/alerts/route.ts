import { NextResponse } from "next/server";
import { createAlert, listAlerts } from "@/lib/db/repo";
import { getDb } from "@/lib/db/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getDb())) {
    return NextResponse.json({ error: "no-db" }, { status: 503 });
  }
  try {
    const alerts = await listAlerts();
    return NextResponse.json({ alerts });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await getDb())) {
    return NextResponse.json({ error: "no-db" }, { status: 503 });
  }
  try {
    const body = await req.json();
    const created = await createAlert(body);
    return NextResponse.json({ alert: created });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
