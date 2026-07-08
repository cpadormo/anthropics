import { NextResponse } from "next/server";
import { frontMonth } from "@/lib/data/symbols";
import { getAuth, tradovateGet, tradovatePost } from "@/lib/tradovate-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PlaceOrderRequest {
  symbol: string; // root: "NQ" | "ES" | "RTY" | "YM"
  action: "Buy" | "Sell";
  orderQty: number;
  orderType: "Market" | "Limit" | "Stop" | "StopLimit";
  price?: number;
  stopPrice?: number;
  timeInForce?: "Day" | "GTC" | "IOC" | "FOK";
  accountId?: number;
}

export async function POST(req: Request) {
  let body: PlaceOrderRequest;
  try {
    body = (await req.json()) as PlaceOrderRequest;
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  if (!body?.symbol || !body?.action || !body?.orderQty || !body?.orderType) {
    return NextResponse.json({ error: "missing required fields" }, { status: 400 });
  }

  try {
    const auth = await getAuth();

    let accountId = body.accountId;
    if (!accountId) {
      const accounts = await tradovateGet<any[]>("/account/list");
      if (!Array.isArray(accounts) || accounts.length === 0) {
        return NextResponse.json(
          { error: "No Tradovate accounts found for this user" },
          { status: 404 },
        );
      }
      accountId = accounts[0].id as number;
    }

    const contract = frontMonth(body.symbol);
    const orderBody: Record<string, unknown> = {
      accountSpec: auth.name,
      accountId,
      action: body.action,
      symbol: contract,
      orderQty: body.orderQty,
      orderType: body.orderType,
      timeInForce: body.timeInForce ?? "Day",
      isAutomated: false,
    };
    if (body.price != null) orderBody.price = body.price;
    if (body.stopPrice != null) orderBody.stopPrice = body.stopPrice;

    const result = await tradovatePost<{ orderId?: number }>(
      "/order/placeOrder",
      orderBody,
    );
    return NextResponse.json({ ok: true, order: result, contract, accountId });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 },
    );
  }
}
