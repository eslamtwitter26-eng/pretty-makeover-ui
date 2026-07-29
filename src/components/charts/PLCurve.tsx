import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, AreaChart, Legend, LineChart,
} from "recharts";
import { Play, Pause, RotateCcw, TrendingUp, TrendingDown, Minus, Sliders, BarChart3, LineChart as LineIcon, Activity, Sparkles } from "lucide-react";
import type { Trade } from "@/lib/tradeAnalysis";
import { DownloadChartButton } from "./DownloadChartButton";

interface PLCurveProps {
  trades: Trade[];
  initialBalance: number;
  theme?: "dark" | "light";
}

interface PLPoint {
  label: string;
  cum: number;
  balance: number;
  tradeProfit: number;
  dd: number;
  tradeNum: number;
  symbol?: string;
  kind?: "buy" | "sell";
  dateStr?: string;
  lot?: number;
  openPrice?: number;
  closePrice?: number;
  benchmark?: number;
  rollingReturn?: number;
}

function buildPoints(trades: Trade[], initialBalance: number): PLPoint[] {
  if (!trades.length) return [];
  const sorted = [...trades].sort((a, b) => a.closeTime.getTime() - b.closeTime.getTime());
  let cum = 0, peak = 0;
  
  // Calculate average profit per trade to draw a benchmark line
  const totalNet = sorted.reduce((sum, t) => sum + t.netProfit, 0);
  const avgProfit = totalNet / sorted.length;

  const pts: PLPoint[] = [
    { 
      label: "Start", 
      cum: 0, 
      balance: initialBalance, 
      tradeProfit: 0, 
      dd: 0, 
      tradeNum: 0,
      benchmark: initialBalance,
      rollingReturn: 0 
    },
  ];

  for (let i = 0; i < sorted.length; i++) {
    const t = sorted[i];
    cum = parseFloat((cum + t.netProfit).toFixed(2));
    const currentBalance = parseFloat((initialBalance + cum).toFixed(2));
    peak = Math.max(peak, cum);
    
    // Compute 30-trade moving average rolling return
    let rollingSum = 0;
    let count = 0;
    for (let j = Math.max(0, i - 29); j <= i; j++) {
      rollingSum += sorted[j].netProfit;
      count++;
    }
    const rollingReturn = count > 0 ? parseFloat((rollingSum / count).toFixed(2)) : 0;

    // Benchmark grows steadily matching target return rate
    const benchmarkVal = parseFloat((initialBalance + (i + 1) * avgProfit).toFixed(2));

    pts.push({
      label: t.closeTime.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      dateStr: t.closeTime.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      cum,
      balance: currentBalance,
      tradeProfit: parseFloat(t.netProfit.toFixed(2)),
      dd: parseFloat((cum - peak).toFixed(2)),
      tradeNum: i + 1,
      symbol: t.symbol,
      kind: t.type,
      lot: t.volume,
      openPrice: t.openPrice,
      closePrice: t.closePrice,
      benchmark: benchmarkVal,
      rollingReturn,
    });
  }
  return pts;
}

const PLAY_SPEED = 25; // ms per step
const STEP = 1;        // points per tick

const HiddenDot = () => null;

