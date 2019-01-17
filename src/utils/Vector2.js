import * as PIXI from 'pixi.js';
import rotatePoint from './rotatePoint';

/**
 * Homegrown basic vector class.
 * TODO: Expand to 3d.
 */
export default class Vector {
    x = null;
    y = null;
    z = null;

    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    getLength() {
        return Math.sqrt(this.x * this.x + this.y * this.y); // eslint-disable-line
    }

    // Useful when comparing length of two vectors together, saves a sqrt call.
    squaredLength() {
        return this.x * this.x + this.y * this.y; // eslint-disable-line
    }

    getUnit() {
        const length = this.getLength();
        return new Vector(this.x / length, this.y / length);
    }

    // Keep in mind this function uses '+' to convert back from string as .toFixed() returns a string.
    getFixedUnit(places) {
        const unit = this.getUnit();
        return new Vector(+unit.x.toFixed(places), +unit.y.toFixed(places));
    }

    rotateBy(radians, pivot) {
        const res = rotatePoint(new PIXI.Point(this.x, this.y), radians, pivot);
        this.x = res.x;
        this.y = res.y;
    }

    equals(vector) {
        return this.x === vector.x && this.y === vector.y;
    }

    // Copy the values of another vector into this.
    copy(vector) {
        this.x = vector.x;
        this.y = vector.y;
    }

    // Return a clone of this vector.
    clone() {
        const vector = new Vector();
        vector.copy(this);

        return vector;
    }

    // products
    dot(vector) {
        return this.x * vector.x + this.y * vector.y; // eslint-disable-line
    }

    cross(vector) {
        return this.x * vector.y + this.y * vector.x; // eslint-disable-line
    }
}
