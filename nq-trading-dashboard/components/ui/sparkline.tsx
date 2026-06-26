import { cn } from "@/lib/utils";

interface Props {
  data: number[];
  className?: string;
  stroke?: string;
  fill?: string;
  width?: number;
  height?: number;
}

export function Sparkline({
  data,
  className,
  stroke,
  fill,
  width = 80,
  height = 24,
}: Props) {
  if (data.length < 2) return <svg width={width} height={height} className={className} />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const step = width / (data.length - 1);
  let d = "";
  for (let i = 0; i < data.length; i++) {
    const x = (i * step).toFixed(2);
    const y = (height - ((data[i] - min) / span) * height).toFixed(2);
    d += `${i === 0 ? "M" : "L"}${x},${y} `;
  }
  const area = `${d}L${width},${height} L0,${height} Z`;
  const isUp = data[data.length - 1] >= data[0];
  const lineColor = stroke ?? (isUp ? "#22c55e" : "#ef4444");
  const fillColor = fill ?? (isUp ? "rgba(34,197,94,0.14)" : "rgba(239,68,68,0.14)");
  return (
    <svg width={width} height={height} className={cn("overflow-visible", className)}>
      <path d={area} fill={fillColor} />
      <path
        d={d}
        fill="none"
        stroke={lineColor}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
