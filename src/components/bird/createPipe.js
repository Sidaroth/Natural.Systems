import Vector from '../../math/Vector';
import * as PIXI from 'pixi.js';
import Rect from '../../shapes/rect';
import createState from 'utils/createState';
import canEmit from 'components/events/canEmit';
import config from '../../config';

const createPipe = (birdRef, texture, orientation, xPos, gap, heightAdjustment) => {
    const state = {};
    const sprite = new PIXI.Sprite(texture);
    sprite.rotation = Math.PI;

    const bird = birdRef;
    const width = 177;
    const height = 1175;
    const isTop = orientation === 'top';

    const topPos = heightAdjustment;
    const bottomPos = topPos + gap + height;
    const yPos = isTop ? topPos : bottomPos;

    const position = new Vector(xPos, yPos);
    const collider = new Rect(position.x - width, position.y - height, width, height);
    sprite.position.x = position.x;
    sprite.position.y = position.y;

    let birdHasPassed = false;

    function checkForCollisions() {
        if (collider.intersects(bird.collider)) {
            // Houston, we have a crash.
            bird.onCollision({
                source: state,
            });
        }
    }

    function hasBirdPassed() {
        if (birdHasPassed || state.destroyed || bird.destroyed) return;

        if (bird && bird.body && bird.body.sprite && (bird.body.position.x - bird.body.sprite.width / 2) > position.x) {
            // bird has flown past us.
            birdHasPassed = true;
            state.emit(config.EVENTS.ENTITY.PASSED, state);
        }
    }

    function setPosition(x, y) {
        position.x = x;
        position.y = y;
        sprite.position.x = x;
        sprite.position.y = y;
        collider.setPosition(x - width, y - height);
    }

    function update(delta, pipeSpeed, debugGfx = undefined) {
        setPosition(position.x - pipeSpeed, position.y);
        if (sprite && position.x + sprite.width < 0) {
            state.destroyed = true;
            return;
        }

        if (birdHasPassed || state.destroyed) return;

        checkForCollisions();
        hasBirdPassed();

        if (debugGfx) {
            debugGfx.lineStyle(5, 0x000000);
            debugGfx.drawRect(collider.x, collider.y, collider.w, collider.h);
        }
    }

    function destroy() {
        if (sprite) {
            sprite.destroy();
        }
    }

    const localState = {
        update,
        destroy,
        sprite,
        position,
        destroyed: false,
    };

    return createState('Pipe', state, {
        localState,
        canEmit: canEmit(state),
    });
};

export default createPipe;
