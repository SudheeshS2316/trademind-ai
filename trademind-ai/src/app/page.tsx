'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Zap,
  Shield,
  BarChart3,
  Bell,
  Eye,
  FlaskConical,
  Brain,
  ArrowRight,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-terminal-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-terminal-600/50 bg-terminal-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/20">
              <TrendingUp size={20} className="text-accent" />
            </div>
            <span className="text-xl font-bold">
              Trade<span className="text-accent">Mind</span> AI
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-bullish/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-sm text-accent">
              <Zap size={14} />
              AI-Powered Trading Intelligence
            </div>
            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-text-primary lg:text-6xl">
              Trade Smarter with{' '}
              <span className="bg-gradient-to-r from-accent to-bullish bg-clip-text text-transparent">
                AI-Powered
              </span>{' '}
              Insights
            </h1>
            <p className="mb-10 text-lg text-text-secondary lg:text-xl">
              Advanced swing trading signals for Indian stock markets. Get AI-generated setups,
              risk management, real-time analytics, and intelligent alerts — all in one platform.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/signup">
                <Button size="lg" icon={<ArrowRight size={18} />}>
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 rounded-2xl border border-terminal-600 bg-terminal-800 p-2 shadow-2xl shadow-accent/5">
            <div className="flex items-center gap-2 border-b border-terminal-600 px-4 py-2">
              <div className="h-3 w-3 rounded-full bg-bearish/60" />
              <div className="h-3 w-3 rounded-full bg-warning/60" />
              <div className="h-3 w-3 rounded-full bg-bullish/60" />
              <span className="ml-2 text-xs text-text-muted">TradeMind AI Dashboard</span>
            </div>
            <div className="grid grid-cols-4 gap-3 p-4">
              {[
                { label: 'NIFTY 50', val: '22,450', chg: '+0.85%', pos: true },
                { label: 'BANK NIFTY', val: '48,720', chg: '-0.32%', pos: false },
                { label: 'AI Signals', val: '12', chg: 'Active', pos: true },
                { label: 'Win Rate', val: '73%', chg: 'Last 30d', pos: true },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-terminal-900 p-3">
                  <p className="text-xs text-text-muted">{item.label}</p>
                  <p className="mt-1 text-xl font-bold font-mono text-text-primary">{item.val}</p>
                  <p className={`text-xs ${item.pos ? 'text-bullish' : 'text-bearish'}`}>{item.chg}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-terminal-600/50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-text-primary lg:text-4xl">
              Everything you need to trade confidently
            </h2>
            <p className="text-lg text-text-secondary">
              Professional-grade tools powered by artificial intelligence
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Brain, title: 'AI Signals', desc: 'AI-generated swing trading setups with confidence scores and risk analysis' },
              { icon: Shield, title: 'Risk Management', desc: 'Automated position sizing, stop-loss, and risk-reward calculations' },
              { icon: BarChart3, title: 'Live Analytics', desc: 'Real-time market data, sector trends, and portfolio performance' },
              { icon: Bell, title: 'Smart Alerts', desc: 'Instant notifications for price targets, stop-losses, and breakouts' },
              { icon: Eye, title: 'Watchlists', desc: 'Track your favorite stocks with AI confidence scores' },
              { icon: FlaskConical, title: 'Backtesting', desc: 'Test strategies against historical data with detailed metrics' },
              { icon: TrendingUp, title: 'Paper Trading', desc: 'Practice with virtual capital before risking real money' },
              { icon: Zap, title: 'Real-time Data', desc: 'WebSocket-powered live price feeds and instant updates' },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-terminal-600 bg-terminal-800 p-6 transition-all duration-300 hover:border-accent/30 hover:bg-terminal-700"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent/20">
                  <feature.icon size={24} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-text-primary">{feature.title}</h3>
                <p className="text-sm text-text-secondary">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-terminal-600/50 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-text-primary lg:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-text-secondary">Start free, upgrade when you&apos;re ready</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {/* Free Plan */}
            <div className="rounded-2xl border border-terminal-600 bg-terminal-800 p-8">
              <h3 className="text-xl font-bold text-text-primary">Free</h3>
              <p className="mt-1 text-sm text-text-muted">Get started with basic features</p>
              <div className="my-6">
                <span className="text-4xl font-bold font-mono text-text-primary">₹0</span>
                <span className="text-text-muted"> /month</span>
              </div>
              <ul className="mb-8 space-y-3">
                {['5 AI Signals / day', '1 Watchlist', 'Basic alerts', 'Market overview', 'Paper trading'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                    <Check size={16} className="text-bullish" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button variant="outline" className="w-full">Get Started Free</Button>
              </Link>
            </div>
            {/* Pro Plan */}
            <div className="relative rounded-2xl border border-accent/30 bg-terminal-800 p-8 shadow-lg shadow-accent/5">
              <div className="absolute -top-3 right-6 rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">
                POPULAR
              </div>
              <h3 className="text-xl font-bold text-text-primary">Pro</h3>
              <p className="mt-1 text-sm text-text-muted">For serious traders</p>
              <div className="my-6">
                <span className="text-4xl font-bold font-mono text-text-primary">₹999</span>
                <span className="text-text-muted"> /month</span>
              </div>
              <ul className="mb-8 space-y-3">
                {[
                  'Unlimited AI Signals',
                  'Unlimited Watchlists',
                  'Advanced alerts',
                  'Full analytics suite',
                  'Backtesting engine',
                  'Priority support',
                  'API access',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                    <Check size={16} className="text-accent" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button className="w-full">Start Pro Trial</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-terminal-600/50 py-12">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp size={20} className="text-accent" />
            <span className="text-lg font-bold">
              Trade<span className="text-accent">Mind</span> AI
            </span>
          </div>
          <p className="text-sm text-text-muted">
            © 2025 TradeMind AI. AI-powered swing trading research platform for Indian markets.
          </p>
          <p className="mt-2 text-xs text-text-muted">
            Disclaimer: TradeMind AI is a research tool. Not financial advice. Trading involves risk.
          </p>
        </div>
      </footer>
    </div>
  );
}
