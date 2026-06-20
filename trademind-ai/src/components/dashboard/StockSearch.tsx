'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string;
}

interface StockSearchProps {
  onSelect: (symbol: string) => void;
  placeholder?: string;
}

export function StockSearch({ onSelect, placeholder = 'Search stocks...' }: StockSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    if (query.trim().length === 0) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await api.get<StockSearchResult[]>(`/api/market/search?q=${encodeURIComponent(query)}`);
        setResults(data);
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

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
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
          </button>
        )}
      </div>

      {isOpen && query.length > 0 && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full max-h-64 overflow-y-auto rounded-xl border border-terminal-600 bg-terminal-800 py-1 shadow-2xl animate-fade-in">
          {isLoading && results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-text-muted text-center">Searching...</div>
          ) : results.length > 0 ? (
            results.map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => {
                  onSelect(stock.symbol);
                  setQuery('');
                  setIsOpen(false);
                }}
                className="flex w-full items-center justify-between px-4 py-2.5 text-sm hover:bg-terminal-700 transition-colors"
              >
                <div className="flex flex-col items-start gap-1">
                  <span className="font-mono font-semibold text-text-primary">{stock.symbol}</span>
                  <span className="text-text-muted text-xs truncate max-w-[200px] text-left">{stock.name} • {stock.exchange}</span>
                </div>
              </button>
            ))
          ) : (
             <div className="px-4 py-3 text-sm text-text-muted text-center">No results found</div>
          )}
        </div>
      )}
    </div>
  );
}
