'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Bell, Plus, Trash2, Power } from 'lucide-react';

interface AlertItem { id: string; stockSymbol: string; alertType: string; triggerPrice: number; isActive: boolean; }

const alertTypeLabels: Record<string,string> = { TARGET: 'Target', STOP_LOSS: 'Stop Loss', PRICE_ABOVE: 'Price Above', PRICE_BELOW: 'Price Below', VOLUME_BREAKOUT: 'Volume Breakout' };
const alertTypeVariant = (t: string) => { if (t === 'TARGET') return 'bullish' as const; if (t === 'STOP_LOSS') return 'bearish' as const; if (t === 'VOLUME_BREAKOUT') return 'accent' as const; return 'info' as const; };

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newAlert, setNewAlert] = useState({ symbol: '', alertType: 'TARGET', triggerPrice: '' });

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<AlertItem[]>('/api/alerts');
      setAlerts(data);
      setError(null);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to load alerts'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const toggleAlert = async (id: string) => {
    try {
      const updated = await api.patch<AlertItem>(`/api/alerts/${id}`);
      setAlerts(alerts.map(a => a.id === id ? updated : a));
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to toggle alert'); }
  };

  const deleteAlert = async (id: string) => {
    try {
      await api.delete(`/api/alerts/${id}`);
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to delete alert'); }
  };

  const createAlert = async () => {
    if (!newAlert.symbol || !newAlert.triggerPrice) return;
    try {
      await api.post('/api/alerts', { symbol: newAlert.symbol, alertType: newAlert.alertType, triggerPrice: Number(newAlert.triggerPrice) });
      setNewAlert({ symbol: '', alertType: 'TARGET', triggerPrice: '' });
      setShowCreate(false);
      fetchAlerts();
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to create alert'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2"><Bell size={24} className="text-accent" />Alerts</h1>
          <p className="text-sm text-text-muted">{alerts.filter(a => a.isActive).length} active alerts</p>
        </div>
        <Button onClick={() => setShowCreate(true)} icon={<Plus size={16} />}>Create Alert</Button>
      </div>

      {error && <div className="rounded-lg bg-bearish-dim border border-bearish/20 p-3 text-sm text-bearish">{error}</div>}

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : alerts.length === 0 ? (
        <Card className="py-12 text-center">
          <Bell size={40} className="mx-auto mb-3 text-text-muted opacity-30" />
          <p className="text-text-muted">No alerts yet. Create one to get started.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Card key={alert.id} className={`flex items-center justify-between ${!alert.isActive ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-terminal-700">
                  <Bell size={18} className={alert.isActive ? 'text-accent' : 'text-text-muted'} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-text-primary">{alert.stockSymbol}</span>
                    <Badge variant={alertTypeVariant(alert.alertType)}>{alertTypeLabels[alert.alertType] || alert.alertType}</Badge>
                  </div>
                  <p className="text-sm text-text-muted">Trigger at {formatCurrency(alert.triggerPrice)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleAlert(alert.id)} className={`rounded-lg p-2 transition-colors ${alert.isActive ? 'text-bullish hover:bg-bullish-dim' : 'text-text-muted hover:bg-terminal-700'}`} title="Toggle"><Power size={16} /></button>
                <button onClick={() => deleteAlert(alert.id)} className="rounded-lg p-2 text-text-muted hover:bg-bearish-dim hover:text-bearish" title="Delete"><Trash2 size={16} /></button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Alert">
        <div className="space-y-4">
          <Input label="Stock Symbol" placeholder="e.g. RELIANCE" value={newAlert.symbol} onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value })} />
          <Select label="Alert Type" value={newAlert.alertType} onChange={(e) => setNewAlert({ ...newAlert, alertType: e.target.value })} options={[{ value: 'TARGET', label: 'Target Price' }, { value: 'STOP_LOSS', label: 'Stop Loss' }, { value: 'PRICE_ABOVE', label: 'Price Above' }, { value: 'PRICE_BELOW', label: 'Price Below' }, { value: 'VOLUME_BREAKOUT', label: 'Volume Breakout' }]} />
          <Input label="Trigger Price (₹)" type="number" placeholder="0.00" value={newAlert.triggerPrice} onChange={(e) => setNewAlert({ ...newAlert, triggerPrice: e.target.value })} />
          <Button onClick={createAlert} className="w-full">Create Alert</Button>
        </div>
      </Modal>
    </div>
  );
}
