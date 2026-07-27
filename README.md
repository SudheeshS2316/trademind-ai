# TradeMind AI 🚀

> **AI-powered swing trading platform for Indian stock markets (NSE/BSE)**

---

## 🌍 Deployed Project Links (Live)

* **Vercel Frontend:** [https://trademind-ai-pi.vercel.app](https://trademind-ai-pi.vercel.app)
* **Render Backend API:** [https://trademind-ai-9rck.onrender.com](https://trademind-ai-9rck.onrender.com)
* **API Health Check (for UptimeRobot):** [https://trademind-ai-9rck.onrender.com/api/health](https://trademind-ai-9rck.onrender.com/api/health)
* **Database (Neon PostgreSQL Connection String):**
  `postgresql://neondb_owner:npg_lDHG15KFVohx@ep-calm-moon-azep1k3g.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`

---

A production-ready, full-stack trading platform that delivers real-time market data, technical analysis-driven signals, portfolio tracking, and price alerts — built with a modern decoupled architecture.

---

## 📁 Repository Structure

```
TradeMind_AI/
├── trademind-ai/          # Next.js 16 Frontend
├── trademind-api-gateway/ # Node.js/Express Backend
└── prisma/                # Shared Prisma schema & PostgreSQL DB
```

---

## 🏗️ Architecture

| Layer    | Technology                                   |
|----------|----------------------------------------------|
| Frontend | Next.js 16, React 19, TypeScript, TailwindCSS |
| Backend  | Node.js, Express 5, TypeScript, Prisma (PostgreSQL) |
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

## 🌐 Hosting (Free Tier)

| Service | Platform | Cost |
|---------|----------|------|
| Frontend | [Vercel](https://vercel.com) | Free |
| Backend | [Render](https://render.com) | Free |
| Database | [Neon](https://neon.tech) | Free |
| Keep-alive | [UptimeRobot](https://uptimerobot.com) | Free |

### Deployment Order

**1. Neon (Database)**
- Sign up at [neon.tech](https://neon.tech) (no credit card)
- Create project → copy the **Connection String**

**2. Render (Backend)**
- Sign up at [render.com](https://render.com) (no credit card)
- New → Web Service → connect this GitHub repo
- Root Directory: `trademind-api-gateway`
- Build: `npm install && npx prisma generate && npm run build`
- Start: `npx prisma migrate deploy && npm run start`
- Env vars: `DATABASE_URL` (Neon string), `JWT_SECRET`, `PORT=5000`
- Copy your Render URL (`https://trademind-api.onrender.com`)

**3. Vercel (Frontend)**
- Sign up at [vercel.com](https://vercel.com) (no credit card)
- Import this repo → Root Directory: `trademind-ai`
- Env vars: `NEXT_PUBLIC_API_URL` + `NEXT_PUBLIC_WS_URL` = your Render URL
- Deploy → copy your Vercel URL

**4. Finish CORS**
- Render → your service → Environment → add `FRONTEND_URL` = your Vercel URL → Redeploy

**5. UptimeRobot (Keep-alive)**
- Sign up at [uptimerobot.com](https://uptimerobot.com) (no credit card)
- Add monitor → HTTP(s) → `https://your-backend.onrender.com/api/health`
- Interval: **5 minutes** — keeps the backend alive 24/7

---

## 🚀 Running Locally

You need **two terminal sessions** and a **Neon database** (same DB used for both local and production).

### Step 0 — Set up local env

```powershell
# trademind-api-gateway/.env — paste your Neon connection string
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/trademind?sslmode=require"
JWT_SECRET="any_long_random_string"
PORT=5000
```

```powershell
# trademind-ai/.env — keep as-is for local dev
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=http://localhost:5000
```

### Terminal 1 — Backend API (port 5000)

```powershell
cd trademind-api-gateway
$env:PATH = "C:\Program Files\nodejs;$env:PATH"
npm install
npx prisma generate
npx prisma migrate dev   # Creates tables in your Neon DB
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
| GET    | `/api/health`             | Health check (used by UptimeRobot) | ❌ |

---

## 🤝 Contributing

This is a personal project. Feel free to fork and build upon it!

---

*Built with ❤️ for Indian retail traders*

