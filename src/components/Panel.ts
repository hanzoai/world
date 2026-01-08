export interface PanelOptions {
  id: string;
  title: string;
  showCount?: boolean;
  className?: string;
}

export class Panel {
  protected element: HTMLElement;
  protected content: HTMLElement;
  protected countEl: HTMLElement | null = null;

  constructor(options: PanelOptions) {
    this.element = document.createElement('div');
    this.element.className = `panel ${options.className || ''}`;
    this.element.dataset.panel = options.id;

    const header = document.createElement('div');
    header.className = 'panel-header';

    const headerLeft = document.createElement('div');
    headerLeft.className = 'panel-header-left';

    const title = document.createElement('span');
    title.className = 'panel-title';
    title.textContent = options.title;
    headerLeft.appendChild(title);

    header.appendChild(headerLeft);

    if (options.showCount) {
      this.countEl = document.createElement('span');
      this.countEl.className = 'panel-count';
      this.countEl.textContent = '0';
      header.appendChild(this.countEl);
    }

    this.content = document.createElement('div');
    this.content.className = 'panel-content';
    this.content.id = `${options.id}Content`;

    this.element.appendChild(header);
    this.element.appendChild(this.content);

    this.showLoading();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public showLoading(): void {
    this.content.innerHTML = '<div class="loading">Loading</div>';
  }

  public showError(message = 'Failed to load data'): void {
    this.content.innerHTML = `<div class="error-message">${message}</div>`;
  }

  public setCount(count: number): void {
    if (this.countEl) {
      this.countEl.textContent = count.toString();
    }
  }

  public setContent(html: string): void {
    this.content.innerHTML = html;
  }

  public show(): void {
    this.element.classList.remove('hidden');
  }

  public hide(): void {
    this.element.classList.add('hidden');
  }

  public toggle(visible: boolean): void {
    if (visible) this.show();
    else this.hide();
  }
}
