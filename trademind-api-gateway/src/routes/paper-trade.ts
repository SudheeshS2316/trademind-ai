import { Router, Response } from 'express';
import { prisma } from '../prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const trades = await prisma.paperTrade.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'desc' } });
    res.json(trades);
  } catch (error) { res.status(500).json({ message: 'Error fetching trades', error }); }
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { symbol, entryPrice, quantity, direction } = req.body;
    if (!symbol || !entryPrice || !quantity) return res.status(400).json({ message: 'Symbol, entryPrice, and quantity are required' });
    const trade = await prisma.paperTrade.create({ data: { userId: req.userId!, stockSymbol: symbol.toUpperCase(), entryPrice: Number(entryPrice), quantity: Number(quantity), direction: direction || 'LONG' } });
    res.status(201).json(trade);
  } catch (error) { res.status(500).json({ message: 'Error creating trade', error }); }
});

router.patch('/:id/close', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { exitPrice } = req.body;
    if (!exitPrice) return res.status(400).json({ message: 'exitPrice is required' });
    const trade = await prisma.paperTrade.findUnique({ where: { id: String(req.params.id) } });
    if (!trade) return res.status(404).json({ message: 'Trade not found' });
    const pnl = trade.direction === 'LONG' ? (Number(exitPrice) - trade.entryPrice) * trade.quantity : (trade.entryPrice - Number(exitPrice)) * trade.quantity;
    const updated = await prisma.paperTrade.update({ where: { id: String(req.params.id) }, data: { exitPrice: Number(exitPrice), pnl, status: 'CLOSED' } });
    res.json(updated);
  } catch (error) { res.status(500).json({ message: 'Error closing trade', error }); }
});

export default router;
