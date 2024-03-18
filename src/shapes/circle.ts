import { Graphics, StrokeStyle } from 'pixi.js';
import Vector from 'math/Vector';
import Point from 'math/point';

export default class Circle {
    x: number = 0;

    y: number = 0;

    radius: number = 0;

    squaredRadius: number = 0;

    constructor(x: number, y: number, r: number) {
        this.x = x;
        this.y = y;

        this.radius = r;
        this.squaredRadius = this.radius * this.radius;
    }

    setPosition(point: Point): this {
        this.x = point.x;
        this.y = point.y;

        return this;
    }

    contains(point: Point) {
        const length = new Vector(point.x - this.x, point.y - this.y).squaredLength();
        return length < this.squaredRadius;
    }

    getPosition() {
        return new Point(this.x, this.y);
    }

    render(context: Graphics, strokeStyle: StrokeStyle = { width: 5, color: 0xFF0000 }) {
        context.circle(this.x, this.y, this.radius).stroke(strokeStyle);
    }
}
