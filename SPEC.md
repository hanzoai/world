# World Monitor Enhancement Specification

**Author:** Elie Habib
**Version:** 2.1
**Date:** January 2026

---

## Executive Summary

World Monitor is a geopolitical intelligence dashboard that synthesizes news feeds, market data, prediction markets, and geographic hotspots into a unified tactical view. This spec outlines enhancements to transform it from a feed aggregator into a **signal detection system** that surfaces what matters and filters noise.

**Primary Goal:** Detect important events faster by clustering related stories, measuring velocity, and correlating across data streams.

---

## Use Cases

| Use Case | Priority | Description |
|----------|----------|-------------|
| Situational Awareness | Primary | Stay informed about world events as they develop |
| Trading Signals | Primary | Identify market-moving events before mainstream coverage |
| Professional Intelligence | Primary | OSINT and risk assessment for work purposes |

---

## Design Principles

1. **High Precision Over Recall** - Only alert when multiple confirming signals align; minimize false positives
2. **Map as Hero** - Geographic context remains primary; don't subordinate to timeline views
3. **Responsiveness First** - Keep UI snappy; heavy computation should not block rendering
4. **Explicit Control** - Keyword-based monitors, not magic entity recognition
5. **Silent Failures** - Don't clutter UI with errors; provide status page for diagnostics

---

## Core Enhancements (Must-Have)

### 1. Event Clustering with Source Aggregation

**Problem:** Same event appears as 10+ separate items across feeds, creating noise and making velocity detection impossible.

**Solution:**
- Cluster related stories using title similarity (Jaccard index > 0.6 on normalized tokens)
- Display as single event card showing:
  - Primary headline (from highest-tier source)
  - Source count badge: "12 sources reporting"
  - Top 3 source names (prioritized by tier)
  - Expand to see all sources on click
- Clustering runs client-side on each feed refresh

**Source Tier System:**
```
Tier 1 (Wire Services): Reuters, AP, AFP, Bloomberg
Tier 2 (Major Outlets): BBC, Guardian, NYT, WSJ, CNN
Tier 3 (Specialty): Defense One, Foreign Policy, Bellingcat
Tier 4 (Aggregators): Google News, Hacker News, TechCrunch
```

**Data Model:**
```typescript
interface ClusteredEvent {
  id: string;
  primaryTitle: string;
  sourceCount: number;
  topSources: Array<{ name: string; tier: number; url: string }>;
  allItems: NewsItem[];
  firstSeen: Date;
  lastUpdated: Date;
  velocity: VelocityMetrics;
}
```

### 2. Velocity Detection Engine

**Problem:** Keyword alerts treat all mentions equally; need to detect acceleration in coverage.

**Solution:**
Track two velocity metrics per event/topic:

**Mention Velocity:**
- Rolling count of sources reporting over time windows
- Windows: 15min, 1hr, 6hr, 24hr
- Alert when current window exceeds 2σ above rolling average

**Sentiment Velocity:**
- Track positive/negative/neutral framing using keyword heuristics
- Alert when sentiment shifts significantly within a velocity spike
- Heuristics: presence of words like "escalate", "breakthrough", "collapse", "surge"

**Combined Alert Logic:**
```
ALERT if:
  (mention_velocity > 2σ) AND (
    (sentiment_shift > threshold) OR
    (source_diversity_jump) OR  // Story jumped from niche to mainstream
    (tier_1_source_added)       // Wire service picked it up
  )
```

**UI Indicator:**
- Velocity badge on clustered events: "🔥 +8 sources/hr"
- Color coding: green (normal), yellow (elevated), red (spike)

### 3. Historical Baselines with Deviation Alerts

**Problem:** "50 articles about Iran" means nothing without knowing if average is 12 or 45.

**Solution:**
- Maintain 7-day and 30-day rolling averages per:
  - Hotspot region (Iran, Ukraine, Taiwan, etc.)
  - Category (politics, tech, finance)
  - Custom monitor keywords
- Store in IndexedDB for persistence
- Calculate z-score for current activity vs baseline
- Alert when z > 2.0 (above baseline) or z < -2.0 (unusual silence)

**Display:**
- Baseline context shown on hover: "Iran: 47 mentions (7d avg: 12, +292%)"
- Deviation indicator in panel headers

### 4. Cross-Stream Correlation Detection

**Problem:** Alpha is in the lag between streams - Polymarket moves before news, stocks drop before coverage.

**Solution:**
Detect anomalies across three streams:
1. **News velocity** (clustered events, mention count)
2. **Prediction markets** (Polymarket probability shifts)
3. **Market data** (stock/sector price movements)

**Correlation Patterns to Detect:**
| Pattern | Description | Example |
|---------|-------------|---------|
| Prediction leads news | Polymarket moves >5% before story clusters | Polymarket on "Iran strike" spikes 4hrs before news |
| News leads markets | Velocity spike before sector move | Defense sector moves after Ukraine news spike |
| Silent divergence | Markets move, no news explanation | Oil drops 5% with zero energy news velocity |

