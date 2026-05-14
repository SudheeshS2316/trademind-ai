'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Zap,
  Eye,
  Bell,
  Briefcase,
  FlaskConical,
  Settings,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/signals', label: 'AI Signals', icon: Zap },
  { href: '/watchlist', label: 'Watchlist', icon: Eye },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { href: '/backtesting', label: 'Backtesting', icon: FlaskConical },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-full flex-col border-r border-terminal-600 bg-terminal-800 transition-all duration-300',
        collapsed ? 'w-[68px]' : 'w-[240px]',
        'hidden lg:flex'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-terminal-600 px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/20">
          <TrendingUp size={20} className="text-accent" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-text-primary animate-fade-in">
            Trade<span className="text-accent">Mind</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-accent/10 text-accent border border-accent/20'
                      : 'text-text-secondary hover:bg-terminal-700 hover:text-text-primary border border-transparent'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon size={20} className="shrink-0" />
                  {!collapsed && <span className="animate-fade-in">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-terminal-600 p-3">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-lg p-2 text-text-muted transition-colors hover:bg-terminal-700 hover:text-text-primary"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}
