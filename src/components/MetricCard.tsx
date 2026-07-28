import { ReactNode, useEffect, useRef, useState } from "react";
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

const ACCENT_COLORS: Record<string, { border: string; glow: string; text: string; bg: string }> = {
  purple: { border: "rgba(79, 70, 229,0.4)", glow: "0 0 30px rgba(79, 70, 229,0.2)", text: "#4F46E5", bg: "rgba(79, 70, 229,0.08)" },
  cyan: { border: "rgba(56, 189, 248,0.4)", glow: "0 0 30px rgba(56, 189, 248,0.2)", text: "#38BDF8", bg: "rgba(56, 189, 248,0.08)" },
  green: { border: "rgba(52, 211, 153,0.4)", glow: "0 0 30px rgba(52, 211, 153,0.2)", text: "#34D399", bg: "rgba(52, 211, 153,0.08)" },
  red: { border: "rgba(244, 63, 94,0.4)", glow: "0 0 30px rgba(244, 63, 94,0.2)", text: "#F43F5E", bg: "rgba(244, 63, 94,0.08)" },
  amber: { border: "rgba(251, 191, 36,0.35)", glow: "0 0 25px rgba(251, 191, 36,0.15)", text: "#FBBF24", bg: "rgba(251, 191, 36,0.07)" },
  pink: { border: "rgba(244,114,182,0.4)", glow: "0 0 30px rgba(244,114,182,0.2)", text: "#F472B6", bg: "rgba(244,114,182,0.08)" },
};

export function MetricCard({ title, value, subtitle, icon, trend, className, accentColor = "purple", delay = 0 }: MetricCardProps) {
  const colors = ACCENT_COLORS[accentColor] || ACCENT_COLORS.purple;

  const isNumeric = typeof value === "number" && !isNaN(value);
  const animated = useCountUp(isNumeric ? value as number : 0, 900, delay);
  const displayValue = isNumeric ? animated.toFixed(typeof value === "number" && !Number.isInteger(value) ? 1 : 0) : value;

  const trendTextColor =
    trend === "up" ? "#34D399" :
    trend === "down" ? "#F43F5E" :
    colors.text;

  return (
    <div
      className={cn("relative overflow-hidden rounded-xl p-4 animate-slide-up", className)}
      style={{
        background: "color-mix(in oklab, var(--card) 75%, transparent)",
        backdropFilter: "blur(16px)",
        border: `1px solid ${colors.border}`,
        boxShadow: colors.glow,
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Subtle background glow */}
      <div className="absolute inset-0 opacity-40 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 80% 20%, ${colors.bg} 0%, transparent 70%)` }} />

      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-foreground/85">{title}</p>
          <p className="mt-1.5 text-2xl font-black ticker-value" style={{ color: trendTextColor, textShadow: trend === "up" ? "0 0 20px rgba(52, 211, 153,0.4)" : trend === "down" ? "0 0 20px rgba(244, 63, 94,0.4)" : `0 0 15px ${colors.text}60` }}>
            {displayValue}
          </p>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground/80">{subtitle}</p>}
        </div>
        {icon && (
          <div className="flex-shrink-0 rounded-lg p-2" style={{ background: colors.bg, color: colors.text }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
