import { Graphics } from 'pixi.js';
import Vector from 'math/Vector';
import Rect from 'shapes/rect';
import PhysicsBody from 'components/PhysicsBody';

export default class Region {
    bounds: Rect;

    density: number; // air density, fluid density

    force: Vector = new Vector(); // any force that should be applied to objects within the region. I.e wind, water flow, etc.

    gfx: Graphics = new Graphics();

    constructor(x: number, y: number, w: number, h: number) {
        this.density = 1;
        this.gfx = new Graphics();
        this.force = new Vector();
        this.bounds = new Rect(x, y, w, h);
    }

    setPosition(x: number, y: number) {
        this.bounds.setPosition(x, y);
    }

    setSize(w: number, h: number) {
        this.bounds.setSize(w, h);
    }

    setForce(force: Vector) {
        this.force = force;
    }

    render(color = 0xff00ff) {
        this.gfx.clear();
        this.gfx.rect(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h).fill(color);
    }

    // For now only supports square regions. Circular and polygonal shapes will have to wait until I implement SAT or similar checks.
    contains(object: PhysicsBody) {
        const insideX = object.position.x >= this.bounds.x && object.position.x <= this.bounds.x + this.bounds.w;
        const insideY = object.position.y >= this.bounds.y && object.position.y <= this.bounds.y + this.bounds.h;
        return insideX && insideY;
    }

    destroy() {
        this.gfx.destroy();
    }
}
