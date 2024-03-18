import { Graphics, Sprite, Texture } from 'pixi.js';
import createState from 'utils/createState';
import getUUID from 'math/getUUID';
import Vector from 'math/Vector';
import degreesToRadians from 'math/degreesToRadians';
import Circle from 'shapes/circle';
import store from 'root/store';
import { Boid, QuadTree } from 'root/interfaces/entities';
import Point from 'math/point';

// Boid logic:
// 1. Avoid obstacles/each other (Separation)
// 2. Fly together in a unified direction. (Alignment)
// 3. Move towards center of flock. (Cohesion)
function createBoid(texture: Texture, debugGfx?: Graphics) {
    const state = {} as Boid;

    const id = getUUID();
    const position = new Point();
    const velocity = new Vector();
    const acceleration = new Vector();
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);

    const fov = degreesToRadians(90);
    const visionRadius = 90;
    const visionSquared = visionRadius * visionRadius;
    const visionShape = new Circle(position.x, position.y, visionRadius);
    const maxForce = 0.1;
    let maxSpeed = 5;

    let tree: QuadTree;

    // Visualization vars
    let renderConnections = false;
    let renderVision = false;
    let enableCohesion = true;
    let enableAlignment = true;
    let enableSeparation = true;
    let gfx: Graphics;

    if (debugGfx) {
        gfx = debugGfx;
    }

    function getPosition() {
        return state.position;
    }

    function setTree(newTree: QuadTree) {
        tree = newTree;
    }

    function findHeading() {
        const withinRadius = tree.query(visionShape) as Array<Boid>;
        const withinFOV = withinRadius.filter((boid: Boid) => {
            const notSelf = boid.id !== id;
            const angle = Vector.angleBetweenPoints(state.position, boid.position);
            const inFOV = Math.abs(angle) < fov;
            return notSelf && inFOV;
        });

        if (!withinFOV.length) return; // No boids in range other than self, or they're not in FOV.

        const flockPosition = new Vector();
        const flockVelocity = new Vector();
        const separation = new Vector();

        withinFOV.forEach((boid: Boid) => {
            const diff = Vector.sub(state.position, boid.position);
            const distance = diff.squaredLength();
            if (distance < visionSquared) {
                diff.divide(distance);
                separation.add(diff);
            }

            flockPosition.add(boid.position);
            flockVelocity.add(boid.velocity);

            if (renderConnections && gfx) {
                gfx.moveTo(state.position.x, state.position.y);
                gfx.lineTo(boid.position.x, boid.position.y).stroke({ width: 1, color: 0x000000 });
            }
        });

        if (enableCohesion) {
            flockPosition.divide(withinFOV.length);
            flockPosition.sub(position);
            flockPosition.limit(maxForce);
            acceleration.add(flockPosition);
        }

        if (enableAlignment) {
            flockVelocity.divide(withinFOV.length);
            flockVelocity.sub(velocity);
            flockVelocity.limit(maxForce);
            acceleration.add(flockVelocity);
        }

        if (enableSeparation) {
            separation.divide(withinFOV.length);
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

    function setPosition(x: number, y: number) {
        state.position.set(x, y);
        updateSpritePos();
    }

    // In radians
    function setRotation(angle: number) {
        if (state.sprite) sprite.rotation = angle;
    }

    function checkBounds() {
        if (state.position.x < store.worldBoundary.x) state.setPosition(store.worldBoundary.w, state.position.y);
        if (state.position.x > store.worldBoundary.w) state.setPosition(store.worldBoundary.x, state.position.y);
        if (state.position.y < store.worldBoundary.y) state.setPosition(state.position.x, store.worldBoundary.h);
        if (state.position.y > store.worldBoundary.h) state.setPosition(state.position.x, store.worldBoundary.y);
    }

    function update(delta: number) {
        if (gfx && renderVision) {
            gfx.circle(state.position.x, state.position.y, visionRadius).stroke({ width: 1, color: 0xaaaaaa });
        }

        acceleration.zero();

        findHeading();
        state.velocity.add(acceleration);
        state.velocity.setLength(maxSpeed * delta);

        state.position.add(velocity.asPoint());
        updateSpritePos();
        state.setRotation(state.velocity.getUnit().angle());
        checkBounds();
    }

    function setVizualizationStatus(
        connections: boolean,
        vision: boolean,
        separation: boolean,
        alignment: boolean,
        cohesion: boolean,
    ) {
        renderConnections = connections;
        renderVision = vision;
        enableSeparation = separation;
        enableAlignment = alignment;
        enableCohesion = cohesion;
    }

    function setVelocity(vel: Vector) {
        velocity.copyFrom(vel);
    }

    function addForce(x: number, y?: number) {
        acceleration.add(x, y);
    }

    function setSpeed(speed: number) {
        maxSpeed = speed;
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
        setTree,
        addForce,
        setVizualizationStatus,
        getPosition,
        setPosition,
        setRotation,
        setVelocity,
        setSpeed,
        update,
    };

    return createState({
        stateName: 'Boid',
        mainState: state,
        states: {
            localState,
        },
    });
}

export default createBoid;
