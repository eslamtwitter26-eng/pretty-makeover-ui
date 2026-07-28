import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
  accentColor?: string;
  delay?: number;
}

function useCountUp(target: number, duration = 800, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      const start = performance.now();
      const step = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setVal(target * ease);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timer);
  }, [target, duration, delay]);
  return val;
}

const ACCENTS: Record<string, string> = {
  purple: "var(--primary)",
  cyan: "var(--accent)",
  green: "var(--success)",
  red: "var(--destructive)",
  amber: "var(--warning)",
  pink: "var(--chart-5)",
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
  accentColor = "purple",
  delay = 0,
}: MetricCardProps) {
  const accent = ACCENTS[accentColor] ?? ACCENTS.purple;
  const isNumeric = typeof value === "number" && !isNaN(value);
  const animated = useCountUp(isNumeric ? (value as number) : 0, 900, delay);
  const displayValue = isNumeric
    ? animated.toFixed(typeof value === "number" && !Number.isInteger(value) ? 1 : 0)
    : value;

  const valueColor =
    trend === "up" ? "var(--success)" : trend === "down" ? "var(--destructive)" : accent;

  return (
    <div
      className={cn(
        "animate-slide-up group relative overflow-hidden rounded-xl border border-card-border bg-card/70 p-4 backdrop-blur-xl transition-transform duration-200 hover:-translate-y-0.5",
        className,
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background: `radial-gradient(ellipse at 85% 10%, color-mix(in oklab, ${accent} 14%, transparent) 0%, transparent 65%)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: `color-mix(in oklab, ${accent} 55%, transparent)` }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {title}
          </p>
          <p
            className="ticker-value mt-2 text-2xl font-bold tracking-tight"
            style={{ color: valueColor }}
          >
            {displayValue}
          </p>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {icon && (
          <div
            className="shrink-0 rounded-lg p-2"
            style={{
              background: `color-mix(in oklab, ${accent} 14%, transparent)`,
              color: accent,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
