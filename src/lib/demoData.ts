import type { Trade, EquityPoint } from "@/lib/tradeAnalysis";

const SYMBOLS = [
  { name: "XAUUSD", price: 2350, vol: 0.5 },
  { name: "EURUSD", price: 1.085, vol: 1 },
  { name: "GBPUSD", price: 1.268, vol: 0.8 },
  { name: "USDJPY", price: 152.4, vol: 0.7 },
  { name: "NAS100", price: 18250, vol: 0.3 },
];

/** Deterministic pseudo-random so the demo is identical every run. */
function makeRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/** Builds a realistic, slightly profitable 6-month demo account. */
export function buildDemoDataset(): { trades: Trade[]; equityCurve: EquityPoint[] } {
  const rand = makeRandom(20240715);
  const trades: Trade[] = [];
  const equityCurve: EquityPoint[] = [];

  let balance = 10000;
  const start = new Date();
  start.setMonth(start.getMonth() - 6);
  start.setHours(8, 0, 0, 0);

  equityCurve.push({ time: new Date(start), balance, profit: 0 });

  const totalTrades = 240;
  let cursor = new Date(start);

  for (let i = 0; i < totalTrades; i++) {
    // Advance 3–30 hours, skip weekends.
    cursor = new Date(cursor.getTime() + (3 + rand() * 27) * 3600_000);
    while (cursor.getDay() === 0 || cursor.getDay() === 6) {
      cursor = new Date(cursor.getTime() + 24 * 3600_000);
    }
    // Bias sessions towards London/NY hours.
    const hour = [7, 8, 9, 10, 13, 14, 15, 16, 20][Math.floor(rand() * 9)];
    const openTime = new Date(cursor);
    openTime.setHours(hour, Math.floor(rand() * 60), 0, 0);

    const durationMinutes = Math.round(8 + rand() * 480);
    const closeTime = new Date(openTime.getTime() + durationMinutes * 60_000);

    const sym = SYMBOLS[Math.floor(rand() * SYMBOLS.length)];
    const type: "buy" | "sell" = rand() > 0.48 ? "buy" : "sell";
    const volume = parseFloat((sym.vol * (0.5 + rand())).toFixed(2));

    // ~56% win rate, average win larger than average loss.
    const isWin = rand() < 0.56;
    const magnitude = isWin ? 40 + rand() * 320 : 30 + rand() * 220;
    // Occasional outliers, and a losing streak in month 4.
    const streakPenalty = i > 150 && i < 172 && !isWin ? 1.6 : 1;
    const profit = parseFloat(((isWin ? magnitude : -magnitude) * streakPenalty).toFixed(2));

    const commission = parseFloat((-volume * 3.5).toFixed(2));
    const swap = parseFloat((durationMinutes > 240 ? -rand() * 4 : 0).toFixed(2));
    const netProfit = parseFloat((profit + commission + swap).toFixed(2));

    const drift = (rand() - 0.5) * 0.004;
    const openPrice = parseFloat((sym.price * (1 + drift)).toFixed(sym.price > 100 ? 2 : 5));
    const closePrice = parseFloat(
      (openPrice * (1 + (profit >= 0 ? 1 : -1) * (0.0004 + rand() * 0.002) * (type === "buy" ? 1 : -1))).toFixed(
        sym.price > 100 ? 2 : 5,
      ),
    );

    trades.push({
      openTime,
      closeTime,
      symbol: sym.name,
      type,
      volume,
      openPrice,
      closePrice,
      profit,
      commission,
      swap,
      netProfit,
      durationMs: closeTime.getTime() - openTime.getTime(),
      durationMinutes,
    });

    balance = parseFloat((balance + netProfit).toFixed(2));
    equityCurve.push({ time: closeTime, balance, profit: netProfit });
  }

  trades.sort((a, b) => a.closeTime.getTime() - b.closeTime.getTime());
  equityCurve.sort((a, b) => a.time.getTime() - b.time.getTime());

  return { trades, equityCurve };
}
