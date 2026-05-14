import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'bullish' | 'bearish' | 'neutral' | 'accent' | 'warning' | 'info';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  bullish: 'bg-bullish-dim text-bullish border-bullish/20',
  bearish: 'bg-bearish-dim text-bearish border-bearish/20',
  neutral: 'bg-terminal-700 text-text-secondary border-terminal-600',
  accent: 'bg-accent-dim text-accent border-accent/20',
  warning: 'bg-warning-dim text-warning border-warning/20',
  info: 'bg-info-dim text-info border-info/20',
};

export function Badge({ children, variant = 'neutral', className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            variant === 'bullish' && 'bg-bullish',
            variant === 'bearish' && 'bg-bearish',
            variant === 'accent' && 'bg-accent',
            variant === 'warning' && 'bg-warning',
            variant === 'info' && 'bg-info',
            variant === 'neutral' && 'bg-text-muted'
          )}
        />
      )}
      {children}
    </span>
  );
}

export function ConfidenceBadge({ score }: { score: number }) {
  const variant: BadgeVariant = score >= 75 ? 'bullish' : score >= 50 ? 'warning' : 'bearish';
  return <Badge variant={variant}>{score}%</Badge>;
}
