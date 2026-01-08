# Situation Monitor - Complete Analysis for Replication

## Overview

**URL**: https://hipcityreg.github.io/situation-monitor/
**Repo**: https://github.com/hipcityreg/situation-monitor
**Tech Stack**: Vanilla HTML/CSS/JS + D3.js + TopoJSON

A real-time geopolitical monitoring dashboard combining:
- Interactive world map with multiple data layers
- Multi-source news aggregation
- Financial market data
- Prediction markets
- Custom keyword monitoring

---

## Architecture

### Core Technologies
```
- D3.js v7 - Map rendering, projections, data visualization
- TopoJSON - World map country boundaries
- CORS Proxies - Cross-origin RSS/API fetching
- LocalStorage - Panel settings, custom monitors persistence
- YouTube Embed - Livestream panel
```

### External Dependencies
```html
<script src="https://d3js.org/d3.v7.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/topojson-client@3"></script>
```

### Map Data Sources
```
World Countries: https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json
US States: https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json
```

---

## Design System

### CSS Variables (Theme)
```css
:root {
    --bg: #0a0a0a;           /* Primary background */
    --surface: #141414;       /* Panel/card background */
    --border: #2a2a2a;        /* Border color */
    --text: #e8e8e8;          /* Primary text */
    --text-dim: #888;         /* Secondary text */
    --accent: #fff;           /* Accent/highlight */
    --red: #ff4444;           /* Negative/danger */
    --green: #44ff88;         /* Positive/success */
    --yellow: #ffaa00;        /* Warning/alert */
}
```

### Typography
```css
font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
font-size: 12px;
line-height: 1.5;
```

### Color Palette - Military/Intel Aesthetic
- Map background: `#020a08` (deep dark green-black)
- Map grid: `#0a2a20`, `#0d3a2d`, `#0f4035`
- Country fill: `#0a2018`
- Country stroke: `#0f5040`
- Conflict zones: Red gradient with pulsing animation
- Cables: `#00ffaa` (cyan-green glow)

---

## Panel Configuration

### All Panel Types (21 total)
```javascript
const PANELS = {
    map: { name: 'Global Map', priority: 1 },
    politics: { name: 'World / Geopolitical', priority: 1 },
    tech: { name: 'Technology / AI', priority: 1 },
    finance: { name: 'Financial', priority: 1 },
    gov: { name: 'Government / Policy', priority: 2 },
    heatmap: { name: 'Sector Heatmap', priority: 1 },
    markets: { name: 'Markets', priority: 1 },
    monitors: { name: 'My Monitors', priority: 1 },
    commodities: { name: 'Commodities / VIX', priority: 2 },
    polymarket: { name: 'Polymarket', priority: 2 },
    congress: { name: 'Congress Trades', priority: 3 },
    whales: { name: 'Whale Watch', priority: 3 },
    mainchar: { name: 'Main Character', priority: 2 },
    printer: { name: 'Money Printer', priority: 2 },
    contracts: { name: 'Gov Contracts', priority: 3 },
    ai: { name: 'AI Arms Race', priority: 3 },
    layoffs: { name: 'Layoffs Tracker', priority: 3 },
    venezuela: { name: 'Venezuela Situation', priority: 2 },
    greenland: { name: 'Greenland Situation', priority: 2 },
    tbpn: { name: 'TBPN Live', priority: 1 },
    intel: { name: 'Intel Feed', priority: 2 }
};
```

---

## Data Sources

### RSS Feeds Configuration
```javascript
const FEEDS = {
    politics: [
        { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
        { name: 'NPR News', url: 'https://feeds.npr.org/1001/rss.xml' },
        { name: 'Guardian World', url: 'https://www.theguardian.com/world/rss' },
        { name: 'Reuters World', url: 'https://www.reutersagency.com/feed/...' }
    ],
    tech: [
        { name: 'Hacker News', url: 'https://hnrss.org/frontpage' },
        { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/technology-lab' },
        { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
        { name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/' },
        { name: 'ArXiv AI', url: 'https://rss.arxiv.org/rss/cs.AI' },
        { name: 'OpenAI Blog', url: 'https://openai.com/blog/rss.xml' }
    ],
    finance: [
        { name: 'CNBC', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html' },
        { name: 'MarketWatch', url: 'https://feeds.marketwatch.com/marketwatch/topstories' },
        { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex' },
        { name: 'FT', url: 'https://www.ft.com/rss/home' }
    ],
    gov: [
        { name: 'White House', url: 'https://www.whitehouse.gov/feed/' },
        { name: 'Federal Reserve', url: 'https://www.federalreserve.gov/feeds/press_all.xml' },
        { name: 'SEC Announcements', url: 'https://www.sec.gov/news/pressreleases.rss' },
        { name: 'Treasury', url: 'https://home.treasury.gov/system/files/136/treasury-rss.xml' },
        { name: 'State Dept', url: 'https://www.state.gov/rss-feed/press-releases/feed/' }
    ]
};
```

