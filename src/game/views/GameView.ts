import { Application, Container, Graphics } from 'pixi.js';
import { Shape, ShapeType, RandomPolygonShape } from '../models/Shape';

export interface GameViewConfig {
  width: number;
  height: number;
  container: HTMLElement;
}

export class GameView {
  private app: Application;
  private stage: Container | null = null;
  private background: Graphics | null = null;
  private shapeGraphics: Map<string, Graphics> = new Map();
  private width: number;
  private height: number;
  private initPromise: Promise<void>;

  constructor(config: GameViewConfig) {
    this.width = config.width;
    this.height = config.height;
    this.app = new Application();
    this.initPromise = this.init(config);
  }

  private async init(config: GameViewConfig): Promise<void> {
    await this.app.init({
      width: config.width,
      height: config.height,
      antialias: true,
      backgroundAlpha: 0,
    });

    const canvas = this.app.canvas as HTMLCanvasElement;
    canvas.style.width = '100%';
    canvas.style.display = 'block';

    config.container.appendChild(canvas);

    this.stage = new Container();
    this.app.stage.addChild(this.stage);

    this.drawBackground();
  }

  private drawBackground(): void {
    if (!this.stage) return;

    if (this.background) {
      this.stage.removeChild(this.background);
      this.background.destroy();
    }

    const bg = new Graphics();
    const gridSize = 40;

    bg.rect(0, 0, this.width, this.height);
    bg.fill({ color: 0xffffff });

    for (let x = gridSize; x < this.width; x += gridSize) {
      bg.moveTo(x, 0);
      bg.lineTo(x, this.height);
    }
    for (let y = gridSize; y < this.height; y += gridSize) {
      bg.moveTo(0, y);
      bg.lineTo(this.width, y);
    }
    bg.stroke({ color: 0xDBDBDB, width: 0.5 });

    bg.rect(0, 0, this.width, this.height);
    bg.stroke({ color: 0xDBDBDB, width: 1.5 });

    this.stage.addChildAt(bg, 0);
    this.background = bg;
  }

  async ready(): Promise<void> {
    return this.initPromise;
  }

  getCanvas(): HTMLCanvasElement {
    return this.app.canvas as HTMLCanvasElement;
  }

  resize(width: number, height: number): void {
    if (!this.stage) return;
    this.width = width;
    this.height = height;
    this.app.renderer.resize(width, height);
    this.drawBackground();
  }

  renderShape(shape: Shape): void {
    if (!this.stage) return;

    let g = this.shapeGraphics.get(shape.id);

    if (!g) {
      g = new Graphics();
      this.buildGeometry(g, shape);
      g.rotation = shape.rotation;
      this.stage.addChild(g);
      this.shapeGraphics.set(shape.id, g);
    }

    g.tint = shape.color;
    g.position.set(shape.x, shape.y);
  }

  private buildGeometry(g: Graphics, shape: Shape): void {
    const { size, type } = shape;

    switch (type) {
      case ShapeType.TRIANGLE: this.buildTriangle(g, size);      break;
      case ShapeType.SQUARE:   this.buildSquare(g, size);        break;
      case ShapeType.PENTAGON: this.buildPolygon(g, 5, size);    break;
      case ShapeType.HEXAGON:  this.buildPolygon(g, 6, size);    break;
      case ShapeType.CIRCLE:   this.buildCircle(g, size);        break;
      case ShapeType.ELLIPSE:  this.buildEllipse(g, size);       break;
      case ShapeType.RANDOM:   this.buildPolygon(g, (shape as RandomPolygonShape).sides, size); break;
    }
  }

  private buildTriangle(g: Graphics, size: number): void {
    const r = size / 2;
    g.moveTo(0, -r).lineTo(r, r).lineTo(-r, r).closePath();
    g.fill(0xffffff);
    g.stroke({ color: 0x808080, width: 1.5 });
  }

  private buildSquare(g: Graphics, size: number): void {
    const r = size / 2;
    g.rect(-r, -r, size, size);
    g.fill(0xffffff);
    g.stroke({ color: 0x808080, width: 1.5 });
  }

  private buildPolygon(g: Graphics, sides: number, size: number): void {
    const r = size / 2;
    const step = (Math.PI * 2) / sides;
    for (let i = 0; i < sides; i++) {
      const x = r * Math.cos(i * step - Math.PI / 2);
      const y = r * Math.sin(i * step - Math.PI / 2);
      i === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
    }
    g.closePath();
    g.fill(0xffffff);
    g.stroke({ color: 0x808080, width: 1.5 });
  }

  private buildCircle(g: Graphics, size: number): void {
    g.circle(0, 0, size / 2);
    g.fill(0xffffff);
    g.stroke({ color: 0x808080, width: 1.5 });
  }

  private buildEllipse(g: Graphics, size: number): void {
    g.ellipse(0, 0, size / 2, size / 3);
    g.fill(0xffffff);
    g.stroke({ color: 0x808080, width: 1.5 });
  }

  removeShape(id: string): void {
    const g = this.shapeGraphics.get(id);
    if (g && this.stage) {
      this.stage.removeChild(g);
      g.destroy();
      this.shapeGraphics.delete(id);
    }
  }

  clearShapes(): void {
    this.shapeGraphics.forEach((g) => {
      this.stage?.removeChild(g);
      g.destroy();
    });
    this.shapeGraphics.clear();
  }

  destroy(): void {
    this.clearShapes();
    this.app.destroy();
  }
}
