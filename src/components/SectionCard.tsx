import { ReactNode, useRef } from "react";
import { cn } from "@/lib/utils";
import { DownloadChartButton } from "./charts/DownloadChartButton";

interface SectionCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  accentColor?: string;
  downloadable?: boolean;
}

const COLORS: Record<string, string> = {
  purple: "#4F46E5",
  cyan: "#38BDF8",
  green: "#34D399",
  amber: "#FBBF24",
};

export function SectionCard({ title, children, className, action, accentColor = "purple", downloadable = true }: SectionCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const color = COLORS[accentColor] || COLORS.purple;
  return (
    <div
      ref={cardRef}
      className={cn("rounded-xl overflow-hidden chart-export-container relative", className)}
      style={{
        background: "hsl(var(--card) / 75%)",
        backdropFilter: "blur(16px)",
        border: `1px solid rgba(${accentColor === "purple" ? "79, 70, 229" : accentColor === "cyan" ? "56, 189, 248" : accentColor === "green" ? "52, 211, 153" : "251, 191, 36"},0.15)`,
      }}
    >
      <div className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: `1px solid rgba(${accentColor === "purple" ? "79, 70, 229" : accentColor === "cyan" ? "56, 189, 248" : accentColor === "green" ? "52, 211, 153" : "251, 191, 36"},0.12)` }}>
        <div className="flex items-center gap-2.5">
          <div className="h-4 w-0.5 rounded-full" style={{ background: `linear-gradient(180deg, ${color}, transparent)`, boxShadow: `0 0 8px ${color}80` }} />
          <h3 className="text-sm font-bold text-foreground/90">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {action}
          {downloadable && <DownloadChartButton targetRef={cardRef} title={title} variant="icon" />}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

