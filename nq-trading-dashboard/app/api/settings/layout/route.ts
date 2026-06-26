import { NextResponse } from "next/server";
import { getLayout, setLayout } from "@/lib/db/repo";
import { getDb } from "@/lib/db/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getDb())) {
    return NextResponse.json({ error: "no-db" }, { status: 503 });
  }
  const layout = await getLayout();
  return NextResponse.json({ layout });
}

export async function PUT(req: Request) {
  if (!(await getDb())) {
    return NextResponse.json({ error: "no-db" }, { status: 503 });
  }
  try {
    const body = await req.json();
    await setLayout(body?.layout ?? null);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}
