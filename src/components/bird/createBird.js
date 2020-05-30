import PhysicsBody from '../PhysicsBody';
import store from '../../store';
import Vector from '../../math/Vector';
import Circle from '../../shapes/circle';
import canEmit from 'components/events/canEmit';
import createState from 'utils/createState';
import config from '../../config';
import hasAnimation from '../hasAnimation';
import hasCollision from '../hasCollision';
import getRandomInt from '../../math/getRandomInt';
import playSFX from 'utils/playSFX';

const createBird = (flapVector = new Vector(0, -0.5), maxSp = 11, birdSheet = undefined) => {
    const state = {};
    const body = new PhysicsBody();
    const flapForce = flapVector || new Vector();
    const startPos = new Vector(400, 400);
    const maxSpeed = maxSp;
    const minTimeBetweenFlaps = 16.67; // in ms
    const groundLevel = 150;

    let lastFlap = 0;
    let flapDetected = false;
    let firstFlapDone = false;
    let alive = true;

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
        return pos;
    }

    function setFlapForce(yValue) {
        flapForce.y = yValue;
    }

    function die() {
        if (!alive) return;

        state.setAnimation('dead');
        state.body.velocity.zero();
        alive = false;
    }

    function onDeath() {
        state.reset();
        state.emit(config.EVENTS.ENTITY.DIE, 'I died');
    }

    function flap() {
        body.velocity.zero();
        body.applyForce(flapForce);

        const SFXKey = `swoosh${getRandomInt(1, 3)}`;
        playSFX(SFXKey);

        if (!firstFlapDone) {
            firstFlapDone = true;
            state.emit(config.EVENTS.ENTITY.FIRSTFLAP, 'I flapped');
        }
    }

    function updateCollision() {
        if (body.position.y > config.WORLD.height) {
            onDeath();
        }

        // We don't need to die twice...
        if (!alive) return;

        // We don't want any cheeky birds flying above the trees.
        const groundCollision = body.position.y > config.WORLD.height - groundLevel;
        const skyCollision = body.position.y < 0 - state.getSprite().height * 0.5;

        if (groundCollision || skyCollision) {
            playSFX('crashGround');
            die();
        }
    }


    function update(delta, speed, debugGfx = undefined) {
        const forwardSpeed = alive ? speed : 0;

        if (alive) {
            const timeNow = Date.now();
            if (flapDetected && timeNow - lastFlap > minTimeBetweenFlaps) {
                flap();
                lastFlap = timeNow;
            }
        }

        if (!firstFlapDone) {
            // Apply no forces internal or external until first flap has been done.
            body.acceleration.zero();
        }

        body.update(delta);
        body.velocity.limit(maxSpeed);
        state.setPosition(body.position);

        updateCollision();
        // state.renderCollider(debugGfx);

        const angle = new Vector(forwardSpeed, body.velocity.y).angle();
        state.getSprite().rotation = angle - Math.PI / 2;
        flapDetected = false;
    }

    function isAlive() {
        return alive;
    }

    function applyForce(force) {
        body.applyForce(force);
    }

    function reset() {
        state.setPosition(startPos);
        body.velocity.zero();
        firstFlapDone = false;
        alive = true;
        state.setAnimation('normal');
    }

    function destroy() {
        state.disableMouse();
        body.destroy();
    }

    const localState = {
        __constructor,
        body,
        update,
        die,
        onMouseDown,
        enableMouse,
        disableMouse,
        destroy,
        reset,
        setFlapForce,
        isAlive,
        applyForce,
        setPosition,
    };

    return createState('bird', state, {
        localState,
        canEmit: canEmit(state),
        hasAnimation: hasAnimation(state, birdSheet, 'normal'),
        hasCollision: hasCollision(state, new Circle(body.position.x, body.position.y, 45)),
    });
};

export default createBird;
