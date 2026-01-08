import type { Earthquake } from '@/types';
import { API_URLS } from '@/config';
import { fetchWithProxy } from '@/utils';

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

export async function fetchEarthquakes(): Promise<Earthquake[]> {
  try {
    const response = await fetchWithProxy(API_URLS.earthquakes);
    const data: USGSResponse = await response.json();

    return data.features.map((feature) => ({
      id: feature.id,
      place: feature.properties.place || 'Unknown',
      magnitude: feature.properties.mag,
      lon: feature.geometry.coordinates[0],
      lat: feature.geometry.coordinates[1],
      depth: feature.geometry.coordinates[2],
      time: new Date(feature.properties.time),
      url: feature.properties.url,
    }));
  } catch (e) {
    console.error('Failed to fetch earthquakes:', e);
    return [];
  }
}
