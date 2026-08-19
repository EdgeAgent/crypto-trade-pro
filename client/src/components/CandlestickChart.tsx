import React, { useMemo, useState } from "react";
import { Area, AreaChart, Bar, CartesianGrid, ComposedChart, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLiveOhlc, type OhlcStatus } from "@/hooks/useLiveOhlc";
import { calculateTechnicalIndicators, type ChartTimeframe, type IndicatorCandle, type OhlcCandle } from "@/lib/ohlc";

interface CandlestickChartProps { symbol: string; price: number; change24h: number; }
export type IndicatorVisibility = { rsi: boolean; macd: boolean; bollinger: boolean };
const defaultIndicators: IndicatorVisibility = { rsi: true, macd: true, bollinger: true };

export function ChartDataState({ status, error }: { status: OhlcStatus; error?: string | null }) {
  if (status === "loading") return <div className="h-[300px] flex flex-col items-center justify-center text-center text-muted-foreground"><RefreshCw className="h-6 w-6 animate-spin text-accent" /><p className="mt-3 text-sm">Loading live OHLC candles…</p></div>;
  if (status === "empty") return <div className="h-[300px] flex flex-col items-center justify-center text-center"><p className="font-semibold text-foreground">No candles for this timeframe</p><p className="mt-2 max-w-sm text-sm text-muted-foreground">{error ?? "The live provider returned an empty candle set."}</p></div>;
  if (status === "offline") return <div className="h-[300px] flex flex-col items-center justify-center text-center"><p className="font-semibold text-foreground">Live chart unavailable</p><p className="mt-2 max-w-sm text-sm text-muted-foreground">{error ?? "The provider did not return candles. No synthetic chart data is shown."}</p></div>;
  return null;
}

function IndicatorPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="mt-3 rounded-lg border border-border/40 bg-muted/10 p-2"><p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{title}</p>{children}</div>;
}

function hasIndicatorData(candles: IndicatorCandle[], key: keyof IndicatorCandle) {
  return candles.some((candle) => candle[key] !== null && candle[key] !== undefined);
}

