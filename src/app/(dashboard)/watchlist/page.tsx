'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { StockSearch } from '@/components/dashboard/StockSearch';
import { api } from '@/lib/api';
import { cn, formatCurrency, formatPercent } from '@/lib/utils';
import { Eye, Trash2, Bell, TrendingUp, TrendingDown } from 'lucide-react';

interface WatchlistItem { id: string; stockSymbol: string; createdAt: string; }

// Simulated price data for watched stocks (in production, this comes from market API)
const STOCK_PRICES: Record<string, { price: number; change: number; changePercent: number; volume: string; aiConfidence: number }> = {
  RELIANCE: { price: 2850.45, change: 32.10, changePercent: 1.14, volume: '12.5M', aiConfidence: 85 },
  TCS: { price: 3912.30, change: 45.60, changePercent: 1.18, volume: '4.2M', aiConfidence: 78 },
  INFY: { price: 1456.80, change: -12.40, changePercent: -0.84, volume: '8.1M', aiConfidence: 82 },
  HDFCBANK: { price: 1682.15, change: 18.90, changePercent: 1.14, volume: '6.3M', aiConfidence: 76 },
  SBIN: { price: 823.50, change: -5.20, changePercent: -0.63, volume: '15.8M', aiConfidence: 80 },
  ICICIBANK: { price: 1245.60, change: 22.10, changePercent: 1.80, volume: '7.4M', aiConfidence: 74 },
  ITC: { price: 452.30, change: -3.80, changePercent: -0.83, volume: '18.2M', aiConfidence: 71 },
  BHARTIARTL: { price: 1523.70, change: 8.30, changePercent: 0.55, volume: '3.7M', aiConfidence: 68 },
};
const getPrice = (sym: string) => STOCK_PRICES[sym] || { price: 1000, change: 5, changePercent: 0.5, volume: '1M', aiConfidence: 65 };

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWatchlist = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<WatchlistItem[]>('/api/watchlist');
      setItems(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWatchlist(); }, [fetchWatchlist]);

  const handleAddStock = async (symbol: string) => {
    if (items.find(i => i.stockSymbol === symbol)) return;
    try {
      await api.post('/api/watchlist', { symbol });
      fetchWatchlist();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add stock');
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await api.delete(`/api/watchlist/${id}`);
      setItems(items.filter(i => i.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove stock');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2"><Eye size={24} className="text-accent" />Watchlist</h1>
        <p className="text-sm text-text-muted">{items.length} stocks tracked</p>
      </div>

      {error && <div className="rounded-lg bg-bearish-dim border border-bearish/20 p-3 text-sm text-bearish">{error}</div>}

      <Card><StockSearch onSelect={handleAddStock} placeholder="Add stock to watchlist..." /></Card>

      {loading ? (
        <div className="space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : items.length === 0 ? (
        <Card className="py-12 text-center">
          <Eye size={40} className="mx-auto mb-3 text-text-muted opacity-30" />
          <p className="text-text-muted">Your watchlist is empty. Search and add stocks above.</p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-terminal-600">
          <table className="w-full">
            <thead><tr className="border-b border-terminal-600 bg-terminal-900/50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Symbol</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">Price</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">Change</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted hidden sm:table-cell">Volume</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-text-muted hidden md:table-cell">AI Score</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">Actions</th>
            </tr></thead>
            <tbody>
              {items.map((item) => {
                const p = getPrice(item.stockSymbol);
                return (
                  <tr key={item.id} className="border-b border-terminal-600/50 hover:bg-terminal-700/50">
                    <td className="px-4 py-3"><p className="font-mono font-semibold text-text-primary">{item.stockSymbol}</p></td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-text-primary">{formatCurrency(p.price)}</td>
                    <td className="px-4 py-3 text-right"><div className="flex items-center justify-end gap-1">{p.change >= 0 ? <TrendingUp size={12} className="text-bullish" /> : <TrendingDown size={12} className="text-bearish" />}<span className={cn('font-mono text-sm', p.change >= 0 ? 'text-bullish' : 'text-bearish')}>{formatPercent(p.changePercent)}</span></div></td>
                    <td className="px-4 py-3 text-right text-sm text-text-secondary hidden sm:table-cell font-mono">{p.volume}</td>
                    <td className="px-4 py-3 text-center hidden md:table-cell"><Badge variant={p.aiConfidence >= 75 ? 'bullish' : 'warning'}>{p.aiConfidence}%</Badge></td>
                    <td className="px-4 py-3 text-right"><div className="flex items-center justify-end gap-1"><button className="rounded-lg p-1.5 text-text-muted hover:bg-terminal-600 hover:text-accent" title="Alert"><Bell size={14} /></button><button onClick={() => handleRemove(item.id)} className="rounded-lg p-1.5 text-text-muted hover:bg-bearish-dim hover:text-bearish" title="Remove"><Trash2 size={14} /></button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
