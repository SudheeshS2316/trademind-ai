import { Router, Response } from 'express';
import { prisma } from '../prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const portfolio = await prisma.portfolio.findUnique({ where: { userId: req.userId } });
    res.json(portfolio || { capital: 500000, riskProfile: 'MODERATE' });
  } catch (error) { res.status(500).json({ message: 'Error fetching portfolio', error }); }
});

router.get('/history', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // Mock portfolio history
    const history = Array.from({ length: 30 }, (_, i) => ({ date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0], value: 500000 + Math.round(Math.sin(i / 5) * 15000 + i * 800) }));
    res.json(history);
  } catch (error) { res.status(500).json({ message: 'Error fetching history', error }); }
});

export default router;