export function OhlcChartCanvas({ candles, change24h, visibleIndicators = defaultIndicators }: { candles: OhlcCandle[]; change24h: number; visibleIndicators?: IndicatorVisibility }) {
  const indicatorCandles = useMemo(() => calculateTechnicalIndicators(candles), [candles]);
  const highPrice = useMemo(() => Math.max(...candles.map((candle) => candle.high)), [candles]);
  const lowPrice = useMemo(() => Math.min(...candles.map((candle) => candle.low)), [candles]);
  const chartMin = lowPrice * 0.995;
  const chartMax = highPrice * 1.005;
  const rsiAvailable = hasIndicatorData(indicatorCandles, "rsi");
  const macdAvailable = hasIndicatorData(indicatorCandles, "macdSignal");
  const bollingerAvailable = hasIndicatorData(indicatorCandles, "bollingerMiddle");
  const requestedUnavailable = (visibleIndicators.rsi && !rsiAvailable) || (visibleIndicators.macd && !macdAvailable) || (visibleIndicators.bollinger && !bollingerAvailable);

  return <div data-testid="ohlc-chart-canvas" data-candle-count={candles.length}>
    <div className="h-[300px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={indicatorCandles} margin={{ top: 20, right: 16, left: 56, bottom: 20 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" /><XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" minTickGap={32} /><YAxis stroke="rgba(255,255,255,0.5)" domain={[chartMin, chartMax]} width={72} tickFormatter={(value) => `$${Math.round(Number(value)).toLocaleString()}`} /><Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(0,217,255,0.3)", borderRadius: "8px" }} labelStyle={{ color: "#00D9FF" }} /><Area type="monotone" dataKey="close" stroke="transparent" fill={change24h >= 0 ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)"} strokeWidth={0} /><Line type="monotone" dataKey="close" stroke={change24h >= 0 ? "#22C55E" : "#EF4444"} dot={false} strokeWidth={2} isAnimationActive={false} />{visibleIndicators.bollinger && bollingerAvailable && <><Line type="monotone" dataKey="bollingerUpper" stroke="#00D9FF" dot={false} strokeWidth={1.5} strokeDasharray="5 4" connectNulls={false} isAnimationActive={false} /><Line type="monotone" dataKey="bollingerMiddle" stroke="#94A3B8" dot={false} strokeWidth={1} connectNulls={false} isAnimationActive={false} /><Line type="monotone" dataKey="bollingerLower" stroke="#00D9FF" dot={false} strokeWidth={1.5} strokeDasharray="5 4" connectNulls={false} isAnimationActive={false} /></>}</AreaChart></ResponsiveContainer></div>
    {visibleIndicators.bollinger && bollingerAvailable && <span data-testid="bollinger-overlay" className="sr-only">Bollinger Bands enabled</span>}
    {visibleIndicators.rsi && rsiAvailable && <IndicatorPanel title="RSI (14)"><span data-testid="rsi-panel" className="sr-only">RSI panel enabled</span><div className="h-[100px] w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={indicatorCandles}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" /><XAxis dataKey="time" hide /><YAxis domain={[0, 100]} width={34} stroke="rgba(255,255,255,0.45)" /><ReferenceLine y={70} stroke="#EF4444" strokeDasharray="4 4" /><ReferenceLine y={30} stroke="#22C55E" strokeDasharray="4 4" /><Line type="monotone" dataKey="rsi" stroke="#A78BFA" dot={false} strokeWidth={2} connectNulls={false} isAnimationActive={false} /></LineChart></ResponsiveContainer></div></IndicatorPanel>}
    {visibleIndicators.macd && macdAvailable && <IndicatorPanel title="MACD (12, 26, 9)"><span data-testid="macd-panel" className="sr-only">MACD panel enabled</span><div className="h-[110px] w-full"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={indicatorCandles}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" /><XAxis dataKey="time" hide /><YAxis width={52} stroke="rgba(255,255,255,0.45)" /><Bar dataKey="macdHistogram" fill="rgba(0,217,255,0.35)" barSize={3} /><Line type="monotone" dataKey="macd" stroke="#00D9FF" dot={false} strokeWidth={2} connectNulls={false} isAnimationActive={false} /><Line type="monotone" dataKey="macdSignal" stroke="#F59E0B" dot={false} strokeWidth={1.5} connectNulls={false} isAnimationActive={false} /></ComposedChart></ResponsiveContainer></div></IndicatorPanel>}
    {requestedUnavailable && <p data-testid="indicator-insufficient-history" className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-200">The selected indicator needs more live provider history for this timeframe. No synthetic values are shown.</p>}
  </div>;
}

export default function CandlestickChart({ symbol, price, change24h }: CandlestickChartProps) {
  const [timeframe, setTimeframe] = useState<ChartTimeframe>("1D");
  const [visibleIndicators, setVisibleIndicators] = useState<IndicatorVisibility>(defaultIndicators);
  const { candles, status, error } = useLiveOhlc(symbol, timeframe);
  const highPrice = useMemo(() => candles.length ? Math.max(...candles.map((candle) => candle.high)) : 0, [candles]);
  const lowPrice = useMemo(() => candles.length ? Math.min(...candles.map((candle) => candle.low)) : 0, [candles]);
  const toggleIndicator = (key: keyof IndicatorVisibility) => setVisibleIndicators((current) => ({ ...current, [key]: !current[key] }));

  return <Card className="bg-card border-border/50"><div className="p-6">
    <div className="flex items-center justify-between mb-4 gap-4"><div><div className="flex items-center gap-2"><h3 className="text-lg font-bold text-foreground">{symbol}/USDT</h3><Badge variant="outline" className={status === "live" ? "border-green-500/40 text-green-400" : "border-amber-500/40 text-amber-400"}>{status === "live" ? "Live OHLC" : status}</Badge></div><div className="flex items-baseline gap-3 mt-2"><p className="text-3xl font-bold text-foreground">${price.toLocaleString(undefined, { maximumFractionDigits: 8 })}</p><div className={change24h >= 0 ? "text-green-400" : "text-red-400"}>{change24h >= 0 ? <TrendingUp className="w-4 h-4 inline mr-1" /> : <TrendingDown className="w-4 h-4 inline mr-1" />}<span className="font-semibold">{change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}%</span></div></div></div><div className="flex gap-2">{(["1H", "4H", "1D", "1W"] as const).map((tf) => <Button key={tf} onClick={() => setTimeframe(tf)} className={`px-3 py-1 text-sm ${timeframe === tf ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{tf}</Button>)}</div></div>
    <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">{([ ["rsi", "RSI"], ["macd", "MACD"], ["bollinger", "Bollinger Bands"] ] as const).map(([key, label]) => <label key={key} className="inline-flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={visibleIndicators[key]} onChange={() => toggleIndicator(key)} className="accent-cyan-400" />{label}</label>)}</div>
    <div className="mb-6 min-h-[300px]">{status !== "live" && <ChartDataState status={status} error={error} />}{status === "live" && candles.length > 0 && <OhlcChartCanvas candles={candles} change24h={change24h} visibleIndicators={visibleIndicators} />}</div>
    <div className="grid grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg"><div><p className="text-xs text-muted-foreground mb-1">HIGH</p><p className="font-bold text-foreground">{highPrice ? `$${highPrice.toLocaleString(undefined, { maximumFractionDigits: 8 })}` : "Unavailable"}</p></div><div><p className="text-xs text-muted-foreground mb-1">LOW</p><p className="font-bold text-foreground">{lowPrice ? `$${lowPrice.toLocaleString(undefined, { maximumFractionDigits: 8 })}` : "Unavailable"}</p></div><div><p className="text-xs text-muted-foreground mb-1">CHANGE</p><p className={change24h >= 0 ? "font-bold text-green-400" : "font-bold text-red-400"}>{change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}%</p></div><div><p className="text-xs text-muted-foreground mb-1">CURRENT</p><p className="font-bold text-foreground">${price.toLocaleString(undefined, { maximumFractionDigits: 8 })}</p></div></div>
  </div></Card>;
}
