import { Panel } from './Panel';
import type { NewsItem } from '@/types';
import { formatTime } from '@/utils';

export class NewsPanel extends Panel {
  constructor(id: string, title: string) {
    super({ id, title, showCount: true });
  }

  public renderNews(items: NewsItem[]): void {
    if (items.length === 0) {
      this.showError('No news available');
      return;
    }

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
}
