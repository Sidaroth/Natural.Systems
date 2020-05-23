import PhysicsBody from '../PhysicsBody';
import store from '../../store';
import Vector from '../../math/Vector';
import Circle from '../../shapes/circle';
import canEmit from 'components/events/canEmit';
import createState from 'utils/createState';
import config from '../../config';
import hasAnimation from '../hasAnimation';

const createBird = (flapVector = new Vector(0, -0.5), maxSp = 11, birdSheet = undefined) => {
    const state = {};
    const body = new PhysicsBody();
    const flapForce = flapVector || new Vector();
    const startPos = new Vector(400, 400);
    const maxSpeed = maxSp;
    const minTimeBetweenFlaps = 16.67; // in ms
    const groundLevel = 150;

    const collisionRadius = 42; // Aka. how fat is the bird.
    const collider = new Circle(body.position.x, body.position.y, collisionRadius);

    let lastFlap = 0;
    let flapDetected = false;
    let firstFlapDone = false;

    function __constructor() {
        state.setPosition(startPos);
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

    function setPosition(pos) {
        body.setPosition(pos.x, pos.y);
        collider.setPosition(pos.x, pos.y);
        return pos;
    }

    function die() {
        state.setPosition(startPos);
        body.velocity.zero();
        state.setRenderable(false);
        firstFlapDone = false;
        state.emit(config.EVENTS.ENTITY.DIE, 'I died');
    }

    function updateCollision() {
        if (body.position.y > config.WORLD.height - groundLevel) {
            die();
        }
    }

    function setFlapForce(yValue) {
        flapForce.y = yValue;
    }

    function update(delta, debugGfx = undefined) {
        const timeNow = Date.now();
        if (flapDetected && timeNow - lastFlap > minTimeBetweenFlaps) {
            body.velocity.zero();
            body.applyForce(flapForce);
            lastFlap = timeNow;

            if (!firstFlapDone) {
                firstFlapDone = true;
                state.emit(config.EVENTS.ENTITY.FIRSTFLAP, 'I flapped');
            }
        }

        if (!firstFlapDone) {
            // Apply no forces internal or external until first flap has been done.
            body.acceleration.zero();
        }

        body.update(delta);
        body.velocity.limit(maxSpeed);

        // TL;DR fix hasPhysicsBody instead...
        state.setPosition(body.position);

        updateCollision();
        flapDetected = false;

        if (debugGfx) {
            debugGfx.lineStyle(5, 0xFF0000);
            debugGfx.drawCircle(collider.x, collider.y, collider.getRadius());
        }
    }

    function applyForce(force) {
        body.applyForce(force);
    }

    function destroy() {
        state.disableMouse();
        body.destroy();
    }

    const localState = {
        __constructor,
        body,
        update,
        collider,
        die,
        onMouseDown,
        enableMouse,
        disableMouse,
        destroy,
        setFlapForce,
        applyForce,
        setPosition,
    };

    return createState('bird', state, {
        localState,
        canEmit: canEmit(state),
        hasAnimation: hasAnimation(state, birdSheet, 'normal'),
    });
};

export default createBird;
