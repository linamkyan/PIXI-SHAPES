export interface UIViewConfig {
  statsContainer: HTMLElement;
  controlsContainer: HTMLElement;
}

export class UIView {
  private shapeCountEl: HTMLInputElement | null = null;
  private surfaceAreaEl: HTMLInputElement | null = null;
  private spawnRateEl: HTMLInputElement | null = null;
  private gravityEl: HTMLInputElement | null = null;
  private onSpawnRateChange?: (rate: number) => void;
  private onGravityChange?: (gravity: number) => void;
  private statsRow: HTMLDivElement | null = null;
  private controlsRow: HTMLDivElement | null = null;

  private static stylesInjected = false;
  private static styleElement: HTMLStyleElement | null = null;

  constructor(config: UIViewConfig) {
    UIView.injectStyles();
    this.buildStats(config.statsContainer);
    this.buildControls(config.controlsContainer);
  }

  private static injectStyles(): void {
    if (UIView.stylesInjected) return;
    UIView.stylesInjected = true;

    const style = document.createElement('style');
    style.textContent = `
      .ui-stats,
      .ui-controls {
        display: flex;
        gap: 16px;
        align-items: flex-end;
        flex-wrap: wrap;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .ui-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .ui-field__label {
        font-size: 11px;
        font-weight: 600;
        color: #707070;
        text-transform: uppercase;
        letter-spacing: 0.07em;
      }
      .ui-textfield {
        width: 160px;
        height: 42px;
        padding: 0 11px;
        border: 1.5px solid #DBDBDB;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        color: #1a1a1a;
        background: #ffffff;
        font-variant-numeric: tabular-nums;
        cursor: default;
        outline: none;
        caret-color: transparent;
        font-family: inherit;
        box-sizing: border-box;
      }
      .ui-control-row {
        display: flex;
        align-items: flex-end;
        gap: 8px;
      }
      .ui-btn-group {
        display: flex;
        border-radius: 8px;
        overflow: hidden;
        border: 1.5px solid #DBDBDB;
      }
      .ui-btn {
        width: 42px;
        height: 42px;
        border: none;
        cursor: pointer;
        font-size: 22px;
        font-weight: 700;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.13s, transform 0.08s;
        flex-shrink: 0;
        user-select: none;
        background: #80C242;
        color: #ffffff;
        outline: none;
        box-sizing: border-box;
      }
      .ui-btn + .ui-btn {
        border-left: 1px solid rgba(255,255,255,0.25);
      }
      .ui-btn:hover  { background: #6aaa34; }
      .ui-btn:active { background: #5a9428; transform: scale(0.93); }
      .ui-stepper__value {
        width: 80px;
        height: 42px;
        background: #ffffff;
        color: #1a1a1a;
        border: 1.5px solid #DBDBDB;
        border-radius: 6px;
        font-size: 18px;
        font-weight: 700;
        text-align: center;
        font-variant-numeric: tabular-nums;
        cursor: default;
        outline: none;
        caret-color: transparent;
        padding: 0;
        font-family: inherit;
        box-sizing: border-box;
      }
    `;
    document.head.appendChild(style);
    UIView.styleElement = style;
  }

  private makeTextField(width = '160px'): HTMLInputElement {
    const el = document.createElement('input');
    el.type = 'text';
    el.readOnly = true;
    el.className = 'ui-textfield';
    el.style.width = width;
    return el;
  }

  private makeStepperInput(): HTMLInputElement {
    const el = document.createElement('input');
    el.type = 'text';
    el.readOnly = true;
    el.className = 'ui-stepper__value';
    return el;
  }

  private makeBtn(text: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = 'ui-btn';
    btn.textContent = text;
    btn.addEventListener('click', onClick);
    return btn;
  }

  private buildStats(container: HTMLElement): void {
    const row = document.createElement('div');
    row.className = 'ui-stats';

    const countField = document.createElement('div');
    countField.className = 'ui-field';
    const countLabel = document.createElement('label');
    countLabel.className = 'ui-field__label';
    countLabel.textContent = 'Number of current shapes';
    this.shapeCountEl = this.makeTextField();
    this.shapeCountEl.value = '0';
    countField.append(countLabel, this.shapeCountEl);

    const areaField = document.createElement('div');
    areaField.className = 'ui-field';
    const areaLabel = document.createElement('label');
    areaLabel.className = 'ui-field__label';
    areaLabel.textContent = 'Surface area occupied by shapes';
    this.surfaceAreaEl = this.makeTextField('190px');
    this.surfaceAreaEl.value = '0';
    areaField.append(areaLabel, this.surfaceAreaEl);

    row.append(countField, areaField);
    container.appendChild(row);
    this.statsRow = row;
  }

