const YF = require('yahoo-finance2').default;
const yf = new YF({ suppressNotices: ['yahooSurvey'] });

import fs from 'fs';
import path from 'path';
import { LARGE_MID_CAP_UNIVERSE } from '../data/stockUniverse';
import * as mockMarket from './mockMarketData';

const NIFTY_SYMBOL = '^NSEI';
const BANK_NIFTY_SYMBOL = '^NSEBANK';
const SENSEX_SYMBOL = '^BSESN';

export async function getMarketOverview() {
  try {
    const [nifty, bankNifty, sensex] = await Promise.all([
      yf.quote(NIFTY_SYMBOL).catch(() => null),
      yf.quote(BANK_NIFTY_SYMBOL).catch(() => null),
      yf.quote(SENSEX_SYMBOL).catch(() => null)
    ]);

    if (!nifty && !bankNifty && !sensex) {
      console.warn('⚠️ Yahoo Finance API returned null. Falling back to mock market overview.');
      return mockMarket.getMarketOverview();
    }

    return {
      nifty: {
        name: 'NIFTY 50',
        value: nifty?.regularMarketPrice || mockMarket.getMarketOverview().nifty.value,
        change: nifty?.regularMarketChange || mockMarket.getMarketOverview().nifty.change,
        changePercent: nifty?.regularMarketChangePercent || mockMarket.getMarketOverview().nifty.changePercent,
        isPositive: (nifty?.regularMarketChange || 0) >= 0
      },
      bankNifty: {
        name: 'BANK NIFTY',
        value: bankNifty?.regularMarketPrice || mockMarket.getMarketOverview().bankNifty.value,
        change: bankNifty?.regularMarketChange || mockMarket.getMarketOverview().bankNifty.change,
        changePercent: bankNifty?.regularMarketChangePercent || mockMarket.getMarketOverview().bankNifty.changePercent,
        isPositive: (bankNifty?.regularMarketChange || 0) >= 0
      },
      sensex: {
        name: 'SENSEX',
        value: sensex?.regularMarketPrice || 0,
        change: sensex?.regularMarketChange || 0,
        changePercent: sensex?.regularMarketChangePercent || 0,
        isPositive: (sensex?.regularMarketChange || 0) >= 0
      },
      marketSentiment: (nifty?.regularMarketChange || 0) >= 0 ? 'Bullish' : 'Bearish',
      marketStatus: nifty?.marketState === 'REGULAR' ? 'open' : 'closed',
    };
  } catch (error) {
    console.error('Error fetching market overview, falling back to mock:', error);
    return mockMarket.getMarketOverview();
  }
}

