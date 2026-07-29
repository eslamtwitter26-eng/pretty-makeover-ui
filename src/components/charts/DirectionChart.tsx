import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { ChartReveal, ChartTooltipCard, POSITIVE, NEGATIVE, token, money, CHART_DURATION } from "./chartKit";
import type { DirectionAnalysis } from "@/lib/tradeAnalysis";

const CountTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return <ChartTooltipCard title={p.name} rows={[{ label: "Trades", value: String(p.value), color: p.payload.color }]} />;
};

const AmountTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return <ChartTooltipCard title={p.name} rows={[{ label: "Amount", value: money(p.value), color: p.payload.color }]} />;
};

export function DirectionChart({ data }: { data: DirectionAnalysis; lang?: string }) {
  const tradeData = [
    { name: "Buy", value: data.buyTrades, color: POSITIVE },
    { name: "Sell", value: data.sellTrades, color: token("primary") },
  ];
  const profitData = [
    { name: "Buy Profit", value: Math.max(0, data.buyProfit), color: POSITIVE },
    { name: "Sell Profit", value: Math.max(0, data.sellProfit), color: token("accent") },
    { name: "Buy Loss", value: Math.max(0, -Math.min(0, data.buyProfit)), color: token("warning") },
    { name: "Sell Loss", value: Math.max(0, -Math.min(0, data.sellProfit)), color: NEGATIVE },
  ].filter(d => d.value > 0);

  const RADIAN = Math.PI / 180;
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }: any) => {
    if (percent < 0.05) return null;
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return <text x={x} y={y} fill="var(--foreground)" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700}>{`${(percent * 100).toFixed(0)}%`}</text>;
  };

  return (
    <ChartReveal className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Trade Count</p>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <defs>
                {tradeData.map((d, i) => (
                  <radialGradient key={i} id={`pieGrad${i}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={d.color} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={d.color} stopOpacity={0.6} />
                  </radialGradient>
                ))}
              </defs>
              <Pie data={tradeData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" paddingAngle={4} labelLine={false} label={renderLabel} isAnimationActive animationDuration={CHART_DURATION * 1000} animationEasing="ease-out">
                {tradeData.map((entry, i) => (
                  <Cell key={i} fill={`url(#pieGrad${i})`} stroke="transparent"
                    style={{ filter: `drop-shadow(0 0 8px color-mix(in oklab, ${entry.color} 55%, transparent))` }} />
                ))}
              </Pie>
              <Tooltip content={<CountTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-1">
            {tradeData.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full" style={{ background: d.color, boxShadow: `0 0 6px ${d.color}` }} />
                <span className="text-xs text-muted-foreground">{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">P&L Distribution</p>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={profitData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" paddingAngle={4} labelLine={false} label={renderLabel} isAnimationActive animationDuration={CHART_DURATION * 1000} animationEasing="ease-out">
                {profitData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent"
                    style={{ filter: `drop-shadow(0 0 8px color-mix(in oklab, ${entry.color} 55%, transparent))` }} />
                ))}
              </Pie>
              <Tooltip content={<AmountTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center flex-wrap gap-2 mt-1">
            {profitData.map((d, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full" style={{ background: d.color }} />
                <span className="text-[10px] text-muted-foreground">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Buy Win Rate", value: `${data.buyWinRate.toFixed(1)}%`, color: POSITIVE },
          { label: "Sell Win Rate", value: `${data.sellWinRate.toFixed(1)}%`, color: token("primary") },
          { label: "Buy Net P&L", value: `$${data.buyProfit.toFixed(2)}`, color: data.buyProfit >= 0 ? POSITIVE : NEGATIVE },
          { label: "Sell Net P&L", value: `$${data.sellProfit.toFixed(2)}`, color: data.sellProfit >= 0 ? POSITIVE : NEGATIVE },
        ].map((item, i) => (
          <div key={i} className="rounded-xl p-3" style={{ background: "color-mix(in oklab, var(--card) 70%, transparent)", border: `1px solid color-mix(in oklab, ${item.color} 30%, transparent)` }}>
            <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">{item.label}</p>
            <p className="mt-1 text-lg font-black tabular-nums" style={{ color: item.color, textShadow: `0 0 14px color-mix(in oklab, ${item.color} 55%, transparent)` }}>{item.value}</p>
          </div>
        ))}
      </div>
    </ChartReveal>
  );
}
