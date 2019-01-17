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
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z); // eslint-disable-line
    }

    // Useful when comparing length of two vectors together, saves a sqrt call.
    squaredLength() {
        return this.x * this.x + this.y * this.y + this.z * this.z; // eslint-disable-line
    }

    // Limit the magnitude to the specified 'max' value.
    limit(max) {
        const squaredMag = this.squaredLength();
        if (squaredMag > max * max) {
            this.div(Math.sqrt(squaredMag)).mult(max);
        }

        return this;
    }

    getUnit() {
        const length = this.getLength();
        return new Vector(this.x / length, this.y / length, this.z / length);
    }

    // Keep in mind this function uses '+' to convert back from string as .toFixed() returns a string.
    getFixedUnit(places) {
        const unit = this.getUnit();
        return new Vector(+unit.x.toFixed(places), +unit.y.toFixed(places), +unit.z.toFixed(places));
    }

    /** Currently only supports 2D rotation. TODO... */
    rotateBy(radians, pivot) {
        const res = rotatePoint(new PIXI.Point(this.x, this.y), radians, pivot);
        this.x = res.x;
        this.y = res.y;

        return this;
    }

    equals(vector) {
        return this.x === vector.x && this.y === vector.y && this.z === vector.z;
    }

    // Copy the values of another vector into this.
    copy(vector) {
        this.x = vector.x;
        this.y = vector.y;
        this.z = vector.z;

        return this;
    }

    // Return a clone of this vector.
    clone() {
        const vector = new Vector();
        vector.copy(this);

        return vector;
    }

    // operators
    div(scalar) {
        if (!(typeof scalar === 'number' && Math.isFinite(scalar)) || scalar === 0) {
            return this;
        }

        this.x /= scalar;
        this.y /= scalar;
        this.z /= scalar;

        return this;
    }

    mult(scalar) {
        if (!(typeof scalar === 'number' && Math.isFinite(scalar))) {
            return this;
        }

        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;

        return this;
    }

    // products
    dot(vector) {
        return this.x * vector.x + this.y * vector.y + this.z * vector.z; // eslint-disable-line
    }

    cross(vector) {
        const x = this.y * vector.z - this.z * vector.y;
        const y = this.z * vector.x - this.x * vector.z;
        const z = this.x * vector.y - this.y * vector.x;

        return new Vector(x, y, z);
    }
}
