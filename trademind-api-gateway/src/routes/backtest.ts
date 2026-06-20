import { Router, Response } from 'express';
import { prisma } from '../prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { strategy, period } = req.body;
    // Mock backtest result
    const winRate = Math.round(50 + Math.random() * 25);
    const result = await prisma.backtestResult.create({
      data: {
        userId: req.userId!, strategyName: strategy || 'RSI Breakout',
        winRate, sharpeRatio: Math.round((0.5 + Math.random() * 1.5) * 100) / 100,
        drawdown: Math.round((5 + Math.random() * 15) * 100) / 100,
        profitFactor: Math.round((1 + Math.random() * 1.5) * 100) / 100,
        totalTrades: Math.round(30 + Math.random() * 150),
      },
    });
    res.json(result);
  } catch (error) { res.status(500).json({ message: 'Error running backtest', error }); }
});

router.get('/results', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const results = await prisma.backtestResult.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'desc' } });
    res.json(results);
  } catch (error) { res.status(500).json({ message: 'Error fetching results', error }); }
});

export default router;
