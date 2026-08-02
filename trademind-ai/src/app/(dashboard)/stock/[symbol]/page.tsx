'use client';

import React, { useState, useEffect, use } from 'react';
import { api } from '@/lib/api';
import { TradingViewChart } from '@/components/dashboard/TradingViewChart';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatPercent, cn } from '@/lib/utils';
import { ArrowLeft, TrendingUp, TrendingDown, Plus, BarChart2, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ChartCandle { time: number; open: number; high: number; low: number; close: number; volume: number; }
interface Quote { price: number; change: number; changePercent: number; volume: number; }

export default function StockDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = use(params);
  const router = useRouter();
  const [candles, setCandles] = useState<ChartCandle[]>([]);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [period, setPeriod] = useState<'1m' | '3m' | '6m' | '1y'>('6m');

  const periodMap: Record<string, number> = { '1m': 1, '3m': 3, '6m': 6, '1y': 12 };

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);
    const date = new Date();
    date.setMonth(date.getMonth() - periodMap[period]);
    const period1 = date.toISOString().split('T')[0];
    api.get<ChartCandle[]>(`/api/market/history?symbol=${symbol}&period1=${period1}&interval=1d`)
      .then(data => {
        setCandles(data);
        if (data.length > 0) {
          const last = data[data.length - 1];
          const prev = data[data.length - 2];
          const change = last.close - prev.close;
          setQuote({ price: last.close, change, changePercent: (change / prev.close) * 100, volume: last.volume });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [symbol, period]);

  const handleAddToWatchlist = async () => {
    setAdding(true);
    try {
      await api.post('/api/watchlist', { symbol });
      setAdded(true);
    } catch {}
    setAdding(false);
  };

  // Compute simple technicals from candle data
  const getTechnicals = () => {
    if (candles.length < 20) return null;
    const closes = candles.map(c => c.close);
    const last20 = closes.slice(-20);
    const sma20 = last20.reduce((a, b) => a + b, 0) / 20;
    const high52w = Math.max(...candles.map(c => c.high));
    const low52w = Math.min(...candles.map(c => c.low));
    const avgVol = candles.slice(-20).map(c => c.volume).reduce((a, b) => a + b, 0) / 20;
    const curVol = candles[candles.length - 1].volume;
    return { sma20, high52w, low52w, avgVol, curVol };
  };

  const tech = getTechnicals();
  const isPositive = (quote?.change ?? 0) >= 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="rounded-lg p-2 text-text-muted hover:bg-terminal-700 hover:text-text-primary transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono text-text-primary">{decodeURIComponent(symbol)}</h1>
            {quote && (
              <Badge variant={isPositive ? 'bullish' : 'bearish'} dot>
                {isPositive ? '+' : ''}{formatPercent(quote.changePercent)}
              </Badge>
            )}
          </div>
          <p className="text-sm text-text-muted">NSE • Equity</p>
        </div>
        <Button onClick={handleAddToWatchlist} disabled={adding || added} variant="outline" size="sm" icon={<Plus size={14} />}>
          {added ? 'Added!' : 'Watchlist'}
        </Button>
      </div>

      {/* Price Hero */}
      {quote && (
        <div className="flex items-end gap-4">
          <p className="text-4xl font-bold font-mono text-text-primary">{formatCurrency(quote.price)}</p>
          <div className={cn('flex items-center gap-1 text-lg font-mono mb-1', isPositive ? 'text-bullish' : 'text-bearish')}>
            {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            {isPositive ? '+' : ''}{formatCurrency(Math.abs(quote.change))} ({isPositive ? '+' : ''}{formatPercent(quote.changePercent)})
          </div>
        </div>
      )}

      {/* Period Selector */}
      <div className="flex gap-2">
        {(['1m', '3m', '6m', '1y'] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={cn('rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
              period === p ? 'bg-accent text-terminal-900' : 'bg-terminal-700 text-text-muted hover:text-text-primary'
            )}>
            {p === '1m' ? '1M' : p === '3m' ? '3M' : p === '6m' ? '6M' : '1Y'}
          </button>
        ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart2 size={16} />Price Chart</CardTitle>
        </CardHeader>
        {loading ? (
          <Skeleton className="h-72 rounded-xl" />
        ) : candles.length > 0 ? (
          <TradingViewChart data={candles} height={300} />
        ) : (
          <div className="flex items-center justify-center h-48 text-text-muted text-sm">No chart data available</div>
        )}
      </Card>

      {/* Technicals */}
      {tech && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity size={16} />Key Levels</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: '52W High', value: formatCurrency(tech.high52w), color: 'text-bullish' },
              { label: '52W Low', value: formatCurrency(tech.low52w), color: 'text-bearish' },
              { label: 'SMA 20', value: formatCurrency(tech.sma20), color: 'text-text-primary' },
              { label: 'Avg Volume', value: `${(tech.avgVol / 1000000).toFixed(1)}M`, color: 'text-text-primary' },
            ].map(item => (
              <div key={item.label} className="rounded-lg bg-terminal-900 p-3 text-center">
                <p className="text-xs text-text-muted mb-1">{item.label}</p>
                <p className={cn('font-mono font-bold text-sm', item.color)}>{item.value}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Volume Bar */}
      {tech && quote && (
        <Card>
          <CardHeader><CardTitle>Volume Analysis</CardTitle></CardHeader>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Today&apos;s Volume</span>
              <span className={cn('font-mono', tech.curVol > tech.avgVol ? 'text-bullish' : 'text-text-secondary')}>
                {(tech.curVol / 1000000).toFixed(1)}M ({(tech.curVol / tech.avgVol).toFixed(1)}× avg)
              </span>
            </div>
            <div className="h-2 rounded-full bg-terminal-700 overflow-hidden">
              <div className={cn('h-full rounded-full transition-all', tech.curVol > tech.avgVol ? 'bg-bullish' : 'bg-text-muted')}
                style={{ width: `${Math.min((tech.curVol / tech.avgVol) * 50, 100)}%` }} />
            </div>
            <p className="text-xs text-text-muted">
              {tech.curVol > tech.avgVol * 1.5 ? '🔥 Strong volume — institutional activity detected' :
               tech.curVol > tech.avgVol ? '📊 Above-average volume' : '📉 Below-average volume, weak conviction'}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
