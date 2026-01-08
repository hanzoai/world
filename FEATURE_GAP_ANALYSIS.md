# Situation Monitor - Feature Gap Analysis

## Executive Summary

Comprehensive comparison between original site (hipcityreg.github.io/situation-monitor) and our replica.

**Missing Features: 47 items across 4 categories**

---

## A. MISSING PANELS (12 items)

| # | Panel Name | Description | Data Source | Priority |
|---|------------|-------------|-------------|----------|
| 1 | Congress Trades | Congressional stock trading activity | Quiver Quant / House Stock Watcher API | HIGH |
| 2 | Whale Watch | Large crypto wallet movements | Whale Alert API / Etherscan | HIGH |
| 3 | Main Character | Person mentioned most in headlines | Computed from news feeds | MEDIUM |
| 4 | Money Printer | Fed Balance Sheet tracking | Federal Reserve FRED API | HIGH |
| 5 | Gov Contracts | Government contract awards | USASpending.gov API | MEDIUM |
| 6 | AI Arms Race | AI development announcements | Curated RSS feeds | MEDIUM |
| 7 | Layoffs Tracker | Corporate layoff news | Layoffs.fyi / news scraping | MEDIUM |
| 8 | Venezuela Situation | Venezuela-specific monitoring | News filtering | LOW |
| 9 | Greenland Situation | Arctic dispute monitoring | News filtering | LOW |
| 10 | TBPN Live | YouTube livestream embed | YouTube iframe | LOW |
| 11 | Defense/Military | Breaking Defense, War Zone | RSS feeds | MEDIUM |
| 12 | Cyber/OSINT | CISA alerts, Krebs Security | RSS/API | MEDIUM |

---

## B. INTERACTIVE MAP POPUPS (5 types)

### B1. Conflict Zone Popup
**Trigger:** Click on conflict zone (Ukraine, Gaza, Sudan, Myanmar)

**Required Data:**
```typescript
interface ConflictData {
  name: string;           // "UKRAINE CONFLICT"
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  startDate: string;      // "Feb 24, 2022"
  casualties: string;     // "500,000+ (est.)"
  displaced: string;      // "6.5M+ refugees"
  location: string;       // "48.0°N, 37.5°E"
  description: string;    // Full paragraph
  belligerents: string[]; // ["Russia", "Ukraine", "NATO (support)"]
  keyDevelopments: string[]; // ["Battle of Bakhmut", "Kursk incursion", ...]
}
```

**UI Elements:**
- Red bordered modal
- Severity badge (HIGH/MEDIUM)
- Two-column stats (Start Date | Casualties, Displaced | Location)
- Description paragraph
- Belligerent tags (border buttons)
- Key developments bullet list

### B2. Hotspot City Popup
**Trigger:** Click on hotspot (DC, Moscow, Beijing, etc.)

**Required Data:**
```typescript
interface HotspotData {
  name: string;           // "BEIJING"
  severity: 'HIGH' | 'ELEVATED' | 'LOW';
  subtitle: string;       // "PLA/MSS Activity"
  description: string;    // Full paragraph
  coordinates: string;    // "39.90°N, 116.40°E"
  status: string;         // "Elevated posture"
  keyEntities: string[];  // ["PLA", "MSS", "CCP Politburo"]
  relatedHeadlines: NewsItem[]; // Filtered news matching this location
}
```

**UI Elements:**
- Name with severity badge
- Subtitle in accent color
- Description paragraph
- Two-column (Coordinates | Status)
- Key entities as tags
- Related headlines section

### B3. Earthquake Popup
**Trigger:** Click on earthquake marker

**Required Data:**
```typescript
interface EarthquakePopup {
  magnitude: number;      // 5.0
  severity: 'MAJOR' | 'MODERATE' | 'MINOR';
  location: string;       // "80 km W of Ambunti, Papua New Guinea"
  depth: string;          // "131.4 km"
  coordinates: string;    // "-4.12°, 142.10°"
  time: string;           // "10h ago"
  usgsUrl: string;        // Link to USGS event page
}
```

**UI Elements:**
- Large magnitude display
- Severity badge
- Location description
- Stats grid (Depth, Coordinates, Time)
- "View on USGS →" link

