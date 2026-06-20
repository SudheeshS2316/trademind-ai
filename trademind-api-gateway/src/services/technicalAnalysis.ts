// Technical Analysis Engine — Pure functions for computing indicators from OHLCV data
// Zero external dependencies. All math done from raw price arrays.

export interface OHLCV {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorResult {
  value: number;
  signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  description: string;
}

export interface FullAnalysis {
  rsi: IndicatorResult;
  macd: IndicatorResult;
  emaCrossover: IndicatorResult;
  volume: IndicatorResult;
  bollingerBands: IndicatorResult;
  atr: number;              // Average True Range (used for SL/Target calculation)
  confluenceScore: number;  // 0-100 weighted score
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  reasoning: string;        // Human-readable reasoning from actual data
  currentPrice: number;
  swingLow: number;
  swingHigh: number;
}

// ──────────────────────────────────────────────────
// RSI (Relative Strength Index) — 14-period
// ──────────────────────────────────────────────────
export function computeRSI(closes: number[], period: number = 14): IndicatorResult {
  if (closes.length < period + 1) {
    return { value: 50, signal: 'NEUTRAL', description: 'Insufficient data for RSI' };
  }

  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) gains += diff;
    else losses += Math.abs(diff);
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;

  // Smoothed RSI using Wilder's method
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    avgGain = (avgGain * (period - 1) + (diff > 0 ? diff : 0)) / period;
    avgLoss = (avgLoss * (period - 1) + (diff < 0 ? Math.abs(diff) : 0)) / period;
  }

  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));

  // Previous RSI for crossover detection
  let prevAvgGain = gains / period;
  let prevAvgLoss = losses / period;
  for (let i = period + 1; i < closes.length - 1; i++) {
    const diff = closes[i] - closes[i - 1];
    prevAvgGain = (prevAvgGain * (period - 1) + (diff > 0 ? diff : 0)) / period;
    prevAvgLoss = (prevAvgLoss * (period - 1) + (diff < 0 ? Math.abs(diff) : 0)) / period;
  }
  const prevRs = prevAvgLoss === 0 ? 100 : prevAvgGain / prevAvgLoss;
  const prevRsi = 100 - (100 / (1 + prevRs));

  let signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
  let description = `RSI at ${rsi.toFixed(1)}`;

  if (rsi < 35) {
    signal = 'BULLISH';
    description += ' — oversold territory, potential reversal upward';
  } else if (rsi > 65) {
    signal = 'BEARISH';
    description += ' — overbought territory, potential reversal downward';
  } else if (rsi > 40 && prevRsi <= 40) {
    signal = 'BULLISH';
    description += ' — crossing above 40 from oversold zone';
  } else if (rsi < 60 && prevRsi >= 60) {
    signal = 'BEARISH';
    description += ' — crossing below 60 from overbought zone';
  } else {
    description += ' — neutral zone';
  }

  return { value: Math.round(rsi * 10) / 10, signal, description };
}

// ──────────────────────────────────────────────────
// EMA (Exponential Moving Average)
// ──────────────────────────────────────────────────
export function computeEMA(data: number[], period: number): number[] {
  if (data.length < period) return [];
  const k = 2 / (period + 1);
  const ema: number[] = [];
  // Seed with SMA
  let sum = 0;
  for (let i = 0; i < period; i++) sum += data[i];
  ema.push(sum / period);
  for (let i = period; i < data.length; i++) {
    ema.push(data[i] * k + ema[ema.length - 1] * (1 - k));
  }
  return ema;
}

// ──────────────────────────────────────────────────
// MACD (Moving Average Convergence Divergence)
// ──────────────────────────────────────────────────
export function computeMACD(closes: number[]): IndicatorResult {
  if (closes.length < 35) {
    return { value: 0, signal: 'NEUTRAL', description: 'Insufficient data for MACD' };
  }

  const ema12 = computeEMA(closes, 12);
  const ema26 = computeEMA(closes, 26);

  // Align lengths: ema12 starts at index 12, ema26 starts at index 26
  // So macdLine has length = ema26.length, starting from index 26
  const offset = 26 - 12; // = 14
  const macdLine: number[] = [];
  for (let i = 0; i < ema26.length; i++) {
    macdLine.push(ema12[i + offset] - ema26[i]);
  }

  const signalLine = computeEMA(macdLine, 9);
  if (signalLine.length < 2) {
    return { value: 0, signal: 'NEUTRAL', description: 'Insufficient data for MACD signal line' };
  }

  const signalOffset = macdLine.length - signalLine.length;
  const currentMACD = macdLine[macdLine.length - 1];
  const currentSignal = signalLine[signalLine.length - 1];
  const prevMACD = macdLine[macdLine.length - 2];
  const prevSignal = signalLine[signalLine.length - 2];

  const histogram = currentMACD - currentSignal;
  let signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
  let description = `MACD: ${currentMACD.toFixed(2)}, Signal: ${currentSignal.toFixed(2)}`;

  // Crossover detection
  if (currentMACD > currentSignal && prevMACD <= prevSignal) {
    signal = 'BULLISH';
    description += ' — bullish crossover (MACD crossed above signal line)';
  } else if (currentMACD < currentSignal && prevMACD >= prevSignal) {
    signal = 'BEARISH';
    description += ' — bearish crossover (MACD crossed below signal line)';
  } else if (currentMACD > currentSignal && histogram > 0) {
    signal = 'BULLISH';
    description += ' — MACD above signal line, positive momentum';
  } else if (currentMACD < currentSignal && histogram < 0) {
    signal = 'BEARISH';
    description += ' — MACD below signal line, negative momentum';
  }

  return { value: Math.round(histogram * 100) / 100, signal, description };
}

