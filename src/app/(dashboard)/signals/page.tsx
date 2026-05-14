'use client';

import React, { useState } from 'react';
import { SignalCard } from '@/components/dashboard/SignalCard';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useSignals } from '@/hooks/useSignals';
import { Zap, Brain, TrendingUp, TrendingDown, Target, ShieldAlert, RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Signal } from '@/types';

const tabs = [
  { id: 'all', label: 'All Signals' },
  { id: 'bullish', label: 'Bullish' },
  { id: 'bearish', label: 'Bearish' },
  { id: 'completed', label: 'Completed' },
];

export default function SignalsPage() {
  const { signals, loading, refreshSignals } = useSignals();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const filteredSignals = signals.filter((s) => {
    if (activeTab === 'bullish') return s.direction === 'BULLISH' && s.status === 'ACTIVE';
    if (activeTab === 'bearish') return s.direction === 'BEARISH' && s.status === 'ACTIVE';
    if (activeTab === 'completed') return s.status !== 'ACTIVE';
    return true;
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshSignals();
    setRefreshing(false);
  };

  const bullishCount = signals.filter(s => s.direction === 'BULLISH' && s.status === 'ACTIVE').length;
  const bearishCount = signals.filter(s => s.direction === 'BEARISH' && s.status === 'ACTIVE').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Zap size={24} className="text-accent" />
            AI Signals
          </h1>
          <p className="text-sm text-text-muted">AI-generated trading setups with confidence scoring</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="bullish" dot>{bullishCount} Bullish</Badge>
          <Badge variant="bearish" dot>{bearishCount} Bearish</Badge>
          <button onClick={handleRefresh} disabled={refreshing} className="rounded-lg p-2 text-text-muted hover:bg-terminal-700 hover:text-accent transition-colors disabled:opacity-50" title="Generate New Signals">
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredSignals.map((signal) => (
            <SignalCard key={signal.id} signal={signal} onClick={() => setSelectedSignal(signal)} />
          ))}
        </div>
      )}

      {!loading && filteredSignals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-text-muted">
          <Zap size={48} className="mb-4 opacity-20" />
          <p>No signals in this category</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={handleRefresh}>Generate New Signals</Button>
        </div>
      )}

      {/* Signal Detail Modal */}
      <Modal isOpen={!!selectedSignal} onClose={() => setSelectedSignal(null)} title="Signal Details" size="lg">
        {selectedSignal && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${selectedSignal.direction === 'BULLISH' ? 'bg-bullish-dim' : 'bg-bearish-dim'}`}>
                {selectedSignal.direction === 'BULLISH' ? <TrendingUp className="text-bullish" /> : <TrendingDown className="text-bearish" />}
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary">{selectedSignal.stockSymbol}</h3>
                <p className="text-sm text-text-muted">{selectedSignal.stockName || 'NSE'}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-terminal-900 p-3 text-center">
                <p className="text-xs text-text-muted mb-1">Entry</p>
                <p className="font-mono font-bold text-text-primary">{formatCurrency(selectedSignal.entryPrice)}</p>
              </div>
              <div className="rounded-lg bg-terminal-900 p-3 text-center">
                <p className="text-xs text-text-muted mb-1 flex items-center justify-center gap-1"><Target size={10} /> Target</p>
                <p className="font-mono font-bold text-bullish">{formatCurrency(selectedSignal.targetPrice)}</p>
              </div>
              <div className="rounded-lg bg-terminal-900 p-3 text-center">
                <p className="text-xs text-text-muted mb-1 flex items-center justify-center gap-1"><ShieldAlert size={10} /> Stop Loss</p>
                <p className="font-mono font-bold text-bearish">{formatCurrency(selectedSignal.stopLoss)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={selectedSignal.direction === 'BULLISH' ? 'bullish' : 'bearish'} dot>{selectedSignal.direction}</Badge>
              <span className="text-sm text-text-muted">Confidence: <strong className="text-text-primary">{selectedSignal.confidenceScore}%</strong></span>
              <span className="text-sm text-text-muted">R:R <strong className="text-text-primary">{selectedSignal.riskReward?.toFixed(1) || '—'}</strong></span>
            </div>
            <div className="rounded-xl border border-terminal-600 bg-terminal-900 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain size={16} className="text-accent" />
                <h4 className="text-sm font-semibold text-accent">AI Analysis</h4>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">{selectedSignal.aiReasoning}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="bullish" className="flex-1">Add to Watchlist</Button>
              <Button variant="secondary" className="flex-1">Paper Trade</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
