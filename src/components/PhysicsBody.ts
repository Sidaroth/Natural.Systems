import { Sprite, Texture } from 'pixi.js';
import Vector from 'math/Vector';
import Point from 'root/math/point';

// TODO Seperate sprite from a physicsbody to hasSprite.
// TODO Convert to hasPhysicsBody.
export default class PhysicsBody {
    mass = 1; // in kg.

    position: Point;

    velocity: Vector;

    acceleration: Vector;

    sprite: Sprite;

    texture: Texture;

    dragCoeff = 0.1;

    constructor() {
        // Defaults to three zero vectors.
        this.position = new Point();
        this.velocity = new Vector();
        this.acceleration = new Vector();
        this.sprite = new Sprite();
        this.texture = new Texture();
    }

    setMass(mass: number) {
        this.mass = mass;
    }

    setDrag(drag: number) {
        this.dragCoeff = drag;
    }

    setPosition(x: number, y: number) {
        this.position.x = x;
        this.position.y = y;
    }

    calculateDrag(fluidDensity: number) {
        const speed = this.velocity.getLength();
        const dragMagnitude = fluidDensity * this.dragCoeff * speed * speed;
        const drag = Vector.multiply(this.velocity, -1).getUnit();
        drag.multiply(dragMagnitude);

        this.acceleration.add(drag);
    }

    update(delta: number) {
        const changeInPosition = Vector.multiply(this.velocity, delta).asPoint();
        this.position.add(changeInPosition);
        this.velocity.add(this.acceleration);

        // because force application is additive each frame, we have to zero inbetween updates.
        this.acceleration.zero();

        if (this.sprite) {
            this.sprite.position.x = this.position.x;
            this.sprite.position.y = this.position.y;
        }
    }

    setScale(xScale: number, yScale: number) {
        if (this.sprite) {
            this.sprite.scale.x = xScale;
            this.sprite.scale.y = yScale;
        }
    }

    setTexture(texture: Texture) {
        this.texture = texture;
        if (!this.sprite) this.sprite = new Sprite();
        this.sprite.texture = texture;
    }

    applyForce(force: Vector) {
        if (!force) return;

        this.acceleration.add(Vector.divide(force, this.mass));
    }

    destroy() {
        if (this.sprite) this.sprite.destroy();
    }
}
