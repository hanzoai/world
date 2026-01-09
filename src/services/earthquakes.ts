import type { Earthquake } from '@/types';
import { API_URLS } from '@/config';

interface USGSFeature {
  id: string;
  properties: {
    place: string;
    mag: number;
    time: number;
    url: string;
  };
  geometry: {
    coordinates: [number, number, number];
  };
}

interface USGSResponse {
  features: USGSFeature[];
}

const CORS_PROXY = 'https://corsproxy.io/?';
const DIRECT_USGS_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson';

async function fetchWithTimeout(url: string, timeoutMs: number = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
}

async function fetchWithRetry(url: string, retries = 2): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const proxiedUrl = import.meta.env.DEV ? url : (CORS_PROXY + encodeURIComponent(DIRECT_USGS_URL));
      const response = await fetchWithTimeout(proxiedUrl, 8000);
      if (response.ok) return response;
      console.warn(`[Earthquakes] Attempt ${i + 1} failed with status ${response.status}`);
    } catch (e) {
      console.warn(`[Earthquakes] Attempt ${i + 1} failed:`, e);
      if (i === retries - 1) {
        if (import.meta.env.DEV) {
          console.log('[Earthquakes] Trying CORS proxy fallback...');
          try {
            const corsResponse = await fetchWithTimeout(CORS_PROXY + encodeURIComponent(DIRECT_USGS_URL), 10000);
            if (corsResponse.ok) return corsResponse;
          } catch (corsErr) {
            console.error('[Earthquakes] CORS proxy also failed:', corsErr);
          }
        }
        throw e;
      }
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw new Error('All retries failed');
}

export async function fetchEarthquakes(): Promise<Earthquake[]> {
  console.log('[Earthquakes] Fetching from:', API_URLS.earthquakes);
  try {
    const response = await fetchWithRetry(API_URLS.earthquakes);
    console.log('[Earthquakes] Response status:', response.status);
    const data: USGSResponse = await response.json();
    console.log('[Earthquakes] Got', data.features?.length ?? 0, 'features');

    const earthquakes = data.features.map((feature) => ({
      id: feature.id,
      place: feature.properties.place || 'Unknown',
      magnitude: feature.properties.mag,
      lon: feature.geometry.coordinates[0],
      lat: feature.geometry.coordinates[1],
      depth: feature.geometry.coordinates[2],
      time: new Date(feature.properties.time),
      url: feature.properties.url,
    }));

    console.log('[Earthquakes] Mapped', earthquakes.length, 'earthquakes');
    return earthquakes;
  } catch (e) {
    console.error('[Earthquakes] Failed to fetch after retries:', e);
    return [];
  }
}