### Market Data APIs
```javascript
// Stock quotes - Yahoo Finance API
https://query1.finance.yahoo.com/v8/finance/chart/{symbol}

// Crypto - CoinGecko API
https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true

// Sector ETFs for heatmap
const SECTORS = [
    { symbol: 'XLK', name: 'Tech' },
    { symbol: 'XLF', name: 'Finance' },
    { symbol: 'XLE', name: 'Energy' },
    { symbol: 'XLV', name: 'Health' },
    // ... 12 total sectors
];
```

### CORS Proxy Strategy
```javascript
const CORS_PROXIES = [
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url='
];

async function fetchWithProxy(url) {
    for (let i = 0; i < CORS_PROXIES.length; i++) {
        try {
            const proxy = CORS_PROXIES[i];
            const response = await fetch(proxy + encodeURIComponent(url));
            if (response.ok) return await response.text();
        } catch (e) {
            console.log(`Proxy ${i} failed, trying next...`);
        }
    }
    throw new Error('All proxies failed');
}
```

---

## Interactive Map Features

### Map Layers (Toggleable)
```javascript
let mapLayers = {
    conflicts: true,    // Active conflict zones
    bases: true,        // Military bases (US/NATO, China, Russia)
    nuclear: true,      // Nuclear facilities
    cables: true,       // Undersea fiber cables
    sanctions: true,    // Sanctioned country highlighting
    density: true       // News density heatmap
};
```

### Conflict Zones
```javascript
const CONFLICT_ZONES = [
    {
        id: 'ukraine',
        name: 'Ukraine Conflict',
        intensity: 'high',
        coords: [[37.5, 47.0], [38.5, 47.5], ...], // Polygon points
        labelPos: { lat: 48.0, lon: 37.5 },
        parties: ['Russia', 'Ukraine', 'NATO (support)'],
        casualties: '500,000+ (est.)',
        displaced: '6.5M+ refugees',
        keywords: ['ukraine', 'russia', 'zelensky', 'putin', ...]
    },
    // Gaza, Sudan, Myanmar, Taiwan Strait
];
```

### Intelligence Hotspots (12 locations)
```javascript
const INTEL_HOTSPOTS = [
    { id: 'dc', name: 'DC', subtext: 'Pentagon Pizza Index', lat: 38.9, lon: -77.0,
      keywords: ['pentagon', 'white house', ...],
      agencies: ['Pentagon', 'CIA', 'NSA', 'State Dept'] },
    { id: 'moscow', name: 'Moscow', subtext: 'Kremlin Activity', ... },
    { id: 'beijing', name: 'Beijing', subtext: 'PLA/MSS Activity', ... },
    { id: 'kyiv', name: 'Kyiv', subtext: 'Conflict Zone', ... },
    // + Taipei, Tehran, Tel Aviv, Pyongyang, London, Brussels, Caracas, Nuuk
];
```

### Military Bases
```javascript
const MILITARY_BASES = [
    // US/NATO (10 bases)
    { id: 'ramstein', name: 'Ramstein AB', lat: 49.44, lon: 7.6, type: 'us-nato' },
    { id: 'diego_garcia', name: 'Diego Garcia', lat: -7.32, lon: 72.42, type: 'us-nato' },
    // Chinese (5 bases)
    { id: 'djibouti_cn', name: 'PLA Djibouti', lat: 11.59, lon: 43.05, type: 'china' },
    { id: 'woody_island', name: 'Woody Island', lat: 16.83, lon: 112.33, type: 'china' },
    // Russian (5 bases)
    { id: 'kaliningrad', name: 'Kaliningrad', lat: 54.71, lon: 20.51, type: 'russia' },
    { id: 'tartus', name: 'Tartus (Syria)', lat: 34.89, lon: 35.87, type: 'russia' },
];
```

