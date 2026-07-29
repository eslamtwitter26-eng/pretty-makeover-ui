import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { DailyPerformance } from "@/lib/tradeAnalysis";
import type { Language } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import {
  ChartReveal, ChartTooltipCard, PALETTE, NEGATIVE, alpha,
  axisTick, gridStroke, hoverCursorFill, money, CHART_DURATION,
} from "./chartKit";

export function DayChart({ data, lang }: { data: DailyPerformance[]; lang: Language }) {
  const ordered = [...data].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  const chartData = ordered.map((d, i) => ({
    day: d.dayName.slice(0, 3), profit: parseFloat(d.netProfit.toFixed(2)),
    trades: d.trades, winRate: parseFloat(d.winRate.toFixed(1)),
    color: PALETTE[i % PALETTE.length],
  }));

  const TooltipContent = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const p = payload[0].payload;
    return (
      <ChartTooltipCard
        title={label}
        rows={[
          { label: t(lang, "netProfit"), value: money(p.profit), color: p.profit >= 0 ? p.color : NEGATIVE },
          { label: "Trades", value: String(p.trades) },
          { label: "Win rate", value: `${p.winRate}%` },
        ]}
      />
    );
  };

  return (
    <ChartReveal replayKey={chartData.length}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis dataKey="day" tick={axisTick} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(v) => `${v}`} tick={axisTick} tickLine={false} axisLine={false} width={55} />
          <Tooltip content={<TooltipContent />} cursor={{ fill: hoverCursorFill, radius: 6 }} />
          <Bar dataKey="profit" radius={[5, 5, 0, 0]} isAnimationActive animationDuration={CHART_DURATION * 1000} animationEasing="ease-out">
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.profit >= 0 ? entry.color : NEGATIVE}
                style={{ filter: `drop-shadow(0 0 6px ${alpha(entry.profit >= 0 ? "primary" : "destructive", 35)})` }} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartReveal>
  );
}
