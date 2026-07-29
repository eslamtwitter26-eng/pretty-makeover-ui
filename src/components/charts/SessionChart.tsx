import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
import type { SessionPerformance } from "@/lib/tradeAnalysis";
import type { Language } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import {
  ChartReveal, ChartTooltipCard, PALETTE, POSITIVE, NEGATIVE, alpha, token,
  axisTick, gridStroke, hoverCursorFill, money, CHART_DURATION,
} from "./chartKit";

function translateSession(session: string, lang: Language): string {
  const map: Record<string, Record<Language, string>> = {
    Asia: { en: "Asia", ar: "آسيا", fr: "Asie" },
    London: { en: "London", ar: "لندن", fr: "Londres" }, "New York": { en: "New York", ar: "نيويورك", fr: "New York" },
  };
  return map[session]?.[lang] ?? session;
}

export function SessionChart({ data, lang }: { data: SessionPerformance[]; lang: Language }) {
  const chartData = data.map((s, i) => ({
    session: translateSession(s.session, lang),
    winRate: parseFloat(s.winRate.toFixed(1)),
    profit: parseFloat(s.netProfit.toFixed(2)),
    trades: s.trades,
    color: PALETTE[i % PALETTE.length],
  }));

  const RateTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const p = payload[0].payload;
    return <ChartTooltipCard title={p.session} rows={[{ label: t(lang, "winRateLabel"), value: `${p.winRate}%`, color: token("primary") }, { label: "Trades", value: String(p.trades) }]} />;
  };
  const ProfitTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const p = payload[0].payload;
    return <ChartTooltipCard title={p.session} rows={[{ label: t(lang, "netProfit"), value: money(p.profit), color: p.profit >= 0 ? POSITIVE : NEGATIVE }]} />;
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{t(lang, "sessionWinRate")}</p>
        <ChartReveal replayKey={chartData.length}>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={chartData}>
              <defs>
                <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={token("primary")} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={token("accent")} stopOpacity={0.08} />
                </radialGradient>
              </defs>
              <PolarGrid stroke={gridStroke} />
              <PolarAngleAxis dataKey="session" tick={{ ...axisTick, fontSize: 10 }} />
              <Radar dataKey="winRate" stroke={token("primary")} fill="url(#radarFill)" strokeWidth={2}
                isAnimationActive animationDuration={CHART_DURATION * 1000} animationEasing="ease-out"
                style={{ filter: `drop-shadow(0 0 8px ${alpha("primary", 50)})` }} />
              <Tooltip content={<RateTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartReveal>
      </div>
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{t(lang, "sessionProfit")}</p>
        <ChartReveal replayKey={chartData.length} delay={0.1}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="session" tick={axisTick} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(v) => `${v}`} tick={axisTick} tickLine={false} axisLine={false} width={50} />
              <Tooltip content={<ProfitTooltip />} cursor={{ fill: hoverCursorFill, radius: 6 }} />
              <Bar dataKey="profit" radius={[5, 5, 0, 0]} isAnimationActive animationDuration={CHART_DURATION * 1000} animationEasing="ease-out">
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.profit >= 0 ? POSITIVE : NEGATIVE}
                    style={{ filter: `drop-shadow(0 0 5px ${alpha(entry.profit >= 0 ? "success" : "destructive", 35)})` }} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartReveal>
      </div>
    </div>
  );
}
