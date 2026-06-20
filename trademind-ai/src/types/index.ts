// ===== User & Auth =====

export interface User {
  id: string;
  name: string;
  email: string;
  riskProfile: 'LOW' | 'MODERATE' | 'HIGH';
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  riskProfile?: string;
}

// ===== Market Data =====

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
  isPositive: boolean;
}

export interface MarketOverview {
  nifty: MarketIndex;
  bankNifty: MarketIndex;
  marketSentiment: 'Bullish' | 'Bearish' | 'Neutral';
  marketStatus: 'open' | 'closed' | 'pre-open';
}

export interface TrendingStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

export interface SectorData {
  name: string;
  change: number;
  marketCap: string;
}

// ===== Signals =====

export interface Signal {
  id: string;
  stockSymbol: string;
  stockName?: string;
  entryPrice: number;
  stopLoss: number;
  targetPrice: number;
  confidenceScore: number;
  riskReward: number;
  aiReasoning: string;
  status: 'ACTIVE' | 'HIT_TARGET' | 'HIT_SL' | 'EXPIRED';
  direction: 'BULLISH' | 'BEARISH';
  createdAt: string;
}

// ===== Watchlist =====

export interface WatchlistItem {
  id: string;
  userId: string;
  stockSymbol: string;
  currentPrice?: number;
  change?: number;
  changePercent?: number;
  aiConfidence?: number;
  createdAt: string;
}

// ===== Alerts =====

export interface Alert {
  id: string;
  userId: string;
  stockSymbol: string;
  alertType: 'TARGET' | 'STOP_LOSS' | 'VOLUME_BREAKOUT' | 'PRICE_ABOVE' | 'PRICE_BELOW';
  triggerPrice: number;
  isActive: boolean;
  isTriggered: boolean;
  createdAt: string;
}

// ===== Paper Trading =====

export interface PaperTrade {
  id: string;
  userId: string;
  stockSymbol: string;
  entryPrice: number;
  exitPrice: number | null;
  quantity: number;
  pnl: number | null;
  status: 'OPEN' | 'CLOSED';
  direction: 'LONG' | 'SHORT';
  createdAt: string;
}

// ===== Backtesting =====

export interface BacktestRequest {
  strategy: string;
  period: string;
  symbol?: string;
}

export interface BacktestResult {
  id: string;
  userId: string;
  strategyName: string;
  winRate: number;
  sharpeRatio: number;
  drawdown: number;
  profitFactor: number;
  totalTrades: number;
  createdAt: string;
}

// ===== Portfolio =====

export interface Portfolio {
  id: string;
  userId: string;
  capital: number;
  riskProfile: string;
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  createdAt: string;
}

export interface PortfolioHistoryPoint {
  date: string;
  value: number;
}

// ===== Settings =====

export interface UserSettings {
  capitalPerTrade: number;
  riskTolerancePercent: number;
  riskRewardRatio: number;
  marketCategory: 'LARGE_CAP' | 'MID_CAP' | 'SMALL_CAP' | 'ALL';
  tradingStyle: 'SWING' | 'POSITIONAL' | 'INTRADAY';
}

// ===== WebSocket Events =====

export interface PriceTick {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
}

export interface SignalEvent {
  type: 'NEW_SIGNAL' | 'SIGNAL_UPDATE';
  signal: Signal;
}

export interface AlertEvent {
  type: 'ALERT_TRIGGERED';
  alert: Alert;
  currentPrice: number;
}
