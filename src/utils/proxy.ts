const isDev = import.meta.env.DEV;
const CORS_PROXY = 'https://corsproxy.io/?';

// Map of local proxy paths to actual URLs for production
const PROXY_MAP: Record<string, string> = {
  '/api/yahoo': 'https://query1.finance.yahoo.com',
  '/api/coingecko': 'https://api.coingecko.com',
  '/api/polymarket': 'https://gamma-api.polymarket.com',
  '/api/earthquake': 'https://earthquake.usgs.gov',
  '/rss/bbc': 'https://feeds.bbci.co.uk',
  '/rss/guardian': 'https://www.theguardian.com',
  '/rss/npr': 'https://feeds.npr.org',
  '/rss/reuters': 'https://www.reutersagency.com',
  '/rss/aljazeera': 'https://www.aljazeera.com',
  '/rss/cnn': 'http://rss.cnn.com',
  '/rss/hn': 'https://hnrss.org',
  '/rss/arstechnica': 'https://feeds.arstechnica.com',
  '/rss/verge': 'https://www.theverge.com',
  '/rss/cnbc': 'https://www.cnbc.com',
  '/rss/marketwatch': 'https://feeds.marketwatch.com',
  '/rss/defenseone': 'https://www.defenseone.com',
  '/rss/warontherocks': 'https://warontherocks.com',
  '/rss/breakingdefense': 'https://breakingdefense.com',
  '/rss/bellingcat': 'https://www.bellingcat.com',
  '/rss/techcrunch': 'https://techcrunch.com',
  '/rss/googlenews': 'https://news.google.com',
  '/rss/openai': 'https://openai.com',
  '/rss/anthropic': 'https://www.anthropic.com',
  '/rss/googleai': 'https://blog.google',
  '/rss/deepmind': 'https://deepmind.google',
  '/rss/huggingface': 'https://huggingface.co',
  '/rss/techreview': 'https://www.technologyreview.com',
  '/rss/arxiv': 'https://rss.arxiv.org',
  '/rss/whitehouse': 'https://www.whitehouse.gov',
  '/rss/statedept': 'https://www.state.gov',
  '/rss/fedreserve': 'https://www.federalreserve.gov',
  '/rss/sec': 'https://www.sec.gov',
  '/rss/treasury': 'https://home.treasury.gov',
  '/rss/cisa': 'https://www.cisa.gov',
  '/rss/brookings': 'https://www.brookings.edu',
  '/rss/cfr': 'https://www.cfr.org',
  '/rss/csis': 'https://www.csis.org',
  '/rss/warzone': 'https://www.thedrive.com',
  '/rss/defensegov': 'https://www.defense.gov',
  '/rss/krebs': 'https://krebsonsecurity.com',
  '/rss/yahoonews': 'https://finance.yahoo.com',
  '/rss/diplomat': 'https://thediplomat.com',
};

export function proxyUrl(localPath: string): string {
  if (isDev) {
    return localPath;
  }

  // Find matching proxy prefix
  for (const [prefix, baseUrl] of Object.entries(PROXY_MAP)) {
    if (localPath.startsWith(prefix)) {
      const path = localPath.slice(prefix.length);
      const fullUrl = baseUrl + path;
      return CORS_PROXY + encodeURIComponent(fullUrl);
    }
  }

  // If no match, return as-is (might be absolute URL)
  return localPath;
}

export async function fetchWithProxy(url: string): Promise<Response> {
  const proxiedUrl = proxyUrl(url);
  return fetch(proxiedUrl);
}
