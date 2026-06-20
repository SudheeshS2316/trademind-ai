'use client';

import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface SectorItem {
  name: string;
  change: number;
}

const mockSectors: SectorItem[] = [
  { name: 'IT', change: 2.1 },
  { name: 'Banking', change: 1.5 },
  { name: 'Pharma', change: -0.8 },
  { name: 'Auto', change: 3.2 },
  { name: 'FMCG', change: 0.4 },
  { name: 'Metal', change: -1.9 },
  { name: 'Energy', change: 1.8 },
  { name: 'Realty', change: -2.3 },
  { name: 'Media', change: 0.7 },
  { name: 'Infra', change: -0.3 },
  { name: 'PSU Bank', change: 2.8 },
  { name: 'Fin Svc', change: 1.2 },
];

export function SectorHeatmap() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sector Performance</CardTitle>
      </CardHeader>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {mockSectors.map((sector) => {
          const intensity = Math.min(Math.abs(sector.change) / 3, 1);
          const isPositive = sector.change >= 0;

          return (
            <div
              key={sector.name}
              className={cn(
                'flex flex-col items-center justify-center rounded-lg p-3 transition-transform hover:scale-105 cursor-pointer',
                'border border-transparent'
              )}
              style={{
                backgroundColor: isPositive
                  ? `rgba(38, 166, 154, ${0.08 + intensity * 0.2})`
                  : `rgba(239, 83, 80, ${0.08 + intensity * 0.2})`,
                borderColor: isPositive
                  ? `rgba(38, 166, 154, ${intensity * 0.3})`
                  : `rgba(239, 83, 80, ${intensity * 0.3})`,
              }}
            >
              <span className="text-xs font-medium text-text-secondary">{sector.name}</span>
              <span
                className={cn(
                  'text-sm font-bold font-mono',
                  isPositive ? 'text-bullish' : 'text-bearish'
                )}
              >
                {isPositive ? '+' : ''}{sector.change.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
