'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { cn, formatCurrency, formatPercent } from '@/lib/utils';
import { Briefcase, TrendingUp, Plus, DollarSign, PieChart } from 'lucide-react';

interface PaperTrade { id: string; stockSymbol: string; entryPrice: number; exitPrice: number | null; quantity: number; direction: string; pnl: number | null; status: string; }
interface Portfolio { capital: number; riskProfile: string; }

const tabs = [{ id: 'open', label: 'Open Trades' }, { id: 'closed', label: 'Closed Trades' }];

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState('open');
  const [showTrade, setShowTrade] = useState(false);
  const [trades, setTrades] = useState<PaperTrade[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio>({ capital: 500000, riskProfile: 'MODERATE' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTrade, setNewTrade] = useState({ symbol: '', entryPrice: '', quantity: '', direction: 'LONG' });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [p, t] = await Promise.all([
        api.get<Portfolio>('/api/portfolio'),
        api.get<PaperTrade[]>('/api/paper-trades'),
      ]);
      setPortfolio(p);
      setTrades(t);
      setError(null);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to load portfolio'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = trades.filter(t => activeTab === 'open' ? t.status !== 'CLOSED' : t.status === 'CLOSED');
  const openTrades = trades.filter(t => t.status !== 'CLOSED');
  const totalPnl = openTrades.reduce((s, t) => s + (t.pnl || 0), 0);
  const totalInvested = openTrades.reduce((s, t) => s + t.entryPrice * t.quantity, 0);
  const closedWins = trades.filter(t => t.status === 'CLOSED' && (t.pnl || 0) > 0).length;
  const closedTotal = trades.filter(t => t.status === 'CLOSED').length;
  const winRate = closedTotal > 0 ? Math.round(closedWins / closedTotal * 100) : 0;

  const handleNewTrade = async () => {
    if (!newTrade.symbol || !newTrade.entryPrice || !newTrade.quantity) return;
    try {
      await api.post('/api/paper-trades', { symbol: newTrade.symbol, entryPrice: newTrade.entryPrice, quantity: newTrade.quantity, direction: newTrade.direction });
      setNewTrade({ symbol: '', entryPrice: '', quantity: '', direction: 'LONG' });
      setShowTrade(false);
      fetchData();
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to place trade'); }
  };

  const closeTrade = async (id: string, currentPrice: number) => {
    try {
      await api.patch(`/api/paper-trades/${id}/close`, { exitPrice: currentPrice });
      fetchData();
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to close trade'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2"><Briefcase size={24} className="text-accent" />Portfolio</h1>
          <p className="text-sm text-text-muted">Paper trading portfolio • {portfolio.riskProfile}</p>
        </div>
        <Button onClick={() => setShowTrade(true)} icon={<Plus size={16} />}>New Trade</Button>
      </div>

      {error && <div className="rounded-lg bg-bearish-dim border border-bearish/20 p-3 text-sm text-bearish">{error}</div>}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-dim"><DollarSign size={18} className="text-accent" /></div><div><p className="text-xs text-text-muted">Total Capital</p><p className="text-xl font-bold font-mono text-text-primary">{formatCurrency(portfolio.capital)}</p></div></div></Card>
          <Card><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info-dim"><PieChart size={18} className="text-info" /></div><div><p className="text-xs text-text-muted">Invested</p><p className="text-xl font-bold font-mono text-text-primary">{formatCurrency(totalInvested)}</p></div></div></Card>
          <Card><div className="flex items-center gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-lg ${totalPnl >= 0 ? 'bg-bullish-dim' : 'bg-bearish-dim'}`}><TrendingUp size={18} className={totalPnl >= 0 ? 'text-bullish' : 'text-bearish'} /></div><div><p className="text-xs text-text-muted">Total P&L</p><p className={`text-xl font-bold font-mono ${totalPnl >= 0 ? 'text-bullish' : 'text-bearish'}`}>{formatCurrency(totalPnl)}</p></div></div></Card>
          <Card><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-dim"><TrendingUp size={18} className="text-warning" /></div><div><p className="text-xs text-text-muted">Win Rate</p><p className="text-xl font-bold font-mono text-text-primary">{winRate}%</p></div></div></Card>
        </div>
      )}

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {loading ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : filtered.length === 0 ? (
        <Card className="py-12 text-center">
          <Briefcase size={40} className="mx-auto mb-3 text-text-muted opacity-30" />
          <p className="text-text-muted">{activeTab === 'open' ? 'No open trades. Place a new paper trade.' : 'No closed trades yet.'}</p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-terminal-600">
          <table className="w-full">
            <thead><tr className="border-b border-terminal-600 bg-terminal-900/50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-muted">Symbol</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-text-muted">Entry</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-text-muted">Qty</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-text-muted">P&L</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-text-muted">Direction</th>
              {activeTab === 'open' && <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-text-muted">Action</th>}
            </tr></thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-terminal-600/50 hover:bg-terminal-700/50">
                  <td className="px-4 py-3 font-mono font-semibold text-text-primary">{t.stockSymbol}</td>
                  <td className="px-4 py-3 text-right font-mono text-text-secondary">{formatCurrency(t.entryPrice)}</td>
                  <td className="px-4 py-3 text-right font-mono text-text-secondary">{t.quantity}</td>
                  <td className={cn('px-4 py-3 text-right font-mono font-semibold', (t.pnl || 0) >= 0 ? 'text-bullish' : 'text-bearish')}>{t.pnl != null ? formatCurrency(t.pnl) : '—'}</td>
                  <td className="px-4 py-3 text-center"><Badge variant={t.direction === 'LONG' ? 'bullish' : 'bearish'}>{t.direction}</Badge></td>
                  {activeTab === 'open' && <td className="px-4 py-3 text-right"><Button variant="outline" size="sm" onClick={() => closeTrade(t.id, t.entryPrice * 1.02)}>Close</Button></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showTrade} onClose={() => setShowTrade(false)} title="New Paper Trade">
        <div className="space-y-4">
          <Input label="Stock Symbol" placeholder="e.g. RELIANCE" value={newTrade.symbol} onChange={(e) => setNewTrade({ ...newTrade, symbol: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Entry Price" type="number" placeholder="0.00" value={newTrade.entryPrice} onChange={(e) => setNewTrade({ ...newTrade, entryPrice: e.target.value })} />
            <Input label="Quantity" type="number" placeholder="0" value={newTrade.quantity} onChange={(e) => setNewTrade({ ...newTrade, quantity: e.target.value })} />
          </div>
          <Select label="Direction" value={newTrade.direction} onChange={(e) => setNewTrade({ ...newTrade, direction: e.target.value })} options={[{ value: 'LONG', label: 'Long (Buy)' }, { value: 'SHORT', label: 'Short (Sell)' }]} />
          <Button onClick={handleNewTrade} className="w-full">Place Paper Trade</Button>
        </div>
      </Modal>
    </div>
  );
}
