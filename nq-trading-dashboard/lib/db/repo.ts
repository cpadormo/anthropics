import "server-only";
import type { Trade } from "../data/journal";
import { getDb } from "./client";

function tradeToDb(t: Trade): Record<string, unknown> {
  return {
    id: t.id,
    userId: "local",
    symbol: t.symbol,
    side: t.side,
    entryTime: new Date(t.entryTime),
    exitTime: t.exitTime ? new Date(t.exitTime) : null,
    entry: t.entry,
    exit: t.exit,
    contracts: t.contracts,
    stopLoss: t.stopLoss,
    takeProfit: t.takeProfit,
    pointValue: t.pointValue,
    pnlPoints: t.pnlPoints,
    pnlDollars: t.pnlDollars,
    rMultiple: t.rMultiple,
    setup: t.setup,
    tags: t.tags,
    notes: t.notes,
  };
}

function tradeFromDb(r: any): Trade {
  return {
    id: r.id,
    symbol: r.symbol,
    side: r.side,
    entryTime: new Date(r.entryTime).getTime(),
    exitTime: r.exitTime ? new Date(r.exitTime).getTime() : null,
    entry: r.entry,
    exit: r.exit,
    contracts: r.contracts,
    stopLoss: r.stopLoss,
    takeProfit: r.takeProfit,
    pointValue: r.pointValue,
    pnlPoints: r.pnlPoints,
    pnlDollars: r.pnlDollars,
    rMultiple: r.rMultiple,
    setup: r.setup,
    tags: r.tags ?? [],
    notes: r.notes ?? "",
    createdAt: new Date(r.createdAt).getTime(),
  };
}

export async function listTrades(): Promise<Trade[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.trade.findMany({
    where: { userId: "local" },
    orderBy: { entryTime: "desc" },
  });
  return rows.map(tradeFromDb);
}

export async function createTrade(t: Trade): Promise<Trade | null> {
  const db = await getDb();
  if (!db) return null;
  const created = await db.trade.create({ data: tradeToDb(t) });
  return tradeFromDb(created);
}

export async function updateTrade(id: string, t: Trade): Promise<Trade | null> {
  const db = await getDb();
  if (!db) return null;
  const { id: _, ...patch } = tradeToDb(t);
  const updated = await db.trade.update({ where: { id }, data: patch });
  return tradeFromDb(updated);
}

export async function deleteTrade(id: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  await db.trade.delete({ where: { id } });
  return true;
}

export async function getLayout(): Promise<any | null> {
  const db = await getDb();
  if (!db) return null;
  const row = await db.userSetting.findUnique({ where: { userId: "local" } });
  return row?.layout ?? null;
}

export async function setLayout(layout: unknown): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  await db.userSetting.upsert({
    where: { userId: "local" },
    update: { layout: layout as any },
    create: { userId: "local", layout: layout as any },
  });
  return true;
}
