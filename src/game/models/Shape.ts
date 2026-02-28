export enum ShapeType {
  TRIANGLE = 'triangle',
  SQUARE = 'square',
  PENTAGON = 'pentagon',
  HEXAGON = 'hexagon',
  CIRCLE = 'circle',
  ELLIPSE = 'ellipse',
  RANDOM = 'random',
}

export abstract class Shape {
  readonly id: string;
  abstract readonly type: ShapeType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: number;
  size: number;
  rotation: number;

  constructor(
    id: string,
    x: number,
    y: number,
    vx: number,
    vy: number,
    color: number,
    size: number,
    rotation: number,
  ) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.rotation = rotation;
  }

  update(deltaTime: number): void {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
  }

  applyGravity(gravity: number, deltaTime: number): void {
    this.vy += gravity * 0.08 * deltaTime;
  }

  isOutOfBounds(gameHeight: number): boolean {
    return this.y - this.size / 2 > gameHeight;
  }

  abstract getSurfaceArea(): number;
  abstract containsPoint(px: number, py: number): boolean;
}

export class TriangleShape extends Shape {
  readonly type = ShapeType.TRIANGLE;

  getSurfaceArea(): number {
    return this.size * this.size * 0.5;
  }

  containsPoint(px: number, py: number): boolean {
    const dx = px - this.x;
    const dy = py - this.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.size / 2;
  }
}

export class SquareShape extends Shape {
  readonly type = ShapeType.SQUARE;

  getSurfaceArea(): number {
    return this.size * this.size;
  }

  containsPoint(px: number, py: number): boolean {
    const dx = px - this.x;
    const dy = py - this.y;
    const cos = Math.cos(-this.rotation);
    const sin = Math.sin(-this.rotation);
    const lx = dx * cos - dy * sin;
    const ly = dx * sin + dy * cos;
    const half = this.size / 2;
    return Math.abs(lx) <= half && Math.abs(ly) <= half;
  }
}

export class PentagonShape extends Shape {
  readonly type = ShapeType.PENTAGON;

  getSurfaceArea(): number {
    return this.size * this.size * 0.594;
  }

  containsPoint(px: number, py: number): boolean {
    const dx = px - this.x;
    const dy = py - this.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.size / 2;
  }
}

export class HexagonShape extends Shape {
  readonly type = ShapeType.HEXAGON;

  getSurfaceArea(): number {
    return this.size * this.size * 0.649;
  }

  containsPoint(px: number, py: number): boolean {
    const dx = px - this.x;
    const dy = py - this.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.size / 2;
  }
}

export class CircleShape extends Shape {
  readonly type = ShapeType.CIRCLE;

  getSurfaceArea(): number {
    return Math.PI * (this.size / 2) ** 2;
  }

  containsPoint(px: number, py: number): boolean {
    const dx = px - this.x;
    const dy = py - this.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.size / 2;
  }
}

export class EllipseShape extends Shape {
  readonly type = ShapeType.ELLIPSE;

  getSurfaceArea(): number {
    return Math.PI * (this.size / 2) * (this.size / 3);
  }

  containsPoint(px: number, py: number): boolean {
    const dx = px - this.x;
    const dy = py - this.y;
    const cos = Math.cos(-this.rotation);
    const sin = Math.sin(-this.rotation);
    const lx = dx * cos - dy * sin;
    const ly = dx * sin + dy * cos;
    const a = this.size / 2;
    const b = this.size / 3;
    return (lx * lx) / (a * a) + (ly * ly) / (b * b) <= 1;
  }
}

export class RandomPolygonShape extends Shape {
  readonly type = ShapeType.RANDOM;
  readonly sides: number;

  constructor(
    id: string,
    x: number,
    y: number,
    vx: number,
    vy: number,
    color: number,
    size: number,
    rotation: number,
    sides: number,
  ) {
    super(id, x, y, vx, vy, color, size, rotation);
    this.sides = sides;
  }

  getSurfaceArea(): number {
    const r = this.size / 2;
    return (this.sides / 2) * r * r * Math.sin((2 * Math.PI) / this.sides);
  }

  containsPoint(px: number, py: number): boolean {
    const dx = px - this.x;
    const dy = py - this.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.size / 2;
  }
}
