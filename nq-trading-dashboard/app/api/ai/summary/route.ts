import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface AiSummary {
  bias: "bullish" | "bearish" | "neutral";
  confidence: number;
  reasoning: string;
  supports: number[];
  resistances: number[];
  scenarios: { label: string; description: string }[];
  risks: string[];
  patienceLevel: "wait" | "selective" | "engaged";
  generated: number;
  demo?: boolean;
  error?: string;
}

const SYSTEM_PROMPT = `You are a quantitative analyst providing concise pre-trade context for an NQ futures discretionary trader.

Respond with ONLY a valid JSON object matching exactly this schema:
{
  "bias": "bullish" | "bearish" | "neutral",
  "confidence": number between 0 and 1,
  "reasoning": short string (one or two sentences explaining the bias),
  "supports": [number, number, number] (3 key support prices, nearest first),
  "resistances": [number, number, number] (3 key resistance prices, nearest first),
  "scenarios": array of {"label": string, "description": string} (2 or 3 plausible scenarios),
  "risks": array of strings (top 2 risks to the bias),
  "patienceLevel": "wait" | "selective" | "engaged"
}

Rules:
- No prose, no markdown, no preamble. Only the JSON object.
- Ground every level in the provided context — do not invent prices that aren't in the data.
- Patience: "wait" if a high-impact event is imminent or signals conflict; "selective" if setups are possible but conditional; "engaged" if a clear setup with confluence is in play.
- Keep reasoning under 30 words.`;

function stripJsonFences(s: string): string {
  return s.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
}

function demoSummary(context: any, error?: string): AiSummary {
  const last = Number(context?.quote?.last ?? 21450);
  const round = (v: number) => Math.round(v * 4) / 4;
  return {
    bias: "neutral",
    confidence: 0.5,
    reasoning:
      "Demo summary — set ANTHROPIC_API_KEY in .env.local for live AI analysis. Price is sitting near the middle of today's range with no decisive read.",
    supports: [round(last * 0.998), round(last * 0.995), round(last * 0.99)],
    resistances: [round(last * 1.002), round(last * 1.005), round(last * 1.01)],
    scenarios: [
      { label: "Continuation up", description: "Hold above VWAP, target overnight high then PDH." },
      { label: "Range fade", description: "Reject nearest resistance, fade back to VWAP." },
    ],
    risks: [
      "Imminent high-impact event could trigger a move outside today's range.",
      "Thin liquidity could amplify any directional break.",
    ],
    patienceLevel: "selective",
    generated: Date.now(),
    demo: true,
    error,
  };
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const body = await req.json().catch(() => ({}));
  const context = (body as any)?.context;

  if (!apiKey) {
    return NextResponse.json(demoSummary(context));
  }

  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 800,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Current NQ context:\n\n${JSON.stringify(context, null, 2)}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return NextResponse.json(demoSummary(context, `Anthropic ${res.status}: ${errText.slice(0, 200)}`));
    }

    const data = await res.json();
    const text = data?.content?.[0]?.text ?? "";
    let parsed: AiSummary;
    try {
      parsed = JSON.parse(stripJsonFences(text));
    } catch {
      return NextResponse.json(demoSummary(context, "Model returned non-JSON output"));
    }

    return NextResponse.json({
      ...parsed,
      generated: Date.now(),
      demo: false,
    });
  } catch (err) {
    return NextResponse.json(
      demoSummary(context, (err as Error).message ?? "unknown error"),
    );
  }
}
