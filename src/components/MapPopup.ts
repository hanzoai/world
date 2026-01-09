import type { ConflictZone, Hotspot, Earthquake, NewsItem } from '@/types';
import type { WeatherAlert } from '@/services/weather';

export type PopupType = 'conflict' | 'hotspot' | 'earthquake' | 'weather';

interface PopupData {
  type: PopupType;
  data: ConflictZone | Hotspot | Earthquake | WeatherAlert;
  relatedNews?: NewsItem[];
  x: number;
  y: number;
}

export class MapPopup {
  private container: HTMLElement;
  private popup: HTMLElement | null = null;
  private onClose?: () => void;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public show(data: PopupData): void {
    this.hide();

    this.popup = document.createElement('div');
    this.popup.className = 'map-popup';

    const content = this.renderContent(data);
    this.popup.innerHTML = content;

    // Position popup
    const maxX = this.container.clientWidth - 400;
    const maxY = this.container.clientHeight - 300;
    this.popup.style.left = `${Math.min(data.x + 20, maxX)}px`;
    this.popup.style.top = `${Math.min(data.y - 20, maxY)}px`;

    this.container.appendChild(this.popup);

    // Close button handler
    this.popup.querySelector('.popup-close')?.addEventListener('click', () => this.hide());

    // Click outside to close
    setTimeout(() => {
      document.addEventListener('click', this.handleOutsideClick);
    }, 100);
  }

  private handleOutsideClick = (e: MouseEvent) => {
    if (this.popup && !this.popup.contains(e.target as Node)) {
      this.hide();
    }
  };

  public hide(): void {
    if (this.popup) {
      this.popup.remove();
      this.popup = null;
      document.removeEventListener('click', this.handleOutsideClick);
      this.onClose?.();
    }
  }

  public setOnClose(callback: () => void): void {
    this.onClose = callback;
  }

  private renderContent(data: PopupData): string {
    switch (data.type) {
      case 'conflict':
        return this.renderConflictPopup(data.data as ConflictZone);
      case 'hotspot':
        return this.renderHotspotPopup(data.data as Hotspot, data.relatedNews);
      case 'earthquake':
        return this.renderEarthquakePopup(data.data as Earthquake);
      case 'weather':
        return this.renderWeatherPopup(data.data as WeatherAlert);
      default:
        return '';
    }
  }

