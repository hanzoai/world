import type { Feed } from '@/types';

export const FEEDS: Record<string, Feed[]> = {
  politics: [
    { name: 'BBC World', url: '/rss/bbc/news/world/rss.xml' },
    { name: 'NPR News', url: '/rss/npr/1001/rss.xml' },
    { name: 'Guardian World', url: '/rss/guardian/world/rss' },
    { name: 'Reuters', url: '/rss/reuters/feed/?taxonomy=best-sectors&post_type=best' },
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
    { name: 'OpenAI Blog', url: '/rss/openai/blog/rss.xml' },
    { name: 'Anthropic', url: '/rss/anthropic/rss.xml' },
    { name: 'Google AI', url: '/rss/googleai/technology/ai/rss/' },
    { name: 'DeepMind', url: '/rss/deepmind/blog/rss.xml' },
    { name: 'Hugging Face', url: '/rss/huggingface/blog/feed.xml' },
    { name: 'ArXiv AI', url: '/rss/arxiv/rss/cs.AI' },
  ],
  finance: [
    { name: 'CNBC', url: '/rss/cnbc/id/100003114/device/rss/rss.html' },
    { name: 'MarketWatch', url: '/rss/marketwatch/marketwatch/topstories' },
    { name: 'Yahoo Finance', url: '/rss/yahoonews/news/rssindex' },
  ],
  gov: [
    { name: 'White House', url: '/rss/whitehouse/feed/' },
    { name: 'State Dept', url: '/rss/statedept/rss-feed/press-releases/feed/' },
    { name: 'Federal Reserve', url: '/rss/fedreserve/feeds/press_all.xml' },
    { name: 'SEC', url: '/rss/sec/news/pressreleases.rss' },
    { name: 'Treasury', url: '/rss/treasury/system/files/136/treasury-rss.xml' },
  ],
  layoffs: [
    { name: 'TechCrunch Layoffs', url: '/rss/techcrunch/tag/layoffs/feed/' },
    { name: 'Layoffs News', url: '/rss/googlenews/rss/search?q=tech+layoffs+2025+job+cuts&hl=en-US&gl=US&ceid=US:en' },
  ],
  congress: [
    { name: 'Congress Trades', url: '/rss/googlenews/rss/search?q=congress+stock+trading+pelosi+tuberville&hl=en-US&gl=US&ceid=US:en' },
  ],
  thinktanks: [
    { name: 'Brookings', url: '/rss/brookings/feed/' },
    { name: 'CFR', url: '/rss/cfr/rss.xml' },
    { name: 'CSIS', url: '/rss/csis/analysis/feed' },
  ],
};

export const INTEL_SOURCES: Feed[] = [
  { name: 'Defense One', url: '/rss/defenseone/rss/all/', type: 'defense' },
  { name: 'War on Rocks', url: '/rss/warontherocks/feed/', type: 'defense' },
  { name: 'Breaking Defense', url: '/rss/breakingdefense/feed/', type: 'defense' },
  { name: 'The War Zone', url: '/rss/warzone/the-war-zone/feed', type: 'defense' },
  { name: 'Bellingcat', url: '/rss/bellingcat/feed/', type: 'osint' },
  { name: 'CISA Alerts', url: '/rss/cisa/uscert/ncas/alerts.xml', type: 'cyber' },
  { name: 'Krebs Security', url: '/rss/krebs/feed/', type: 'cyber' },
];

export const ALERT_KEYWORDS = [
  'war', 'invasion', 'military', 'nuclear', 'sanctions', 'missile',
  'attack', 'troops', 'conflict', 'strike', 'bomb', 'casualties',
  'ceasefire', 'treaty', 'nato', 'coup', 'martial law', 'emergency',
  'assassination', 'terrorist', 'hostage', 'evacuation', 'breaking',
];
