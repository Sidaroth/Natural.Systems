import Vector from '../math/Vector';

// A line from p1 to p2.
export default class Line {
    origin;
    end;

    constructor(p1, p2) {
        this.origin = p1;
        this.end = p2;
    }

    getVector() {
        return Vector.sub(this.end, this.origin);
    }

    render(gfx, lineStyle = { width: 3, color: 0x000000 }) {
        gfx.beginFill(lineStyle.color);
        gfx.lineStyle(lineStyle.width, lineStyle.color);
        gfx.moveTo(this.origin.x, this.origin.y);
        gfx.lineTo(this.end.x, this.end.y);
        gfx.endFill();
    }
}
