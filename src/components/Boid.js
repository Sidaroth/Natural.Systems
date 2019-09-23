import * as PIXI from 'pixi.js';
import Vector from '../math/Vector';
import degreesToRadians from '../math/degreesToRadians';

// Boid logic:
// 1. Avoid obstacles/each other (Separation)
// 2. Fly together in a unified direction. (Alignment)
// 3. Move towards center of flock. (Cohesion)
const createBoid = (texture) => {
    const state = {};
    const position = new Vector();
    const direction = new Vector(0, -1);
    const velocity = new Vector();
    const sprite = new PIXI.Sprite(texture);
    sprite.anchor.set(0.5);
    const fov = 100;
    const vision = 90;
    let rotation = 0;
    let staticSpeed = 5;

    const testAngles = [];
    const fovSlices = 180;
    const sliceWidth = fov / fovSlices;

    // i.e -45 degrees to +45 degrees.
    for (let angle = -fov / 2; angle <= fov / 2; angle += sliceWidth) {
        if (angle !== 0) testAngles.push(degreesToRadians(angle));
    }
    testAngles.sort((a, b) => Math.abs(a) - Math.abs(b)); // Sort angles so they are increasingly larger in each direction.

    function getPosition() {
        return position;
    }

    function setPosition(x, y) {
        position.x = x;
        position.y = y;

        state.sprite.position.x = x;
        state.sprite.position.y = y;
    }

    function setRotation(angle) {
        rotation = angle;
        if (state.sprite) sprite.rotation = angle;
    }

    function update(delta) {
        state.setVelocity(Vector.multiply(state.direction, staticSpeed * delta));
        state.setPosition(position.x + velocity.x, position.y + velocity.y);
        state.setRotation(state.direction.angle());
    }

    function setVelocity(vel) {
        velocity.copy(vel);
    }

    function setSpeed(speed) {
        staticSpeed = speed;
    }

    function destroy() {
        state.sprite.destroy();
    }

    function getTestAngles() {
        return testAngles;
    }

    return Object.assign(state, {
        position,
        sprite,
        rotation,
        direction,
        texture,
        vision,
        fov,
        getTestAngles,
        // functions
        getPosition,
        setPosition,
        setRotation,
        setVelocity,
        setSpeed,
        update,
        destroy,
    });
};

export default createBoid;
