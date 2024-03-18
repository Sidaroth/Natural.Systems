import Point from 'math/point';
import Vector from 'math/Vector';
import constrain from 'math/constrain';
import Circle from 'shapes/circle';
import { Graphics } from 'pixi.js';
import Size from 'math/size';

type Shape = Rect | Circle;

export default class Rect {
    x: number = 0;

    y: number = 0;

    w: number = 0;

    h: number = 0;

    constructor(x: number = 0, y: number = 0, w: number = 0, h: number = 0) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    contains(point: Point): boolean {
        const insideX = point.x >= this.x && point.x < this.x + this.w;
        const insideY = point.y >= this.y && point.y < this.y + this.h;

        return insideX && insideY;
    }

    vertices(): Point[] {
        const pos = this.position();
        const size = this.size();

        const vertices = [
            pos,
            new Point(pos.x + size.width, pos.y),
            new Point(pos.x + size.width, pos.y + size.height),
            new Point(pos.x, pos.y + size.height),
        ];

        return vertices;
    }

    intersects(shape: Shape): boolean {
        if (shape instanceof Rect) {
            const shapeRight = shape.x + shape.w;
            const shapeBottom = shape.y + shape.h;
            const thisRight = this.x + this.w;
            const thisBottom = this.y + this.h;

            const insideRight = shapeRight >= this.x && shape.x <= thisRight;
            const insideBottom = shapeBottom >= this.y && shape.y <= thisBottom;

            return insideRight && insideBottom;
        }

        if (shape instanceof Circle) {
            const closestX = constrain(shape.x, this.x, this.x + this.w);
            const closestY = constrain(shape.y, this.y, this.y + this.h);
            const dist = new Vector(shape.x - closestX, shape.y - closestY);

            return dist.squaredLength() < shape.squaredRadius;
        }

        return false;
    }

    size(): Size {
        return new Size(this.w, this.h);
    }

    position(): Point {
        return new Point(this.x, this.y);
    }

    setPosition(x: number | Point, y?: number): this {
        if (x instanceof Point) {
            this.x = x.x;
            this.y = x.y;
            return this;
        }

        // We should always get both x and y if we get here.
        if (x !== undefined && y !== undefined) {
            this.x = x;
            this.y = y;
        }

        return this;
    }

    setSize(w: number | Size, h?: number): this {
        if (w instanceof Size) {
            this.w = w.width;
            this.h = w.height;
            return this;
        }

        // We should always get both w and h if we get here.
        if (w !== undefined && h !== undefined) {
            this.w = w;
            this.h = h;
        }

        return this;
    }

    render(context: Graphics): void {
        context
            .rect(this.x, this.y, this.w, this.h)
            .fill({ color: 0x000000, alpha: 0.85 });
    }
}
