import type { Feed } from '@/types';

export const FEEDS: Record<string, Feed[]> = {
  politics: [
    { name: 'BBC World', url: '/rss/bbc/news/world/rss.xml' },
    { name: 'NPR News', url: '/rss/npr/1001/rss.xml' },
    { name: 'Guardian World', url: '/rss/guardian/world/rss' },
    { name: 'AP News', url: '/rss/apnews/feed' },
    { name: 'The Diplomat', url: '/rss/diplomat/feed/' },
  ],
  middleeast: [
    { name: 'BBC Middle East', url: '/rss/bbc/news/world/middle_east/rss.xml' },
    { name: 'Al Jazeera', url: '/rss/aljazeera/xml/rss/all.xml' },
    { name: 'Guardian ME', url: '/rss/guardian/world/middleeast/rss' },
    { name: 'CNN Middle East', url: '/rss/cnn/rss/edition_meast.rss' },
  ],
  tech: [
    { name: 'Hacker News', url: '/rss/hn/frontpage' },
    { name: 'Ars Technica', url: '/rss/arstechnica/arstechnica/technology-lab' },
    { name: 'The Verge', url: '/rss/verge/rss/index.xml' },
    { name: 'MIT Tech Review', url: '/rss/techreview/feed/' },
  ],
  ai: [
    { name: 'AI News', url: '/rss/googlenews/rss/search?q=artificial+intelligence+AI+news&hl=en-US&gl=US&ceid=US:en' },
    { name: 'Hugging Face', url: '/rss/huggingface/blog/feed.xml' },
    { name: 'ArXiv AI', url: '/rss/arxiv/rss/cs.AI' },
    { name: 'VentureBeat AI', url: '/rss/venturebeat/feed/' },
  ],
  finance: [
    { name: 'CNBC', url: '/rss/cnbc/id/100003114/device/rss/rss.html' },
    { name: 'MarketWatch', url: '/rss/marketwatch/marketwatch/topstories' },
    { name: 'Yahoo Finance', url: '/rss/yahoonews/news/rssindex' },
  ],
  gov: [
    { name: 'Federal Reserve', url: '/rss/fedreserve/feeds/press_all.xml' },
    { name: 'SEC', url: '/rss/sec/news/pressreleases.rss' },
    { name: 'Gov News', url: '/rss/googlenews/rss/search?q=US+government+policy+congress&hl=en-US&gl=US&ceid=US:en' },
  ],
  layoffs: [
    { name: 'TechCrunch Layoffs', url: '/rss/techcrunch/tag/layoffs/feed/' },
    { name: 'Layoffs News', url: '/rss/googlenews/rss/search?q=tech+layoffs+2025+job+cuts&hl=en-US&gl=US&ceid=US:en' },
  ],
  congress: [
    { name: 'Congress Trades', url: '/rss/googlenews/rss/search?q=congress+stock+trading+pelosi+tuberville&hl=en-US&gl=US&ceid=US:en' },
  ],
  thinktanks: [
    { name: 'Foreign Policy', url: '/rss/foreignpolicy/feed/' },
    { name: 'Think Tank News', url: '/rss/googlenews/rss/search?q=brookings+CSIS+CFR+analysis&hl=en-US&gl=US&ceid=US:en' },
  ],
};

export const INTEL_SOURCES: Feed[] = [
  { name: 'Defense One', url: '/rss/defenseone/rss/all/', type: 'defense' },
  { name: 'Breaking Defense', url: '/rss/breakingdefense/feed/', type: 'defense' },
  { name: 'The War Zone', url: '/rss/warzone/the-war-zone/feed', type: 'defense' },
  { name: 'Defense News', url: '/rss/googlenews/rss/search?q=defense+military+pentagon&hl=en-US&gl=US&ceid=US:en', type: 'defense' },
  { name: 'Bellingcat', url: '/rss/bellingcat/feed/', type: 'osint' },
  { name: 'Krebs Security', url: '/rss/krebs/feed/', type: 'cyber' },
];

export const ALERT_KEYWORDS = [
  'war', 'invasion', 'military', 'nuclear', 'sanctions', 'missile',
  'attack', 'troops', 'conflict', 'strike', 'bomb', 'casualties',
  'ceasefire', 'treaty', 'nato', 'coup', 'martial law', 'emergency',
  'assassination', 'terrorist', 'hostage', 'evacuation', 'breaking',
];
