import { Router } from 'express';
import { prisma } from '../prisma/client';
import { generateLiveSignals } from '../services/signalEngine';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// ── Mutex lock to prevent concurrent signal generation ──────────────────────
let isGenerating = false;

async function generateWithLock(count: number) {
  if (isGenerating) {
    console.log('⚠️ Signal generation already in progress — skipping');
    return null;
  }
  isGenerating = true;
  try {
    return await generateLiveSignals(count);
  } finally {
    isGenerating = false;
  }
}

// Save signals to DB — skips duplicates for the same stock symbol
async function saveSignals(signals: Awaited<ReturnType<typeof generateLiveSignals>>) {
  const created = [];
  for (const s of signals) {
    // Skip if there's already an active signal for this stock
    const existing = await prisma.signal.findFirst({
      where: { stockSymbol: s.stockSymbol, status: 'ACTIVE' },
    });
    if (existing) continue;

    try {
      const signal = await prisma.signal.create({
        data: {
          stockSymbol: s.stockSymbol,
          stockName: s.stockName,
          entryPrice: s.entryPrice,
          stopLoss: s.stopLoss,
          targetPrice: s.targetPrice,
          confidenceScore: s.confidenceScore,
          riskReward: s.riskReward,
          direction: s.direction,
          aiReasoning: s.aiReasoning,
          status: 'ACTIVE',
        },
      });
      created.push(signal);
    } catch (err) {
      console.error(`Failed to save signal for ${s.stockSymbol}:`, err);
    }
  }
  return created;
}

// Seed signals if none are ACTIVE
async function ensureSignals() {
  const count = await prisma.signal.count({ where: { status: 'ACTIVE' } });
  if (count > 0) return; // Already have active signals

  console.log('🌱 No active signals — generating initial batch...');
  const signals = await generateWithLock(10);
  if (!signals || signals.length === 0) {
    console.warn('⚠️ generateWithLock returned nothing');
    return;
  }
  const saved = await saveSignals(signals);
  console.log(`✅ Seeded ${saved.length} signals`);
}

// GET /api/signals
router.get('/', authMiddleware, async (req, res) => {
  try {
    await ensureSignals();
    const signals = await prisma.signal.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(signals);
  } catch (error) {
    console.error('Error fetching signals:', error);
    res.status(500).json({ message: 'Error fetching signals', error });
  }
});

// GET /api/signals/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const signal = await prisma.signal.findUnique({ where: { id: String(req.params.id) } });
    if (!signal) return res.status(404).json({ message: 'Signal not found' });
    res.json(signal);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching signal', error });
  }
});

// POST /api/signals/refresh — expire active + generate fresh batch
router.post('/refresh', authMiddleware, async (req, res) => {
  if (isGenerating) {
    return res.status(429).json({ message: 'Signal generation already in progress. Please wait a moment.' });
  }

  try {
    // Expire all currently active signals
    await prisma.signal.updateMany({ where: { status: 'ACTIVE' }, data: { status: 'EXPIRED' } });

    const signals = await generateWithLock(8);
    if (!signals) {
      // Lock was already held — signals are being generated, fetch current state
      const current = await prisma.signal.findMany({ where: { status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } });
      return res.json(current);
    }

    const created = await saveSignals(signals);
    console.log(`🔄 Refreshed: created ${created.length} new signals`);
    res.json(created);
  } catch (error) {
    console.error('Error refreshing signals:', error);
    res.status(500).json({ message: 'Error refreshing signals', error });
  }
});

export default router;
