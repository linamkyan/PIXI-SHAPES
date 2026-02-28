import { GameState } from '../models/GameState';
import { GameView } from '../views/GameView';
import { UIView } from '../views/UIView';
import { syncUI, hitTestAndRecolor, spawnShape, autoSpawnShape } from '../services/GameService';

export interface GameControllerConfig {
  gameWidth: number;
  gameHeight: number;
  gameContainer: HTMLElement;
  statsContainer: HTMLElement;
  controlsContainer: HTMLElement;
}

export interface Game {
  ready(): Promise<void>;
  start(): void;
  resize(width: number, height: number): void;
  destroy(): void;
}

export function createGame(config: GameControllerConfig): Game {
  const state = new GameState(config.gameWidth, config.gameHeight);
  const view = new GameView({ width: config.gameWidth, height: config.gameHeight, container: config.gameContainer });
  const ui = new UIView({ statsContainer: config.statsContainer, controlsContainer: config.controlsContainer });

  let frameId: number | null = null;
  let lastTime = 0;
  let running = false;
  let mousedownHandler: ((e: MouseEvent) => void) | null = null;
  let touchHandler: ((e: TouchEvent) => void) | null = null;

  const readyPromise = view.ready().then(() => {
    const canvas = view.getCanvas();
    canvas.style.cursor = 'crosshair';

    mousedownHandler = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);
      if (!hitTestAndRecolor(state, x, y)) spawnShape(state, view, x, y);
      syncUI(state, ui);
    };
    canvas.addEventListener('mousedown', mousedownHandler);

    touchHandler = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
      const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
      if (!hitTestAndRecolor(state, x, y)) spawnShape(state, view, x, y);
      syncUI(state, ui);
    };
    canvas.addEventListener('touchstart', touchHandler, { passive: false });

    ui.onSpawnRateChanged((rate) => state.setSpawnRate(rate));
    ui.onGravityChanged((gravity) => state.setGravity(gravity));
    syncUI(state, ui);
  });

  function tick(time: number): void {
    if (!running) return;
    const dt = lastTime === 0 ? 1 : Math.min((time - lastTime) / 16.67, 3);
    lastTime = time;
    state.updateShapes(dt).forEach((id) => view.removeShape(id));
    if (state.getGravity() > 0 && state.shouldSpawn(time)) {
      state.recordSpawn(time);
      autoSpawnShape(state, view);
    }
    state.getShapes().forEach((shape) => view.renderShape(shape));
    syncUI(state, ui);
    frameId = requestAnimationFrame(tick);
  }

  return {
    ready: () => readyPromise,
    start() {
      if (running) return;
      running = true;
      lastTime = 0;
      frameId = requestAnimationFrame(tick);
    },
    resize(width, height) {
      view.resize(width, height);
      state.resize(width, height);
    },
    destroy() {
      running = false;
      if (frameId !== null) { cancelAnimationFrame(frameId); frameId = null; }
      const canvas = view.getCanvas();
      if (mousedownHandler !== null) {
        canvas.removeEventListener('mousedown', mousedownHandler);
        mousedownHandler = null;
      }
      if (touchHandler !== null) {
        canvas.removeEventListener('touchstart', touchHandler);
        touchHandler = null;
      }
      ui.destroy();
      view.destroy();
      state.clear();
    },
  };
}
