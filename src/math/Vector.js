import * as PIXI from 'pixi.js';
import rotatePoint from './rotatePoint';

/**
 * Homegrown basic vector class.
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

    // get length/magnitude.
    getLength() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z); // eslint-disable-line
    }

    // set the magnitude/length of the vector.
    setLength(length) {
        return this.getUnit().multiply(length);
    }

    // Useful when comparing length of two vectors together, saves a sqrt call.
    squaredLength() {
        return this.x * this.x + this.y * this.y + this.z * this.z; // eslint-disable-line
    }

    // Limit the magnitude to the specified 'max' value.
    limit(max) {
        const squaredMag = this.squaredLength();
        if (squaredMag > max * max) {
            this.div(Math.sqrt(squaredMag)).multiply(max);
        }

        return this;
    }

    // Calculates the Euclidean distance between two points (vectors)
    dist(vector) {
        return vector.copy().sub(this).getLength();
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
    // Support addition of vector+vector, vector+array, and vector+scalars.
    add(x, y, z) {
        if (x instanceof Vector) {
            this.x += x.x || 0;
            this.y += x.y || 0;
            this.z += x.z || 0;

            return this;
        }

        // Unsure how useful this one is.
        if (x instanceof Array) {
            this.x += x[0] || 0;
            this.y += x[1] || 0;
            this.z += x[2] || 0;
            return this;
        }

        this.x += x || 0;
        this.y += y || 0;
        this.z += z || 0;

        return this;
    }

    // Support substraction of vector-vector, vector-array, and vector-scalars.
    sub(x, y, z) {
        if (x instanceof Vector) {
            this.x -= x.x || 0;
            this.y -= x.y || 0;
            this.z -= x.z || 0;

            return this;
        }

        // Unsure how useful this one is.
        if (x instanceof Array) {
            this.x -= x[0] || 0;
            this.y -= x[1] || 0;
            this.z -= x[2] || 0;
            return this;
        }

        this.x -= x || 0;
        this.y -= y || 0;
        this.z -= z || 0;

        return this;
    }

    div(scalar) {
        if (!(typeof scalar === 'number' && Math.isFinite(scalar)) || scalar === 0) {
            return this;
        }

        this.x /= scalar;
        this.y /= scalar;
        this.z /= scalar;

        return this;
    }

    multiply(scalar) {
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

    // TODO Add static methods.
    // static add(vec1, vec2) {
    //     const vector = new Vector();
    //     vector.copy(vec1);
    //     return vector.add(vec2);
    // }

    // static sub(vec1, vec2) {
    //     const vector = new Vector();
    //     vector.copy(vec1);
    //     return vector.sub(vec2);
    // }
}
