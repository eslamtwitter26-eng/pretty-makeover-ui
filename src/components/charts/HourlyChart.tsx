import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { HourlyPerformance } from "@/lib/tradeAnalysis";
import type { Language } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import {
  ChartReveal, ChartTooltipCard, SeriesGradient, NEGATIVE, alpha,
  axisTick, gridStroke, hoverCursorFill, money, CHART_DURATION, token,
} from "./chartKit";

export function HourlyChart({ data, lang }: { data: HourlyPerformance[]; lang: Language }) {
  const chartData = data.map(h => ({
    hour: `${h.hour}h`, profit: parseFloat(h.netProfit.toFixed(2)), trades: h.trades,
  }));

  const TooltipContent = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const p = payload[0].payload;
    return (
      <ChartTooltipCard
        title={label}
        rows={[
          { label: t(lang, "netProfit"), value: money(p.profit), color: p.profit >= 0 ? token("accent") : NEGATIVE },
          { label: "Trades", value: String(p.trades) },
        ]}
      />
    );
  };

  return (
    <ChartReveal replayKey={chartData.length}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <SeriesGradient id="hourAccent" color={token("accent")} from={95} to={30} />
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis dataKey="hour" tick={{ ...axisTick, fontSize: 9 }} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(v) => `${v}`} tick={axisTick} tickLine={false} axisLine={false} width={55} />
          <Tooltip content={<TooltipContent />} cursor={{ fill: hoverCursorFill, radius: 4 }} />
          <Bar dataKey="profit" radius={[3, 3, 0, 0]} isAnimationActive animationDuration={CHART_DURATION * 1000} animationEasing="ease-out">
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.profit >= 0 ? "url(#hourAccent)" : NEGATIVE}
                style={{ filter: `drop-shadow(0 0 5px ${alpha(entry.profit >= 0 ? "accent" : "destructive", 35)})` }} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartReveal>
  );
}