// ──────────────────────────────────────────────────
// EMA Crossover (9-EMA vs 21-EMA)
// ──────────────────────────────────────────────────
export function computeEMACrossover(closes: number[]): IndicatorResult {
  if (closes.length < 25) {
    return { value: 0, signal: 'NEUTRAL', description: 'Insufficient data for EMA crossover' };
  }

  const ema9 = computeEMA(closes, 9);
  const ema21 = computeEMA(closes, 21);

  // Align: ema9 starts at index 9, ema21 starts at index 21
  const offset = 21 - 9; // 12
  const current9 = ema9[ema9.length - 1];
  const current21 = ema21[ema21.length - 1];
  const prev9 = ema9[ema9.length - 2];
  const prev21 = ema21[ema21.length - 2];

  const spread = ((current9 - current21) / current21) * 100;

  let signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
  let description = `9-EMA: ${current9.toFixed(2)}, 21-EMA: ${current21.toFixed(2)}`;

  if (current9 > current21 && prev9 <= prev21) {
    signal = 'BULLISH';
    description += ' — golden crossover (9-EMA crossed above 21-EMA)';
  } else if (current9 < current21 && prev9 >= prev21) {
    signal = 'BEARISH';
    description += ' — death crossover (9-EMA crossed below 21-EMA)';
  } else if (current9 > current21) {
    signal = 'BULLISH';
    description += ` — 9-EMA above 21-EMA (spread: +${spread.toFixed(2)}%)`;
  } else {
    signal = 'BEARISH';
    description += ` — 9-EMA below 21-EMA (spread: ${spread.toFixed(2)}%)`;
  }

  return { value: Math.round(spread * 100) / 100, signal, description };
}

// ──────────────────────────────────────────────────
// Volume Analysis (current vs 20-day average)
// ──────────────────────────────────────────────────
export function computeVolumeSignal(candles: OHLCV[]): IndicatorResult {
  if (candles.length < 21) {
    return { value: 0, signal: 'NEUTRAL', description: 'Insufficient data for volume analysis' };
  }

  const recentVolumes = candles.slice(-21, -1).map(c => c.volume);
  const avgVolume = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
  const currentVolume = candles[candles.length - 1].volume;
  const ratio = avgVolume > 0 ? currentVolume / avgVolume : 0;
  const lastClose = candles[candles.length - 1].close;
  const prevClose = candles[candles.length - 2].close;
  const priceUp = lastClose >= prevClose;

  let signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
  let description = `Volume: ${(currentVolume / 1000000).toFixed(1)}M (${ratio.toFixed(1)}× avg)`;

  if (ratio >= 1.5 && priceUp) {
    signal = 'BULLISH';
    description += ' — strong volume on up-move, institutional buying likely';
  } else if (ratio >= 1.5 && !priceUp) {
    signal = 'BEARISH';
    description += ' — strong volume on down-move, distribution likely';
  } else if (ratio < 0.5) {
    description += ' — low volume, weak conviction';
  } else {
    description += ' — normal volume';
  }

  return { value: Math.round(ratio * 100) / 100, signal, description };
}

