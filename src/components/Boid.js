import * as PIXI from 'pixi.js';
import Vector from '../math/Vector';
import degreesToRadians from '../math/degreesToRadians';
import Circle from '../shapes/circle';
import store from '../store';
import getUUID from '../math/getUUID';
import getRandomInt from '../math/getRandomInt';

// Boid logic:
// 1. Avoid obstacles/each other (Separation)
// 2. Fly together in a unified direction. (Alignment)
// 3. Move towards center of flock. (Cohesion)
const createBoid = (texture, edges, debugStage = undefined) => {
    const state = {};

    const id = getUUID();
    const position = new Vector();
    const direction = new Vector(0, -1);
    const velocity = new Vector();
    const sprite = new PIXI.Sprite(texture);
    sprite.anchor.set(0.5);

    const fov = 100;
    const visionRadius = 125;
    const visionShape = new Circle(position.x, position.y, visionRadius);
    const testAngles = [];
    const fovSlices = 180;
    const sliceWidth = fov / fovSlices;
    let rotation = 0;
    let staticSpeed = 2;
    let renderConnections = false;
    let renderVision = false;
    let gfx;

    if (debugStage) {
        gfx = new PIXI.Graphics();
        debugStage.addChild(gfx);
    }

    // i.e -45 degrees to +45 degrees.
    for (let angle = -fov / 2; angle <= fov / 2; angle += sliceWidth) {
        if (angle !== 0) testAngles.push(degreesToRadians(angle));
    }
    testAngles.sort((a, b) => Math.abs(a) - Math.abs(b)); // Sort angles so they are increasingly larger in each direction.

    function getPosition() {
        return position;
    }

    function getCentroid(vertices) {
        let centerX = 0;
        let centerY = 0;
        let area = 0;

        vertices.forEach((vertex, i) => {
            const nextVertex = vertices[(i + 1) % vertices.length];

            const a = vertex.x * nextVertex.y - nextVertex.x * vertex.y;
            centerX += (vertex.x + nextVertex.x) * a;
            centerY += (vertex.y + nextVertex.y) * a;
            area += a;
        });

        area *= 3;
        centerX /= area;
        centerY /= area;

        return new Vector(centerX, centerY);
    }

    function findDirection(tree) {
        const nearbyBoids = tree.query(visionShape).filter(b => b.id !== id);
        if (!nearbyBoids.length) return;

        const closest = {
            distance: Infinity,
            boid: undefined,
        };

        const flockVertices = [];
        const flockDirections = [];

        nearbyBoids.forEach((boid) => {
            const distance = Vector.sub(boid.position, position).squaredLength();
            if (distance < closest.distance) {
                closest.boid = boid;
                closest.distance = distance;
            }

            flockVertices.push(boid.position);
            flockDirections.push(boid.direction);

            if (renderConnections && gfx) {
                gfx.lineStyle(1, 0x000000);
                gfx.moveTo(position.x, position.y);
                gfx.lineTo(boid.position.x, boid.position.y);
            }
        });

        let avoidanceDirection;
        let directionToCenter;
        let flockDirection;
        let numDirs = 0;

        if (closest.boid) {
            avoidanceDirection = direction.clone().rotateBy(testAngles[getRandomInt(3, 5)]);
            numDirs += 1;
        }

        if (flockVertices.length >= 3) {
            const flockCenter = getCentroid(flockVertices);
            directionToCenter = Vector.sub(flockCenter, position).getUnit();

            flockDirection = { x: 0, y: 0 };
            flockDirections.reduce((m, dir) => {
                m.x += dir.x;
                m.y += dir.y;
                return m;
            }, flockDirection);

            flockDirection.x /= flockDirections.length;
            flockDirection.y /= flockDirections.length;
            numDirs += 2;
        }

        // find final direction.
        const finalDirection = new Vector()
            .add(flockDirection)
            .add(avoidanceDirection)
            .add(directionToCenter)
            .divide(numDirs);

        direction.set(finalDirection).getUnit();
    }

    function setPosition(x, y) {
        position.x = x;
        position.y = y;

        visionShape.setPosition(position);

        state.sprite.position.x = x;
        state.sprite.position.y = y;
    }

    function setRotation(angle) {
        rotation = angle;
        if (state.sprite) sprite.rotation = angle;
    }

    function checkBounds() {
        if (state.position.x < store.worldBoundary.x) state.setPosition(store.worldBoundary.w, position.y);
        if (state.position.x > store.worldBoundary.w) state.setPosition(store.worldBoundary.x, position.y);
        if (state.position.y < store.worldBoundary.y) state.setPosition(position.x, store.worldBoundary.h);
        if (state.position.y > store.worldBoundary.h) state.setPosition(position.x, store.worldBoundary.y);
    }

    function update(delta, tree) {
        if (gfx) {
            gfx.clear();

            if (renderVision) {
                gfx.lineStyle(1, 0xaaaaaa);
                gfx.drawCircle(position.x, position.y, visionRadius);
            }
        }

        findDirection(tree);
        state.setVelocity(Vector.multiply(state.direction.getUnit(), staticSpeed * delta));
        state.setPosition(position.x + velocity.x, position.y + velocity.y);
        state.setRotation(state.direction.angle());

        checkBounds();
    }

    function setRenderConnections(status) {
        renderConnections = status;
    }

    function setRenderVision(status) {
        renderVision = status;
    }

    function setVelocity(vel) {
        velocity.copy(vel);
    }

    function setSpeed(speed) {
        staticSpeed = speed;
    }

    function destroy() {
        if (debugStage && gfx) debugStage.removeChild(gfx);
        if (gfx) gfx.destroy();
        state.sprite.destroy();
    }

    function getTestAngles() {
        return testAngles;
    }

    return Object.assign(state, {
        // exposed vars
        id,
        position,
        sprite,
        rotation,
        direction,
        texture,
        visionRadius,
        fov,
        // functions
        getTestAngles,
        setRenderConnections,
        setRenderVision,
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