export function PLCurve({ trades, initialBalance, theme }: PLCurveProps) {
  const isDark = theme !== "light";
  const gridColor = isDark ? "color-mix(in oklab, var(--foreground) 2%, transparent)" : "color-mix(in oklab, var(--foreground) 5%, transparent)";
  const labelColor = isDark ? "color-mix(in oklab, var(--foreground) 40%, transparent)" : "color-mix(in oklab, var(--foreground) 60%, transparent)";
  const cursorColor = isDark ? "color-mix(in oklab, var(--foreground) 6%, transparent)" : "color-mix(in oklab, var(--foreground) 10%, transparent)";
  const refLineColor = isDark ? "color-mix(in oklab, var(--foreground) 10%, transparent)" : "color-mix(in oklab, var(--foreground) 15%, transparent)";

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload as PLPoint;
    if (!d || d.tradeNum === 0) return null;
    const win = d.tradeProfit >= 0;
    return (
      <div style={{
        background: isDark ? "color-mix(in oklab, var(--card) 95%, transparent)" : "color-mix(in oklab, var(--foreground) 98%, transparent)",
        border: `1px solid ${win ? "color-mix(in oklab, var(--success) 30%, transparent)" : "color-mix(in oklab, var(--destructive) 30%, transparent)"}`,
        borderRadius: 12,
        padding: "12px 16px",
        backdropFilter: "blur(24px)",
        fontSize: 12,
        minWidth: 200,
        boxShadow: "0 10px 30px -10px color-mix(in oklab, var(--foreground) 15%, transparent)",
        color: isDark ? "var(--foreground)" : "var(--foreground)"
      }}>
        <div className="flex items-center justify-between gap-4 mb-2">
          <span className="text-muted-foreground/85 text-[10px] font-bold">#{d.tradeNum} · {d.dateStr}</span>
          {d.symbol && (
            <span style={{
              fontSize: 9, fontWeight: 900, letterSpacing: "0.06em",
              color: d.kind === "buy" ? "var(--accent)" : "var(--accent)",
              background: d.kind === "buy" ? "color-mix(in oklab, var(--accent) 12%, transparent)" : "rgba(244,114,182,0.12)",
              padding: "2px 6px", borderRadius: 4,
              border: `1px solid ${d.kind === "buy" ? "color-mix(in oklab, var(--accent) 15%, transparent)" : "rgba(244,114,182,0.15)"}`
            }}>
              {d.symbol} {d.kind?.toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex items-baseline justify-between gap-6">
          <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Trade P&L</span>
          <span style={{ fontWeight: 900, fontSize: 14, color: win ? "var(--success)" : "var(--destructive)" }}>
            {d.tradeProfit >= 0 ? "+" : ""} ${d.tradeProfit.toFixed(2)}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-6 mt-1">
          <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Balance</span>
          <span style={{ fontWeight: 800, fontSize: 13, color: isDark ? "var(--foreground)" : "var(--foreground)" }}>
            ${d.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
        {d.dd < 0 && (
          <div className="flex items-baseline justify-between gap-6 mt-1 border-t border-border/5 pt-1">
            <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Drawdown</span>
            <span style={{ fontWeight: 600, fontSize: 12, color: "var(--destructive)" }}>${d.dd.toFixed(2)}</span>
          </div>
        )}
      </div>
    );
  };

  const allPoints = useMemo(() => buildPoints(trades, initialBalance), [trades, initialBalance]);
  const [displayCount, setDisplayCount] = useState(allPoints.length);
  const [playing, setPlaying] = useState(false);
  const [chartType, setChartType] = useState<"equity" | "balance" | "floating" | "benchmark" | "rolling">("equity");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setDisplayCount(allPoints.length);
  }, [allPoints]);

  const step = allPoints.length > 500 ? 5 : allPoints.length > 200 ? 3 : STEP;

  const stopPlay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setPlaying(false);
  }, []);

  const startPlay = useCallback(() => {
    setDisplayCount(1);
    setPlaying(true);
  }, []);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setDisplayCount((c) => {
          if (c >= allPoints.length) { stopPlay(); return allPoints.length; }
          return Math.min(c + step, allPoints.length);
        });
      }, PLAY_SPEED);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, allPoints.length, step, stopPlay]);

  const visiblePoints = useMemo(() => allPoints.slice(0, displayCount), [allPoints, displayCount]);

  // Selected trade for Replay Slider
  const replayIndex = Math.max(0, Math.min(displayCount - 1, allPoints.length - 1));
  const selectedPoint = allPoints[replayIndex];

  // Stats derived from FULL data
  const finalCum = allPoints[allPoints.length - 1]?.cum ?? 0;
  const peakCum = useMemo(() => Math.max(...allPoints.map((p) => p.cum), 0), [allPoints]);
  const maxDD = useMemo(() => Math.min(...allPoints.map((p) => p.dd), 0), [allPoints]);
  const returnPct = initialBalance > 0 ? (finalCum / initialBalance) * 100 : 0;

  // Gradient offset logic based on currently chosen chart metric
  const chartKey = chartType === "equity" ? "cum" : chartType === "balance" ? "balance" : chartType === "floating" ? "tradeProfit" : chartType === "benchmark" ? "benchmark" : "rollingReturn";

  const values = visiblePoints.map(p => Number(p[chartKey]) || 0);
  const minVal = Math.min(...values, 0);
  const maxVal = Math.max(...values, 0);
  const range = maxVal - minVal;
  const zeroOffset = range > 0 ? `${((maxVal / range) * 100).toFixed(1)}%` : maxVal <= 0 ? "0%" : "100%";

  const tickInterval = Math.max(1, Math.floor(visiblePoints.length / 8) - 1);

  if (!allPoints.length) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground/50">
        No trades to display
      </div>
    );
  }

  return (
    <div className="space-y-6 chart-export-container">
      {/* Chart Toggles and Header Banner */}
      <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between border-b border-border/5 pb-4">
        <div className="flex flex-wrap gap-1.5 bg-background/50 p-1 rounded-xl border border-border/5">
          {[
            { id: "equity", label: "Equity Curve", icon: Activity },
            { id: "balance", label: "Balance Curve", icon: LineIcon },
            { id: "floating", label: "Floating P/L (Trade)", icon: BarChart3 },
            { id: "benchmark", label: "Target Benchmark", icon: Sparkles },
            { id: "rolling", label: "30-Trade Rolling Return", icon: Sliders }
          ].map((type) => {
            const Icon = type.icon;
            const active = chartType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setChartType(type.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  active 
                    ? "bg-primary/15 text-primary border border-primary/30" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          <DownloadChartButton title="P&L Performance Curve" variant="button" />
          <button
            onClick={playing ? stopPlay : startPlay}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all"
            style={{
              background: playing ? "color-mix(in oklab, var(--destructive) 12%, transparent)" : "color-mix(in oklab, var(--success) 12%, transparent)",
              border: `1px solid ${playing ? "color-mix(in oklab, var(--destructive) 30%, transparent)" : "color-mix(in oklab, var(--success) 30%, transparent)"}`,
              color: playing ? "var(--destructive)" : "var(--success)",
            }}
          >
            {playing ? <Pause className="h-3 w-3 animate-pulse" /> : <Play className="h-3 w-3" />}
            {playing ? "Pause" : "Play History"}
          </button>
          <button
            onClick={() => { stopPlay(); setDisplayCount(allPoints.length); }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all hover:bg-white/5 bg-background/40 border border-border/10 text-muted-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        </div>
      </div>

      {/* Main visual display of chosen chart mode */}
      <div className="relative overflow-hidden rounded-xl border border-border/5 bg-background/20 p-4">
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={visiblePoints} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
              <defs>
                <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartType === "floating" ? "var(--accent)" : "var(--success)"} stopOpacity={0.25} />
                  <stop offset={zeroOffset} stopColor={chartType === "floating" ? "var(--accent)" : "var(--success)"} stopOpacity={0.02} />
                  <stop offset={zeroOffset} stopColor="var(--destructive)" stopOpacity={0.02} />
                  <stop offset="100%" stopColor="var(--destructive)" stopOpacity={0.25} />
                </linearGradient>
                <linearGradient id="curveStroke" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartType === "floating" ? "var(--accent)" : "var(--success)"} />
                  <stop offset={zeroOffset} stopColor={chartType === "floating" ? "var(--accent)" : "var(--success)"} />
                  <stop offset={zeroOffset} stopColor="var(--destructive)" />
                  <stop offset="100%" stopColor="var(--destructive)" />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fill: labelColor, fontWeight: "600" }}
                tickLine={false} axisLine={false}
                interval={tickInterval}
              />
              <YAxis
                tickFormatter={(v) => `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                tick={{ fontSize: 9, fill: labelColor, fontWeight: "600" }}
                tickLine={false} axisLine={false}
                width={65}
                domain={["auto", "auto"]}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: cursorColor, strokeWidth: 1 }} />
              <ReferenceLine y={chartType === "balance" ? initialBalance : 0} stroke={refLineColor} strokeDasharray="3 3" />

              <Area
                type="monotone"
                dataKey={chartKey}
                stroke="url(#curveStroke)"
                strokeWidth={2}
                fill="url(#curveFill)"
                dot={<HiddenDot />}
                activeDot={{
                  r: 5,
                  fill: "var(--primary)",
                  stroke: "var(--foreground)",
                  strokeWidth: 1.5,
                }}
                isAnimationActive={false}
              />

              {chartType === "benchmark" && (
                <Line
                  type="monotone"
                  dataKey="benchmark"
                  stroke="var(--warning)"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  isAnimationActive={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Drawdown timeline below equity curve */}
      <div className="rounded-xl border border-border/5 bg-background/20 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">
            Drawdown Timeline & Under-Water Periods
          </p>
          <span className="text-[10px] text-muted-foreground/60 font-semibold">Max DD: ${Math.abs(maxDD).toFixed(2)}</span>
        </div>
        <div style={{ height: 60 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={visiblePoints} margin={{ top: 2, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="ddFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--destructive)" stopOpacity={0.03} />
                  <stop offset="100%" stopColor="var(--destructive)" stopOpacity={0.35} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" hide />
              <YAxis
                tickFormatter={(v) => `$${v}`}
                tick={{ fontSize: 8, fill: "color-mix(in oklab, var(--destructive) 50%, transparent)" }}
                tickLine={false} axisLine={false}
                width={65}
                domain={["auto", 0]}
                tickCount={3}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="dd"
                stroke="var(--destructive)"
                strokeWidth={1}
                fill="url(#ddFill)"
                dot={false}
                activeDot={{ r: 3, fill: "var(--destructive)", stroke: "color-mix(in oklab, var(--card) 90%, transparent)", strokeWidth: 1.5 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION 3 NEW FEATURE: 30 Trade Moving Average Momentum Chart */}
      <div className="rounded-xl border border-border/5 bg-background/20 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
            Rolling Performance Momentum (30 Trade Moving Average)
          </p>
          <span className="text-[10px] text-muted-foreground/60 font-semibold">Tracks consistency trend</span>
        </div>
        <div style={{ height: 80 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={visiblePoints} margin={{ top: 2, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="rollingFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" hide />
              <YAxis
                tickFormatter={(v) => `$${v}`}
                tick={{ fontSize: 8, fill: "color-mix(in oklab, var(--accent) 50%, transparent)" }}
                tickLine={false} axisLine={false}
                width={65}
                domain={["auto", "auto"]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="rollingReturn"
                stroke="var(--accent)"
                strokeWidth={1.5}
                fill="url(#rollingFill)"
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trade Replay Slider controls with active trade details */}
      {allPoints.length > 1 && (
        <div className="rounded-xl p-5 border border-border/5 bg-background/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-primary animate-pulse" />
              <p className="text-xs font-black uppercase tracking-wider text-foreground">Interactive Trade Replay Engine</p>
            </div>
            <p className="text-[10px] font-semibold text-muted-foreground/70 bg-background/40 px-2.5 py-1 rounded-md border border-border/5">
              Drag to step through trades and replay historical performance step-by-step
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-muted-foreground/60">T#1</span>
            <input
              type="range"
              min={1}
              max={allPoints.length - 1}
              value={displayCount - 1}
              onChange={(e) => setDisplayCount(Number(e.target.value) + 1)}
              className="flex-1 accent-primary h-1 bg-border/20 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] font-bold text-muted-foreground/60">T#{allPoints.length - 1}</span>
          </div>

          {selectedPoint && selectedPoint.tradeNum > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 pt-2">
              <div className="rounded-lg p-2.5 bg-card/40 border border-border/5 text-center">
                <span className="text-[9px] font-black text-muted-foreground/70 uppercase tracking-widest block">Trade #</span>
                <p className="text-sm font-black text-foreground mt-0.5">#{selectedPoint.tradeNum}</p>
              </div>
              <div className="rounded-lg p-2.5 bg-card/40 border border-border/5 text-center">
                <span className="text-[9px] font-black text-muted-foreground/70 uppercase tracking-widest block">Date</span>
                <p className="text-xs font-bold text-foreground mt-0.5 truncate">{selectedPoint.dateStr}</p>
              </div>
              <div className="rounded-lg p-2.5 bg-card/40 border border-border/5 text-center">
                <span className="text-[9px] font-black text-muted-foreground/70 uppercase tracking-widest block">Symbol</span>
                <p className="text-xs font-black text-primary mt-0.5">{selectedPoint.symbol}</p>
              </div>
              <div className="rounded-lg p-2.5 bg-card/40 border border-border/5 text-center">
                <span className="text-[9px] font-black text-muted-foreground/70 uppercase tracking-widest block">Type</span>
                <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 uppercase ${
                  selectedPoint.kind === "buy" ? "bg-cyan-500/10 text-cyan-400" : "bg-accent/10 text-accent"
                }`}>
                  {selectedPoint.kind}
                </span>
              </div>
              <div className="rounded-lg p-2.5 bg-card/40 border border-border/5 text-center">
                <span className="text-[9px] font-black text-muted-foreground/70 uppercase tracking-widest block">Size (Lots)</span>
                <p className="text-sm font-bold text-foreground mt-0.5">{selectedPoint.lot?.toFixed(2)}</p>
              </div>
              <div className="rounded-lg p-2.5 bg-card/40 border border-border/5 text-center">
                <span className="text-[9px] font-black text-muted-foreground/70 uppercase tracking-widest block">Prices</span>
                <p className="text-[10px] font-semibold text-muted-foreground mt-0.5 truncate">
                  {selectedPoint.openPrice} → {selectedPoint.closePrice}
                </p>
              </div>
              <div className="rounded-lg p-2.5 bg-card/40 border border-border/5 text-center">
                <span className="text-[9px] font-black text-muted-foreground/70 uppercase tracking-widest block">P&L</span>
                <p className="text-sm font-black mt-0.5" style={{ color: selectedPoint.tradeProfit >= 0 ? "var(--success)" : "var(--destructive)" }}>
                  {selectedPoint.tradeProfit >= 0 ? "+" : ""}${selectedPoint.tradeProfit.toFixed(2)}
                </p>
              </div>
              <div className="rounded-lg p-2.5 bg-card/40 border border-border/5 text-center col-span-2 lg:col-span-1">
                <span className="text-[9px] font-black text-muted-foreground/70 uppercase tracking-widest block">Max Drawdown</span>
                <p className="text-xs font-bold text-red-400 mt-0.5">${selectedPoint.dd?.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
