import Vector from '../math/Vector';

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

    getSize() {
        return new Vector(this.w, this.h);
    }

    getPosition() {
        return new Vector(this.x, this.y);
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    setSize(w, h) {
        this.w = w;
        this.h = h;
    }
}
