import type { PredictionMarket } from '@/types';
import { fetchWithProxy } from '@/utils';

interface PolymarketMarket {
  question: string;
  outcomes?: string[];
  outcomePrices?: string[];
  volume?: string;
  volumeNum?: number;
  closed?: boolean;
}

export async function fetchPredictions(): Promise<PredictionMarket[]> {
  try {
    // Use /markets endpoint ordered by volume (most active first)
    const response = await fetchWithProxy(
      '/api/polymarket/markets?closed=false&order=volume&ascending=false&limit=25'
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data: PolymarketMarket[] = await response.json();

    return data
      .map((market) => {
        // Parse outcomePrices - it's an array of string prices
        const prices = market.outcomePrices;
        let yesPrice = 50; // default

        if (prices && prices.length >= 2) {
          // First price is typically "Yes" outcome
          const priceStr = prices[0];
          if (priceStr) {
            const parsed = parseFloat(priceStr);
            if (!isNaN(parsed)) {
              yesPrice = parsed * 100;
            }
          }
        }

        const volume = market.volumeNum ?? (market.volume ? parseFloat(market.volume) : 0);

        return {
          title: market.question || '',
          yesPrice,
          volume,
        };
      })
      .filter((p) => {
        // Filter out empty titles and ensure valid price
        if (!p.title || isNaN(p.yesPrice)) return false;

        // Filter for "interesting" markets - those with strong signals (far from 50%)
        // Keep markets where Yes is below 40% or above 60%
        const discrepancy = Math.abs(p.yesPrice - 50);
        return discrepancy > 10 || (p.volume && p.volume > 10000);
      })
      .slice(0, 12); // Limit to 12 predictions
  } catch (e) {
    console.error('Failed to fetch predictions:', e);
    return [];
  }
}
