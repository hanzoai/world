import type { PredictionMarket } from '@/types';
import { API_URLS } from '@/config';
import { fetchWithProxy } from '@/utils';

interface PolymarketEvent {
  title: string;
  markets?: Array<{
    outcomePrices?: string[];
    volume?: string;
  }>;
}

export async function fetchPredictions(): Promise<PredictionMarket[]> {
  try {
    const response = await fetchWithProxy(API_URLS.polymarket);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data: PolymarketEvent[] = await response.json();

    return data
      .slice(0, 10)
      .map((event) => {
        const market = event.markets?.[0];
        const rawPrice = market?.outcomePrices?.[0];
        const parsed = rawPrice ? parseFloat(rawPrice) : NaN;
        const yesPrice = isNaN(parsed) ? 50 : parsed * 100;
        const volume = market?.volume ? parseFloat(market.volume) : undefined;

        return {
          title: event.title,
          yesPrice,
          volume,
        };
      })
      .filter((p) => p.title && !isNaN(p.yesPrice));
  } catch (e) {
    console.error('Failed to fetch predictions:', e);
    return [];
  }
}
