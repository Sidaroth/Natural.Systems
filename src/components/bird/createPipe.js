import Vector from '../../math/Vector';
import * as PIXI from 'pixi.js';
import Rect from '../../shapes/rect';

const createPipe = (collisionObjects, texture, orientation, xPos, gap, heightAdjustment) => {
    const state = {};
    const sprite = new PIXI.Sprite(texture);
    sprite.rotation = Math.PI;

    const collidesWith = collisionObjects;
    const width = 200;
    const height = 400;

    const topPos = heightAdjustment;
    const bottomPos = topPos + gap + 1175;
    const yPos = orientation === 'top' ? topPos : bottomPos;

    const position = new Vector(xPos, yPos);
    const collider = new Rect(position.x, position.y, width, height);
    sprite.position.x = position.x;
    sprite.position.y = position.y;

    function checkForCollisions() {
        collidesWith.forEach((entity) => {
            if (collider.intersects(entity.collider)) {
                // Houston, we have a crash.
            }
        });
    }

    function setPosition(x, y) {
        position.x = x;
        position.y = y;
        sprite.position.x = x;
        sprite.position.y = y;
        collider.setPosition(x, y);
    }

    function update(delta, pipeSpeed) {
        setPosition(position.x + pipeSpeed, position.y);
        checkForCollisions();
    }

    function destroy() {
        if (sprite) {
            sprite.destroy();
        }
    }

    return Object.assign(state, {
        update,
        destroy,
        sprite,
        position,
    });
};

export default createPipe;
