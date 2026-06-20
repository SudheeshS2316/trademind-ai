// Live AI Signal Engine for Indian Markets
// Uses real technical analysis (RSI, MACD, EMA, BB, ATR) — zero hardcoded reasoning
import { getLiveQuotes, getHistoricalData } from './marketDataService';
import { analyzeStock, OHLCV } from './technicalAnalysis';
import { LARGE_MID_CAP_UNIVERSE } from '../data/stockUniverse';

export interface LiveSignal {
  stockSymbol: string;
  stockName: string;
  entryPrice: number;
  stopLoss: number;
  targetPrice: number;
  confidenceScore: number;
  riskReward: number;
  direction: 'BULLISH' | 'BEARISH';
  aiReasoning: string;
}

export async function generateLiveSignals(count: number = 8): Promise<LiveSignal[]> {
  const symbols = LARGE_MID_CAP_UNIVERSE.map(s => s.symbol);

  // 1. Fetch live quotes for the entire universe
  const liveQuotes = await getLiveQuotes(symbols);

  // 2. Fetch 3-month daily OHLCV for each stock and run technical analysis
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const period1 = threeMonthsAgo.toISOString().split('T')[0];

  const analysisResults: Array<{
    symbol: string;
    name: string;
    signal: LiveSignal;
  }> = [];

  // Process stocks in parallel batches of 5 to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize);
    const batchPromises = batch.map(async (symbol) => {
      try {
        const stockInfo = LARGE_MID_CAP_UNIVERSE.find(s => s.symbol === symbol);
        if (!stockInfo) return null;

        const quote = liveQuotes.find(q => q.symbol === symbol);
        if (!quote || quote.price <= 0) return null;

        // Fetch historical OHLCV
        const candles = await getHistoricalData(symbol, period1, '1d');
        if (!candles || candles.length < 60) return null;

        // Run full technical analysis
        const analysis = analyzeStock(candles as OHLCV[]);
        if (!analysis) return null;

        // Only generate signals with confidence >= 60
        if (analysis.confluenceScore < 60 || analysis.direction === 'NEUTRAL') return null;

        const direction = analysis.direction as 'BULLISH' | 'BEARISH';
        const currentPrice = quote.price;
        const atr = analysis.atr;

        // Entry: conservative limit order
        // BULLISH: slightly below current price (0.1-0.3% below)
        // BEARISH: slightly above current price
        const entryOffset = currentPrice * 0.002;
        const entryPrice = direction === 'BULLISH'
          ? currentPrice - entryOffset
          : currentPrice + entryOffset;

        // SL: ATR-based (1.5× ATR from entry)
        let stopLoss: number;
        if (direction === 'BULLISH') {
          // Use the higher of ATR-based SL or recent swing low
          const atrSL = entryPrice - 1.5 * atr;
          stopLoss = Math.max(atrSL, analysis.swingLow * 0.99);
        } else {
          const atrSL = entryPrice + 1.5 * atr;
          stopLoss = Math.min(atrSL, analysis.swingHigh * 1.01);
        }

        // Target: 2× the risk distance (2:1 risk-reward minimum)
        const riskDistance = Math.abs(entryPrice - stopLoss);
        const targetPrice = direction === 'BULLISH'
          ? entryPrice + riskDistance * 2
          : entryPrice - riskDistance * 2;

        const riskReward = riskDistance > 0
          ? Math.abs(targetPrice - entryPrice) / riskDistance
          : 2;

        return {
          symbol: stockInfo.symbol,
          name: stockInfo.name,
          signal: {
            stockSymbol: stockInfo.symbol,
            stockName: stockInfo.name,
            entryPrice: Math.round(entryPrice * 100) / 100,
            stopLoss: Math.round(stopLoss * 100) / 100,
            targetPrice: Math.round(targetPrice * 100) / 100,
            confidenceScore: analysis.confluenceScore,
            riskReward: Math.round(riskReward * 100) / 100,
            direction,
            aiReasoning: analysis.reasoning,
          },
        };
      } catch (err) {
        console.error(`Failed to analyze ${symbol}:`, err);
        return null;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    for (const result of batchResults) {
      if (result) analysisResults.push(result);
    }
  }

  // Sort by confidence score (highest first) and return top N
  analysisResults.sort((a, b) => b.signal.confidenceScore - a.signal.confidenceScore);

  return analysisResults.slice(0, count).map(r => r.signal);
}
