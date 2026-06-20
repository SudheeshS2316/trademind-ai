'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketOverviewCardProps {
  name: string;
  value: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
  sparklineData?: number[];
}

export function MarketOverviewCard({
  name,
  value,
  change,
  changePercent,
  isPositive,
  sparklineData = [],
}: MarketOverviewCardProps) {
  return (
    <Card hover className="relative overflow-hidden">
      {/* Background gradient */}
      <div
        className={cn(
          'absolute inset-0 opacity-5',
          isPositive
            ? 'bg-gradient-to-br from-bullish to-transparent'
            : 'bg-gradient-to-br from-bearish to-transparent'
        )}
      />

      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-text-secondary">{name}</span>
          <div
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              isPositive ? 'bg-bullish-dim text-bullish' : 'bg-bearish-dim text-bearish'
            )}
          >
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {changePercent}
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold font-mono text-text-primary">{value}</p>
            <p className={cn('text-sm font-mono', isPositive ? 'text-bullish' : 'text-bearish')}>
              {isPositive ? '+' : ''}{change}
            </p>
          </div>

          {/* Mini Sparkline */}
          {sparklineData.length > 0 && (
            <svg viewBox="0 0 80 32" className="h-8 w-20" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke={isPositive ? '#26A69A' : '#EF5350'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={sparklineData
                  .map((v, i) => {
                    const x = (i / (sparklineData.length - 1)) * 80;
                    const min = Math.min(...sparklineData);
                    const max = Math.max(...sparklineData);
                    const range = max - min || 1;
                    const y = 32 - ((v - min) / range) * 28 - 2;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
            </svg>
          )}
        </div>
      </div>
    </Card>
  );
}
