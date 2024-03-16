import * as PIXI from 'pixi.js';
import Vector from '../math/Vector';
import Rect from '../shapes/rect';

export default class Region {
    bounds;

    density = 1; // air density, fluid density

    force = new Vector(); // any force that should be applied to objects within the region. I.e wind, water flow, etc.

    gfx = new PIXI.Graphics();

    constructor(x, y, w, h) {
        this.bounds = new Rect(x, y, w, h);
    }

    setPosition(x, y) {
        this.bounds.setPosition({ x, y });
    }

    setSize(w, h) {
        this.bounds.setSize(w, h);
    }

    setForce(force) {
        this.force = force;
    }

    render(color = 0xff00ff) {
        this.gfx.clear();
        this.gfx.beginFill(color);
        this.gfx.drawRect(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
        this.gfx.endFill();
    }

    // For now only supports square regions. Circular and polygonal shapes will have to wait until I implement SAT or similar checks.
    contains(object) {
        const insideX = object.position.x >= this.bounds.x && object.position.x <= this.bounds.x + this.bounds.w;
        const insideY = object.position.y >= this.bounds.y && object.position.y <= this.bounds.y + this.bounds.h;
        return insideX && insideY;
    }

    destroy() {
        this.gfx.destroy();
    }
}