### B4. Nuclear Facility Popup
**Trigger:** Click on nuclear marker

**Required Data:**
```typescript
interface NuclearFacility {
  name: string;           // "Zaporizhzhia NPP"
  type: 'plant' | 'enrichment' | 'weapons' | 'reprocessing';
  status: 'active' | 'contested' | 'inactive';
  country: string;
  coordinates: string;
  description: string;
  concerns: string[];     // ["Russian occupation", "Power grid damage"]
}
```

### B5. Military Base Popup
**Trigger:** Click on base marker

**Required Data:**
```typescript
interface MilitaryBase {
  name: string;           // "Ramstein AB"
  country: string;        // "Germany"
  operator: 'US/NATO' | 'China' | 'Russia';
  type: string;           // "Air Base"
  coordinates: string;
  description: string;
  units: string[];        // ["USAFE", "86th Airlift Wing"]
}
```

---

## C. ENHANCED MAP FEATURES (15 items)

### C1. Hotspot Subtitles
Each hotspot should display a subtitle below the city name:
- DC → "Pentagon Pizza Index"
- Moscow → "Kremlin Activity"
- Beijing → "PLA/MSS Activity"
- Caracas → "Venezuela Crisis"
- Nuuk → "Arctic Dispute"
- Taipei → "Strait Watch"
- Tehran → "IRGC Activity"
- Tel Aviv → "Mossad/IDF"
- Pyongyang → "DPRK Watch"

### C2. APT/Cyber Threat Markers
Small indicators showing APT groups near their attributed locations:
- APT28/29 near Moscow
- APT41 near Beijing
- Lazarus near Pyongyang
- APT33/35 near Tehran

### C3. Strategic Waterway Labels
Add prominent labels for:
- TAIWAN STRAIT
- MALACCA STRAIT
- BOSPHORUS STRAIT
- STRAIT OF HORMUZ
- SUEZ CANAL
- PANAMA CANAL

### C4. Ship/Maritime Icons (⚓)
Anchor icons at chokepoints showing maritime monitoring:
- Panama Canal
- Suez Canal
- Strait of Hormuz
- Malacca Strait

### C5. "BREAKING" Tags
Dynamic tags appearing on hotspots with recent critical news:
- Red bordered box with "BREAKING" text
- Positioned near active hotspots
- Auto-computed from news freshness + importance

### C6. Grid Lines with Labels
- Latitude lines at 60°N, 30°N, 0°, 30°S, 60°S
- Longitude lines at 120°W, 60°W, 0°, 60°E, 120°E
- Small labels at line intersections

### C7. Bottom Legend Bar
Fixed bar at bottom showing:
`⚓ SHIP | ☢ NUKES | ● BASES | ═ CABLES | 2026-01-08 14:04:41 UTC`

### C8. Classification Indicator
Top-right corner: "CLASSIFICATION: OPEN"

### C9. Zoom Level Indicator
Near zoom controls: "1.0x" / "1.5x" / "2.0x"

### C10. Enhanced Visual Effects
- Red glow/halo effect around conflict zones
- Pulsing animation on high-severity markers
- Better color coding for severity levels

### C11. Time Slider Enhancement
Bottom-center prominent slider:
`TIME ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ LIVE`

### C12. More Strategic Locations
Missing hotspot markers:
- BOSPHORUS STRAIT region
- APT markers for cyber threats
- PANAMA CANAL
- SUEZ CANAL

### C13. Enhanced Conflict Zone Rendering
- Larger conflict zone areas with pulsing borders
- Better visibility of conflict names
- Warning triangles (△) on active conflicts

### C14. Ship Tracking Indicators
Small ship icons showing naval activity at:
- Panama Canal (US control)
- Strait of Hormuz (Iran monitoring)
- Taiwan Strait (PLA Navy)
- South China Sea (contested)

### C15. Enhanced Base Markers
Different icons for:
- Air bases (✈)
- Naval bases (⚓)
- Army installations (★)

---

## D. DATA STRUCTURE ENHANCEMENTS

