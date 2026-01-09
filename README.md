# World Monitor

Real-time global intelligence dashboard aggregating news, markets, geopolitical data, and infrastructure monitoring into a unified situation awareness interface.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![D3.js](https://img.shields.io/badge/D3.js-F9A03C?style=flat&logo=d3.js&logoColor=white)

## Features

### Interactive Global Map
- **Zoom & Pan** - Smooth navigation with mouse/trackpad gestures
- **Multiple Views** - Global, US, and MENA region presets
- **Layer System** - Toggle visibility of different data layers
- **Time Filtering** - Filter events by time range (1h to 7d)

### Data Layers

| Layer | Description |
|-------|-------------|
| **Hotspots** | Intelligence hotspots with activity levels based on news correlation |
| **Conflicts** | Active conflict zones with party information |
| **Military Bases** | Global military installations |
| **Pipelines** | 88 major oil & gas pipelines worldwide |
| **Undersea Cables** | Critical internet infrastructure |
| **Nuclear Facilities** | Power plants and research reactors |
| **Gamma Irradiators** | IAEA-tracked radiation sources |
| **AI Datacenters** | Major AI compute infrastructure |
| **Earthquakes** | Live USGS seismic data |
| **Weather Alerts** | Severe weather warnings |
| **Internet Outages** | Network connectivity disruptions |
| **Sanctions** | Countries under economic sanctions |
| **Economic Centers** | Major exchanges and central banks |

### News Aggregation

Multi-source RSS aggregation across categories:
- **World / Geopolitical** - BBC, Reuters, AP, Guardian, NPR
- **Middle East / MENA** - Al Jazeera, BBC ME, CNN ME
- **Technology** - Hacker News, Ars Technica, The Verge, MIT Tech Review
- **AI / ML** - ArXiv, Hugging Face, VentureBeat, OpenAI
- **Finance** - CNBC, MarketWatch, Financial Times, Yahoo Finance
- **Government** - White House, State Dept, Pentagon, Treasury, Fed, SEC
- **Intel Feed** - Defense One, Breaking Defense, Bellingcat, Krebs Security
- **Think Tanks** - Foreign Policy, Brookings, CSIS, CFR
- **Layoffs Tracker** - Tech industry job cuts
- **Congress Trades** - Congressional stock trading activity

### Market Data
- **Stocks** - Major indices and tech stocks
- **Commodities** - Oil, gold, natural gas, copper
- **Crypto** - Bitcoin, Ethereum, and top cryptocurrencies
- **Sector Heatmap** - Visual sector performance
- **Economic Indicators** - Fed data (GDP, inflation, unemployment)

### Prediction Markets
- Polymarket integration for event probability tracking
- Correlation analysis with news events

### Intelligence Features
- **News Clustering** - Groups related articles
- **Signal Detection** - Correlates news with market/prediction movements
- **Custom Monitors** - Set keyword alerts across all feeds
- **Activity Scoring** - Dynamic hotspot threat levels based on news volume
- **Deviation Analysis** - Tracks anomalies in news velocity

### Search (⌘K)
Universal search across all data sources:
- News articles
- Geographic hotspots and conflicts
- Infrastructure (pipelines, cables, datacenters)
- Nuclear facilities and irradiators
- Markets and predictions

### Data Export
- JSON export of current dashboard state
- Historical playback from snapshots

## Tech Stack

- **Frontend**: TypeScript, Vite
- **Visualization**: D3.js, TopoJSON
- **Data**: RSS feeds, REST APIs
- **Storage**: IndexedDB for snapshots, LocalStorage for preferences

## Installation

```bash
# Clone the repository
git clone https://github.com/koala73/worldmonitor.git
cd worldmonitor

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## API Dependencies

The dashboard fetches data from various public APIs:

| Service | Data |
|---------|------|
| RSS2JSON | News feed parsing |
| Alpha Vantage | Stock quotes |
| CoinGecko | Cryptocurrency prices |
| USGS | Earthquake data |
| NWS | Weather alerts |
| FRED | Economic indicators |
| Polymarket | Prediction markets |

## Project Structure

```
src/
├── App.ts              # Main application orchestrator
├── main.ts             # Entry point
├── components/         # UI components
│   ├── Map.ts          # D3 map with all layers
│   ├── MapPopup.ts     # Info popups for map elements
│   ├── SearchModal.ts  # Universal search
│   ├── NewsPanel.ts    # News feed display
│   ├── MarketPanel.ts  # Stock/commodity display
│   └── ...
├── config/             # Static data & configuration
│   ├── feeds.ts        # RSS feed definitions
│   ├── geo.ts          # Hotspots, conflicts, bases, cables
│   ├── pipelines.ts    # Pipeline data (88 entries)
│   ├── ai-datacenters.ts
│   ├── irradiators.ts
│   └── markets.ts
├── services/           # Data fetching & processing
│   ├── rss.ts          # RSS parsing
│   ├── markets.ts      # Stock/crypto APIs
│   ├── earthquakes.ts  # USGS integration
│   ├── clustering.ts   # News clustering algorithm
│   ├── correlation.ts  # Signal detection
│   └── storage.ts      # IndexedDB snapshots
├── styles/             # CSS
└── types/              # TypeScript definitions
```

## Usage

### Keyboard Shortcuts
- `⌘K` / `Ctrl+K` - Open search
- `↑↓` - Navigate search results
- `Enter` - Select result
- `Esc` - Close modals

### Map Controls
- **Scroll** - Zoom in/out
- **Drag** - Pan the map
- **Click markers** - Show detailed popup
- **Layer toggles** - Show/hide data layers

### Panel Management
- **Drag panels** - Reorder layout
- **Settings (⚙)** - Toggle panel visibility

## Data Sources

### News Feeds
Aggregates 40+ RSS feeds from major news outlets, government sources, and specialty publications with source-tier prioritization.

### Geospatial Data
- **Hotspots**: 25+ global intelligence hotspots with keyword correlation
- **Conflicts**: Active conflict zones with involved parties
- **Pipelines**: 88 operating oil/gas pipelines across all continents
- **Military Bases**: Major global installations
- **Nuclear**: Power plants, research reactors, irradiator facilities

### Live APIs
- USGS earthquake feed (M4.5+ global)
- National Weather Service alerts
- Internet outage monitoring
- Cryptocurrency prices (real-time)

## License

MIT

## Author

**Elie Habib**

---

*Built for situational awareness and open-source intelligence gathering.*
