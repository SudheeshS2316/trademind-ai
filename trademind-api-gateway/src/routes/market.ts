import { Router } from 'express';
import { getMarketOverview, getTrendingStocks, getSectorPerformance, getHistoricalData, searchStocks } from '../services/marketDataService';

const router = Router();

router.get('/live', async (req, res) => {
  try {
    const data = await getMarketOverview();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch market overview' });
  }
});

router.get('/trending', async (req, res) => {
  try {
    const data = await getTrendingStocks();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trending stocks' });
  }
});

router.get('/sectors', async (req, res) => {
  try {
    const data = await getSectorPerformance();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sector performance' });
  }
});

router.get('/history', async (req, res) => {
  const { symbol, period1, interval } = req.query;
  
  if (!symbol || !period1) {
    res.status(400).json({ error: 'Missing required parameters: symbol, period1' });
    return;
  }

  try {
    const data = await getHistoricalData(
      symbol as string, 
      period1 as string, 
      (interval as any) || '1d'
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch historical data for ${symbol}` });
  }
});

router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q) {
    res.json([]);
    return;
  }
  
  try {
    const data = await searchStocks(q as string);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search stocks' });
  }
});

export default router;
