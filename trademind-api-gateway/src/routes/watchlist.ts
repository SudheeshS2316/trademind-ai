import { Router, Response } from 'express';
import { prisma } from '../prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { getLiveQuotes } from '../services/marketDataService';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.watchlist.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'desc' } });
    if (items.length === 0) {
      return res.json([]);
    }
    
    // Fetch live quotes (real or mock fallback) for all watchlisted symbols
    const symbols = items.map(i => i.stockSymbol);
    const quotes = await getLiveQuotes(symbols);
    
    const result = items.map(item => {
      const quote = quotes.find(q => q.symbol === item.stockSymbol);
      return {
        id: item.id,
        stockSymbol: item.stockSymbol,
        createdAt: item.createdAt,
        price: quote?.price || 0,
        change: quote?.change || 0,
        changePercent: quote?.changePercent || 0,
        volume: quote?.volume || 0
      };
    });
    
    res.json(result);
  } catch (error) { res.status(500).json({ message: 'Error fetching watchlist', error }); }
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { symbol } = req.body;
    if (!symbol) return res.status(400).json({ message: 'Symbol is required' });
    const item = await prisma.watchlist.create({ data: { userId: req.userId!, stockSymbol: symbol.toUpperCase() } });
    res.status(201).json(item);
  } catch (error: any) {
    if (error?.code === 'P2002') return res.status(400).json({ message: 'Already in watchlist' });
    res.status(500).json({ message: 'Error adding to watchlist', error });
  }
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.watchlist.delete({ where: { id: String(req.params.id) } });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ message: 'Error removing from watchlist', error }); }
});

export default router;
