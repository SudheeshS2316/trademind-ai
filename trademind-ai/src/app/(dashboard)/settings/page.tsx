'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Settings as SettingsIcon, User, Shield, Bell, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface UserSettings {
  name: string; email: string;
  capitalPerTrade: string; riskPercent: string; riskReward: string;
  marketCategory: string; tradingStyle: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [settings, setSettings] = useState<UserSettings>({
    name: '', email: '',
    capitalPerTrade: '10000', riskPercent: '2', riskReward: '2',
    marketCategory: 'ALL', tradingStyle: 'SWING',
  });

  // Bug Fix #1 + #6: Load actual settings from API on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const me = await api.get<any>('/api/auth/me');
        setSettings({
          name: me.name || '',
          email: me.email || '',
          capitalPerTrade: String(me.capitalPerTrade ?? 10000),
          riskPercent: String(me.riskPercent ?? 2),
          riskReward: String(me.riskReward ?? 2),
          marketCategory: me.marketCategory || 'ALL',
          tradingStyle: me.tradingStyle || 'SWING',
        });
      } catch {
        // Fallback to auth context values
        setSettings(s => ({ ...s, name: user?.name || '', email: user?.email || '' }));
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [user]);

  const update = (key: keyof UserSettings, val: string) => setSettings(s => ({ ...s, [key]: val }));

  // Bug Fix #1: actually calls the API to persist settings
  const handleSave = async () => {
    setSaving(true);
    setStatus('idle');
    try {
      await api.patch('/api/auth/settings', {
        name: settings.name,
        capitalPerTrade: parseFloat(settings.capitalPerTrade),
        riskPercent: parseFloat(settings.riskPercent),
        riskReward: parseFloat(settings.riskReward),
        marketCategory: settings.marketCategory,
        tradingStyle: settings.tradingStyle,
      });
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err?.message || 'Failed to save settings');
      setTimeout(() => setStatus('idle'), 4000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <SettingsIcon size={24} className="text-accent" />Settings
        </h1>
        <p className="text-sm text-text-muted">Manage your profile and trading preferences</p>
      </div>

      <Card>
        <CardHeader><CardTitle><span className="flex items-center gap-2"><User size={16} />Profile</span></CardTitle></CardHeader>
        <div className="space-y-4">
          <Input label="Name" value={settings.name} onChange={e => update('name', e.target.value)} />
          <Input label="Email" type="email" value={settings.email} onChange={e => update('email', e.target.value)} disabled />
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle><span className="flex items-center gap-2"><Shield size={16} />Trading Preferences</span></CardTitle></CardHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Capital per Trade (₹)" type="number" value={settings.capitalPerTrade} onChange={e => update('capitalPerTrade', e.target.value)} />
          <Input label="Risk Tolerance (%)" type="number" value={settings.riskPercent} onChange={e => update('riskPercent', e.target.value)} />
          <Input label="Risk Reward Ratio" type="number" value={settings.riskReward} onChange={e => update('riskReward', e.target.value)} />
          <Select label="Market Category" value={settings.marketCategory} onChange={e => update('marketCategory', e.target.value)}
            options={[{ value: 'ALL', label: 'All Stocks' }, { value: 'LARGE_CAP', label: 'Large Cap' }, { value: 'MID_CAP', label: 'Mid Cap' }, { value: 'SMALL_CAP', label: 'Small Cap' }]} />
          <Select label="Trading Style" value={settings.tradingStyle} onChange={e => update('tradingStyle', e.target.value)}
            options={[{ value: 'SWING', label: 'Swing Trading' }, { value: 'POSITIONAL', label: 'Positional' }, { value: 'INTRADAY', label: 'Intraday' }]} />
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle><span className="flex items-center gap-2"><Bell size={16} />Notifications</span></CardTitle></CardHeader>
        <div className="space-y-3">
          {['Signal Alerts', 'Price Alerts', 'Portfolio Updates', 'Market News'].map(label => (
            <label key={label} className="flex items-center justify-between cursor-pointer rounded-lg p-2 hover:bg-terminal-700">
              <span className="text-sm text-text-secondary">{label}</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-terminal-600 bg-terminal-900 text-accent focus:ring-accent" />
            </label>
          ))}
        </div>
      </Card>

      {status === 'error' && (
        <div className="flex items-center gap-2 rounded-lg bg-bearish-dim border border-bearish/20 p-3 text-sm text-bearish">
          <AlertCircle size={16} />{errorMsg}
        </div>
      )}

      <Button onClick={handleSave} disabled={saving} icon={saving ? <Loader2 size={16} className="animate-spin" /> : status === 'success' ? <CheckCircle size={16} /> : <Save size={16} />} className="w-full sm:w-auto">
        {saving ? 'Saving...' : status === 'success' ? '✓ Settings Saved!' : 'Save Settings'}
      </Button>
    </div>
  );
}
