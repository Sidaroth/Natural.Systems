import Vector from '../math/Vector';
import constrain from '../math/constrain';
import Circle from './circle';

export default class Rect {
    x;

    y;

    w;

    h;

    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    contains(point) {
        return point.x >= this.x && point.x < this.x + this.w && point.y >= this.y && point.y < this.y + this.h;
    }

    getVertices() {
        const pos = this.getPosition();
        const size = this.getSize();

        const vertices = [
            pos,
            new Vector(pos.x + size.x, pos.y),
            new Vector(pos.x + size.x, pos.y + size.y),
            new Vector(pos, pos.y + size.y),
        ];

        return vertices;
    }

    intersects(shape) {
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

            return dist.squaredLength() < shape.r2;
        }

        return false;
    }

    getSize() {
        return new Vector(this.w, this.h);
    }

    getPosition() {
        return new Vector(this.x, this.y);
    }

    setPosition(vec) {
        this.x = vec.x;
        this.y = vec.y;
    }

    setSize(w, h) {
        this.w = w;
        this.h = h;
    }

    render(context) {
        context.beginFill(0x000000, 0.85);
        context.drawRect(this.x, this.y, this.w, this.h);
        context.endFill();
    }
}
