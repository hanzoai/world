import type { ClusteredEvent, PredictionMarket, MarketData } from '@/types';

export type SignalType = 'prediction_leads_news' | 'news_leads_markets' | 'silent_divergence' | 'velocity_spike';

export interface CorrelationSignal {
  id: string;
  type: SignalType;
  title: string;
  description: string;
  confidence: number;
  timestamp: Date;
  data: {
    newsVelocity?: number;
    marketChange?: number;
    predictionShift?: number;
    relatedTopics?: string[];
  };
}

interface StreamSnapshot {
  newsVelocity: Map<string, number>;
  marketChanges: Map<string, number>;
  predictionChanges: Map<string, number>;
  timestamp: number;
}

const PREDICTION_SHIFT_THRESHOLD = 5;
const MARKET_MOVE_THRESHOLD = 2;
const NEWS_VELOCITY_THRESHOLD = 3;

let previousSnapshot: StreamSnapshot | null = null;
const signalHistory: CorrelationSignal[] = [];

function generateSignalId(): string {
  return `sig-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function extractTopics(events: ClusteredEvent[]): Map<string, number> {
  const topics = new Map<string, number>();

  const keywords = [
    'iran', 'israel', 'ukraine', 'russia', 'china', 'taiwan', 'oil', 'crypto',
    'fed', 'interest', 'inflation', 'recession', 'war', 'sanctions', 'tariff',
    'ai', 'tech', 'layoff', 'trump', 'biden', 'election',
  ];

  for (const event of events) {
    const title = event.primaryTitle.toLowerCase();
    for (const kw of keywords) {
      if (title.includes(kw)) {
        const velocity = event.velocity?.sourcesPerHour ?? 0;
        topics.set(kw, (topics.get(kw) ?? 0) + velocity + event.sourceCount);
      }
    }
  }

  return topics;
}

function findRelatedTopics(prediction: string): string[] {
  const title = prediction.toLowerCase();
  const related: string[] = [];

  const mappings: Record<string, string[]> = {
    'iran': ['iran', 'israel', 'oil', 'sanctions'],
    'israel': ['israel', 'iran', 'war', 'gaza'],
    'ukraine': ['ukraine', 'russia', 'war', 'nato'],
    'russia': ['russia', 'ukraine', 'sanctions'],
    'china': ['china', 'taiwan', 'tariff', 'trade'],
    'taiwan': ['taiwan', 'china'],
    'trump': ['trump', 'election', 'tariff'],
    'fed': ['fed', 'interest', 'inflation', 'recession'],
    'bitcoin': ['crypto', 'bitcoin'],
    'recession': ['recession', 'fed', 'inflation'],
  };

  for (const [key, topics] of Object.entries(mappings)) {
    if (title.includes(key)) {
      related.push(...topics);
    }
  }

  return [...new Set(related)];
}

export function analyzeCorrelations(
  events: ClusteredEvent[],
  predictions: PredictionMarket[],
  markets: MarketData[]
): CorrelationSignal[] {
  const signals: CorrelationSignal[] = [];
  const now = Date.now();

  const newsTopics = extractTopics(events);

  const currentSnapshot: StreamSnapshot = {
    newsVelocity: newsTopics,
    marketChanges: new Map(markets.map(m => [m.symbol, m.change ?? 0])),
    predictionChanges: new Map(predictions.map(p => [p.title.slice(0, 50), p.yesPrice])),
    timestamp: now,
  };

  if (!previousSnapshot) {
    previousSnapshot = currentSnapshot;
    return signals;
  }

  // Detect prediction shifts
  for (const pred of predictions) {
    const key = pred.title.slice(0, 50);
    const prev = previousSnapshot.predictionChanges.get(key);
    if (prev !== undefined) {
      const shift = Math.abs(pred.yesPrice - prev);
      if (shift >= PREDICTION_SHIFT_THRESHOLD) {
        const related = findRelatedTopics(pred.title);
        const newsActivity = related.reduce((sum, t) => sum + (newsTopics.get(t) ?? 0), 0);

        if (newsActivity < NEWS_VELOCITY_THRESHOLD) {
          signals.push({
            id: generateSignalId(),
            type: 'prediction_leads_news',
            title: 'Prediction Market Shift',
            description: `"${pred.title.slice(0, 60)}..." moved ${shift > 0 ? '+' : ''}${shift.toFixed(1)}% with low news coverage`,
            confidence: Math.min(0.9, 0.5 + shift / 20),
            timestamp: new Date(),
            data: {
              predictionShift: shift,
              newsVelocity: newsActivity,
              relatedTopics: related,
            },
          });
        }
      }
    }
  }

  // Detect news velocity spikes without market reaction
  for (const [topic, velocity] of newsTopics) {
    const prevVelocity = previousSnapshot.newsVelocity.get(topic) ?? 0;
    if (velocity > NEWS_VELOCITY_THRESHOLD * 2 && velocity > prevVelocity * 2) {
      signals.push({
        id: generateSignalId(),
        type: 'velocity_spike',
        title: 'News Velocity Spike',
        description: `"${topic}" coverage surging: ${velocity.toFixed(1)} activity score`,
        confidence: Math.min(0.85, 0.4 + velocity / 20),
        timestamp: new Date(),
        data: {
          newsVelocity: velocity,
          relatedTopics: [topic],
        },
      });
    }
  }

  // Detect silent market divergence
  for (const market of markets) {
    const change = Math.abs(market.change ?? 0);
    if (change >= MARKET_MOVE_THRESHOLD) {
      const relatedNews = Array.from(newsTopics.entries())
        .filter(([k]) => market.name.toLowerCase().includes(k) || k.includes(market.symbol.toLowerCase()))
        .reduce((sum, [, v]) => sum + v, 0);

      if (relatedNews < 2) {
        signals.push({
          id: generateSignalId(),
          type: 'silent_divergence',
          title: 'Unexplained Market Move',
          description: `${market.name} moved ${market.change! > 0 ? '+' : ''}${market.change!.toFixed(2)}% with minimal news coverage`,
          confidence: Math.min(0.8, 0.4 + change / 10),
          timestamp: new Date(),
          data: {
            marketChange: market.change!,
            newsVelocity: relatedNews,
          },
        });
      }
    }
  }

  previousSnapshot = currentSnapshot;

  // Dedupe by type to avoid spam
  const uniqueSignals = signals.filter((sig, idx) =>
    signals.findIndex(s => s.type === sig.type) === idx
  );

  // Only return high-confidence signals
  return uniqueSignals.filter(s => s.confidence >= 0.6);
}

export function getRecentSignals(): CorrelationSignal[] {
  const cutoff = Date.now() - 30 * 60 * 1000; // Last 30 mins
  return signalHistory.filter(s => s.timestamp.getTime() > cutoff);
}

export function addToSignalHistory(signals: CorrelationSignal[]): void {
  signalHistory.push(...signals);
  // Keep only last 100 signals
  while (signalHistory.length > 100) {
    signalHistory.shift();
  }
}
