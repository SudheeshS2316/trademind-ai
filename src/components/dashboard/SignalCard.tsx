'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge, ConfidenceBadge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Brain } from 'lucide-react';
import type { Signal } from '@/types';

interface SignalCardProps {
  signal: Signal;
  onClick?: () => void;
  compact?: boolean;
}

export function SignalCard({ signal, onClick, compact = false }: SignalCardProps) {
  const isBullish = signal.direction === 'BULLISH';
  const riskReward = ((signal.targetPrice - signal.entryPrice) / (signal.entryPrice - signal.stopLoss)).toFixed(1);

  return (
    <Card hover onClick={onClick} className="relative overflow-hidden">
      {/* Direction indicator strip */}
      <div
        className={cn(
          'absolute left-0 top-0 h-full w-1 rounded-l-xl',
          isBullish ? 'bg-bullish' : 'bg-bearish'
        )}
      />

      <div className="pl-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg',
              isBullish ? 'bg-bullish-dim' : 'bg-bearish-dim'
            )}>
              {isBullish ? (
                <TrendingUp size={16} className="text-bullish" />
              ) : (
                <TrendingDown size={16} className="text-bearish" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">{signal.stockSymbol}</h3>
              <span className="text-xs text-text-muted">{signal.stockName || 'NSE'}</span>
            </div>
          </div>
          <ConfidenceBadge score={signal.confidenceScore} />
        </div>

        {/* Price Levels */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <PriceLevel label="Entry" value={signal.entryPrice} color="text-text-primary" />
          <PriceLevel label="Target" value={signal.targetPrice} color="text-bullish" />
          <PriceLevel label="Stop Loss" value={signal.stopLoss} color="text-bearish" />
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant={isBullish ? 'bullish' : 'bearish'} dot>
              {signal.direction}
            </Badge>
            <span className="text-xs text-text-muted">R:R {riskReward}</span>
          </div>
          {!compact && signal.aiReasoning && (
            <div className="flex items-center gap-1 text-xs text-accent">
              <Brain size={12} />
              <span>AI Insight</span>
            </div>
          )}
        </div>

        {/* AI Reasoning Preview */}
        {!compact && signal.aiReasoning && (
          <p className="mt-3 border-t border-terminal-600 pt-3 text-xs text-text-muted line-clamp-2">
            {signal.aiReasoning}
          </p>
        )}
      </div>
    </Card>
  );
}

function PriceLevel({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <p className="text-xs text-text-muted mb-0.5">{label}</p>
      <p className={cn('font-mono text-sm font-semibold', color)}>
        {formatCurrency(value)}
      </p>
    </div>
  );
}
