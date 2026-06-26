// CME quarterly futures month codes: H=Mar, M=Jun, U=Sep, Z=Dec.
// Tradovate symbols use a single-digit year (e.g. NQU6 = NQ Sep 2026).

const MONTH_CODES: Record<number, string> = { 3: "H", 6: "M", 9: "U", 12: "Z" };

// Returns the active CME front-month contract symbol for the given root.
// Uses a pragmatic "day 8 of the contract month" roll. Most discretionary
// traders have rolled by then; refine in V2B-2 if needed (true rule is
// 8 calendar days before the 3rd Friday).
export function frontMonth(root: string, now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1..12
  const day = now.getDate();

  let targetMonth: number;
  let targetYear: number;
  if (month < 3 || (month === 3 && day < 8))      { targetMonth = 3;  targetYear = year; }
  else if (month < 6 || (month === 6 && day < 8))  { targetMonth = 6;  targetYear = year; }
  else if (month < 9 || (month === 9 && day < 8))  { targetMonth = 9;  targetYear = year; }
  else if (month < 12 || (month === 12 && day < 8)) { targetMonth = 12; targetYear = year; }
  else                                              { targetMonth = 3;  targetYear = year + 1; }

  return `${root}${MONTH_CODES[targetMonth]}${targetYear % 10}`;
}
