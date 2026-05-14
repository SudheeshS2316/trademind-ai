'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';

interface PriceTick {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
}

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [priceTicks, setPriceTicks] = useState<PriceTick[]>([]);

  useEffect(() => {
    const socket = io(WS_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      // Auto-subscribe to price updates
      socket.emit('subscribe:prices', ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'SBIN']);
      socket.emit('subscribe:signals');
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('price:tick', (ticks: PriceTick[]) => {
      setPriceTicks(ticks);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const subscribeAlerts = useCallback((userId: string) => {
    socketRef.current?.emit('subscribe:alerts', userId);
  }, []);

  return { connected, priceTicks, subscribeAlerts, socket: socketRef.current };
}