**UI: Signal Modal**
- Modal pops up (not permanent panel) when significant cross-stream anomaly detected
- Shows: triggering event, correlated streams, confidence score
- Requires multiple confirming signals (high precision mode)
- Sound/visual alert on page when modal triggered

### 5. Full Historical Playback

**Problem:** Can't see what the dashboard looked like during a past event.

**Solution:**
- Snapshot dashboard state every 15 minutes to IndexedDB
- Store: all clustered events, velocity metrics, market prices, hotspot levels
- Playback UI: time slider to scrub through history
- Lightweight storage: delta compression between snapshots
- Retention: 7 days of history (configurable)

**Implementation:**
```typescript
interface DashboardSnapshot {
  timestamp: Date;
  events: ClusteredEvent[];
  hotspotLevels: Record<string, AlertLevel>;
  marketPrices: Record<string, number>;
  velocityMetrics: Record<string, VelocityMetrics>;
}
```

---

## Nice-to-Have Enhancements

### 6. Social Platform Integration (Telegram/X)

**Problem:** Major blind spot - social platforms often surface news before RSS feeds.

**Approach:**
- 5-10 minute polling latency (not real-time)
- Integration options:
  - Telegram: Public channel scraping via unofficial API or RSSHub bridge
  - X/Twitter: Nitter RSS bridge or official API (rate-limited)
- Curated channel list: OSINT accounts, breaking news channels
- Feed into clustering engine like any other source (Tier 4)

**Challenges:**
- Auth complexity
- Rate limits
- Content moderation risk
- Terms of service compliance

### 7. Sound/Visual Alerts

**Current:** Silent operation
**Enhancement:**
- Audible chime when signal modal triggers
- Visual: header bar flash or pulse animation
- Configurable: enable/disable, volume control
- Respect browser audio permissions

### 8. Expanded Regional Coverage

**Current Gaps:** Limited Africa, Latin America, Southeast Asia sources

**Potential Additions:**
- Africa: AllAfrica, African Arguments, ISS Africa
- LatAm: Americas Quarterly, Brazil-focused sources
- SEA: The Diplomat Asia, Channel News Asia, Nikkei Asia

### 9. Status/Health Dashboard

**Problem:** Errors fail silently; no visibility into system health.

**Solution:**
- Dedicated status page (not cluttering main UI)
- Per-source status: up/down/degraded
- Last successful fetch timestamp
- Error log with recent failures
- Accessible via settings menu

### 10. Data Export

**Use Case:** Analysis in external tools

**Format Options:**
- CSV: events, prices, velocity metrics
- JSON: full structured data
- Time range selection for export

---

## Additional Data Sources & Map Overlays

Based on analysis of existing geopolitical dashboards, the following data sources can enhance World Monitor's coverage:

### 11. Weather Alerts Overlay (Map-Plottable)

**Source:** National Weather Service API
**Endpoint:** `https://api.weather.gov/alerts/active?status=actual&severity=Extreme,Severe`

**Value Proposition:**
- Extreme weather events (hurricanes, severe storms, wildfires) correlate with market movements
- GeoJSON format with polygon coordinates → direct map plotting
- Real-time severity levels: Extreme, Severe, Moderate, Minor
- Free, no API key required, high reliability

**Data Model:**
```typescript
interface WeatherAlert {
  id: string;
  event: string;           // "Hurricane Warning", "Severe Thunderstorm"
  severity: 'Extreme' | 'Severe' | 'Moderate' | 'Minor';
  headline: string;
  description: string;
  geometry: GeoJSON.Polygon;
  effective: Date;
  expires: Date;
  areaDesc: string;        // "Miami-Dade County"
}
```

**Map Integration:**
- Plot alert polygons with severity-based color coding
- Red: Extreme | Orange: Severe | Yellow: Moderate
- Click for full alert details
- Auto-expire alerts past their `expires` timestamp

### 12. Federal Reserve Economic Data (FRED)

**Source:** Federal Reserve Bank of St. Louis
**Endpoint:** `https://fred.stlouisfed.org/graph/fredgraph.csv?id=WALCL`

**Key Series to Track:**
| Series ID | Description | Relevance |
|-----------|-------------|-----------|
| WALCL | Fed Total Assets | Liquidity indicator |
| FEDFUNDS | Federal Funds Rate | Interest rate policy |
| T10Y2Y | 10Y-2Y Treasury Spread | Recession indicator |
| UNRATE | Unemployment Rate | Labor market |
| CPIAUCSL | Consumer Price Index | Inflation |

**Value Proposition:**
- Leading economic indicators
- Correlate with market movements
- Weekly/monthly updates
- Free, no API key required

**Integration:**
- Display key indicators in dedicated panel
- Alert on significant changes (>0.5% for rates, >$50B for Fed assets)
- Historical chart on hover

### 13. Official Government Feeds

**Sources:**
| Source | Endpoint | Update Frequency |
|--------|----------|------------------|
| State Department | `https://www.state.gov/rss-feed/press-releases/feed/` | Daily |
| White House | `https://www.whitehouse.gov/news/feed/` | Daily |
| Pentagon (DOD) | `https://www.defense.gov/DesktopModules/ArticleCS/RSS.ashx` | Daily |

