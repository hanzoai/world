import type { NewsItem, Monitor, PanelConfig, MapLayers } from '@/types';
import {
  FEEDS,
  INTEL_SOURCES,
  SECTORS,
  COMMODITIES,
  MARKET_SYMBOLS,
  REFRESH_INTERVALS,
  DEFAULT_PANELS,
  DEFAULT_MAP_LAYERS,
  STORAGE_KEYS,
} from '@/config';
import { fetchCategoryFeeds, fetchMultipleStocks, fetchCrypto, fetchPredictions, fetchEarthquakes } from '@/services';
import { loadFromStorage, saveToStorage } from '@/utils';
import {
  MapComponent,
  NewsPanel,
  MarketPanel,
  HeatmapPanel,
  CommoditiesPanel,
  CryptoPanel,
  PredictionPanel,
  MonitorPanel,
  Panel,
} from '@/components';

export class App {
  private container: HTMLElement;
  private map: MapComponent | null = null;
  private panels: Record<string, Panel> = {};
  private newsPanels: Record<string, NewsPanel> = {};
  private allNews: NewsItem[] = [];
  private monitors: Monitor[];
  private panelSettings: Record<string, PanelConfig>;
  private mapLayers: MapLayers;

  constructor(containerId: string) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Container ${containerId} not found`);
    this.container = el;

    this.monitors = loadFromStorage<Monitor[]>(STORAGE_KEYS.monitors, []);
    this.panelSettings = loadFromStorage<Record<string, PanelConfig>>(
      STORAGE_KEYS.panels,
      DEFAULT_PANELS
    );
    this.mapLayers = loadFromStorage<MapLayers>(STORAGE_KEYS.mapLayers, DEFAULT_MAP_LAYERS);
  }

  public async init(): Promise<void> {
    this.renderLayout();
    this.setupEventListeners();
    await this.loadAllData();
    this.setupRefreshIntervals();
  }

  private renderLayout(): void {
    this.container.innerHTML = `
      <div class="header">
        <div class="header-left">
          <span class="logo">WORLD MONITOR</span>
          <span class="credit">by Elie Habib</span>
          <div class="status-indicator">
            <span class="status-dot"></span>
            <span>LIVE</span>
          </div>
        </div>
        <div class="header-center">
          <button class="view-btn active" data-view="global">GLOBAL</button>
          <button class="view-btn" data-view="us">US</button>
          <button class="view-btn" data-view="mena">MENA</button>
        </div>
        <div class="header-right">
          <span class="time-display" id="timeDisplay">--:--:-- UTC</span>
          <button class="settings-btn" id="settingsBtn">⚙ PANELS</button>
        </div>
      </div>
      <div class="main-content">
        <div class="map-section" id="mapSection">
          <div class="panel-header">
            <div class="panel-header-left">
              <span class="panel-title">Global Situation</span>
            </div>
          </div>
          <div class="map-container" id="mapContainer"></div>
          <div class="map-resize-handle" id="mapResizeHandle"></div>
        </div>
        <div class="panels-grid" id="panelsGrid"></div>
      </div>
      <div class="modal-overlay" id="settingsModal">
        <div class="modal">
          <div class="modal-header">
            <span class="modal-title">Panel Settings</span>
            <button class="modal-close" id="modalClose">×</button>
          </div>
          <div class="panel-toggle-grid" id="panelToggles"></div>
        </div>
      </div>
    `;

    this.createPanels();
    this.renderPanelToggles();
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
  }

  private createPanels(): void {
    const panelsGrid = document.getElementById('panelsGrid')!;

    // Initialize map in the map section
    const mapContainer = document.getElementById('mapContainer') as HTMLElement;
    this.map = new MapComponent(mapContainer, {
      zoom: 1,
      pan: { x: 0, y: 0 },
      view: 'global',
      layers: this.mapLayers,
      timeRange: '7d',
    });

    // Create all panels
    const politicsPanel = new NewsPanel('politics', 'World / Geopolitical');
    this.newsPanels['politics'] = politicsPanel;
    this.panels['politics'] = politicsPanel;

    const techPanel = new NewsPanel('tech', 'Technology / AI');
    this.newsPanels['tech'] = techPanel;
    this.panels['tech'] = techPanel;

    const financePanel = new NewsPanel('finance', 'Financial News');
    this.newsPanels['finance'] = financePanel;
    this.panels['finance'] = financePanel;

    const heatmapPanel = new HeatmapPanel();
    this.panels['heatmap'] = heatmapPanel;

    const marketsPanel = new MarketPanel();
    this.panels['markets'] = marketsPanel;

    const monitorPanel = new MonitorPanel(this.monitors);
    this.panels['monitors'] = monitorPanel;
    monitorPanel.onChanged((monitors) => {
      this.monitors = monitors;
      saveToStorage(STORAGE_KEYS.monitors, monitors);
      this.updateMonitorResults();
    });

    const commoditiesPanel = new CommoditiesPanel();
    this.panels['commodities'] = commoditiesPanel;

    const predictionPanel = new PredictionPanel();
    this.panels['polymarket'] = predictionPanel;

    const govPanel = new NewsPanel('gov', 'Government / Policy');
    this.newsPanels['gov'] = govPanel;
    this.panels['gov'] = govPanel;

    const intelPanel = new NewsPanel('intel', 'Intel Feed');
    this.newsPanels['intel'] = intelPanel;
    this.panels['intel'] = intelPanel;

    const cryptoPanel = new CryptoPanel();
    this.panels['crypto'] = cryptoPanel;

    const middleeastPanel = new NewsPanel('middleeast', 'Middle East / MENA');
    this.newsPanels['middleeast'] = middleeastPanel;
    this.panels['middleeast'] = middleeastPanel;

    const layoffsPanel = new NewsPanel('layoffs', 'Layoffs Tracker');
    this.newsPanels['layoffs'] = layoffsPanel;
    this.panels['layoffs'] = layoffsPanel;

    const congressPanel = new NewsPanel('congress', 'Congress Trades');
    this.newsPanels['congress'] = congressPanel;
    this.panels['congress'] = congressPanel;

    const aiPanel = new NewsPanel('ai', 'AI / ML');
    this.newsPanels['ai'] = aiPanel;
    this.panels['ai'] = aiPanel;

    const thinktanksPanel = new NewsPanel('thinktanks', 'Think Tanks');
    this.newsPanels['thinktanks'] = thinktanksPanel;
    this.panels['thinktanks'] = thinktanksPanel;

    // Add panels to grid in saved order
    const defaultOrder = ['politics', 'middleeast', 'tech', 'ai', 'finance', 'layoffs', 'congress', 'heatmap', 'markets', 'commodities', 'crypto', 'polymarket', 'gov', 'thinktanks', 'intel', 'monitors'];
    const savedOrder = this.getSavedPanelOrder();
    // Merge saved order with default to include new panels
    let panelOrder = defaultOrder;
    if (savedOrder.length > 0) {
      // Add any missing panels from default that aren't in saved order
      const missing = defaultOrder.filter(k => !savedOrder.includes(k));
      // Remove any saved panels that no longer exist
      const valid = savedOrder.filter(k => defaultOrder.includes(k));
      // Insert missing panels after 'politics' (except monitors which goes at end)
      const monitorsIdx = valid.indexOf('monitors');
      if (monitorsIdx !== -1) valid.splice(monitorsIdx, 1); // Remove monitors temporarily
      const insertIdx = valid.indexOf('politics') + 1 || 0;
      const newPanels = missing.filter(k => k !== 'monitors');
      valid.splice(insertIdx, 0, ...newPanels);
      valid.push('monitors'); // Always put monitors last
      panelOrder = valid;
    }

    panelOrder.forEach((key: string) => {
      const panel = this.panels[key];
      if (panel) {
        const el = panel.getElement();
        this.makeDraggable(el, key);
        panelsGrid.appendChild(el);
      }
    });

    this.applyPanelSettings();
  }

  private getSavedPanelOrder(): string[] {
    try {
      const saved = localStorage.getItem('panel-order');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  private savePanelOrder(): void {
    const grid = document.getElementById('panelsGrid');
    if (!grid) return;
    const order = Array.from(grid.children)
      .map((el) => (el as HTMLElement).dataset.panel)
      .filter((key): key is string => !!key);
    localStorage.setItem('panel-order', JSON.stringify(order));
  }

  private makeDraggable(el: HTMLElement, key: string): void {
    el.draggable = true;
    el.dataset.panel = key;

    el.addEventListener('dragstart', (e) => {
      el.classList.add('dragging');
      e.dataTransfer?.setData('text/plain', key);
    });

    el.addEventListener('dragend', () => {
      el.classList.remove('dragging');
      this.savePanelOrder();
    });

    el.addEventListener('dragover', (e) => {
      e.preventDefault();
      const dragging = document.querySelector('.dragging');
      if (!dragging || dragging === el) return;

      const grid = document.getElementById('panelsGrid');
      if (!grid) return;

      const siblings = Array.from(grid.children).filter((c) => c !== dragging);
      const nextSibling = siblings.find((sibling) => {
        const rect = sibling.getBoundingClientRect();
        return e.clientY < rect.top + rect.height / 2;
      });

      if (nextSibling) {
        grid.insertBefore(dragging, nextSibling);
      } else {
        grid.appendChild(dragging);
      }
    });
  }

  private setupEventListeners(): void {
    // View buttons
    document.querySelectorAll('.view-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.view-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const view = (btn as HTMLElement).dataset.view as 'global' | 'us' | 'mena';
        this.map?.setView(view);
      });
    });

    // Settings modal
    document.getElementById('settingsBtn')?.addEventListener('click', () => {
      document.getElementById('settingsModal')?.classList.add('active');
    });

    document.getElementById('modalClose')?.addEventListener('click', () => {
      document.getElementById('settingsModal')?.classList.remove('active');
    });

    document.getElementById('settingsModal')?.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
        (e.target as HTMLElement).classList.remove('active');
      }
    });

    // Window resize
    window.addEventListener('resize', () => {
      this.map?.render();
    });

    // Map section resize handle
    this.setupMapResize();
  }

  private setupMapResize(): void {
    const mapSection = document.getElementById('mapSection');
    const resizeHandle = document.getElementById('mapResizeHandle');
    if (!mapSection || !resizeHandle) return;

    // Load saved height
    const savedHeight = localStorage.getItem('map-height');
    if (savedHeight) {
      mapSection.style.height = savedHeight;
    }

    let isResizing = false;
    let startY = 0;
    let startHeight = 0;

    resizeHandle.addEventListener('mousedown', (e) => {
      isResizing = true;
      startY = e.clientY;
      startHeight = mapSection.offsetHeight;
      mapSection.classList.add('resizing');
      document.body.style.cursor = 'ns-resize';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      const deltaY = e.clientY - startY;
      const newHeight = Math.max(400, Math.min(startHeight + deltaY, window.innerHeight * 0.85));
      mapSection.style.height = `${newHeight}px`;
      this.map?.render();
    });

    document.addEventListener('mouseup', () => {
      if (!isResizing) return;
      isResizing = false;
      mapSection.classList.remove('resizing');
      document.body.style.cursor = '';
      // Save height preference
      localStorage.setItem('map-height', mapSection.style.height);
      this.map?.render();
    });
  }

  private renderPanelToggles(): void {
    const container = document.getElementById('panelToggles')!;
    container.innerHTML = Object.entries(this.panelSettings)
      .map(
        ([key, panel]) => `
        <div class="panel-toggle-item ${panel.enabled ? 'active' : ''}" data-panel="${key}">
          <div class="panel-toggle-checkbox">${panel.enabled ? '✓' : ''}</div>
          <span class="panel-toggle-label">${panel.name}</span>
        </div>
      `
      )
      .join('');

    container.querySelectorAll('.panel-toggle-item').forEach((item) => {
      item.addEventListener('click', () => {
        const panelKey = (item as HTMLElement).dataset.panel!;
        const config = this.panelSettings[panelKey];
        if (config) {
          config.enabled = !config.enabled;
          saveToStorage(STORAGE_KEYS.panels, this.panelSettings);
          this.renderPanelToggles();
          this.applyPanelSettings();
        }
      });
    });
  }

  private applyPanelSettings(): void {
    Object.entries(this.panelSettings).forEach(([key, config]) => {
      if (key === 'map') {
        const mapSection = document.getElementById('mapSection');
        if (mapSection) {
          mapSection.classList.toggle('hidden', !config.enabled);
        }
        return;
      }
      const panel = this.panels[key];
      panel?.toggle(config.enabled);
    });
  }

  private updateTime(): void {
    const now = new Date();
    const el = document.getElementById('timeDisplay');
    if (el) {
      el.textContent = now.toUTCString().split(' ')[4] + ' UTC';
    }
  }

  private async loadAllData(): Promise<void> {
    await Promise.all([
      this.loadNews(),
      this.loadMarkets(),
      this.loadPredictions(),
      this.loadEarthquakes(),
    ]);
  }

  private async loadNews(): Promise<void> {
    this.allNews = [];

    // Politics
    const politics = await fetchCategoryFeeds(FEEDS.politics ?? []);
    this.newsPanels['politics']?.renderNews(politics);
    this.allNews.push(...politics);

    // Tech
    const tech = await fetchCategoryFeeds(FEEDS.tech ?? []);
    this.newsPanels['tech']?.renderNews(tech);
    this.allNews.push(...tech);

    // Finance
    const finance = await fetchCategoryFeeds(FEEDS.finance ?? []);
    this.newsPanels['finance']?.renderNews(finance);
    this.allNews.push(...finance);

    // Gov
    const gov = await fetchCategoryFeeds(FEEDS.gov ?? []);
    this.newsPanels['gov']?.renderNews(gov);
    this.allNews.push(...gov);

    // Middle East
    const middleeast = await fetchCategoryFeeds(FEEDS.middleeast ?? []);
    this.newsPanels['middleeast']?.renderNews(middleeast);
    this.allNews.push(...middleeast);

    // Layoffs
    const layoffs = await fetchCategoryFeeds(FEEDS.layoffs ?? []);
    this.newsPanels['layoffs']?.renderNews(layoffs);
    this.allNews.push(...layoffs);

    // Congress Trades
    const congress = await fetchCategoryFeeds(FEEDS.congress ?? []);
    this.newsPanels['congress']?.renderNews(congress);
    this.allNews.push(...congress);

    // AI / ML
    const ai = await fetchCategoryFeeds(FEEDS.ai ?? []);
    this.newsPanels['ai']?.renderNews(ai);
    this.allNews.push(...ai);

    // Think Tanks
    const thinktanks = await fetchCategoryFeeds(FEEDS.thinktanks ?? []);
    this.newsPanels['thinktanks']?.renderNews(thinktanks);
    this.allNews.push(...thinktanks);

    // Intel
    const intel = await fetchCategoryFeeds(INTEL_SOURCES);
    this.newsPanels['intel']?.renderNews(intel);
    this.allNews.push(...intel);

    // Update map hotspots
    this.map?.updateHotspotActivity(this.allNews);

    // Update monitors
    this.updateMonitorResults();
  }

  private async loadMarkets(): Promise<void> {
    // Stocks
    const stocks = await fetchMultipleStocks(MARKET_SYMBOLS);
    (this.panels['markets'] as MarketPanel).renderMarkets(stocks);

    // Sectors
    const sectors = await fetchMultipleStocks(SECTORS.map((s) => ({ ...s, display: s.name })));
    (this.panels['heatmap'] as HeatmapPanel).renderHeatmap(
      sectors.map((s) => ({ name: s.name, change: s.change }))
    );

    // Commodities
    const commodities = await fetchMultipleStocks(COMMODITIES);
    (this.panels['commodities'] as CommoditiesPanel).renderCommodities(
      commodities.map((c) => ({ display: c.display, price: c.price, change: c.change }))
    );

    // Crypto
    const crypto = await fetchCrypto();
    (this.panels['crypto'] as CryptoPanel).renderCrypto(crypto);
  }

  private async loadPredictions(): Promise<void> {
    const predictions = await fetchPredictions();
    (this.panels['polymarket'] as PredictionPanel).renderPredictions(predictions);
  }

  private async loadEarthquakes(): Promise<void> {
    const earthquakes = await fetchEarthquakes();
    this.map?.setEarthquakes(earthquakes);
  }

  private updateMonitorResults(): void {
    const monitorPanel = this.panels['monitors'] as MonitorPanel;
    monitorPanel.renderResults(this.allNews);
  }

  private setupRefreshIntervals(): void {
    setInterval(() => this.loadNews(), REFRESH_INTERVALS.feeds);
    setInterval(() => this.loadMarkets(), REFRESH_INTERVALS.markets);
    setInterval(() => this.loadPredictions(), REFRESH_INTERVALS.predictions);
    setInterval(() => this.loadEarthquakes(), 5 * 60 * 1000);
  }
}
