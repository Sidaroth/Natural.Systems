import Vector from 'math/Vector';

export default class PhysicsObject {
    mass = 1; // in kg.
    location;
    velocity;
    acceleration;

    constructor() {
        // Defaults to three zero vectors.
        this.location = new Vector();
        this.velocity = new Vector();
        this.acceleration = new Vector();
    }

    update() {
        this.location.add(this.velocity);
        this.velocity.add(this.acceleration);

        // because force application is additive each frame, we have to zero inbetween updates.
        this.acceleration.zero();
    }

    applyForce(force) {
        if (!force) return;

        this.acceleration.add(Vector.divide(force, this.mass));
    }
}
