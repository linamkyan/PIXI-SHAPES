import { Shape, ShapeType } from './Shape';

export class GameState {
  private shapes: Map<string, Shape> = new Map();
  private gravity = 1;
  private spawnRate = 1;
  private gameWidth: number;
  private gameHeight: number;
  private colorByType: Map<ShapeType, number> = new Map();
  private lastSpawnTime = Number.NEGATIVE_INFINITY;
  private _totalSurfaceArea = 0;
  private surfaceAreaDirty = true;

  constructor(width: number, height: number) {
    this.gameWidth = width;
    this.gameHeight = height;
  }

  addShape(shape: Shape): void {
    this.shapes.set(shape.id, shape);
    this.surfaceAreaDirty = true;
  }

  removeShape(id: string): void {
    this.shapes.delete(id);
    this.surfaceAreaDirty = true;
  }

  getShapes(): Shape[] {
    return Array.from(this.shapes.values());
  }

  getShapeCount(): number {
    return this.shapes.size;
  }

  getTotalSurfaceArea(): number {
    if (this.surfaceAreaDirty) {
      this._totalSurfaceArea = 0;
      this.shapes.forEach((s) => { this._totalSurfaceArea += s.getSurfaceArea(); });
      this.surfaceAreaDirty = false;
    }
    return this._totalSurfaceArea;
  }

  updateShapes(deltaTime: number): string[] {
    const removed: string[] = [];

    this.shapes.forEach((shape) => {
      if (this.gravity === 0) {
        shape.vx = 0;
        shape.vy = 0;
        if (shape.y < 0) {
          removed.push(shape.id);
          return;
        }
      } else {
        shape.applyGravity(this.gravity, deltaTime);
        shape.update(deltaTime);
      }
      if (shape.isOutOfBounds(this.gameHeight)) {
        removed.push(shape.id);
      }
    });

    removed.forEach((id) => this.removeShape(id));
    return removed;
  }

  shouldSpawn(currentTime: number): boolean {
    return currentTime - this.lastSpawnTime >= 1000 / this.spawnRate;
  }

  recordSpawn(currentTime: number): void {
    this.lastSpawnTime = currentTime;
  }

  setGravity(gravity: number): void {
    this.gravity = Math.max(0, gravity);
  }

  getGravity(): number {
    return this.gravity;
  }

  setSpawnRate(rate: number): void {
    this.spawnRate = Math.max(1, Math.min(rate, 20));
  }

  getSpawnRate(): number {
    return this.spawnRate;
  }

  getColorForType(type: ShapeType): number | undefined {
    return this.colorByType.get(type);
  }

  setColorForType(type: ShapeType, color: number): void {
    this.colorByType.set(type, color);
    this.shapes.forEach((shape) => {
      if (shape.type === type) shape.color = color;
    });
  }

  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
  }

  getGameDimensions(): { width: number; height: number } {
    return { width: this.gameWidth, height: this.gameHeight };
  }

  clear(): void {
    this.shapes.clear();
    this.surfaceAreaDirty = true;
  }
}
