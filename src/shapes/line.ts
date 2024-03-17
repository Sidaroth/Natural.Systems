import { Graphics, StrokeStyle } from 'pixi.js';
import Vector from 'math/Vector';
import Point from 'math/point';

// A line between two points.
export default class Line {
    origin: Point;

    end: Point;

    constructor(p1: Point, p2: Point) {
        this.origin = p1;
        this.end = p2;
    }

    // Returns a vector representation from the origin to the end of the line.
    getVector(): Vector {
        const vector = new Vector(this.end.x, this.end.y);
        return vector.sub(this.origin);
    }

    render(gfx: Graphics, stroke: StrokeStyle = { width: 3, color: 0x000000 }) {
        gfx
            .moveTo(this.origin.x, this.origin.y)
            .lineTo(this.end.x, this.end.y)
            .stroke({ width: stroke.width, color: stroke.color });
    }
}