**Value Proposition:**
- Official government positions before media interpretation
- Policy announcements, sanctions, diplomatic statements
- Tier 1 authority for geopolitical events

**Source Tier:** Tier 1.5 (between Wire Services and Major Outlets)

### 14. Tech Industry News

**Sources:**
| Source | Endpoint | Focus |
|--------|----------|-------|
| OpenAI News | `https://openai.com/news/rss.xml` | AI developments |
| TechCrunch | Existing | Startups, funding |
| Ars Technica | `https://feeds.arstechnica.com/arstechnica/index` | Tech policy |

**Value Proposition:**
- AI developments increasingly geopolitically relevant
- Tech policy intersects with US-China relations
- Cybersecurity incidents

### 15. Reuters Taxonomy Feeds

**Sources:**
```
https://www.reutersagency.com/feed/?best-topics=political-general
https://www.reutersagency.com/feed/?best-topics=business-finance
https://www.reutersagency.com/feed/?best-topics=tech
https://www.reutersagency.com/feed/?taxonomy=best-regions&post_type=best
```

**Value Proposition:**
- Reuters is Tier 1 wire service
- Pre-categorized by topic (political, finance, tech)
- Regional taxonomy for geographic filtering
- High signal-to-noise ratio

---

## Architecture Considerations

### Performance

Given "prioritize responsiveness" requirement:
- Clustering runs in Web Worker (off main thread)
- Velocity calculations debounced, not real-time
- Snapshots written during idle periods (requestIdleCallback)
- IndexedDB for storage (async, doesn't block UI)
- Lazy load historical data only when playback activated

### Data Flow

```
[RSS Feeds] ──────┐
[Yahoo API] ──────┤
[Polymarket] ─────┤
[CoinGecko] ──────┼──▶ [Fetch Layer] ──▶ [Clustering Engine] ──▶ [Velocity Tracker]
[USGS] ───────────┤         │                    │                      │
[Weather.gov] ────┤         │                    │                      │
[FRED] ───────────┤         ▼                    ▼                      ▼
[Gov Feeds] ──────┘  [Raw Storage]     [Clustered Events]      [Baseline Store]
                            │                    │                      │
                            └────────────────────┼──────────────────────┘
                                                 ▼
                                       [Correlation Engine]
                                                 │
                                                 ▼
                                       [Signal Detection] ──▶ [Alert Modal]
                                                 │
                                                 ▼
                                          [Render Layer]
                                                 │
                              ┌──────────────────┼──────────────────┐
                              ▼                  ▼                  ▼
                     [News Timeline]      [Map + Overlays]   [Market Panel]
                                          - Hotspots
                                          - Weather Alerts
                                          - Earthquake Markers
```

### Storage Schema (IndexedDB)

```
worldmonitor_db
├── snapshots          // Dashboard state snapshots (playback)
├── baselines          // Rolling averages per topic
├── velocity_history   // Time series of velocity metrics
├── events             // Clustered events (current + recent)
└── settings           // User preferences
```

---

## Implementation Priority

### Phase 1: Foundation (Core Signal Detection)
1. Event clustering with source aggregation
2. Source tier system
3. Basic velocity detection (mention count only)
4. UI updates for clustered view

### Phase 2: Intelligence Layer
5. Full velocity engine (mention + sentiment)
6. Historical baselines with deviation alerts
7. Cross-stream correlation detection
8. Signal modal UI

### Phase 3: History & Polish
9. Full historical playback
10. Sound/visual alerts
11. Status dashboard
12. Data export

### Phase 4: Data Source Expansion
13. Weather alerts overlay (map-plottable, high value)
14. Official government feeds (State, White House, DOD)
15. Reuters taxonomy feeds
16. FRED economic indicators panel

### Phase 5: Social & Regional (Nice-to-Have)
17. Social platform integration (Telegram/X)
18. Regional coverage expansion
19. Tech industry feeds (OpenAI, Ars Technica)

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Duplicate stories shown | 10+ per event | 1 (clustered) |
| Time to detect significant event | Unknown | <5 min from first source |
| False positive alerts | N/A (no alerts) | <2 per day |
| Missed important events | "Frequent" | <1 per week |
| UI responsiveness (FCP) | ~1s | <1s maintained |

---

## Open Questions

1. **Clustering threshold:** Is Jaccard > 0.6 right, or does it over/under-cluster?
2. **Baseline window:** 7-day vs 30-day - which is more useful as primary?
3. **Social channel curation:** Who decides which Telegram/X accounts to follow?
4. **Playback storage:** 7 days of snapshots - how much IndexedDB space?
5. **Alert sound:** What sound is appropriate for a tactical dashboard?

---

## Appendix: Current Pain Points Addressed

| Pain Point | Root Cause | Solution |
|------------|------------|----------|
| Too much noise | Duplicate stories, no prioritization | Clustering + velocity |
| Missing niche/regional stories | Limited source coverage | Regional expansion + social |
| Missing slow-developing stories | Keyword threshold too high | Baseline deviation detection |
| Missing cross-domain events | Categories siloed | Cross-stream correlation |

---

*Spec complete. Ready for implementation.*