export async function getTrendingStocks() {
  const symbols = LARGE_MID_CAP_UNIVERSE.map(s => `${s.symbol}.NS`);
  
  try {
    const quotes = await Promise.all(symbols.map(sym => yf.quote(sym).catch(() => null)));
    const filtered = quotes.filter((q: any) => q !== null && q !== undefined && q.symbol);
    
    if (filtered.length === 0) {
      console.warn('⚠️ Yahoo Finance quotes failed. Falling back to mock trending stocks.');
      return mockMarket.getTrendingStocks();
    }
    
    return filtered
      .map((q: any) => ({
        symbol: q.symbol.replace('.NS', ''),
        name: q.shortName || LARGE_MID_CAP_UNIVERSE.find(s => `${s.symbol}.NS` === q.symbol)?.name || q.symbol,
        price: q.regularMarketPrice || 0,
        change: q.regularMarketChange || 0,
        changePercent: q.regularMarketChangePercent || 0,
        volume: q.regularMarketVolume || 0
      }))
      .sort((a: any, b: any) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
      .slice(0, 10);
  } catch (error) {
    console.error('Failed to fetch trending stocks, falling back to mock:', error);
    return mockMarket.getTrendingStocks();
  }
}

export async function getSectorPerformance() {
  const sectors = [
    { name: 'IT', symbol: '^CNXIT' },
    { name: 'Banking', symbol: '^NSEBANK' },
    { name: 'Pharma', symbol: '^CNXPHARMA' },
    { name: 'Auto', symbol: '^CNXAUTO' },
    { name: 'FMCG', symbol: '^CNXFMCG' },
    { name: 'Metal', symbol: '^CNXMETAL' },
    { name: 'Energy', symbol: '^CNXENERGY' },
    { name: 'Realty', symbol: '^CNXREALTY' },
    { name: 'Media', symbol: '^CNXMEDIA' },
    { name: 'Infra', symbol: '^CNXINFRA' },
    { name: 'PSU Bank', symbol: '^CNXPSUBANK' },
    { name: 'Fin Svc', symbol: '^CNXFIN' }
  ];

  try {
    const quotes = await Promise.all(sectors.map(s => yf.quote(s.symbol).catch(() => null)));
    if (quotes.every(q => q === null)) {
      console.warn('⚠️ Yahoo Finance sectors failed. Falling back to mock sector performance.');
      return mockMarket.getSectorPerformance();
    }

    return sectors.map((s, i) => {
      const q: any = quotes[i];
      return {
        name: s.name,
        change: q?.regularMarketChangePercent || 0,
        marketCap: q?.marketCap ? `${(q.marketCap / 10000000000).toFixed(1)}L Cr` : '—'
      };
    });
  } catch (error) {
    console.error('Failed to fetch sector performance, falling back to mock:', error);
    return mockMarket.getSectorPerformance();
  }
}

export async function getHistoricalData(symbol: string, period1: string, interval: '1d' | '1wk' | '1mo' | '1m' | '5m' | '15m' | '60m' = '1d') {
  try {
    const formattedSymbol = symbol.includes('.NS') || symbol.startsWith('^') ? symbol : `${symbol}.NS`;
    const queryOptions: any = { period1: period1, interval: interval };
    const result = await yf.chart(formattedSymbol, queryOptions);
    
    if (!result || !result.quotes || result.quotes.length === 0) {
      console.warn(`⚠️ Empty historical data for ${symbol}. Falling back to mock historical data.`);
      return mockMarket.getHistoricalData(symbol);
    }

    return result.quotes.map((q: any) => ({
      time: Math.floor(new Date(q.date).getTime() / 1000), // UNIX timestamp
      open: q.open,
      high: q.high,
      low: q.low,
      close: q.close,
      volume: q.volume
    })).filter((q: any) => q.open !== null && q.close !== null);
  } catch (error) {
    console.error(`Failed to fetch historical data for ${symbol}, falling back to mock:`, error);
    return mockMarket.getHistoricalData(symbol);
  }
}

export async function getLiveQuotes(symbols: string[]) {
  try {
    const formattedSymbols = symbols.map(s => s.includes('.NS') || s.startsWith('^') ? s : `${s}.NS`);
    const quotes = await Promise.all(formattedSymbols.map(sym => yf.quote(sym).catch(() => null)));
    
    const filtered = quotes.filter(q => q !== null && q !== undefined);
    if (filtered.length === 0) {
      return symbols.map(sym => {
        const base = sym === 'RELIANCE' ? 2850 : sym === 'TCS' ? 3900 : sym === 'INFY' ? 1450 : 1000;
        const change = (Math.random() - 0.47) * base * 0.015;
        return {
          symbol: sym,
          price: Math.round((base + change) * 100) / 100,
          change: Math.round(change * 100) / 100,
          changePercent: Math.round((change / base * 100) * 100) / 100,
          volume: Math.round(Math.random() * 1000000),
          timestamp: Date.now(),
        };
      });
    }

    return filtered.map((q: any) => ({
      symbol: q.symbol ? q.symbol.replace('.NS', '') : '',
      price: q.regularMarketPrice || 0,
      change: q.regularMarketChange || 0,
      changePercent: q.regularMarketChangePercent || 0,
      volume: q.regularMarketVolume || 0,
      timestamp: Date.now(),
    })).filter(q => q.symbol !== '');
  } catch (error) {
    console.error('Failed to fetch live quotes, falling back to mock:', error);
    return symbols.map(sym => {
      const base = sym === 'RELIANCE' ? 2850 : sym === 'TCS' ? 3900 : sym === 'INFY' ? 1450 : 1000;
      const change = (Math.random() - 0.47) * base * 0.015;
      return {
        symbol: sym,
        price: Math.round((base + change) * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round((change / base * 100) * 100) / 100,
        volume: Math.round(Math.random() * 1000000),
        timestamp: Date.now(),
      };
    });
  }
}

export async function searchStocks(query: string) {
  try {
    const q = query.toLowerCase();
    
    // Read local stock DB
    const dbPath = path.join(__dirname, '../data/nse_stocks.json');
    if (!fs.existsSync(dbPath)) return [];
    
    const stocksData = fs.readFileSync(dbPath, 'utf8');
    const stocks = JSON.parse(stocksData);
    
    // Filter stocks by query
    const results = stocks
      .filter((s: any) => s.symbol.toLowerCase().includes(q) || (s.name && s.name.toLowerCase().includes(q)))
      .slice(0, 10);
      
    return results;
  } catch (error) {
    console.error('Failed to search stocks', error);
    return [];
  }
}
