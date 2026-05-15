'use client';

import React, { useState, useEffect } from 'react';
import { MarketOverviewCard } from '@/components/dashboard/MarketOverviewCard';
import { SignalCard } from '@/components/dashboard/SignalCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useMarketData } from '@/hooks/useMarketData';
import { useSignals } from '@/hooks/useSignals';
import { useWebSocket } from '@/hooks/useWebSocket';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Zap, TrendingUp, Briefcase, Activity, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { overview, sectors, loading: marketLoading } = useMarketData();
  const { signals, loading: signalsLoading, refreshSignals } = useSignals();
  const { connected, priceTicks } = useWebSocket();
  const [refreshing, setRefreshing] = useState(false);

  const activeSignals = signals.filter(s => s.status === 'ACTIVE');
  const bullishCount = activeSignals.filter(s => s.direction === 'BULLISH').length;
  const bearishCount = activeSignals.filter(s => s.direction === 'BEARISH').length;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshSignals();
    setRefreshing(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-muted">Market overview and AI-powered insights</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn('flex items-center gap-1.5 rounded-full px-3 py-1 text-xs', connected ? 'bg-bullish-dim text-bullish' : 'bg-bearish-dim text-bearish')}>
            {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
            {connected ? 'Live' : 'Offline'}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="rounded-lg p-2 text-text-muted hover:bg-terminal-700 hover:text-accent transition-colors disabled:opacity-50"
            title="Refresh Signals"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Market Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {marketLoading ? (
          <>
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </>
        ) : (
          <>
            {overview && (
              <>
                <MarketOverviewCard
                  name={overview.nifty.name}
                  value={overview.nifty.value.toLocaleString('en-IN')}
                  change={overview.nifty.change.toFixed(2)}
                  changePercent={`${overview.nifty.isPositive ? '+' : ''}${overview.nifty.changePercent}%`}
                  isPositive={overview.nifty.isPositive}
                  sparklineData={[100, 102, 101, 104, 103, 106, 108, 107, 110, 112]}
                />
                <MarketOverviewCard
                  name={overview.bankNifty.name}
                  value={overview.bankNifty.value.toLocaleString('en-IN')}
                  change={overview.bankNifty.change.toFixed(2)}
                  changePercent={`${overview.bankNifty.isPositive ? '+' : ''}${overview.bankNifty.changePercent}%`}
                  isPositive={overview.bankNifty.isPositive}
                  sparklineData={[200, 198, 199, 196, 197, 195, 194, 196, 193, 192]}
                />
                <MarketOverviewCard
                  name={overview.sensex.name}
                  value={overview.sensex.value.toLocaleString('en-IN')}
                  change={overview.sensex.change.toFixed(2)}
                  changePercent={`${overview.sensex.isPositive ? '+' : ''}${overview.sensex.changePercent}%`}
                  isPositive={overview.sensex.isPositive}
                  sparklineData={[300, 298, 301, 305, 303, 302, 304, 306, 308, 310]}
                />
              </>
            )}
            <Card hover className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-50" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-text-secondary">Active Signals</span>
                  <Zap size={16} className="text-accent" />
                </div>
                <p className="text-2xl font-bold font-mono text-text-primary">{activeSignals.length}</p>
                <p className="text-sm text-bullish">{bullishCount} Bullish · {bearishCount} Bearish</p>
              </div>
            </Card>
            <Card hover className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-bullish/5 to-transparent opacity-50" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-text-secondary">Sentiment</span>
                  <Briefcase size={16} className="text-bullish" />
                </div>
                <p className="text-2xl font-bold font-mono text-text-primary">{overview?.marketSentiment || '—'}</p>
                <p className="text-sm text-text-muted">Market: {overview?.marketStatus || 'loading'}</p>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* AI Signals */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-accent" />
              <h2 className="text-lg font-semibold text-text-primary">Top AI Signals</h2>
            </div>
            <Badge variant="accent" dot>Live</Badge>
          </div>
          {signalsLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-44 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {activeSignals.slice(0, 4).map((signal) => (
                <SignalCard key={signal.id} signal={signal} />
              ))}
            </div>
          )}
          {!signalsLoading && activeSignals.length === 0 && (
            <Card className="py-12 text-center">
              <Zap size={40} className="mx-auto mb-3 text-text-muted opacity-30" />
              <p className="text-text-muted">No active signals. Click refresh to generate new AI signals.</p>
            </Card>
          )}
        </div>

        {/* Sidebar: Sector Heatmap + Live Ticks */}
        <div className="space-y-6">
          {/* Sector Performance from API */}
          <Card>
            <CardHeader>
              <CardTitle>Sector Performance</CardTitle>
            </CardHeader>
            {marketLoading ? (
              <div className="grid grid-cols-3 gap-2">{[...Array(12)].map((_,i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2">
                {sectors.map((sector) => {
                  const intensity = Math.min(Math.abs(sector.change) / 3, 1);
                  const isPositive = sector.change >= 0;
                  return (
                    <div
                      key={sector.name}
                      className="flex flex-col items-center justify-center rounded-lg p-3 transition-transform hover:scale-105 cursor-pointer border border-transparent"
                      style={{
                        backgroundColor: isPositive ? `rgba(38, 166, 154, ${0.08 + intensity * 0.2})` : `rgba(239, 83, 80, ${0.08 + intensity * 0.2})`,
                        borderColor: isPositive ? `rgba(38, 166, 154, ${intensity * 0.3})` : `rgba(239, 83, 80, ${intensity * 0.3})`,
                      }}
                    >
                      <span className="text-xs font-medium text-text-secondary">{sector.name}</span>
                      <span className={cn('text-sm font-bold font-mono', isPositive ? 'text-bullish' : 'text-bearish')}>
                        {isPositive ? '+' : ''}{sector.change.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Live Price Ticks */}
          <Card>
            <CardHeader>
              <CardTitle>Live Ticks</CardTitle>
              <div className={cn('flex items-center gap-1 text-xs', connected ? 'text-bullish' : 'text-text-muted')}>
                <div className={cn('h-1.5 w-1.5 rounded-full', connected ? 'bg-bullish animate-pulse' : 'bg-text-muted')} />
                {connected ? 'Connected' : 'Disconnected'}
              </div>
            </CardHeader>
            <div className="space-y-2">
              {priceTicks.length > 0 ? priceTicks.map((tick) => (
                <div key={tick.symbol} className="flex items-center justify-between rounded-lg p-2 hover:bg-terminal-700 transition-colors">
                  <span className="font-mono text-sm font-semibold text-text-primary">{tick.symbol}</span>
                  <div className="text-right">
                    <p className="font-mono text-sm text-text-primary">{formatCurrency(tick.price)}</p>
                    <p className={cn('text-xs font-mono', tick.change >= 0 ? 'text-bullish' : 'text-bearish')}>
                      {tick.change >= 0 ? '+' : ''}{tick.changePercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-text-muted text-center py-4">Waiting for live data...</p>
              )}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <Activity size={16} className="text-text-muted" />
            </CardHeader>
            <div className="space-y-3">
              {activeSignals.slice(0, 4).map((signal, i) => (
                <div key={signal.id} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-terminal-700">
                  <Zap size={14} className="text-accent" />
                  <span className="flex-1 text-sm text-text-secondary">
                    New signal: {signal.stockSymbol} {signal.direction}
                  </span>
                  <span className="text-xs text-text-muted">{signal.confidenceScore}%</span>
                </div>
              ))}
              {activeSignals.length === 0 && <p className="text-sm text-text-muted text-center py-2">No recent activity</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
