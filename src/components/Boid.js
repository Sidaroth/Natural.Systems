import * as PIXI from 'pixi.js';
import Vector from '../math/Vector';
import degreesToRadians from '../math/degreesToRadians';
import Circle from '../shapes/circle';
import store from '../store';
import getUUID from '../math/getUUID';
import createState from 'utils/createState';

// Boid logic:
// 1. Avoid obstacles/each other (Separation)
// 2. Fly together in a unified direction. (Alignment)
// 3. Move towards center of flock. (Cohesion)
const createBoid = (texture, debugGfx = undefined) => {
    const state = {};

    const id = getUUID();
    const position = new Vector();
    const velocity = new Vector();
    const acceleration = new Vector();
    const sprite = new PIXI.Sprite(texture);
    sprite.anchor.set(0.5);

    const fov = degreesToRadians(90);
    const visionRadius = 90;
    const visionSquared = visionRadius * visionRadius;
    const visionShape = new Circle(position.x, position.y, visionRadius);
    const testAngles = [];
    const fovSlices = 120;
    const sliceWidth = fov / fovSlices;
    const maxForce = 0.1;
    let maxSpeed = 5;

    // Visualization vars
    let renderConnections = false;
    let renderVision = false;
    let enableCohesion = true;
    let enableAlignment = true;
    let enableSeparation = true;
    let gfx;

    if (debugGfx) {
        gfx = debugGfx;
    }

    // i.e -45 degrees to +45 degrees. (In radians)
    for (let angle = -fov / 2; angle <= fov / 2; angle += sliceWidth) {
        if (angle !== 0) testAngles.push(angle);
    }
    testAngles.sort((a, b) => Math.abs(a) - Math.abs(b)); // Sort angles so they are increasingly larger in each direction.

    function getPosition() {
        return state.position;
    }

    function findHeading(tree) {
        const nearbyBoids = tree
            .query(visionShape)
            .filter(b => b.id !== id && Math.abs(state.position.getUnit().angleBetween2d(b.position.getUnit())) < fov);

        if (!nearbyBoids.length) return; // No boids in range other than self, or they're not in FOV.

        const flockPosition = new Vector();
        const flockVelocity = new Vector();
        const separation = new Vector();

        nearbyBoids.forEach((boid) => {
            const diff = Vector.sub(state.position, boid.position);
            const distance = diff.squaredLength();
            if (distance < visionSquared) {
                diff.divide(distance);
                separation.add(diff);
            }

            flockPosition.add(boid.position);
            flockVelocity.add(boid.velocity);

            if (renderConnections && gfx) {
                gfx.lineStyle(1, 0x000000);
                gfx.moveTo(state.position.x, state.position.y);
                gfx.lineTo(boid.position.x, boid.position.y);
            }
        });

        if (enableCohesion) {
            flockPosition.divide(nearbyBoids.length);
            flockPosition.sub(position);
            flockPosition.limit(maxForce);
            acceleration.add(flockPosition);
        }

        if (enableAlignment) {
            flockVelocity.divide(nearbyBoids.length);
            flockVelocity.sub(velocity);
            flockVelocity.limit(maxForce);
            acceleration.add(flockVelocity);
        }

        if (enableSeparation) {
            separation.divide(nearbyBoids.length);
            separation.setLength(maxSpeed * 3);
            separation.sub(velocity);
            separation.limit(maxForce);
            acceleration.add(separation);
        }
    }

    function updateSpritePos() {
        visionShape.setPosition(state.position);

        state.sprite.position.x = state.position.x;
        state.sprite.position.y = state.position.y;
    }

    function setPosition(x, y) {
        state.position.set(x, y);
        updateSpritePos();
    }

    function setRotation(angle) {
        if (state.sprite) sprite.rotation = angle;
    }

    function checkBounds() {
        if (state.position.x < store.worldBoundary.x) state.setPosition(store.worldBoundary.w, state.position.y);
        if (state.position.x > store.worldBoundary.w) state.setPosition(store.worldBoundary.x, state.position.y);
        if (state.position.y < store.worldBoundary.y) state.setPosition(state.position.x, store.worldBoundary.h);
        if (state.position.y > store.worldBoundary.h) state.setPosition(state.position.x, store.worldBoundary.y);
    }

    function update(delta, tree) {
        if (gfx && renderVision) {
            gfx.lineStyle(1, 0xaaaaaa);
            gfx.drawCircle(state.position.x, state.position.y, visionRadius);
        }

        acceleration.zero();
        findHeading(tree);
        state.velocity.add(acceleration);
        state.velocity.setLength(maxSpeed * delta);

        state.position.add(velocity);
        updateSpritePos();
        state.setRotation(state.velocity.getUnit().angle());
        checkBounds();
    }

    function setVizualizationStatus(connections, vision, separation, alignment, cohesion) {
        renderConnections = connections;
        renderVision = vision;
        enableSeparation = separation;
        enableAlignment = alignment;
        enableCohesion = cohesion;
    }

    function setVelocity(vel) {
        velocity.copy(vel);
    }

    function addForce(x, y = undefined) {
        acceleration.add(x, y);
    }

    function setSpeed(speed) {
        maxSpeed = speed;
    }

    function getTestAngles() {
        return testAngles;
    }


    const localState = {
        // exposed vars
        id,
        position,
        velocity,
        sprite,
        texture,
        visionRadius,
        fov,
        // functions
        addForce,
        getTestAngles,
        setVizualizationStatus,
        getPosition,
        setPosition,
        setRotation,
        setVelocity,
        setSpeed,
        update,
    };

    return createState('Boid', state, {
        localState,
    });
};

export default createBoid;
