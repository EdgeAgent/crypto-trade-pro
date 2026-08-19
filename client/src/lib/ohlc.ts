export type ChartTimeframe = "1H" | "4H" | "1D" | "1W";

export interface OhlcCandle {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface TechnicalIndicatorPoint {
  rsi: number | null;
  macd: number | null;
  macdSignal: number | null;
  macdHistogram: number | null;
  bollingerUpper: number | null;
  bollingerMiddle: number | null;
  bollingerLower: number | null;
}

export type IndicatorCandle = OhlcCandle & TechnicalIndicatorPoint;

const daysByTimeframe: Record<ChartTimeframe, number> = { "1H": 1, "4H": 7, "1D": 30, "1W": 90 };

export function getOhlcDays(timeframe: ChartTimeframe): number {
  return daysByTimeframe[timeframe];
}

export function parseCoinGeckoOhlc(payload: unknown): OhlcCandle[] {
  if (!Array.isArray(payload)) return [];
  return payload.flatMap((row) => {
    if (!Array.isArray(row) || row.length < 5) return [];
    const [timestamp, open, high, low, close] = row.map(Number);
    if (![timestamp, open, high, low, close].every(Number.isFinite)) return [];
    return [{ time: new Date(timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }), timestamp, open, high, low, close }];
  });
}

function simpleMovingAverage(values: number[], period: number): Array<number | null> {
  return values.map((_, index) => {
    if (index < period - 1) return null;
    const window = values.slice(index - period + 1, index + 1);
    return window.reduce((sum, value) => sum + value, 0) / period;
  });
}

function exponentialMovingAverage(values: number[], period: number): Array<number | null> {
  const output: Array<number | null> = Array(values.length).fill(null);
  if (values.length < period) return output;
  let previous = values.slice(0, period).reduce((sum, value) => sum + value, 0) / period;
  output[period - 1] = previous;
  const alpha = 2 / (period + 1);
  for (let index = period; index < values.length; index += 1) {
    previous = (values[index] - previous) * alpha + previous;
    output[index] = previous;
  }
  return output;
}

function relativeStrengthIndex(values: number[], period: number): Array<number | null> {
  const output: Array<number | null> = Array(values.length).fill(null);
  if (values.length <= period) return output;
  let gains = 0;
  let losses = 0;
  for (let index = 1; index <= period; index += 1) {
    const delta = values[index] - values[index - 1];
    if (delta >= 0) gains += delta;
    else losses += Math.abs(delta);
  }
  let averageGain = gains / period;
  let averageLoss = losses / period;
  const toRsi = (gain: number, loss: number) => loss === 0 ? (gain === 0 ? 50 : 100) : 100 - (100 / (1 + gain / loss));
  output[period] = toRsi(averageGain, averageLoss);
  for (let index = period + 1; index < values.length; index += 1) {
    const delta = values[index] - values[index - 1];
    const gain = delta > 0 ? delta : 0;
    const loss = delta < 0 ? Math.abs(delta) : 0;
    averageGain = ((averageGain * (period - 1)) + gain) / period;
    averageLoss = ((averageLoss * (period - 1)) + loss) / period;
    output[index] = toRsi(averageGain, averageLoss);
  }
  return output;
}

function macdSeries(values: number[], fastPeriod: number, slowPeriod: number, signalPeriod: number): Pick<TechnicalIndicatorPoint, "macd" | "macdSignal" | "macdHistogram">[] {
  const fast = exponentialMovingAverage(values, fastPeriod);
  const slow = exponentialMovingAverage(values, slowPeriod);
  const macd: Array<number | null> = values.map((_, index) => fast[index] !== null && slow[index] !== null ? fast[index]! - slow[index]! : null);
  const signal: Array<number | null> = Array(values.length).fill(null);
  const validMacd: number[] = [];
  let previousSignal: number | null = null;
  const alpha = 2 / (signalPeriod + 1);
  macd.forEach((value, index) => {
    if (value === null) return;
    validMacd.push(value);
    if (validMacd.length === signalPeriod) {
      previousSignal = validMacd.reduce((sum, item) => sum + item, 0) / signalPeriod;
      signal[index] = previousSignal;
    } else if (validMacd.length > signalPeriod && previousSignal !== null) {
      previousSignal = (value - previousSignal) * alpha + previousSignal;
      signal[index] = previousSignal;
    }
  });
  return values.map((_, index) => ({
    macd: macd[index],
    macdSignal: signal[index],
    macdHistogram: macd[index] !== null && signal[index] !== null ? macd[index]! - signal[index]! : null,
  }));
}

export function calculateTechnicalIndicators(candles: OhlcCandle[], options?: { rsiPeriod?: number; macdFastPeriod?: number; macdSlowPeriod?: number; macdSignalPeriod?: number; bollingerPeriod?: number; bollingerStdDev?: number }): IndicatorCandle[] {
  const rsiPeriod = options?.rsiPeriod ?? 14;
  const macdFastPeriod = options?.macdFastPeriod ?? 12;
  const macdSlowPeriod = options?.macdSlowPeriod ?? 26;
  const macdSignalPeriod = options?.macdSignalPeriod ?? 9;
  const bollingerPeriod = options?.bollingerPeriod ?? 20;
  const bollingerStdDev = options?.bollingerStdDev ?? 2;
  const closes = candles.map((candle) => candle.close);
  const rsi = relativeStrengthIndex(closes, rsiPeriod);
  const macd = macdSeries(closes, macdFastPeriod, macdSlowPeriod, macdSignalPeriod);
  const bollingerMiddle = simpleMovingAverage(closes, bollingerPeriod);
  const bollingerUpper: Array<number | null> = Array(closes.length).fill(null);
  const bollingerLower: Array<number | null> = Array(closes.length).fill(null);
  bollingerMiddle.forEach((middle, index) => {
    if (middle === null) return;
    const window = closes.slice(index - bollingerPeriod + 1, index + 1);
    const variance = window.reduce((sum, value) => sum + ((value - middle) ** 2), 0) / bollingerPeriod;
    const deviation = Math.sqrt(variance) * bollingerStdDev;
    bollingerUpper[index] = middle + deviation;
    bollingerLower[index] = middle - deviation;
  });
  return candles.map((candle, index) => ({ ...candle, rsi: rsi[index], ...macd[index], bollingerUpper: bollingerUpper[index], bollingerMiddle: bollingerMiddle[index], bollingerLower: bollingerLower[index] }));
}
