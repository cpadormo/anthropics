"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GlassCard } from "../ui/glass-card";
import { TimeframePicker } from "../ui/timeframe-picker";
import { useCandles } from "@/lib/hooks/use-candles";
import { adx, ema, macd, rsi, supertrend, vwap } from "@/lib/indicators";
import { INSTRUMENTS } from "@/lib/instruments";
import type { Timeframe } from "@/lib/types";
import { cn, fmtPrice } from "@/lib/utils";

const SYMBOLS = ["NQ", "ES", "RTY", "YM"];
const SUB_OPTIONS = ["RSI", "MACD", "ADX"] as const;
type Sub = (typeof SUB_OPTIONS)[number];

const EMA_DEFS = [
  { k: "ema20",  period: 20,  color: "#7c5cff", label: "EMA 20" },
  { k: "ema50",  period: 50,  color: "#38bdf8", label: "EMA 50" },
  { k: "ema100", period: 100, color: "#f59e0b", label: "EMA 100" },
  { k: "ema200", period: 200, color: "#ef4444", label: "EMA 200" },
] as const;

export function ChartWidget() {
  const [symbol, setSymbol] = useState("NQ");
  const [tf, setTf] = useState<Timeframe>("5m");
  const [sub, setSub] = useState<Sub>("RSI");
  const [overlays, setOverlays] = useState<Record<string, boolean>>({
    vwap: true,
    ema20: true,
    ema50: true,
    ema100: false,
    ema200: false,
    supertrend: false,
  });

  const inst = INSTRUMENTS[symbol];
  const candles = useCandles(symbol, tf, 200);

  const rows = useMemo(() => {
    if (!candles) return [];
    const closes = candles.map((c) => c.close);
    const vwapArr = vwap(candles);
    const e20 = ema(closes, 20);
    const e50 = ema(closes, 50);
    const e100 = ema(closes, 100);
    const e200 = ema(closes, 200);
    const rsiArr = rsi(closes, 14);
    const macdRes = macd(closes);
    const st = supertrend(candles, 10, 3);
    const adxRes = adx(candles, 14);
    return candles.map((c, i) => {
      const stPt = st[i];
      return {
        i,
        ts: c.ts,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume,
        isUp: c.close >= c.open,
        wick: [c.low, c.high] as [number, number],
        body: [c.open, c.close] as [number, number],
        vwap: vwapArr[i],
        ema20: e20[i],
        ema50: e50[i],
        ema100: e100[i],
        ema200: e200[i],
        rsi: rsiArr[i],
        macd: macdRes.macd[i],
        signal: macdRes.signal[i],
        hist: macdRes.hist[i],
        stUp: stPt && stPt.direction === "up" ? stPt.value : null,
        stDown: stPt && stPt.direction === "down" ? stPt.value : null,
        adx: adxRes.adx[i],
        pdi: adxRes.pdi[i],
        mdi: adxRes.mdi[i],
      };
    });
  }, [candles]);

  const dec = inst.priceDecimals;
  const last = rows[rows.length - 1];

  return (
    <GlassCard
      title="Chart"
      subtitle={
        <span className="flex items-center gap-2">
          <span className="font-mono text-text-primary">{inst.display}</span>
          <span className="text-text-muted truncate">{inst.name}</span>
          {last && (
            <span
              className={cn(
                "ml-2 font-mono tabular-nums",
                last.isUp ? "text-bull" : "text-bear",
              )}
            >
              {fmtPrice(last.close, dec)}
            </span>
          )}
        </span>
      }
      actions={
        <div className="flex items-center gap-1">
          <SymbolPicker value={symbol} onChange={setSymbol} />
          <TimeframePicker value={tf} onChange={setTf} />
        </div>
      }
    >
      <div className="flex flex-col gap-2 h-full min-h-[320px]">
        <OverlayToggle
          overlays={overlays}
          setOverlays={setOverlays}
          sub={sub}
          setSub={setSub}
        />

        <div className="flex-1 min-h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={rows} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="i" hide />
              <YAxis
                orientation="right"
                tick={{ fill: "#5e6a7c", fontSize: 10 }}
                domain={["auto", "auto"]}
                width={60}
                tickFormatter={(v) => Number(v).toFixed(dec)}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelFormatter={() => ""}
                formatter={priceTooltipFormatter(dec)}
              />
              <Bar dataKey="wick" shape={<Wick />} isAnimationActive={false} />
              <Bar dataKey="body" shape={<Body />} isAnimationActive={false} />
              {overlays.vwap && (
                <Line
                  type="monotone"
                  dataKey="vwap"
                  stroke="#e6edf6"
                  strokeWidth={1.25}
                  strokeDasharray="3 3"
                  dot={false}
                  isAnimationActive={false}
                  name="VWAP"
                />
              )}
              {EMA_DEFS.map((e) =>
                overlays[e.k] ? (
                  <Line
                    key={e.k}
                    type="monotone"
                    dataKey={e.k}
                    stroke={e.color}
                    strokeWidth={1}
                    dot={false}
                    isAnimationActive={false}
                    name={e.label}
                  />
                ) : null,
              )}
              {overlays.supertrend && (
                <>
                  <Line
                    type="stepAfter"
                    dataKey="stUp"
                    stroke="#22c55e"
                    strokeWidth={1.5}
                    dot={false}
                    connectNulls={false}
                    isAnimationActive={false}
                    name="Supertrend (long)"
                  />
                  <Line
                    type="stepAfter"
                    dataKey="stDown"
                    stroke="#ef4444"
                    strokeWidth={1.5}
                    dot={false}
                    connectNulls={false}
                    isAnimationActive={false}
                    name="Supertrend (short)"
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="h-[120px] border-t border-white/5 pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={rows} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="i" hide />
              <YAxis
                orientation="right"
                tick={{ fill: "#5e6a7c", fontSize: 10 }}
                domain={subDomain(sub)}
                width={60}
                tickFormatter={(v) =>
                  sub === "MACD" ? Number(v).toFixed(2) : Number(v).toFixed(0)
                }
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelFormatter={() => ""}
                formatter={(value) =>
                  typeof value === "number" ? value.toFixed(2) : String(value)
                }
              />
              {sub === "RSI" && (
                <>
                  <ReferenceLine y={70} stroke="rgba(239,68,68,0.4)" strokeDasharray="2 2" />
                  <ReferenceLine y={50} stroke="rgba(255,255,255,0.08)" />
                  <ReferenceLine y={30} stroke="rgba(34,197,94,0.4)" strokeDasharray="2 2" />
                  <Line
                    type="monotone"
                    dataKey="rsi"
                    stroke="#7c5cff"
                    strokeWidth={1.25}
                    dot={false}
                    isAnimationActive={false}
                    name="RSI(14)"
                  />
                </>
              )}
              {sub === "MACD" && (
                <>
                  <ReferenceLine y={0} stroke="rgba(255,255,255,0.08)" />
                  <Bar
                    dataKey="hist"
                    isAnimationActive={false}
                    shape={<HistBar />}
                    name="Histogram"
                  />
                  <Line
                    type="monotone"
                    dataKey="macd"
                    stroke="#38bdf8"
                    strokeWidth={1.25}
                    dot={false}
                    isAnimationActive={false}
                    name="MACD"
                  />
                  <Line
                    type="monotone"
                    dataKey="signal"
                    stroke="#f59e0b"
                    strokeWidth={1.25}
                    dot={false}
                    isAnimationActive={false}
                    name="Signal"
                  />
                </>
              )}
              {sub === "ADX" && (
                <>
                  <ReferenceLine y={20} stroke="rgba(255,255,255,0.10)" strokeDasharray="2 2" />
                  <ReferenceLine y={40} stroke="rgba(245,158,11,0.35)" strokeDasharray="2 2" />
                  <Line
                    type="monotone"
                    dataKey="adx"
                    stroke="#e6edf6"
                    strokeWidth={1.25}
                    dot={false}
                    isAnimationActive={false}
                    name="ADX(14)"
                  />
                  <Line
                    type="monotone"
                    dataKey="pdi"
                    stroke="#22c55e"
                    strokeWidth={1}
                    dot={false}
                    isAnimationActive={false}
                    name="+DI"
                  />
                  <Line
                    type="monotone"
                    dataKey="mdi"
                    stroke="#ef4444"
                    strokeWidth={1}
                    dot={false}
                    isAnimationActive={false}
                    name="-DI"
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </GlassCard>
  );
}

function subDomain(sub: Sub): [number | string, number | string] {
  if (sub === "RSI") return [0, 100];
  if (sub === "ADX") return [0, 60];
  return ["auto", "auto"];
}

const tooltipStyle = {
  background: "rgba(11,15,23,0.95)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8,
  fontSize: 11,
  color: "#e6edf6",
} as const;

function priceTooltipFormatter(dec: number) {
  return (value: unknown, name: string) => {
    if (Array.isArray(value)) {
      return [`${fmtPrice(value[0] as number, dec)} → ${fmtPrice(value[1] as number, dec)}`, name];
    }
    if (typeof value === "number") return [fmtPrice(value, dec), name];
    return [String(value), name];
  };
}

interface ShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: { isUp: boolean; hist?: number | null };
}

function Wick(props: ShapeProps) {
  const { x = 0, y = 0, width = 0, height = 0, payload } = props;
  if (!payload) return null;
  const cx = x + width / 2;
  const color = payload.isUp ? "#22c55e" : "#ef4444";
  return <line x1={cx} x2={cx} y1={y} y2={y + height} stroke={color} strokeWidth={1} />;
}

function Body(props: ShapeProps) {
  const { x = 0, y = 0, width = 0, height = 0, payload } = props;
  if (!payload) return null;
  const color = payload.isUp ? "#22c55e" : "#ef4444";
  const w = Math.max(2, width * 0.7);
  const offset = (width - w) / 2;
  const h = Math.max(1, height);
  return <rect x={x + offset} y={y} width={w} height={h} fill={color} stroke={color} />;
}

function HistBar(props: ShapeProps) {
  const { x = 0, y = 0, width = 0, height = 0, payload } = props;
  if (!payload || payload.hist == null) return null;
  const color = payload.hist >= 0 ? "rgba(34,197,94,0.55)" : "rgba(239,68,68,0.55)";
  const w = Math.max(1, width * 0.7);
  const offset = (width - w) / 2;
  return <rect x={x + offset} y={y} width={w} height={Math.max(1, height)} fill={color} />;
}

function SymbolPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-0.5 rounded-md bg-white/[0.04] p-0.5">
      {SYMBOLS.map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={cn(
            "px-2 py-0.5 text-2xs font-medium rounded",
            value === s
              ? "bg-white/10 text-text-primary"
              : "text-text-muted hover:text-text-secondary",
          )}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

function OverlayToggle({
  overlays,
  setOverlays,
  sub,
  setSub,
}: {
  overlays: Record<string, boolean>;
  setOverlays: (next: Record<string, boolean>) => void;
  sub: Sub;
  setSub: (v: Sub) => void;
}) {
  const toggle = (k: string) => setOverlays({ ...overlays, [k]: !overlays[k] });
  return (
    <div className="flex items-center justify-between gap-2 flex-wrap text-2xs">
      <div className="flex items-center gap-1 flex-wrap">
        <Pill on={overlays.vwap} color="#e6edf6" onClick={() => toggle("vwap")}>VWAP</Pill>
        {EMA_DEFS.map((e) => (
          <Pill key={e.k} on={overlays[e.k]} color={e.color} onClick={() => toggle(e.k)}>
            {e.label}
          </Pill>
        ))}
        <Pill on={overlays.supertrend} color="#22c55e" onClick={() => toggle("supertrend")}>
          Supertrend
        </Pill>
      </div>
      <div className="flex gap-0.5 rounded-md bg-white/[0.04] p-0.5">
        {SUB_OPTIONS.map((o) => (
          <button
            key={o}
            onClick={() => setSub(o)}
            className={cn(
              "px-2 py-0.5 text-2xs font-medium rounded",
              sub === o
                ? "bg-white/10 text-text-primary"
                : "text-text-muted hover:text-text-secondary",
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function Pill({
  on,
  color,
  onClick,
  children,
}: {
  on: boolean;
  color: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 px-1.5 py-0.5 rounded border transition-colors",
        on
          ? "border-white/15 bg-white/[0.04] text-text-primary"
          : "border-white/5 text-text-muted hover:text-text-secondary",
      )}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: on ? color : "rgba(255,255,255,0.15)" }}
      />
      <span>{children}</span>
    </button>
  );
}
