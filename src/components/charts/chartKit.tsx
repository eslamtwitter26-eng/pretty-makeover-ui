import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Shared chart motion + theming language.
 * Motion curve & reveal behaviour modelled on the bklit-ui chart primitives,
 * re-expressed with this project's semantic tokens.
 */
export const CHART_EASE: [number, number, number, number] = [0.85, 0, 0.15, 1];
export const CHART_DURATION = 1.1;

export const token = (name: string) => `var(--${name})`;
export const alpha = (name: string, pct: number) =>
  `color-mix(in oklab, var(--${name}) ${pct}%, transparent)`;

/** Ordered categorical palette built from the project's semantic tokens. */
export const PALETTE = [
  token("primary"),
  token("accent"),
  token("success"),
  token("warning"),
  token("destructive"),
];

export const POSITIVE = token("success");
export const NEGATIVE = token("destructive");

export const axisTick = {
  fontSize: 10,
  fill: alpha("muted-foreground", 90),
} as const;

export const gridStroke = alpha("border", 55);
export const hoverCursorFill = alpha("primary", 10);
export const hoverCursorLine = {
  stroke: alpha("primary", 55),
  strokeWidth: 1,
  strokeDasharray: "4 4",
};

/**
 * Left-to-right clip reveal on mount — the signature bklit chart entrance.
 * Re-runs whenever `replayKey` changes.
 */
export function ChartReveal({
  children,
  delay = 0,
  replayKey,
  className,
}: {
  children: ReactNode;
  delay?: number;
  replayKey?: string | number;
  className?: string;
}) {
  return (
    <motion.div
      key={replayKey}
      className={className}
      initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0 }}
      animate={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
      transition={{
        clipPath: { duration: CHART_DURATION, ease: CHART_EASE, delay },
        opacity: { duration: 0.35, delay },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Vertical fill gradient for area / bar series. */
export function SeriesGradient({
  id,
  color,
  from = 55,
  to = 2,
}: {
  id: string;
  color: string;
  from?: number;
  to?: number;
}) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={color} stopOpacity={from / 100} />
      <stop offset="60%" stopColor={color} stopOpacity={(from / 100) * 0.18} />
      <stop offset="100%" stopColor={color} stopOpacity={to / 100} />
    </linearGradient>
  );
}

export function GlowFilter({ id, blur = 3 }: { id: string; blur?: number }) {
  return (
    <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation={blur} result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  );
}

interface TooltipRow {
  label: string;
  value: string;
  color?: string;
}

/** Glass tooltip shared by every chart. */
export function ChartTooltipCard({
  title,
  rows,
}: {
  title?: string;
  rows: TooltipRow[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      className="rounded-xl border border-border/70 bg-card/95 px-3.5 py-2.5 backdrop-blur-xl"
      style={{ boxShadow: `0 12px 40px -14px ${alpha("primary", 60)}` }}
    >
      {title && (
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {title}
        </p>
      )}
      <div className="space-y-0.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              {r.color && (
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: r.color, boxShadow: `0 0 8px ${r.color}` }}
                />
              )}
              {r.label}
            </span>
            <span className="ml-auto font-bold tabular-nums text-foreground">{r.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export const money = (v: number) =>
  `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