### Nuclear Facilities
```javascript
const NUCLEAR_FACILITIES = [
    // Power Plants
    { id: 'zaporizhzhia', name: 'Zaporizhzhia NPP', type: 'plant', status: 'contested' },
    // Enrichment
    { id: 'natanz', name: 'Natanz', type: 'enrichment', status: 'active' },
    // Weapons
    { id: 'yongbyon', name: 'Yongbyon', type: 'weapons', status: 'active' },
];
```

### Undersea Cables (6 major routes)
```javascript
const UNDERSEA_CABLES = [
    { id: 'transatlantic_1', name: 'Transatlantic (TAT-14)', major: true,
      points: [[-74.0, 40.7], [-30.0, 45.0], [-9.0, 52.0]] },
    { id: 'transpacific_1', name: 'Transpacific (Unity)', major: true,
      points: [[-122.4, 37.8], [-155.0, 25.0], [139.7, 35.7]] },
    // SEA-ME-WE 5, Asia-Africa-Europe 1, Curie, MAREA
];
```

### Shipping Chokepoints
```javascript
const SHIPPING_CHOKEPOINTS = [
    { id: 'suez', name: 'Suez Canal', lat: 30.0, lon: 32.5,
      desc: 'Critical waterway. ~12% of global trade.' },
    { id: 'hormuz', name: 'Strait of Hormuz', lat: 26.5, lon: 56.3,
      desc: '~21% of global oil passes through daily.' },
    // Panama, Malacca, Bosphorus
];
```

### Cyber Threat Regions
```javascript
const CYBER_REGIONS = [
    { id: 'cyber_russia', group: 'APT28/29', aka: 'Fancy Bear / Cozy Bear', sponsor: 'GRU / FSB' },
    { id: 'cyber_china', group: 'APT41', aka: 'Double Dragon / Winnti', sponsor: 'MSS' },
    { id: 'cyber_nk', group: 'Lazarus', aka: 'Hidden Cobra', sponsor: 'RGB' },
    { id: 'cyber_iran', group: 'APT33/35', aka: 'Charming Kitten', sponsor: 'IRGC' },
];
```

### Sanctioned Countries (by ISO code)
```javascript
const SANCTIONED_COUNTRIES = {
    408: 'severe',   // North Korea
    728: 'severe',   // South Sudan
    760: 'severe',   // Syria
    364: 'high',     // Iran
    643: 'high',     // Russia
    112: 'high',     // Belarus
    862: 'moderate', // Venezuela
    104: 'moderate', // Myanmar
};
```

---

## Map Rendering (D3.js)

### Projection Setup
```javascript
// Global view - Equirectangular
projection = d3.geoEquirectangular()
    .scale(width / (2 * Math.PI))
    .center([0, 0])
    .translate([width / 2, height / 2]);

// US view - Albers USA
projection = d3.geoAlbersUsa()
    .scale(width * 1.3)
    .translate([width / 2, height / 2]);
```

### Layer Rendering Order
1. Background rectangle (`#020a08`)
2. Grid pattern (small + large)
3. Graticule (lat/lon lines)
4. Countries (TopoJSON)
5. Undersea cables (curved paths)
6. Conflict zone boundaries (animated polygons)
7. State boundaries (US view)
8. HTML Overlays (hotspots, bases, labels)

### Zoom/Pan Implementation
```javascript
let mapZoom = 1;
let mapPan = { x: 0, y: 0 };
const MAP_ZOOM_MIN = 1;
const MAP_ZOOM_MAX = 4;
const MAP_ZOOM_STEP = 0.5;

function applyMapTransform() {
    const wrapper = document.getElementById('mapZoomWrapper');
    wrapper.style.transform = `scale(${mapZoom}) translate(${mapPan.x}px, ${mapPan.y}px)`;
}

// Mouse wheel zoom
container.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.deltaY < 0) mapZoomIn();
    else mapZoomOut();
}, { passive: false });
```

---

## Alert System

### Alert Keywords
```javascript
const ALERT_KEYWORDS = [
    'war', 'invasion', 'military', 'nuclear', 'sanctions', 'missile',
    'attack', 'troops', 'conflict', 'strike', 'bomb', 'casualties',
    'ceasefire', 'treaty', 'nato', 'coup', 'martial law', 'emergency',
    'assassination', 'terrorist', 'hostage', 'evacuation'
];
```

