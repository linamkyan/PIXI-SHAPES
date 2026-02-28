import { Shape } from '../models/Shape';
import { ShapeFactory } from '../models/ShapeFactory';
import { GameState } from '../models/GameState';
import { GameView } from '../views/GameView';
import { UIView } from '../views/UIView';

export function syncUI(state: GameState, ui: UIView): void {
  ui.setShapeCount(state.getShapeCount());
  ui.setSurfaceArea(state.getTotalSurfaceArea());
  ui.setSpawnRate(state.getSpawnRate());
  ui.setGravity(state.getGravity());
}

export function hitTestAndRecolor(state: GameState, x: number, y: number): boolean {
  const shapes = state.getShapes();
  for (let i = shapes.length - 1; i >= 0; i--) {
    if (shapes[i].containsPoint(x, y)) {
      state.setColorForType(shapes[i].type, ShapeFactory.randomColor());
      return true;
    }
  }
  return false;
}

function applyColorOverride(state: GameState, shape: Shape): void {
  const color = state.getColorForType(shape.type);
  if (color !== undefined) shape.color = color;
}

function clampToCanvas(value: number, margin: number, max: number): number {
  return Math.max(margin, Math.min(max - margin, value));
}

export function spawnShape(state: GameState, view: GameView, x: number, y: number): void {
  const shape = ShapeFactory.createRandomShape(x, y);
  const { width, height } = state.getGameDimensions();
  const margin = (shape.size / 2) * Math.SQRT2;
  shape.x = clampToCanvas(shape.x, margin, width);
  shape.y = clampToCanvas(shape.y, margin, height);
  applyColorOverride(state, shape);
  state.addShape(shape);
  view.renderShape(shape);
}

export function autoSpawnShape(state: GameState, view: GameView): void {
  const { width } = state.getGameDimensions();
  const shape = ShapeFactory.createRandomShape(Math.random() * width, 0);
  const margin = (shape.size / 2) * Math.SQRT2;
  shape.x = clampToCanvas(shape.x, margin, width);
  shape.y = -(shape.size / 2);
  applyColorOverride(state, shape);
  state.addShape(shape);
  view.renderShape(shape);
}
