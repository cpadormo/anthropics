import { NextResponse } from "next/server";
import { tradovateGet } from "@/lib/tradovate-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const accounts = await tradovateGet("/account/list");
    return NextResponse.json({ accounts });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 },
    );
  }
}
