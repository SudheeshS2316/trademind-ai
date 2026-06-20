'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
  isPositive: boolean;
}

interface MarketOverview {
  nifty: MarketIndex;
  bankNifty: MarketIndex;
  sensex: MarketIndex;
  marketSentiment: string;
  marketStatus: string;
}

interface TrendingStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

interface SectorData {
  name: string;
  change: number;
  marketCap: string;
}

interface SparklineData {
  nifty: number[];
  bankNifty: number[];
  sensex: number[];
}

export function useMarketData() {
  const [overview, setOverview] = useState<MarketOverview | null>(null);
  const [trending, setTrending] = useState<TrendingStock[]>([]);
  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [sparklines, setSparklines] = useState<SparklineData>({ nifty: [], bankNifty: [], sensex: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSparklines = useCallback(async () => {
    try {
      // Fetch 5-day daily data for sparklines (more reliable than intraday)
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 30);
      const period1 = fiveDaysAgo.toISOString().split('T')[0];

      const [niftyData, bankNiftyData, sensexData] = await Promise.all([
        api.get<any[]>(`/api/market/history?symbol=^NSEI&period1=${period1}&interval=1d`).catch(() => []),
        api.get<any[]>(`/api/market/history?symbol=^NSEBANK&period1=${period1}&interval=1d`).catch(() => []),
        api.get<any[]>(`/api/market/history?symbol=^BSESN&period1=${period1}&interval=1d`).catch(() => []),
      ]);

      setSparklines({
        nifty: niftyData.slice(-15).map((d: any) => d.close).filter(Boolean),
        bankNifty: bankNiftyData.slice(-15).map((d: any) => d.close).filter(Boolean),
        sensex: sensexData.slice(-15).map((d: any) => d.close).filter(Boolean),
      });
    } catch (err) {
      // Sparklines are non-critical, silently fail
    }
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [ov, tr, sec] = await Promise.all([
        api.get<MarketOverview>('/api/market/live'),
        api.get<TrendingStock[]>('/api/market/trending'),
        api.get<SectorData[]>('/api/market/sectors'),
      ]);
      setOverview(ov);
      setTrending(tr);
      setSectors(sec);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch market data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    fetchSparklines();
    // Refresh market data every 30 seconds, sparklines every 5 minutes
    const interval = setInterval(fetchAll, 30000);
    const sparklineInterval = setInterval(fetchSparklines, 300000);
    return () => { clearInterval(interval); clearInterval(sparklineInterval); };
  }, [fetchAll, fetchSparklines]);

  return { overview, trending, sectors, sparklines, loading, error, refresh: fetchAll };
}