### Hotspot Activity Scoring
```javascript
function analyzeHotspotActivity(allNews) {
    INTEL_HOTSPOTS.forEach(spot => {
        let score = 0;
        allNews.forEach(item => {
            const matchedKeywords = spot.keywords.filter(kw =>
                item.title.toLowerCase().includes(kw)
            );
            if (matchedKeywords.length > 0) {
                score += matchedKeywords.length;
                if (item.isAlert) score += 3; // Boost for alert keywords
            }
        });

        let level = 'low';
        if (score >= 8) level = 'high';
        else if (score >= 3) level = 'elevated';
    });
}
```

---

## UI Components

### Panel Structure
```html
<div class="panel" data-panel="politics">
    <div class="panel-header">
        <div class="panel-header-left">
            <span class="panel-title">World / Geopolitical</span>
        </div>
        <span class="panel-count">15</span>
    </div>
    <div class="panel-content">
        <!-- News items -->
    </div>
</div>
```

### News Item Structure
```html
<div class="item alert">
    <div class="item-source">
        NPR News<span class="alert-tag">ALERT</span>
    </div>
    <a class="item-title" href="..." target="_blank">
        Trump invites Colombian president...
    </a>
    <div class="item-time">2h ago</div>
</div>
```

### Sector Heatmap
```html
<div class="heatmap">
    <div class="heatmap-cell down-2">
        <div class="sector-name">Finance</div>
        <div class="sector-change">-1.40%</div>
    </div>
</div>
```

### Market Item
```html
<div class="market-item">
    <div class="market-info">
        <span class="market-name">S&P 500</span>
        <span class="market-symbol">SPX</span>
    </div>
    <div class="market-data">
        <span class="market-price">$6,921</span>
        <span class="market-change down">-0.34%</span>
    </div>
</div>
```

---

## Custom Monitors Feature

### Monitor Data Structure
```javascript
{
    id: 'monitor-123456',
    name: 'TSMC Supply Chain',
    keywords: ['tsmc', 'taiwan semiconductor', 'chip'],
    color: '#44ff88',
    lat: 25.0,   // Optional map location
    lon: 121.5   // Optional map location
}
```

### Color Palette for Monitors
```javascript
const MONITOR_COLORS = [
    '#44ff88', '#ff8844', '#4488ff', '#ff44ff',
    '#ffff44', '#ff4444', '#44ffff', '#88ff44',
    '#ff88ff', '#88ffff'
];
```

---

## Time Slider (Historical Mode)

```javascript
// Time slider for historical data
<div class="time-slider-container">
    <span class="time-label">Time</span>
    <input type="range" min="0" max="24" value="0" class="time-slider">
    <span class="time-value">LIVE</span>
</div>

// When not at 0, shows "VIEWING HISTORICAL DATA" banner
```

---

## Key Animations

### Conflict Zone Pulse
```css
@keyframes pulse-red {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.6; }
}

.conflict-zone-fill {
    animation: pulse-red 2s ease-in-out infinite;
}
```

### Breaking News Badge
```css
@keyframes pulse-breaking {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

.hotspot-breaking-badge {
    animation: pulse-breaking 1s ease-in-out infinite;
}
```

### Cable Glow
```css
.cable-path {
    stroke: #00ffaa;
    stroke-width: 1.5;
    filter: drop-shadow(0 0 3px #00ffaa);
}
```

---

## Performance Optimizations

1. **Parallel Fetch**: All RSS feeds fetched simultaneously
2. **Caching**: `worldMapData` and `usStatesData` cached after first load
3. **LocalStorage**: Panel settings, order, sizes persisted
4. **Limit Items**: Only 5 items per feed, 20 per category displayed
5. **Debounced Updates**: Auto-refresh with rate limiting

---

## Replication Checklist

- [ ] Set up HTML structure with header, dashboard grid, modals
- [ ] Implement CSS theme with military/intel aesthetic
- [ ] Add D3.js and TopoJSON dependencies
- [ ] Create map rendering with all layers
- [ ] Implement RSS feed fetching with CORS proxies
- [ ] Add Yahoo Finance API integration for markets
- [ ] Create panel toggle/drag/resize functionality
- [ ] Implement custom monitors with keyword matching
- [ ] Add alert keyword detection
- [ ] Create hotspot activity scoring
- [ ] Implement time slider for historical view
- [ ] Add zoom/pan controls for map
- [ ] Implement settings modal
- [ ] Add YouTube livestream embed
- [ ] Persist settings to localStorage
