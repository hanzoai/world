import { Panel } from './Panel';
import type { PredictionMarket } from '@/types';

export class PredictionPanel extends Panel {
  constructor() {
    super({ id: 'polymarket', title: 'Prediction Markets' });
  }

  public renderPredictions(data: PredictionMarket[]): void {
    if (data.length === 0) {
      this.showError('Failed to load predictions');
      return;
    }

    const html = data
      .map(
        (p) => `
      <div class="prediction-item">
        <div class="prediction-question">${p.title}</div>
        <div class="prediction-bar">
          <div class="prediction-yes" style="width: ${p.yesPrice}%">${p.yesPrice.toFixed(0)}%</div>
          <div class="prediction-no">${(100 - p.yesPrice).toFixed(0)}%</div>
        </div>
      </div>
    `
      )
      .join('');

    this.setContent(html);
  }
}
