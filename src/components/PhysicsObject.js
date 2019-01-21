import Vector from 'math/Vector';
import * as PIXI from 'pixi.js';

export default class PhysicsObject extends PIXI.Graphics {
    mass = 1; // in kg.
    limit = Infinity;
    location;
    velocity;
    acceleration;

    constructor() {
        super();

        // Defaults to three zero vectors.
        this.location = new Vector();
        this.velocity = new Vector();
        this.acceleration = new Vector();
    }

    limitVelocityTo(limit) {
        this.limit = limit;
    }

    // TODO: fix mass calculations.
    update() {
        this.location.add(this.velocity);
        this.velocity.add(this.acceleration);

        // because force application is additive each frame, we have to zero inbetween updates.
        this.acceleration.zero();

        if (this.limit < Infinity) {
            this.velocity.limit(this.limit);
        }
    }

    applyForce(force) {
        this.acceleration.add(force);
    }

    render() {
        this.clear();
        this.beginFill(0xffffff);
        this.drawCircle(this.location.x, this.location.y, 3);
        this.endFill();
    }
}
