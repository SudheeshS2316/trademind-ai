import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { getLiveQuotes } from '../services/marketDataService';

export function setupWebSocket(httpServer: HttpServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  // Default symbols to track if no one explicitly subscribes
  const defaultSymbols = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'SBIN', 'ICICIBANK', 'ITC', 'BHARTIARTL'];
  
  // Track all subscribed symbols across clients
  let activeSymbols = new Set<string>(defaultSymbols);

  io.on('connection', (socket) => {
    console.log(`📡 Client connected: ${socket.id}`);

    socket.on('subscribe:prices', (symbols: string[]) => {
      socket.join('prices');
      symbols.forEach(sym => activeSymbols.add(sym));
      console.log(`📊 ${socket.id} subscribed to prices:`, symbols);
    });

    socket.on('subscribe:signals', () => {
      socket.join('signals');
      console.log(`⚡ ${socket.id} subscribed to signals`);
    });

    socket.on('subscribe:alerts', (userId: string) => {
      socket.join(`alerts:${userId}`);
      console.log(`🔔 ${socket.id} subscribed to alerts for user ${userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  // Poll Yahoo Finance every 10 seconds for real-time price updates
  // (We use 10 seconds to avoid hitting rate limits too quickly)
  
  setInterval(async () => {
    try {
      const symbolsToFetch = Array.from(activeSymbols);
      if (symbolsToFetch.length === 0) return;
      
      const ticks = await getLiveQuotes(symbolsToFetch);
      if (ticks && ticks.length > 0) {
        io.to('prices').emit('price:tick', ticks);
      }
    } catch (error) {
      console.error('WebSocket polling error:', error);
    }
  }, 10000);

  return io;
}