// ──────────────────────────────────────────────────
// Bollinger Bands (20-period, 2 std dev)
// ──────────────────────────────────────────────────
export function computeBollingerBands(closes: number[], rsiValue: number): IndicatorResult {
  const period = 20;
  if (closes.length < period) {
    return { value: 0, signal: 'NEUTRAL', description: 'Insufficient data for Bollinger Bands' };
  }

  const recent = closes.slice(-period);
  const sma = recent.reduce((a, b) => a + b, 0) / period;
  const variance = recent.reduce((sum, val) => sum + Math.pow(val - sma, 2), 0) / period;
  const stdDev = Math.sqrt(variance);
  const upper = sma + 2 * stdDev;
  const lower = sma - 2 * stdDev;
  const currentPrice = closes[closes.length - 1];

  // %B indicator: where is price within the bands (0 = lower, 1 = upper)
  const percentB = (currentPrice - lower) / (upper - lower);

  let signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
  let description = `BB: Upper ${upper.toFixed(2)}, SMA ${sma.toFixed(2)}, Lower ${lower.toFixed(2)}`;

  if (percentB <= 0.05 && rsiValue < 40) {
    signal = 'BULLISH';
    description += ' — price at lower band + RSI oversold, bounce likely';
  } else if (percentB >= 0.95 && rsiValue > 60) {
    signal = 'BEARISH';
    description += ' — price at upper band + RSI overbought, pullback likely';
  } else if (percentB <= 0.2) {
    signal = 'BULLISH';
    description += ' — price near lower band, potential support';
  } else if (percentB >= 0.8) {
    signal = 'BEARISH';
    description += ' — price near upper band, potential resistance';
  } else {
    description += ` — price at ${(percentB * 100).toFixed(0)}% of band range`;
  }

  return { value: Math.round(percentB * 100) / 100, signal, description };
}

// ──────────────────────────────────────────────────
// ATR (Average True Range) — 14-period
// ──────────────────────────────────────────────────
export function computeATR(candles: OHLCV[], period: number = 14): number {
  if (candles.length < period + 1) return 0;

  const trueRanges: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;
    trueRanges.push(Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose)));
  }

  // Use Wilder's smoothing for ATR
  let atr = trueRanges.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < trueRanges.length; i++) {
    atr = (atr * (period - 1) + trueRanges[i]) / period;
  }

  return Math.round(atr * 100) / 100;
}

// ──────────────────────────────────────────────────
// Swing High / Swing Low (last 20 candles)
// ──────────────────────────────────────────────────
export function findSwingPoints(candles: OHLCV[], lookback: number = 20): { swingHigh: number; swingLow: number } {
  const recent = candles.slice(-lookback);
  const swingHigh = Math.max(...recent.map(c => c.high));
  const swingLow = Math.min(...recent.map(c => c.low));
  return { swingHigh, swingLow };
}

// ──────────────────────────────────────────────────
// Full Analysis — runs all indicators and computes confluence
// ──────────────────────────────────────────────────
export function analyzeStock(candles: OHLCV[]): FullAnalysis | null {
  if (candles.length < 60) return null; // Need at least 60 days of data

  const closes = candles.map(c => c.close);
  const currentPrice = closes[closes.length - 1];

  // Compute all indicators
  const rsi = computeRSI(closes);
  const macd = computeMACD(closes);
  const emaCrossover = computeEMACrossover(closes);
  const volume = computeVolumeSignal(candles);
  const bollingerBands = computeBollingerBands(closes, rsi.value);
  const atr = computeATR(candles);
  const { swingHigh, swingLow } = findSwingPoints(candles);

  // Weighted confluence scoring
  const weights = { rsi: 0.20, macd: 0.25, ema: 0.20, volume: 0.15, bb: 0.20 };

  const indicators = [
    { result: rsi, weight: weights.rsi },
    { result: macd, weight: weights.macd },
    { result: emaCrossover, weight: weights.ema },
    { result: volume, weight: weights.volume },
    { result: bollingerBands, weight: weights.bb },
  ];

  let bullishScore = 0, bearishScore = 0;
  for (const ind of indicators) {
    if (ind.result.signal === 'BULLISH') bullishScore += ind.weight * 100;
    else if (ind.result.signal === 'BEARISH') bearishScore += ind.weight * 100;
    // NEUTRAL adds nothing
  }

  // Determine overall direction
  let direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  let confluenceScore: number;
  if (bullishScore > bearishScore) {
    direction = 'BULLISH';
    confluenceScore = Math.round(bullishScore);
  } else if (bearishScore > bullishScore) {
    direction = 'BEARISH';
    confluenceScore = Math.round(bearishScore);
  } else {
    direction = 'NEUTRAL';
    confluenceScore = 0;
  }

  // Build reasoning from actual indicator descriptions
  const activeIndicators = indicators
    .filter(i => i.result.signal !== 'NEUTRAL')
    .map(i => i.result.description);
  const reasoning = activeIndicators.length > 0
    ? activeIndicators.join('. ') + '.'
    : 'No clear signal — indicators are mixed.';

  return {
    rsi, macd, emaCrossover, volume, bollingerBands,
    atr, confluenceScore, direction, reasoning, currentPrice,
    swingLow, swingHigh,
  };
}
