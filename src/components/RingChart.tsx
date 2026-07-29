import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface RingDatum {
  label: string;
  value: number;
  color: string;
}

interface RingChartProps {
  data: RingDatum[];
  hoveredIndex: number | null;
  onHoverChange: (index: number | null) => void;
  size?: number;
  centerLabel?: string;
  centerValue?: number | string;
}

/**
 * Concentric progress rings — one ring per sub-score.
 * Colors come from the design system tokens passed in via `data[].color`.
 */
export function RingChart({
  data,
  hoveredIndex,
  onHoverChange,
  size = 180,
  centerLabel,
  centerValue,
}: RingChartProps) {
  const center = size / 2;
  const stroke = Math.max(6, size / 26);
  const gap = stroke + 4;
  const outer = center - stroke;

  const active = hoveredIndex !== null ? data[hoveredIndex] : null;

  // Draw-in animation on mount (and whenever the values change)
  const [drawn, setDrawn] = useState(false);
  const signature = data.map((d) => d.value).join(",");
  useEffect(() => {
    setDrawn(false);
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setDrawn(true)));
    return () => cancelAnimationFrame(id);
  }, [signature]);

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        role="img"
        aria-label="Cognitive assessment sub-scores"
      >
        {data.map((d, i) => {
          const r = outer - i * gap;
          if (r <= 2) return null;
          const circ = 2 * Math.PI * r;
          const pct = Math.max(0, Math.min(100, d.value)) / 100;
          const shown = drawn ? pct : 0;
          const dim = hoveredIndex !== null && hoveredIndex !== i;
          return (
            <g key={d.label}>
              <circle
                cx={center}
                cy={center}
                r={r}
                fill="none"
                stroke="currentColor"
                className="text-border/25"
                strokeWidth={stroke}
              />
              <circle
                cx={center}
                cy={center}
                r={r}
                fill="none"
                stroke={d.color}
                strokeWidth={hoveredIndex === i ? stroke + 2 : stroke}
                strokeLinecap="round"
                strokeDasharray={`${circ * shown} ${circ}`}
                style={{
                  opacity: dim ? 0.25 : 1,
                  filter: hoveredIndex === i ? `drop-shadow(0 0 6px ${d.color})` : undefined,
                  transition:
                    "stroke-dasharray 1100ms cubic-bezier(0.22, 1, 0.36, 1), opacity 250ms ease, stroke-width 200ms ease",
                  transitionDelay: `${i * 120}ms`,
                }}
              />
              {/* invisible hit area */}
              <circle
                cx={center}
                cy={center}
                r={r}
                fill="none"
                stroke="transparent"
                strokeWidth={gap}
                className="cursor-pointer"
                onMouseEnter={() => onHoverChange(i)}
                onMouseLeave={() => onHoverChange(null)}
              />
            </g>
          );
        })}
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className={cn("text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70 px-4 leading-tight")}
        >
          {active ? active.label : centerLabel}
        </span>
        <span
          className="text-2xl font-black leading-none mt-0.5"
          style={{ color: active ? active.color : "var(--primary)" }}
        >
          {active ? active.value : centerValue}
        </span>
      </div>
    </div>
  );
}