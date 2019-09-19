import * as PIXI from 'pixi.js';
import Vector from 'math/Vector';

export default class PhysicsObject {
    mass = 1; // in kg.
    position;
    velocity;
    acceleration;
    sprite;
    texture;
    dragCoeff = 0.1;

    constructor() {
        // Defaults to three zero vectors.
        this.position = new Vector();
        this.velocity = new Vector();
        this.acceleration = new Vector();
    }

    setMass(mass) {
        this.mass = mass;
    }

    calculateDrag(fluidDensity) {
        const speed = this.velocity.getLength();
        const dragMagnitude = fluidDensity * this.dragCoeff * speed * speed;
        const drag = Vector.multiply(this.velocity, -1).getUnit();
        drag.multiply(dragMagnitude);

        this.acceleration.add(drag);
    }

    update() {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);

        // because force application is additive each frame, we have to zero inbetween updates.
        this.acceleration.zero();

        if (this.sprite) {
            this.sprite.position.x = this.position.x;
            this.sprite.position.y = this.position.y;
        }
    }

    setTexture(texture) {
        this.texture = texture;
        if (!this.sprite) this.sprite = new PIXI.Sprite();
        this.sprite.texture = texture;
    }

    applyForce(force) {
        if (!force) return;

        this.acceleration.add(Vector.divide(force, this.mass));
    }

    destroy() {
        if (this.texture) this.texture.destroy();
        if (this.sprite) this.sprite.destroy();
    }
}
