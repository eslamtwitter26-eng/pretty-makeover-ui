import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { CHART_DURATION } from "./chartKit";

export interface PieDatum {
  label: string;
  value: number;
  color: string;
}

interface PieContextValue {
  data: PieDatum[];
  total: number;
  hovered: number | null;
  setHovered: (i: number | null) => void;
  size: number;
  innerRadius: number;
  drawn: boolean;
}

const PieContext = createContext<PieContextValue | null>(null);
const usePie = () => {
  const ctx = useContext(PieContext);
  if (!ctx) throw new Error("Pie subcomponents must be used inside <PieChart>");
  return ctx;
};

interface PieChartProps {
  data: PieDatum[];
  size?: number;
  innerRadius?: number;
  className?: string;
  children: ReactNode;
}

export function PieChart({
  data,
  size = 200,
  innerRadius = 65,
  className,
  children,
}: PieChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [drawn, setDrawn] = useState(false);
  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);

  useEffect(() => {
    setDrawn(false);
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setDrawn(true)));
    return () => cancelAnimationFrame(raf);
  }, [data]);

  const childArray = Children.toArray(children);
  const center = childArray.find(
    (c) => isValidElement(c) && (c.type as { displayName?: string })?.displayName === "PieCenter",
  );
  const slices = childArray.filter((c) => c !== center);

  return (
    <PieContext.Provider value={{ data, total, hovered, setHovered, size, innerRadius, drawn }}>
      <div
        className={cn("relative select-none", className)}
        style={{ width: size, height: size }}
        onMouseLeave={() => setHovered(null)}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>{slices}</g>
        </svg>
        {center && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">{center}</div>
        )}
      </div>
    </PieContext.Provider>
  );
}

export function PieSlice({ index }: { index: number }) {
  const { data, total, hovered, setHovered, size, innerRadius, drawn } = usePie();
  const datum = data[index];
  if (!datum || total <= 0) return null;

  const outerRadius = size / 2 - 4;
  const baseWidth = outerRadius - innerRadius;
  const isHovered = hovered === index;
  const dim = hovered !== null && !isHovered;
  const r = (outerRadius + innerRadius) / 2;
  const c = 2 * Math.PI * r;

  const before = data.slice(0, index).reduce((s, d) => s + d.value, 0);
  const fraction = datum.value / total;
  const gap = data.length > 1 ? 2 : 0;
  const len = Math.max(c * fraction - gap, 0.5);

  return (
    <circle
      cx={size / 2}
      cy={size / 2}
      r={r}
      fill="none"
      stroke={datum.color}
      strokeWidth={isHovered ? baseWidth + 6 : baseWidth}
      strokeLinecap="butt"
      strokeDasharray={`${drawn ? len : 0} ${c}`}
      strokeDashoffset={-(c * (before / total)) + (drawn ? 0 : 0)}
      opacity={dim ? 0.35 : 1}
      onMouseEnter={() => setHovered(index)}
      style={{
        transition: `stroke-dasharray ${CHART_DURATION}s cubic-bezier(0.22,1,0.36,1) ${index * 90}ms, stroke-width 220ms ease-out, opacity 220ms ease-out, filter 220ms ease-out`,
        filter: isHovered
          ? `drop-shadow(0 0 12px color-mix(in oklab, ${datum.color} 70%, transparent))`
          : `drop-shadow(0 0 6px color-mix(in oklab, ${datum.color} 35%, transparent))`,
        cursor: "pointer",
      }}
    />
  );
}

interface PieCenterRenderArgs {
  value: number;
  label: string;
  isHovered: boolean;
  data: PieDatum;
}

export function PieCenter({
  children,
  totalLabel = "Total",
}: {
  children: (args: PieCenterRenderArgs) => ReactNode;
  totalLabel?: string;
}) {
  const { data, total, hovered } = usePie();
  const active = hovered !== null ? data[hovered] : null;
  const datum: PieDatum = active ?? { label: totalLabel, value: total, color: "var(--foreground)" };
  return <>{children({ value: datum.value, label: datum.label, isHovered: !!active, data: datum })}</>;
}
PieCenter.displayName = "PieCenter";
