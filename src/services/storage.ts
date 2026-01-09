const DB_NAME = 'worldmonitor_db';
const DB_VERSION = 1;

interface BaselineEntry {
  key: string;
  counts: number[];
  timestamps: number[];
  avg7d: number;
  avg30d: number;
  lastUpdated: number;
}

let db: IDBDatabase | null = null;

export async function initDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      if (!database.objectStoreNames.contains('baselines')) {
        database.createObjectStore('baselines', { keyPath: 'key' });
      }

      if (!database.objectStoreNames.contains('snapshots')) {
        const store = database.createObjectStore('snapshots', { keyPath: 'timestamp' });
        store.createIndex('by_time', 'timestamp');
      }
    };
  });
}

export async function getBaseline(key: string): Promise<BaselineEntry | null> {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const tx = database.transaction('baselines', 'readonly');
    const store = tx.objectStore('baselines');
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function updateBaseline(key: string, currentCount: number): Promise<BaselineEntry> {
  const database = await initDB();
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  let entry = await getBaseline(key);

  if (!entry) {
    entry = {
      key,
      counts: [currentCount],
      timestamps: [now],
      avg7d: currentCount,
      avg30d: currentCount,
      lastUpdated: now,
    };
  } else {
    entry.counts.push(currentCount);
    entry.timestamps.push(now);

    const cutoff30d = now - 30 * DAY_MS;
    const validIndices = entry.timestamps
      .map((t, i) => (t > cutoff30d ? i : -1))
      .filter(i => i >= 0);

    entry.counts = validIndices.map(i => entry!.counts[i]!);
    entry.timestamps = validIndices.map(i => entry!.timestamps[i]!);

    const cutoff7d = now - 7 * DAY_MS;
    const last7dCounts = entry.counts.filter((_, i) => entry!.timestamps[i]! > cutoff7d);

    entry.avg7d = last7dCounts.length > 0
      ? last7dCounts.reduce((a, b) => a + b, 0) / last7dCounts.length
      : currentCount;

    entry.avg30d = entry.counts.length > 0
      ? entry.counts.reduce((a, b) => a + b, 0) / entry.counts.length
      : currentCount;

    entry.lastUpdated = now;
  }

  return new Promise((resolve, reject) => {
    const tx = database.transaction('baselines', 'readwrite');
    const store = tx.objectStore('baselines');
    const request = store.put(entry);

    request.onsuccess = () => resolve(entry!);
    request.onerror = () => reject(request.error);
  });
}

export function calculateDeviation(current: number, baseline: BaselineEntry): {
  zScore: number;
  percentChange: number;
  level: 'normal' | 'elevated' | 'spike' | 'quiet';
} {
  const avg = baseline.avg7d;
  const counts = baseline.counts;

  if (counts.length < 3) {
    return { zScore: 0, percentChange: 0, level: 'normal' };
  }

  const variance = counts.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) / counts.length;
  const stdDev = Math.sqrt(variance) || 1;

  const zScore = (current - avg) / stdDev;
  const percentChange = avg > 0 ? ((current - avg) / avg) * 100 : 0;

  let level: 'normal' | 'elevated' | 'spike' | 'quiet' = 'normal';
  if (zScore > 2.5) level = 'spike';
  else if (zScore > 1.5) level = 'elevated';
  else if (zScore < -2) level = 'quiet';

  return {
    zScore: Math.round(zScore * 100) / 100,
    percentChange: Math.round(percentChange),
    level,
  };
}

export async function getAllBaselines(): Promise<BaselineEntry[]> {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const tx = database.transaction('baselines', 'readonly');
    const store = tx.objectStore('baselines');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}