  private renderConflictPopup(conflict: ConflictZone): string {
    const severityClass = conflict.intensity === 'high' ? 'high' : conflict.intensity === 'medium' ? 'medium' : 'low';
    const severityLabel = conflict.intensity?.toUpperCase() || 'UNKNOWN';

    return `
      <div class="popup-header conflict">
        <span class="popup-title">${conflict.name.toUpperCase()}</span>
        <span class="popup-badge ${severityClass}">${severityLabel}</span>
        <button class="popup-close">×</button>
      </div>
      <div class="popup-body">
        <div class="popup-stats">
          <div class="popup-stat">
            <span class="stat-label">START DATE</span>
            <span class="stat-value">${conflict.startDate || 'Unknown'}</span>
          </div>
          <div class="popup-stat">
            <span class="stat-label">CASUALTIES</span>
            <span class="stat-value">${conflict.casualties || 'Unknown'}</span>
          </div>
          <div class="popup-stat">
            <span class="stat-label">DISPLACED</span>
            <span class="stat-value">${conflict.displaced || 'Unknown'}</span>
          </div>
          <div class="popup-stat">
            <span class="stat-label">LOCATION</span>
            <span class="stat-value">${conflict.location || `${conflict.center[1]}°N, ${conflict.center[0]}°E`}</span>
          </div>
        </div>
        ${conflict.description ? `<p class="popup-description">${conflict.description}</p>` : ''}
        ${conflict.parties && conflict.parties.length > 0 ? `
          <div class="popup-section">
            <span class="section-label">BELLIGERENTS</span>
            <div class="popup-tags">
              ${conflict.parties.map(p => `<span class="popup-tag">${p}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        ${conflict.keyDevelopments && conflict.keyDevelopments.length > 0 ? `
          <div class="popup-section">
            <span class="section-label">KEY DEVELOPMENTS</span>
            <ul class="popup-list">
              ${conflict.keyDevelopments.map(d => `<li>${d}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `;
  }

  private renderHotspotPopup(hotspot: Hotspot, relatedNews?: NewsItem[]): string {
    const severityClass = hotspot.level || 'low';
    const severityLabel = (hotspot.level || 'low').toUpperCase();

    return `
      <div class="popup-header hotspot">
        <span class="popup-title">${hotspot.name.toUpperCase()}</span>
        <span class="popup-badge ${severityClass}">${severityLabel}</span>
        <button class="popup-close">×</button>
      </div>
      <div class="popup-body">
        ${hotspot.subtext ? `<div class="popup-subtitle">${hotspot.subtext}</div>` : ''}
        ${hotspot.description ? `<p class="popup-description">${hotspot.description}</p>` : ''}
        <div class="popup-stats">
          <div class="popup-stat">
            <span class="stat-label">COORDINATES</span>
            <span class="stat-value">${hotspot.lat.toFixed(2)}°N, ${hotspot.lon.toFixed(2)}°E</span>
          </div>
          <div class="popup-stat">
            <span class="stat-label">STATUS</span>
            <span class="stat-value">${hotspot.status || 'Monitoring'}</span>
          </div>
        </div>
        ${hotspot.agencies && hotspot.agencies.length > 0 ? `
          <div class="popup-section">
            <span class="section-label">KEY ENTITIES</span>
            <div class="popup-tags">
              ${hotspot.agencies.map(a => `<span class="popup-tag">${a}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        ${relatedNews && relatedNews.length > 0 ? `
          <div class="popup-section">
            <span class="section-label">RELATED HEADLINES</span>
            <div class="popup-news">
              ${relatedNews.slice(0, 5).map(n => `
                <div class="popup-news-item">
                  <span class="news-source">${n.source}</span>
                  <a href="${n.link}" target="_blank" class="news-title">${n.title}</a>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  private renderEarthquakePopup(earthquake: Earthquake): string {
    const severity = earthquake.magnitude >= 6 ? 'high' : earthquake.magnitude >= 5 ? 'medium' : 'low';
    const severityLabel = earthquake.magnitude >= 6 ? 'MAJOR' : earthquake.magnitude >= 5 ? 'MODERATE' : 'MINOR';

    const timeAgo = this.getTimeAgo(earthquake.time);

    return `
      <div class="popup-header earthquake">
        <span class="popup-title magnitude">M${earthquake.magnitude.toFixed(1)}</span>
        <span class="popup-badge ${severity}">${severityLabel}</span>
        <button class="popup-close">×</button>
      </div>
      <div class="popup-body">
        <p class="popup-location">${earthquake.place}</p>
        <div class="popup-stats">
          <div class="popup-stat">
            <span class="stat-label">Depth</span>
            <span class="stat-value">${earthquake.depth.toFixed(1)} km</span>
          </div>
          <div class="popup-stat">
            <span class="stat-label">Coordinates</span>
            <span class="stat-value">${earthquake.lat.toFixed(2)}°, ${earthquake.lon.toFixed(2)}°</span>
          </div>
          <div class="popup-stat">
            <span class="stat-label">Time</span>
            <span class="stat-value">${timeAgo}</span>
          </div>
        </div>
        <a href="${earthquake.url}" target="_blank" class="popup-link">View on USGS →</a>
      </div>
    `;
  }

  private getTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  private renderWeatherPopup(alert: WeatherAlert): string {
    const severityClass = alert.severity.toLowerCase();
    const expiresIn = this.getTimeUntil(alert.expires);

    return `
      <div class="popup-header weather ${severityClass}">
        <span class="popup-title">${alert.event.toUpperCase()}</span>
        <span class="popup-badge ${severityClass}">${alert.severity.toUpperCase()}</span>
        <button class="popup-close">×</button>
      </div>
      <div class="popup-body">
        <p class="popup-headline">${alert.headline}</p>
        <div class="popup-stats">
          <div class="popup-stat">
            <span class="stat-label">Area</span>
            <span class="stat-value">${alert.areaDesc}</span>
          </div>
          <div class="popup-stat">
            <span class="stat-label">Expires</span>
            <span class="stat-value">${expiresIn}</span>
          </div>
        </div>
        <p class="popup-description">${alert.description.slice(0, 300)}${alert.description.length > 300 ? '...' : ''}</p>
      </div>
    `;
  }

  private getTimeUntil(date: Date): string {
    const ms = date.getTime() - Date.now();
    if (ms <= 0) return 'Expired';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    if (hours < 1) return `${Math.floor(ms / (1000 * 60))}m`;
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  }
}
