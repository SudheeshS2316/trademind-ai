import { Router, Response } from 'express';
import { prisma } from '../prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const alerts = await prisma.alert.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'desc' } });
    res.json(alerts);
  } catch (error) { res.status(500).json({ message: 'Error fetching alerts', error }); }
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { symbol, alertType, triggerPrice } = req.body;
    if (!symbol || !alertType || !triggerPrice) return res.status(400).json({ message: 'Symbol, alertType, and triggerPrice are required' });
    const alert = await prisma.alert.create({ data: { userId: req.userId!, stockSymbol: symbol.toUpperCase(), alertType, triggerPrice: Number(triggerPrice) } });
    res.status(201).json(alert);
  } catch (error) { res.status(500).json({ message: 'Error creating alert', error }); }
});

router.patch('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const alert = await prisma.alert.findUnique({ where: { id: String(req.params.id) } });
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    const updated = await prisma.alert.update({ where: { id: String(req.params.id) }, data: { isActive: !alert.isActive } });
    res.json(updated);
  } catch (error) { res.status(500).json({ message: 'Error updating alert', error }); }
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.alert.delete({ where: { id: String(req.params.id) } });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ message: 'Error deleting alert', error }); }
});

export default router;
