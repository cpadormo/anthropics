import { NextResponse } from "next/server";
import { deleteAlert, updateAlert } from "@/lib/db/repo";
import { getDb } from "@/lib/db/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!(await getDb())) {
    return NextResponse.json({ error: "no-db" }, { status: 503 });
  }
  try {
    const body = await req.json();
    const updated = await updateAlert(params.id, body);
    return NextResponse.json({ alert: updated });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  if (!(await getDb())) {
    return NextResponse.json({ error: "no-db" }, { status: 503 });
  }
  try {
    await deleteAlert(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
