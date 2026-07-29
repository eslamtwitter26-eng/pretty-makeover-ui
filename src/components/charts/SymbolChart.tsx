import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { SymbolPerformance } from "@/lib/tradeAnalysis";
import type { Language } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import {
  ChartReveal, ChartTooltipCard, PALETTE, NEGATIVE, alpha,
  axisTick, gridStroke, hoverCursorFill, money, CHART_DURATION,
} from "./chartKit";

export function SymbolChart({ data, lang }: { data: SymbolPerformance[]; lang: Language }) {
  const top = [...data].sort((a, b) => Math.abs(b.netProfit) - Math.abs(a.netProfit)).slice(0, 10);
  const chartData = top.map((s, i) => ({
    symbol: s.symbol, profit: parseFloat(s.netProfit.toFixed(2)),
    winRate: parseFloat(s.winRate.toFixed(1)), trades: s.trades,
    color: PALETTE[i % PALETTE.length],
  }));

  const TooltipContent = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const p = payload[0].payload;
    return (
      <ChartTooltipCard
        title={p.symbol}
        rows={[
          { label: t(lang, "netProfit"), value: money(p.profit), color: p.profit >= 0 ? p.color : NEGATIVE },
          { label: "Win rate", value: `${p.winRate}%` },
          { label: "Trades", value: String(p.trades) },
        ]}
      />
    );
  };

  return (
    <ChartReveal replayKey={chartData.length}>
      <ResponsiveContainer width="100%" height={Math.max(180, chartData.length * 34)}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
          <XAxis type="number" tickFormatter={(v) => `${v}`} tick={axisTick} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="symbol" tick={{ ...axisTick, fontSize: 11, fontWeight: 600 }} tickLine={false} axisLine={false} width={65} />
          <Tooltip content={<TooltipContent />} cursor={{ fill: hoverCursorFill, radius: 6 }} />
          <Bar dataKey="profit" radius={[0, 5, 5, 0]} isAnimationActive animationDuration={CHART_DURATION * 1000} animationEasing="ease-out">
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.profit >= 0 ? entry.color : NEGATIVE}
                style={{ filter: `drop-shadow(0 0 5px ${alpha(entry.profit >= 0 ? "primary" : "destructive", 30)})` }} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartReveal>
  );
}