### D1. Rich Conflict Data
Expand CONFLICT_ZONES in config:
```typescript
const CONFLICT_ZONES = [
  {
    id: 'ukraine',
    name: 'Ukraine Conflict',
    bounds: [[44, 22], [52, 40]],
    severity: 'HIGH',
    startDate: 'Feb 24, 2022',
    casualties: '500,000+ (est.)',
    displaced: '6.5M+ refugees',
    location: '48.0°N, 37.5°E',
    description: 'Full-scale Russian invasion of Ukraine...',
    belligerents: ['Russia', 'Ukraine', 'NATO (support)'],
    keyDevelopments: [
      'Battle of Bakhmut',
      'Kursk incursion',
      'Black Sea drone strikes',
      'Infrastructure attacks'
    ]
  },
  // ... more conflicts
];
```

### D2. Rich Hotspot Data
Expand HOTSPOTS in config:
```typescript
const HOTSPOTS = [
  {
    id: 'dc',
    name: 'DC',
    lat: 38.9,
    lon: -77.0,
    subtitle: 'Pentagon Pizza Index',
    severity: 'ELEVATED',
    description: 'US government center...',
    status: 'Elevated activity',
    keyEntities: ['Pentagon', 'CIA', 'State Dept'],
    newsKeywords: ['washington', 'pentagon', 'white house', 'congress']
  },
  // ... more hotspots
];
```

### D3. Related Headlines Matching
Add logic to match news items to hotspots based on:
- Keywords in title/description
- Geographic mentions
- Entity mentions

### D4. Enhanced Earthquake Data
Add depth and USGS URL to earthquake objects:
```typescript
interface Earthquake {
  magnitude: number;
  place: string;
  time: Date;
  lat: number;
  lon: number;
  depth: number;      // NEW
  usgsUrl: string;    // NEW
  severity: string;   // Computed from magnitude
}
```

---

## E. IMPLEMENTATION PRIORITY

### Phase 1: Interactive Popups (Critical)
1. Create popup component system
2. Implement ConflictPopup
3. Implement HotspotPopup with related headlines
4. Implement EarthquakePopup
5. Add click handlers to map elements

### Phase 2: Rich Data & Config (High)
1. Expand conflict zone data
2. Expand hotspot data with subtitles/entities
3. Add news keyword matching for related headlines
4. Enhance earthquake data with depth/URL

### Phase 3: Missing Panels (Medium)
1. Congress Trades panel
2. Whale Watch panel
3. Main Character panel
4. Money Printer panel
5. AI Arms Race panel

### Phase 4: Map Enhancements (Medium)
1. Hotspot subtitles
2. Strategic waterway labels
3. BREAKING tags system
4. Grid lines
5. Bottom legend bar
6. APT markers

### Phase 5: Polish (Low)
1. Enhanced visual effects
2. Time slider redesign
3. Classification indicator
4. Zoom level display
5. Ship markers

---

## F. ESTIMATED SCOPE

| Phase | Items | Complexity | Est. Files |
|-------|-------|------------|------------|
| Phase 1 | 5 | High | 3-4 new components |
| Phase 2 | 4 | Medium | Config expansion |
| Phase 3 | 5 | Medium | 5 new panels |
| Phase 4 | 6 | Medium | Map.ts updates |
| Phase 5 | 5 | Low | CSS + minor updates |

**Total: 25 work items across 5 phases**

---

## G. FILES TO CREATE/MODIFY

### New Files:
- `src/components/popups/ConflictPopup.ts`
- `src/components/popups/HotspotPopup.ts`
- `src/components/popups/EarthquakePopup.ts`
- `src/components/popups/BasePopup.ts`
- `src/components/popups/NuclearPopup.ts`
- `src/components/panels/CongressTradesPanel.ts`
- `src/components/panels/WhaleWatchPanel.ts`
- `src/components/panels/MainCharacterPanel.ts`
- `src/components/panels/MoneyPrinterPanel.ts`
- `src/components/panels/AIArmsRacePanel.ts`
- `src/services/congressTrades.ts`
- `src/services/whaleWatch.ts`

### Modify:
- `src/config/hotspots.ts` - Add rich hotspot data
- `src/config/conflicts.ts` - Add rich conflict data
- `src/components/Map.ts` - Add popup triggers, subtitles, APT markers
- `src/styles/main.css` - Popup styles, legend, grid
- `src/App.ts` - New panels integration
