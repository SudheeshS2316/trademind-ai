'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Select } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { FlaskConical, Play, BarChart3, Target, AlertTriangle } from 'lucide-react';

interface BacktestRun { id: string; strategyName: string; winRate: number; sharpeRatio: number; drawdown: number; profitFactor: number; totalTrades: number; createdAt: string; }

const strategies = [{ value: 'RSI Breakout', label: 'RSI Breakout' }, { value: 'MACD Crossover', label: 'MACD Crossover' }, { value: 'EMA Trend', label: 'EMA Trend Following' }, { value: 'Bollinger Squeeze', label: 'Bollinger Squeeze' }, { value: 'VWAP Bounce', label: 'VWAP Bounce' }];
const periods = [{ value: '1M', label: '1 Month' }, { value: '3M', label: '3 Months' }, { value: '6M', label: '6 Months' }, { value: '1Y', label: '1 Year' }, { value: '2Y', label: '2 Years' }];

export default function BacktestingPage() {
  const [selectedStrategy, setSelectedStrategy] = useState('RSI Breakout');
  const [selectedPeriod, setSelectedPeriod] = useState('1Y');
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<BacktestRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<BacktestRun[]>('/api/backtest/results');
      setResults(data);
      setError(null);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to load results'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const runBacktest = async () => {
    setRunning(true);
    try {
      await api.post('/api/backtest', { strategy: selectedStrategy, period: selectedPeriod });
      await fetchResults();
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to run backtest'); }
    finally { setRunning(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2"><FlaskConical size={24} className="text-accent" />Backtesting</h1>
        <p className="text-sm text-text-muted">Test strategies against historical data</p>
      </div>

      {error && <div className="rounded-lg bg-bearish-dim border border-bearish/20 p-3 text-sm text-bearish">{error}</div>}

      <Card>
        <CardHeader><CardTitle>Run Backtest</CardTitle></CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1"><Select label="Strategy" options={strategies} value={selectedStrategy} onChange={(e) => setSelectedStrategy(e.target.value)} /></div>
          <div className="flex-1"><Select label="Period" options={periods} value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} /></div>
          <Button onClick={runBacktest} loading={running} icon={<Play size={16} />}>{running ? 'Running...' : 'Run Backtest'}</Button>
        </div>
      </Card>

      <h2 className="text-lg font-semibold text-text-primary">Results History</h2>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
      ) : results.length === 0 ? (
        <Card className="py-12 text-center">
          <FlaskConical size={40} className="mx-auto mb-3 text-text-muted opacity-30" />
          <p className="text-text-muted">No backtest results yet. Run a backtest above.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {results.map((r) => (
            <Card key={r.id} hover>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-text-primary">{r.strategyName}</h3>
                  <span className="text-xs text-text-muted">{r.totalTrades} trades · {new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <Badge variant={r.winRate >= 60 ? 'bullish' : r.winRate >= 50 ? 'warning' : 'bearish'}>{r.winRate}% Win</Badge>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-terminal-900 p-3 text-center">
                  <BarChart3 size={14} className="mx-auto mb-1 text-accent" />
                  <p className="text-xs text-text-muted">Sharpe</p>
                  <p className="font-mono font-bold text-text-primary">{r.sharpeRatio.toFixed(2)}</p>
                </div>
                <div className="rounded-lg bg-terminal-900 p-3 text-center">
                  <AlertTriangle size={14} className="mx-auto mb-1 text-warning" />
                  <p className="text-xs text-text-muted">Drawdown</p>
                  <p className="font-mono font-bold text-bearish">{r.drawdown}%</p>
                </div>
                <div className="rounded-lg bg-terminal-900 p-3 text-center">
                  <Target size={14} className="mx-auto mb-1 text-bullish" />
                  <p className="text-xs text-text-muted">Profit Factor</p>
                  <p className="font-mono font-bold text-bullish">{r.profitFactor.toFixed(2)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
