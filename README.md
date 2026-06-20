# TradeMind AI 🚀

> **AI-powered swing trading platform for Indian stock markets (NSE/BSE)**

A production-ready, full-stack trading platform that delivers real-time market data, technical analysis-driven signals, portfolio tracking, and price alerts — built with a modern decoupled architecture.

---

## 📁 Repository Structure

```
TradeMind_AI/
├── trademind-ai/          # Next.js 16 Frontend
├── trademind-api-gateway/ # Node.js/Express Backend
└── prisma/                # Shared Prisma schema & SQLite DB
```

---

## 🏗️ Architecture

| Layer    | Technology                                   |
|----------|----------------------------------------------|
| Frontend | Next.js 16, React 19, TypeScript, TailwindCSS |
| Backend  | Node.js, Express 5, TypeScript, Prisma (SQLite) |
| Realtime | Socket.IO (WebSockets)                        |
| Data     | yahoo-finance2 (live NSE/BSE data)            |
| Auth     | JWT + bcrypt                                  |
| Scheduler | node-cron (market-hours signal generation)   |

---

## ⚡ Core Features

- **Real-Time TA Signal Engine** — RSI, MACD, EMA Crossover, Bollinger Bands, Volume Analysis with confluence scoring (≥60 threshold)
- **Background Scheduler** — Auto-scans 35 large/mid-cap stocks every 15 min during market hours (9:15–15:30 IST, Mon–Fri)
- **Live Market Data** — NIFTY 50, BANK NIFTY, SENSEX + sparklines via Yahoo Finance
- **Local Stock Search** — Instant search across 1,486 NSE tickers (offline-first)
- **Paper Trading** — Track virtual trades with real-time PnL
- **Price Alerts** — User-defined price alerts per stock
- **WebSocket Feeds** — Price ticks pushed every 10 seconds

---

## 🚀 Running Locally

You need **two terminal sessions**. Ensure Node.js is in your PATH.

### Terminal 1 — Backend API (port 5000)

```powershell
cd trademind-api-gateway
$env:PATH = "C:\Program Files\nodejs;$env:PATH"
npm install
npx prisma generate
npm run dev
```

### Terminal 2 — Frontend (port 3000)

```powershell
cd trademind-ai
$env:PATH = "C:\Program Files\nodejs;$env:PATH"
npm install
npm run dev
```

Visit **http://localhost:3000** — sign up and start trading!

---

## 🔧 Environment Setup

### `trademind-api-gateway/.env`

```env
DATABASE_URL="file:../prisma/dev.db"
JWT_SECRET="your_super_secret_jwt_key_change_in_production"
PORT=5000
```

### `trademind-ai/.env`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=http://localhost:5000
```

---

## 📊 API Endpoints

| Method | Endpoint                  | Description               | Auth |
|--------|---------------------------|---------------------------|------|
| POST   | `/api/auth/signup`        | Create account            | ❌   |
| POST   | `/api/auth/login`         | Login                     | ❌   |
| GET    | `/api/auth/me`            | Get current user          | ✅   |
| GET    | `/api/market/live`        | NIFTY/SENSEX overview     | ❌   |
| GET    | `/api/market/trending`    | Top movers                | ❌   |
| GET    | `/api/market/sectors`     | Sector performance        | ❌   |
| GET    | `/api/market/history`     | OHLCV historical data     | ❌   |
| GET    | `/api/market/search`      | Local NSE stock search    | ❌   |
| GET    | `/api/signals`            | Active AI signals         | ✅   |
| POST   | `/api/signals/refresh`    | Regenerate signals        | ✅   |
| GET    | `/api/watchlist`          | User watchlist            | ✅   |
| POST   | `/api/watchlist`          | Add to watchlist          | ✅   |
| DELETE | `/api/watchlist/:id`      | Remove from watchlist     | ✅   |
| GET    | `/api/alerts`             | Price alerts              | ✅   |
| POST   | `/api/alerts`             | Create alert              | ✅   |
| GET    | `/api/portfolio`          | Portfolio summary         | ✅   |
| GET    | `/api/paper-trades`       | Paper trades list         | ✅   |
| POST   | `/api/paper-trades`       | Open paper trade          | ✅   |
| PATCH  | `/api/paper-trades/:id/close` | Close trade          | ✅   |
| POST   | `/api/backtest`           | Run backtest              | ✅   |
| GET    | `/api/backtest/results`   | Backtest history          | ✅   |

---

## 🤝 Contributing

This is a personal project. Feel free to fork and build upon it!

---

*Built with ❤️ for Indian retail traders*
