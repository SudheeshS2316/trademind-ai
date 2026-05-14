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

export function useMarketData() {
  const [overview, setOverview] = useState<MarketOverview | null>(null);
  const [trending, setTrending] = useState<TrendingStock[]>([]);
  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    // Refresh every 30 seconds
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  return { overview, trending, sectors, loading, error, refresh: fetchAll };
}
