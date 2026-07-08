import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Pulls Market Internals from an operator-run IQFeed bridge. The
// bridge handles the native TCP/Windows concerns (IQConnect.exe) and
// exposes a single endpoint:
//
//   GET {IQFEED_BRIDGE_URL}/internals
//   -> { nyseTick, nasdaqTick, trin, advanceDecline, addLine,
//        putCall, riskOn, ts }
//
// A minimal bridge is ~50 lines of Node or Python (connect to
// localhost:5009, subscribe to JTNT.Z / JTHK.Z / TRIN-NY etc., emit
// JSON over HTTP). See README for sample code.
export async function GET() {
  const bridge = process.env.IQFEED_BRIDGE_URL;
  if (!bridge) {
    return NextResponse.json({ demo: true });
  }
  try {
    const res = await fetch(`${bridge.replace(/\/$/, "")}/internals`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({
        demo: true,
        error: `IQFeed bridge ${res.status}`,
      });
    }
    const data = await res.json();
    return NextResponse.json({ internals: data, demo: false });
  } catch (err) {
    return NextResponse.json({ demo: true, error: (err as Error).message });
  }
}
