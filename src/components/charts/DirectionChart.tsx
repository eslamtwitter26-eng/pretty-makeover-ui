import { ChartReveal, POSITIVE, NEGATIVE, token, money } from "./chartKit";
import { PieChart, PieSlice, PieCenter, type PieDatum } from "./PieChart";
import type { DirectionAnalysis } from "@/lib/tradeAnalysis";

function PieBlock({
  title,
  data,
  totalLabel,
  format,
}: {
  title: string;
  data: PieDatum[];
  totalLabel: string;
  format: (v: number) => string;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">{title}</p>
      <PieChart data={data} innerRadius={65} size={200}>
        {data.map((_, i) => (
          <PieSlice index={i} key={i} />
        ))}
        <PieCenter totalLabel={totalLabel}>
          {({ value, label, isHovered, data: d }) => (
            <div className="text-center">
              <div
                className="font-bold text-xl tabular-nums transition-colors"
                style={{ color: isHovered ? d.color : undefined }}
              >
                {format(value)}
              </div>
              <div className="text-muted-foreground text-xs">{label}</div>
            </div>
          )}
        </PieCenter>
      </PieChart>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: d.color, boxShadow: `0 0 6px ${d.color}` }}
            />
            <span className="text-[11px] text-muted-foreground">
              {d.label}: {format(d.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DirectionChart({ data }: { data: DirectionAnalysis; lang?: string }) {
  const tradeData: PieDatum[] = [
    { label: "Buy", value: data.buyTrades, color: POSITIVE },
    { label: "Sell", value: data.sellTrades, color: token("primary") },
  ].filter((d) => d.value > 0);

  const profitData: PieDatum[] = [
    { label: "Buy Profit", value: Math.max(0, data.buyProfit), color: POSITIVE },
    { label: "Sell Profit", value: Math.max(0, data.sellProfit), color: token("accent") },
    { label: "Buy Loss", value: Math.max(0, -Math.min(0, data.buyProfit)), color: token("warning") },
    { label: "Sell Loss", value: Math.max(0, -Math.min(0, data.sellProfit)), color: NEGATIVE },
  ].filter((d) => d.value > 0);

  return (
    <ChartReveal className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 place-items-center">
        <PieBlock
          title="Trade Count"
          data={tradeData}
          totalLabel="Trades"
          format={(v) => Math.round(v).toLocaleString()}
        />
        <PieBlock
          title="P&L Distribution"
          data={profitData}
          totalLabel="Volume"
          format={(v) => money(v)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Buy Win Rate", value: `${data.buyWinRate.toFixed(1)}%`, color: POSITIVE },
          { label: "Sell Win Rate", value: `${data.sellWinRate.toFixed(1)}%`, color: token("primary") },
          { label: "Buy Net P&L", value: `$${data.buyProfit.toFixed(2)}`, color: data.buyProfit >= 0 ? POSITIVE : NEGATIVE },
          { label: "Sell Net P&L", value: `$${data.sellProfit.toFixed(2)}`, color: data.sellProfit >= 0 ? POSITIVE : NEGATIVE },
        ].map((item, i) => (
          <div
            key={i}
            className="rounded-xl p-3"
            style={{
              background: "color-mix(in oklab, var(--card) 70%, transparent)",
              border: `1px solid color-mix(in oklab, ${item.color} 30%, transparent)`,
            }}
          >
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">{item.label}</p>
            <p
              className="mt-1 text-lg font-black tabular-nums"
              style={{ color: item.color, textShadow: `0 0 14px color-mix(in oklab, ${item.color} 55%, transparent)` }}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </ChartReveal>
  );
}
