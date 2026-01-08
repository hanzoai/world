import type { MarketData, CryptoData } from '@/types';
import { API_URLS, CRYPTO_MAP } from '@/config';
import { fetchWithProxy } from '@/utils';

interface YahooFinanceResponse {
  chart: {
    result: Array<{
      meta: {
        regularMarketPrice: number;
        chartPreviousClose?: number;
        previousClose?: number;
      };
    }>;
  };
}

interface CoinGeckoResponse {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
  };
}

export async function fetchStockQuote(
  symbol: string,
  name: string,
  display: string
): Promise<MarketData> {
  try {
    const url = API_URLS.yahooFinance(symbol);
    const response = await fetchWithProxy(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data: YahooFinanceResponse = await response.json();

    const meta = data.chart.result[0]?.meta;
    if (!meta) {
      return { symbol, name, display, price: null, change: null };
    }

    const price = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose || meta.previousClose || price;
    const change = ((price - prevClose) / prevClose) * 100;

    return {
      symbol,
      name,
      display,
      price,
      change,
    };
  } catch (e) {
    console.error(`Failed to fetch ${symbol}:`, e);
    return { symbol, name, display, price: null, change: null };
  }
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchMultipleStocks(
  symbols: Array<{ symbol: string; name: string; display: string }>
): Promise<MarketData[]> {
  const results: MarketData[] = [];
  // Sequential fetch with delay to avoid rate limiting
  for (const s of symbols) {
    const result = await fetchStockQuote(s.symbol, s.name, s.display);
    results.push(result);
    await delay(500); // 500ms delay between requests
  }
  return results.filter((r) => r.price !== null);
}

export async function fetchCrypto(): Promise<CryptoData[]> {
  try {
    const response = await fetchWithProxy(API_URLS.coingecko);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data: CoinGeckoResponse = await response.json();

    return Object.entries(CRYPTO_MAP).map(([id, info]) => {
      const coinData = data[id];
      return {
        name: info.name,
        symbol: info.symbol,
        price: coinData?.usd ?? 0,
        change: coinData?.usd_24h_change ?? 0,
      };
    });
  } catch (e) {
    console.error('Failed to fetch crypto:', e);
    return [];
  }
}
