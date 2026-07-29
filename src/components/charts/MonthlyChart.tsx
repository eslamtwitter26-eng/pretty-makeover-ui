import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { MonthlyPerformance } from "@/lib/tradeAnalysis";
import {
  ChartReveal, ChartTooltipCard, SeriesGradient, alpha, axisTick, gridStroke,
  hoverCursorFill, money, CHART_DURATION, POSITIVE, NEGATIVE,
} from "./chartKit";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const v = payload[0].value as number;
  return (
    <ChartTooltipCard
      title={label}
      rows={[{ label: "Net P&L", value: money(v), color: v >= 0 ? POSITIVE : NEGATIVE }]}
    />
  );
};

export function MonthlyChart({ data }: { data: MonthlyPerformance[] }) {
  const chartData = data.map(m => ({ name: m.monthName, profit: parseFloat(m.netProfit.toFixed(2)) }));

  return (
    <ChartReveal replayKey={chartData.length}>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <defs>
            <SeriesGradient id="barPositive" color={POSITIVE} from={95} to={35} />
            <SeriesGradient id="barNegative" color={NEGATIVE} from={95} to={35} />
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis dataKey="name" tick={axisTick} tickLine={false} axisLine={false} interval={data.length > 12 ? Math.floor(data.length / 12) : 0} />
          <YAxis tickFormatter={(v) => `${v}`} tick={axisTick} tickLine={false} axisLine={false} width={60} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: hoverCursorFill, radius: 6 }} />
          <Bar dataKey="profit" radius={[5, 5, 0, 0]} isAnimationActive animationDuration={CHART_DURATION * 1000} animationEasing="ease-out">
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.profit >= 0 ? "url(#barPositive)" : "url(#barNegative)"}
                style={{ filter: `drop-shadow(0 0 6px ${alpha(entry.profit >= 0 ? "success" : "destructive", 35)})` }} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartReveal>
  );
}
