import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { DailyPerformance } from "@/lib/tradeAnalysis";
import type { Language } from "@/lib/i18n";
import { t } from "@/lib/i18n";

const NEON_PALETTE = ["#4F46E5", "#38BDF8", "#34D399", "#FBBF24", "#38bdf8"];
const TooltipStyle = { background: "rgba(8,11,28,0.95)", border: "1px solid rgba(251, 191, 36,0.3)", borderRadius: 10, padding: "10px 14px", backdropFilter: "blur(16px)", fontSize: 12 };

export function DayChart({ data, lang }: { data: DailyPerformance[]; lang: Language }) {
  const ordered = [...data].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  const chartData = ordered.map((d, i) => ({
    day: d.dayName.slice(0, 3), profit: parseFloat(d.netProfit.toFixed(2)),
    trades: d.trades, winRate: parseFloat(d.winRate.toFixed(1)),
    color: NEON_PALETTE[i % NEON_PALETTE.length],
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(251, 191, 36,0.06)" />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.85)" }} tickLine={false} axisLine={false} />
        <YAxis tickFormatter={(v) => `${v}`} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.85)" }} tickLine={false} axisLine={false} width={55} />
        <Tooltip contentStyle={TooltipStyle} formatter={(v: number) => [`$${v.toFixed(2)}`, t(lang, "netProfit")]} cursor={{ fill: "rgba(251, 191, 36,0.05)" }} />
        <Bar dataKey="profit" radius={[5, 5, 0, 0]}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.profit >= 0 ? entry.color : "#F43F5E"}
              style={{ filter: `drop-shadow(0 0 6px ${entry.profit >= 0 ? entry.color + "80" : "rgba(244, 63, 94,0.4)"})` }} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
