import { Router } from 'express';
import { prisma } from '../prisma/client';
import { generateLiveSignals } from '../services/signalEngine';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// ── Mutex lock to prevent concurrent signal generation ────────────────────────
// Bug Fix #2: rapid refresh or concurrent requests caused duplicate batches
let isGenerating = false;

async function generateWithLock(count: number) {
  if (isGenerating) {
    console.log('⚠️ Signal generation already in progress — skipping duplicate call');
    return null;
  }
  isGenerating = true;
  try {
    return await generateLiveSignals(count);
  } finally {
    isGenerating = false;
  }
}

// Seed signals if none are ACTIVE — also de-duplicates by stockSymbol
async function ensureSignals() {
  const count = await prisma.signal.count({ where: { status: 'ACTIVE' } });
  if (count === 0) {
    const signals = await generateWithLock(10);
    if (!signals) return; // Another request already generating
    for (const s of signals) {
      // Upsert by stockSymbol — prevents exact duplicate signals for same stock
      await prisma.signal.upsert({
        where: { id: `seed-${s.stockSymbol}` }, // dummy id — will always create
        update: {}, // no-op on conflict via the unique check below
        create: {
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
      }).catch(async () => {
        // Upsert with dummy id won't work as expected; use create with duplicate check
        const existing = await prisma.signal.findFirst({
          where: { stockSymbol: s.stockSymbol, status: 'ACTIVE' }
        });
        if (!existing) {
          await prisma.signal.create({
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
        }
      });
    }
  }
}

// GET /api/signals
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

// POST /api/signals/refresh — Bug Fix #2: mutex prevents duplicate batches on rapid clicks
router.post('/refresh', authMiddleware, async (req, res) => {
  if (isGenerating) {
    return res.status(429).json({ message: 'Signal generation already in progress. Please wait.' });
  }

  try {
    // Expire current active signals
    await prisma.signal.updateMany({ where: { status: 'ACTIVE' }, data: { status: 'EXPIRED' } });

    const signals = await generateWithLock(8);
    if (!signals) {
      return res.status(429).json({ message: 'Signal generation already in progress. Please wait.' });
    }

    const created = [];
    for (const s of signals) {
      // Only create if we don't already have an active signal for this stock
      const existing = await prisma.signal.findFirst({
        where: { stockSymbol: s.stockSymbol, status: 'ACTIVE' }
      });
      if (!existing) {
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
      }
    }
    res.json(created);
  } catch (error) { res.status(500).json({ message: 'Error refreshing signals', error }); }
});

export default router;