  private buildControls(container: HTMLElement): void {
    const row = document.createElement('div');
    row.className = 'ui-controls';

    const spawnField = document.createElement('div');
    spawnField.className = 'ui-field';
    const spawnLabel = document.createElement('label');
    spawnLabel.className = 'ui-field__label';
    spawnLabel.textContent = 'Number of shapes per sec';
    this.spawnRateEl = this.makeStepperInput();
    this.spawnRateEl.value = '1';

    const spawnControlRow = document.createElement('div');
    spawnControlRow.className = 'ui-control-row';

    const spawnBtnGroup = document.createElement('div');
    spawnBtnGroup.className = 'ui-btn-group';
    spawnBtnGroup.append(
      this.makeBtn('−', () => {
        const val = Math.max(1, parseInt(this.spawnRateEl!.value || '1', 10) - 1);
        this.setSpawnRate(val);
        this.onSpawnRateChange?.(val);
      }),
      this.makeBtn('+', () => {
        const val = Math.min(20, parseInt(this.spawnRateEl!.value || '1', 10) + 1);
        this.setSpawnRate(val);
        this.onSpawnRateChange?.(val);
      }),
    );
    spawnControlRow.append(spawnBtnGroup, this.spawnRateEl);
    spawnField.append(spawnLabel, spawnControlRow);

    const gravityField = document.createElement('div');
    gravityField.className = 'ui-field';
    const gravityLabel = document.createElement('label');
    gravityLabel.className = 'ui-field__label';
    gravityLabel.textContent = 'Gravity Value';
    this.gravityEl = this.makeStepperInput();
    this.gravityEl.value = '1';

    const gravityControlRow = document.createElement('div');
    gravityControlRow.className = 'ui-control-row';

    const gravityBtnGroup = document.createElement('div');
    gravityBtnGroup.className = 'ui-btn-group';
    gravityBtnGroup.append(
      this.makeBtn('−', () => {
        const val = Math.max(0, parseInt(this.gravityEl!.value || '1', 10) - 1);
        this.setGravity(val);
        this.onGravityChange?.(val);
      }),
      this.makeBtn('+', () => {
        const val = Math.min(10, parseInt(this.gravityEl!.value || '1', 10) + 1);
        this.setGravity(val);
        this.onGravityChange?.(val);
      }),
    );
    gravityControlRow.append(gravityBtnGroup, this.gravityEl);
    gravityField.append(gravityLabel, gravityControlRow);

    row.append(spawnField, gravityField);
    container.appendChild(row);
    this.controlsRow = row;
  }

  setShapeCount(count: number): void {
    if (this.shapeCountEl) this.shapeCountEl.value = String(count);
  }

  setSurfaceArea(area: number): void {
    if (this.surfaceAreaEl) this.surfaceAreaEl.value = String(Math.round(area));
  }

  setSpawnRate(rate: number): void {
    if (this.spawnRateEl) this.spawnRateEl.value = String(Math.round(rate));
  }

  setGravity(gravity: number): void {
    if (this.gravityEl) this.gravityEl.value = String(Math.round(gravity));
  }

  onSpawnRateChanged(cb: (rate: number) => void): void {
    this.onSpawnRateChange = cb;
  }

  onGravityChanged(cb: (gravity: number) => void): void {
    this.onGravityChange = cb;
  }

  destroy(): void {
    this.statsRow?.remove();
    this.controlsRow?.remove();
    this.statsRow = null;
    this.controlsRow = null;
    this.shapeCountEl = null;
    this.surfaceAreaEl = null;
    this.spawnRateEl = null;
    this.gravityEl = null;
    this.onSpawnRateChange = undefined;
    this.onGravityChange = undefined;
    UIView.styleElement?.remove();
    UIView.styleElement = null;
    UIView.stylesInjected = false;
  }
}
