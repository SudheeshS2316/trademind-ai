import { Router } from 'express';
import { prisma } from '../prisma/client';
import { generateLiveSignals } from '../services/signalEngine';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Seed signals if empty
async function ensureSignals() {
  const count = await prisma.signal.count();
  if (count === 0) {
    const signals = await generateLiveSignals(10);
    for (const s of signals) {
      await prisma.signal.create({ data: { stockSymbol: s.stockSymbol, entryPrice: s.entryPrice, stopLoss: s.stopLoss, targetPrice: s.targetPrice, confidenceScore: s.confidenceScore, riskReward: s.riskReward, direction: s.direction, aiReasoning: s.aiReasoning, status: 'ACTIVE' } });
    }
  }
}

router.get('/', authMiddleware, async (req, res) => {
  try {
    await ensureSignals();
    const signals = await prisma.signal.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(signals);
  } catch (error) { res.status(500).json({ message: 'Error fetching signals', error }); }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const signal = await prisma.signal.findUnique({ where: { id: String(req.params.id) } });
    if (!signal) return res.status(404).json({ message: 'Signal not found' });
    res.json(signal);
  } catch (error) { res.status(500).json({ message: 'Error fetching signal', error }); }
});

// Refresh signals (generate new batch)
router.post('/refresh', authMiddleware, async (req, res) => {
  try {
    await prisma.signal.updateMany({ where: { status: 'ACTIVE' }, data: { status: 'EXPIRED' } });
    const signals = await generateLiveSignals(8);
    const created = [];
    for (const s of signals) {
      const signal = await prisma.signal.create({ data: { stockSymbol: s.stockSymbol, entryPrice: s.entryPrice, stopLoss: s.stopLoss, targetPrice: s.targetPrice, confidenceScore: s.confidenceScore, riskReward: s.riskReward, direction: s.direction, aiReasoning: s.aiReasoning, status: 'ACTIVE' } });
      created.push(signal);
    }
    res.json(created);
  } catch (error) { res.status(500).json({ message: 'Error refreshing signals', error }); }
});

export default router;
