import "server-only";

// Lazy, optional Prisma singleton.
//
// We never import @prisma/client statically because that pulls Prisma's
// generated client into every server build. Instead we dynamic-import on
// first use and cache on globalThis (so HMR + serverless reuse the same
// instance). If DATABASE_URL is unset OR generation hasn't been run, the
// route handlers see a null client and return 503.

declare global {
  // eslint-disable-next-line no-var
  var __prisma: any | undefined;
}

let disabled = false;

export async function getDb(): Promise<any | null> {
  if (disabled) return null;
  if (!process.env.DATABASE_URL) return null;
  if (globalThis.__prisma) return globalThis.__prisma;
  try {
    const mod = await import("@prisma/client");
    globalThis.__prisma = new mod.PrismaClient();
    return globalThis.__prisma;
  } catch (err) {
    disabled = true;
    // eslint-disable-next-line no-console
    console.error(
      "[db] Prisma client not available. Run 'npm run db:generate' after setting DATABASE_URL.",
      err,
    );
    return null;
  }
}

export async function isDbConfigured(): Promise<boolean> {
  return (await getDb()) !== null;
}
