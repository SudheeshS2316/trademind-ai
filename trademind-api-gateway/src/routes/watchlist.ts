import { Router, Response } from 'express';
import { prisma } from '../prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.watchlist.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'desc' } });
    res.json(items);
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
