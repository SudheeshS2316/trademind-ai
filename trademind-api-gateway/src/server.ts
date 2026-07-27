import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { setupWebSocket } from './websocket/index';
import { initSignalScheduler } from './services/signalScheduler';

// Routes
import authRoutes from './routes/auth';
import marketRoutes from './routes/market';
import signalRoutes from './routes/signals';
import watchlistRoutes from './routes/watchlist';
import alertRoutes from './routes/alerts';
import portfolioRoutes from './routes/portfolio';
import paperTradeRoutes from './routes/paper-trade';
import backtestRoutes from './routes/backtest';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = ['http://localhost:3000'];
if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/signals', signalRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/paper-trades', paperTradeRoutes);
app.use('/api/backtest', backtestRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WebSocket setup
const io = setupWebSocket(httpServer);

// Background signal scheduler (runs during market hours)
initSignalScheduler(io);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 TradeMind API Gateway running at http://localhost:${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`📊 Endpoints: auth, market, signals, watchlist, alerts, portfolio, paper-trades, backtest`);
});