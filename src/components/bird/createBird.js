import PhysicsBody from '../PhysicsBody';
import store from '../../store';
import Vector from '../../math/Vector';
import Circle from '../../shapes/circle';
import canEmit from 'components/events/canEmit';
import createState from 'utils/createState';
import config from '../../config';

// TODO When Sprites are seperated from physicsbody, update here...
const createBird = (spriteTexture = undefined, flapVector = new Vector(0, -0.5), maxSp = 11) => {
    const state = {};
    const body = new PhysicsBody();
    const flapForce = flapVector || new Vector();
    const startPos = new Vector(400, 400);
    const maxSpeed = maxSp;
    const minTimeBetweenFlaps = 16.67; // in ms
    if (spriteTexture) {
        body.setTexture(spriteTexture);
        body.sprite.anchor.set(0.5);
    }
    body.setPosition(startPos.x, startPos.y);
    const collisionRadius = 42; // Aka. how fat is the bird.
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
        body.sprite.anchor.set(0.5);
    }

    function die() {
        body.setPosition(startPos.x, startPos.y);
        body.velocity.zero();
        body.sprite.visible = false;
        firstFlapDone = false;
        state.emit(config.EVENTS.ENTITY.DIE, 'I died');
    }

    function onCollision(data) {
        die();
    }

    function updateCollision() {
        collider.setPosition(body.position);
        if (body.position.y > store.worldBoundary.h) {
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

        body.update();
        body.velocity.limit(maxSpeed);

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
        state.destroyed = true;
        state.disableMouse();
        body.destroy();
    }

    const localState = {
        body,
        update,
        flap,
        collider,
        onMouseDown,
        enableMouse,
        disableMouse,
        destroy,
        setTexture,
        setFlapForce,
        applyForce,
        onCollision,
        destroyed: false,
    };

    return createState('bird', state, {
        localState,
        canEmit: canEmit(state),
    });
};

export default createBird;
