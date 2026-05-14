'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Bell, Search, LogOut, User, ChevronDown, Menu } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface NavbarProps {
  onMenuToggle: () => void;
}

export function Navbar({ onMenuToggle }: NavbarProps) {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-terminal-600 bg-terminal-800/80 backdrop-blur-xl px-4 lg:px-6">
      {/* Left: Mobile menu + Market Ticker */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-text-muted hover:bg-terminal-700 hover:text-text-primary lg:hidden"
        >
          <Menu size={20} />
        </button>

        {/* Market Ticker */}
        <div className="hidden items-center gap-4 text-xs font-mono md:flex">
          <MarketTick label="NIFTY 50" value="22,450.30" change="+0.85%" positive />
          <div className="h-4 w-px bg-terminal-600" />
          <MarketTick label="BANK NIFTY" value="48,720.15" change="-0.32%" positive={false} />
          <div className="h-4 w-px bg-terminal-600" />
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-bullish animate-pulse" />
            <span className="text-text-muted">Market Open</span>
          </span>
        </div>
      </div>

      {/* Right: Search + Notifications + User */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden items-center gap-2 rounded-lg border border-terminal-600 bg-terminal-900 px-3 py-1.5 sm:flex">
          <Search size={14} className="text-text-muted" />
          <input
            type="text"
            placeholder="Search stocks..."
            className="w-32 bg-transparent text-xs text-text-primary placeholder:text-text-muted focus:outline-none lg:w-48"
          />
          <kbd className="rounded bg-terminal-700 px-1.5 py-0.5 text-[10px] text-text-muted">/</kbd>
        </div>

        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-text-muted transition-colors hover:bg-terminal-700 hover:text-text-primary">
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
        </button>

        {/* User Menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-terminal-700"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/20 text-accent">
              <User size={14} />
            </div>
            <span className="hidden text-text-primary md:inline">{user?.name || 'Trader'}</span>
            <ChevronDown size={14} className="text-text-muted" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-terminal-600 bg-terminal-800 py-2 shadow-2xl animate-fade-in">
              <div className="border-b border-terminal-600 px-4 py-2">
                <p className="text-sm font-medium text-text-primary">{user?.name}</p>
                <p className="text-xs text-text-muted">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-bearish hover:bg-terminal-700"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function MarketTick({ label, value, change, positive }: { label: string; value: string; change: string; positive: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-text-muted">{label}</span>
      <span className="text-text-primary font-semibold">{value}</span>
      <span className={positive ? 'text-bullish' : 'text-bearish'}>{change}</span>
    </div>
  );
}
