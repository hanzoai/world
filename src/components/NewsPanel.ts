import { Panel } from './Panel';
import type { NewsItem, ClusteredEvent, DeviationLevel } from '@/types';
import { formatTime } from '@/utils';
import { clusterNews, enrichWithVelocity } from '@/services';

export class NewsPanel extends Panel {
  private clusteredMode = true;
  private deviationEl: HTMLElement | null = null;

  constructor(id: string, title: string) {
    super({ id, title, showCount: true });
    this.createDeviationIndicator();
  }

  private createDeviationIndicator(): void {
    const header = this.getElement().querySelector('.panel-header-left');
    if (header) {
      this.deviationEl = document.createElement('span');
      this.deviationEl.className = 'deviation-indicator';
      header.appendChild(this.deviationEl);
    }
  }

  public setDeviation(zScore: number, percentChange: number, level: DeviationLevel): void {
    if (!this.deviationEl) return;

    if (level === 'normal') {
      this.deviationEl.textContent = '';
      this.deviationEl.className = 'deviation-indicator';
      return;
    }

    const arrow = zScore > 0 ? '↑' : '↓';
    const sign = percentChange > 0 ? '+' : '';
    this.deviationEl.textContent = `${arrow}${sign}${percentChange}%`;
    this.deviationEl.className = `deviation-indicator ${level}`;
    this.deviationEl.title = `z-score: ${zScore} (vs 7-day avg)`;
  }

  public renderNews(items: NewsItem[]): void {
    if (items.length === 0) {
      this.showError('No news available');
      return;
    }

    if (this.clusteredMode) {
      const clusters = clusterNews(items);
      const enriched = enrichWithVelocity(clusters);
      this.renderClusters(enriched);
    } else {
      this.renderFlat(items);
    }
  }

  private renderFlat(items: NewsItem[]): void {
    this.setCount(items.length);

    const html = items
      .map(
        (item) => `
      <div class="item ${item.isAlert ? 'alert' : ''}" ${item.monitorColor ? `style="border-left-color: ${item.monitorColor}"` : ''}>
        <div class="item-source">
          ${item.source}
          ${item.isAlert ? '<span class="alert-tag">ALERT</span>' : ''}
        </div>
        <a class="item-title" href="${item.link}" target="_blank" rel="noopener">${item.title}</a>
        <div class="item-time">${formatTime(item.pubDate)}</div>
      </div>
    `
      )
      .join('');

    this.setContent(html);
  }

  private renderClusters(clusters: ClusteredEvent[]): void {
    const totalItems = clusters.reduce((sum, c) => sum + c.sourceCount, 0);
    this.setCount(totalItems);

    const html = clusters
      .map((cluster) => {
        const sourceBadge = cluster.sourceCount > 1
          ? `<span class="source-count">${cluster.sourceCount} sources</span>`
          : '';

        const velocity = cluster.velocity;
        const velocityBadge = velocity && velocity.level !== 'normal' && cluster.sourceCount > 1
          ? `<span class="velocity-badge ${velocity.level}">${velocity.trend === 'rising' ? '↑' : ''}+${velocity.sourcesPerHour}/hr</span>`
          : '';

        const sentimentIcon = velocity?.sentiment === 'negative' ? '⚠' : velocity?.sentiment === 'positive' ? '✓' : '';
        const sentimentBadge = sentimentIcon && Math.abs(velocity?.sentimentScore || 0) > 2
          ? `<span class="sentiment-badge ${velocity?.sentiment}">${sentimentIcon}</span>`
          : '';

        const topSourcesHtml = cluster.topSources
          .map(s => `<span class="top-source tier-${s.tier}">${s.name}</span>`)
          .join('');

        return `
      <div class="item clustered ${cluster.isAlert ? 'alert' : ''}" ${cluster.monitorColor ? `style="border-left-color: ${cluster.monitorColor}"` : ''} data-cluster-id="${cluster.id}">
        <div class="item-source">
          ${cluster.primarySource}
          ${sourceBadge}
          ${velocityBadge}
          ${sentimentBadge}
          ${cluster.isAlert ? '<span class="alert-tag">ALERT</span>' : ''}
        </div>
        <a class="item-title" href="${cluster.primaryLink}" target="_blank" rel="noopener">${cluster.primaryTitle}</a>
        <div class="cluster-meta">
          <span class="top-sources">${topSourcesHtml}</span>
          <span class="item-time">${formatTime(cluster.lastUpdated)}</span>
        </div>
      </div>
    `;
      })
      .join('');

    this.setContent(html);
  }
}
