import { useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import type { EquityPoint } from "@/lib/tradeAnalysis";
import {
  ChartReveal, ChartTooltipCard, GlowFilter, SeriesGradient,
  alpha, axisTick, gridStroke, hoverCursorLine, money, POSITIVE, NEGATIVE,
  CHART_DURATION,
} from "./chartKit";

interface EquityCurveChartProps {
  data: EquityPoint[];
}

const fmt = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });

const CustomTooltip = ({ active, payload, label, color }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <ChartTooltipCard
      title={fmt.format(new Date(label))}
      rows={[{ label: "Balance", value: money(payload[0].value), color }]}
    />
  );
};

export function EquityCurveChart({ data }: EquityCurveChartProps) {
  const chartData = useMemo(() => {
    if (data.length <= 500) return data.map(p => ({ time: p.time.getTime(), balance: p.balance }));
    const step = Math.ceil(data.length / 500);
    return data.filter((_, i) => i % step === 0).map(p => ({ time: p.time.getTime(), balance: p.balance }));
  }, [data]);

  const minBalance = useMemo(() => Math.min(...chartData.map(d => d.balance)), [chartData]);
  const maxBalance = useMemo(() => Math.max(...chartData.map(d => d.balance)), [chartData]);
  const startBalance = chartData[0]?.balance ?? 0;
  const isProfit = chartData.length > 1 && chartData[chartData.length - 1].balance >= chartData[0].balance;
  const stroke = isProfit ? "var(--primary)" : NEGATIVE;
  const gradId = isProfit ? "equityGradUp" : "equityGradDown";

  return (
    <ChartReveal replayKey={chartData.length}>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <SeriesGradient id={gradId} color={stroke} from={50} />
            <GlowFilter id="equityGlow" />
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis
            dataKey="time" type="number" domain={["dataMin", "dataMax"]}
            tickFormatter={(v) => fmt.format(new Date(v))}
            tick={axisTick} tickLine={false} axisLine={false} scale="time"
          />
          <YAxis
            domain={[minBalance * 0.995, maxBalance * 1.005]}
            tickFormatter={(v) => `$${v.toLocaleString()}`}
            tick={axisTick} tickLine={false} axisLine={false} width={78}
          />
          <Tooltip content={<CustomTooltip color={stroke} />} cursor={hoverCursorLine} />
          <ReferenceLine y={startBalance} stroke={alpha("border", 90)} strokeDasharray="5 3" />
          <Area
            type="monotone" dataKey="balance"
            stroke={stroke} strokeWidth={2.5}
            fill={`url(#${gradId})`} dot={false}
            isAnimationActive animationDuration={CHART_DURATION * 1000}
            animationEasing="ease-in-out"
            activeDot={{ r: 5, fill: stroke, stroke: "var(--background)", strokeWidth: 2, filter: "url(#equityGlow)" }}
            style={{ filter: `drop-shadow(0 0 6px ${alpha(isProfit ? "primary" : "destructive", 45)})` }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartReveal>
  );
}
