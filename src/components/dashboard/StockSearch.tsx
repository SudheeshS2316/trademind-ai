'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const STOCK_LIST = [
  { symbol: 'RELIANCE', name: 'Reliance Industries' },
  { symbol: 'TCS', name: 'Tata Consultancy Services' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank' },
  { symbol: 'INFY', name: 'Infosys' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever' },
  { symbol: 'SBIN', name: 'State Bank of India' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel' },
  { symbol: 'ITC', name: 'ITC Limited' },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank' },
  { symbol: 'LT', name: 'Larsen & Toubro' },
  { symbol: 'AXISBANK', name: 'Axis Bank' },
  { symbol: 'WIPRO', name: 'Wipro' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki' },
  { symbol: 'ONGC', name: 'ONGC' },
  { symbol: 'NTPC', name: 'NTPC Limited' },
  { symbol: 'TATASTEEL', name: 'Tata Steel' },
];

interface StockSearchProps {
  onSelect: (symbol: string) => void;
  placeholder?: string;
}

export function StockSearch({ onSelect, placeholder = 'Search stocks...' }: StockSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = query.length > 0
    ? STOCK_LIST.filter(
        (s) =>
          s.symbol.toLowerCase().includes(query.toLowerCase()) ||
          s.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-terminal-600 bg-terminal-900 py-2.5 pl-10 pr-8 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && filtered.length > 0 && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-xl border border-terminal-600 bg-terminal-800 py-1 shadow-2xl animate-fade-in">
          {filtered.map((stock) => (
            <button
              key={stock.symbol}
              onClick={() => {
                onSelect(stock.symbol);
                setQuery('');
                setIsOpen(false);
              }}
              className="flex w-full items-center justify-between px-4 py-2.5 text-sm hover:bg-terminal-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-semibold text-text-primary">{stock.symbol}</span>
                <span className="text-text-muted">{stock.name}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
