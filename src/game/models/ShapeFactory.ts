import { nanoid } from 'nanoid';
import {
  Shape,
  ShapeType,
  TriangleShape,
  SquareShape,
  PentagonShape,
  HexagonShape,
  CircleShape,
  EllipseShape,
  RandomPolygonShape,
} from './Shape';

export class ShapeFactory {
  private static readonly SHAPE_TYPES: ShapeType[] = [
    ShapeType.TRIANGLE,
    ShapeType.SQUARE,
    ShapeType.PENTAGON,
    ShapeType.HEXAGON,
    ShapeType.CIRCLE,
    ShapeType.ELLIPSE,
    ShapeType.RANDOM,
  ];

  private static readonly SIZE_MIN = 40;
  private static readonly SIZE_MAX = 100;

  static createRandomShape(x: number, y: number): Shape {
    return this.createShape(this.randomType(), x, y, this.randomColor());
  }

  private static createShape(type: ShapeType, x: number, y: number, color: number): Shape {
    const id = nanoid();
    const size = this.randomSize();
    const rotation = Math.random() * Math.PI * 2;

    switch (type) {
      case ShapeType.TRIANGLE: return new TriangleShape(id, x, y, 0, 0, color, size, rotation);
      case ShapeType.SQUARE:   return new SquareShape(id, x, y, 0, 0, color, size, rotation);
      case ShapeType.PENTAGON: return new PentagonShape(id, x, y, 0, 0, color, size, rotation);
      case ShapeType.HEXAGON:  return new HexagonShape(id, x, y, 0, 0, color, size, rotation);
      case ShapeType.CIRCLE:   return new CircleShape(id, x, y, 0, 0, color, size, rotation);
      case ShapeType.ELLIPSE:  return new EllipseShape(id, x, y, 0, 0, color, size, rotation);
      case ShapeType.RANDOM: {
        const sides = 3 + Math.floor(Math.random() * 8);
        return new RandomPolygonShape(id, x, y, 0, 0, color, size, rotation, sides);
      }
    }
  }

  private static randomType(): ShapeType {
    return this.SHAPE_TYPES[Math.floor(Math.random() * this.SHAPE_TYPES.length)];
  }

  private static randomSize(): number {
    return Math.random() * (this.SIZE_MAX - this.SIZE_MIN) + this.SIZE_MIN;
  }

  static randomColor(): number {
    return Math.floor(Math.random() * 0xffffff);
  }
}
