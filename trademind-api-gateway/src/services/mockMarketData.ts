// Mock market data service for Indian markets

export function getMarketOverview() {
  const niftyBase = 22450;
  const bankNiftyBase = 48720;
  const niftyChange = Math.round((Math.random() - 0.45) * 400 * 100) / 100;
  const bankNiftyChange = Math.round((Math.random() - 0.5) * 600 * 100) / 100;

  return {
    nifty: { name: 'NIFTY 50', value: niftyBase + niftyChange, change: niftyChange, changePercent: Math.round(niftyChange / niftyBase * 10000) / 100, isPositive: niftyChange >= 0 },
    bankNifty: { name: 'BANK NIFTY', value: bankNiftyBase + bankNiftyChange, change: bankNiftyChange, changePercent: Math.round(bankNiftyChange / bankNiftyBase * 10000) / 100, isPositive: bankNiftyChange >= 0 },
    marketSentiment: niftyChange >= 0 ? 'Bullish' : 'Bearish',
    marketStatus: 'open',
  };
}

export function getTrendingStocks() {
  const stocks = [
    { symbol: 'RELIANCE', name: 'Reliance Industries', basePrice: 2850 },
    { symbol: 'TCS', name: 'Tata Consultancy', basePrice: 3900 },
    { symbol: 'INFY', name: 'Infosys', basePrice: 1450 },
    { symbol: 'HDFCBANK', name: 'HDFC Bank', basePrice: 1680 },
    { symbol: 'SBIN', name: 'State Bank of India', basePrice: 820 },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel', basePrice: 1520 },
    { symbol: 'ICICIBANK', name: 'ICICI Bank', basePrice: 1245 },
    { symbol: 'ITC', name: 'ITC Limited', basePrice: 452 },
    { symbol: 'TATAMOTORS', name: 'Tata Motors', basePrice: 950 },
    { symbol: 'LT', name: 'Larsen & Toubro', basePrice: 3450 },
  ];

  return stocks.map((s) => {
    const change = Math.round((Math.random() - 0.45) * s.basePrice * 0.05 * 100) / 100;
    return { symbol: s.symbol, name: s.name, price: s.basePrice + change, change, changePercent: Math.round(change / s.basePrice * 10000) / 100, volume: Math.round(Math.random() * 20000000) };
  }).sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
}

export function getSectorPerformance() {
  const sectors = ['IT', 'Banking', 'Pharma', 'Auto', 'FMCG', 'Metal', 'Energy', 'Realty', 'Media', 'Infra', 'PSU Bank', 'Fin Svc'];
  return sectors.map((name) => ({ name, change: Math.round((Math.random() - 0.45) * 6 * 100) / 100, marketCap: `${Math.round(Math.random() * 50 + 5)}L Cr` }));
}

export function getHistoricalData(symbol: string) {
  const result = [];
  const days = 100;
  const now = Math.floor(Date.now() / 1000);
  const oneDay = 24 * 60 * 60;
  
  // Choose seed price
  let price = 1000;
  if (symbol.includes('RELIANCE')) price = 2850;
  else if (symbol.includes('TCS')) price = 3900;
  else if (symbol.includes('INFY')) price = 1450;
  else if (symbol.includes('HDFCBANK')) price = 1680;
  else if (symbol.includes('SBIN')) price = 820;
  else if (symbol.includes('TATAMOTORS')) price = 950;
  
  for (let i = days; i >= 0; i--) {
    const time = now - i * oneDay;
    const change = (Math.random() - 0.47) * (price * 0.025);
    const open = Math.round(price * 100) / 100;
    const close = Math.round((price + change) * 100) / 100;
    const high = Math.round((Math.max(open, close) + Math.random() * (price * 0.015)) * 100) / 100;
    const low = Math.round((Math.min(open, close) - Math.random() * (price * 0.015)) * 100) / 100;
    const volume = Math.round(Math.random() * 5000000 + 500000);
    
    result.push({ time, open, high, low, close, volume });
    price = close;
  }
  return result;
}

