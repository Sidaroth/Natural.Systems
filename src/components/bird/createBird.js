import PhysicsBody from '../PhysicsBody';
import store from '../../store';
import Vector from '../../math/Vector';
import Circle from '../../shapes/circle';

// TODO When Sprites are seperated from physicsbody, update here...
const createBird = () => {
    const state = {};
    const body = new PhysicsBody();
    const flapForce = new Vector(0, -0.5);
    const startPos = new Vector(400, 400);
    const maxSpeed = 9;
    const minTimeBetweenFlaps = 16; // in ms.

    body.setPosition(startPos.x, startPos.y);
    const collisionRadius = 20; // Aka. how fat is the bird.
    const collider = new Circle(body.position.x, body.position.y, collisionRadius);

    let lastFlap = 0;
    let flapDetected = false;
    let firstFlapDone = false;

    function flap() {
        this.body.applyForce(flapForce);
    }

    function onMouseDown() {
        flapDetected = true;
    }

    function enableMouse() {
        store.renderer.plugins.interaction.on('mousedown', state.onMouseDown, state);
    }

    function disableMouse() {
        store.renderer.plugins.interaction.off('mousedown', state.onMouseDown, state);
    }

    function setTexture(texture) {
        body.setTexture(texture);
        // body.sprite.scale.x = 0.25;
        // body.sprite.scale.y = 0.25;
    }

    function updateCollision() {
        collider.setPosition(body.position);
        if (body.position.y > store.worldBoundary.h) {
            body.setPosition(startPos.x, startPos.y);
            body.velocity.zero();
            firstFlapDone = false;
        }
    }

    function setFlapForce(yValue) {
        flapForce.y = yValue;
    }

    function update(delta) {
        const timeNow = Date.now();
        if (flapDetected && timeNow - lastFlap > minTimeBetweenFlaps) {
            body.velocity.zero();
            body.applyForce(flapForce);
            lastFlap = timeNow;

            if (!firstFlapDone) firstFlapDone = true;
        }

        if (!firstFlapDone) {
            // Apply no forces internal or external until first flap has been done.
            body.acceleration.zero();
        }

        body.update();
        body.velocity.limit(maxSpeed);

        updateCollision();
        flapDetected = false;
    }

    function applyForce(force) {
        body.applyForce(force);
    }

    function destroy() {
        state.disableMouse();
        body.destroy();
    }

    return Object.assign(state, {
        body,
        update,
        flap,
        onMouseDown,
        enableMouse,
        disableMouse,
        destroy,
        setTexture,
        setFlapForce,
        applyForce,
    });
};

export default createBird;
