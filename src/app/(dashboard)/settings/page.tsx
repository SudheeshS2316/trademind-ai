'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { Settings as SettingsIcon, User, Shield, Bell, Save } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    name: user?.name || '', email: user?.email || '',
    capitalPerTrade: '10000', riskPercent: '2', riskReward: '2',
    marketCategory: 'ALL', tradingStyle: 'SWING',
  });

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const update = (key: string, val: string) => setSettings({ ...settings, [key]: val });

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2"><SettingsIcon size={24} className="text-accent" />Settings</h1>
        <p className="text-sm text-text-muted">Manage your profile and trading preferences</p>
      </div>

      <Card>
        <CardHeader><CardTitle><span className="flex items-center gap-2"><User size={16} />Profile</span></CardTitle></CardHeader>
        <div className="space-y-4">
          <Input label="Name" value={settings.name} onChange={(e) => update('name', e.target.value)} />
          <Input label="Email" type="email" value={settings.email} onChange={(e) => update('email', e.target.value)} disabled />
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle><span className="flex items-center gap-2"><Shield size={16} />Trading Preferences</span></CardTitle></CardHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Capital per Trade (₹)" type="number" value={settings.capitalPerTrade} onChange={(e) => update('capitalPerTrade', e.target.value)} />
          <Input label="Risk Tolerance (%)" type="number" value={settings.riskPercent} onChange={(e) => update('riskPercent', e.target.value)} />
          <Input label="Risk Reward Ratio" type="number" value={settings.riskReward} onChange={(e) => update('riskReward', e.target.value)} />
          <Select label="Market Category" value={settings.marketCategory} onChange={(e) => update('marketCategory', e.target.value)} options={[{ value: 'ALL', label: 'All Stocks' }, { value: 'LARGE_CAP', label: 'Large Cap' }, { value: 'MID_CAP', label: 'Mid Cap' }, { value: 'SMALL_CAP', label: 'Small Cap' }]} />
          <Select label="Trading Style" value={settings.tradingStyle} onChange={(e) => update('tradingStyle', e.target.value)} options={[{ value: 'SWING', label: 'Swing Trading' }, { value: 'POSITIONAL', label: 'Positional' }, { value: 'INTRADAY', label: 'Intraday' }]} />
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle><span className="flex items-center gap-2"><Bell size={16} />Notifications</span></CardTitle></CardHeader>
        <div className="space-y-3">
          {['Signal Alerts', 'Price Alerts', 'Portfolio Updates', 'Market News'].map((label) => (
            <label key={label} className="flex items-center justify-between cursor-pointer rounded-lg p-2 hover:bg-terminal-700">
              <span className="text-sm text-text-secondary">{label}</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-terminal-600 bg-terminal-900 text-accent focus:ring-accent" />
            </label>
          ))}
        </div>
      </Card>

      <Button onClick={handleSave} icon={<Save size={16} />} className="w-full sm:w-auto">
        {saved ? '✓ Saved!' : 'Save Settings'}
      </Button>
    </div>
  );
}
