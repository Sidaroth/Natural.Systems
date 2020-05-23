import * as PIXI from 'pixi.js';
import createState from 'utils/createState';
import canEmit from 'components/events/canEmit';
import config from '../../config';
import getUUID from 'math/getUUID';
import getRandomInt from '../../math/getRandomInt';
import { cloneDeep } from 'lodash';

const createTree = (spawnPoint, textureMap, colliderMap, scene, birdRef) => {
    const state = {};
    const id = getUUID();

    const scale = 0.375;
    const groundLevel = 150;
    const treeTypes = 10;

    let type = `tree${getRandomInt(1, treeTypes)}`;
    let isPassed = false;

    let colliders;
    const bird = birdRef;
    const sprite = new PIXI.Sprite(textureMap.get(type));
    sprite.scale.set(scale);

    const debugGfx = new PIXI.Graphics();

    function __constructor() {
        state.setPosition(spawnPoint, config.WORLD.height - groundLevel - sprite.height);
        scene.addChildAt(sprite, scene.children.length - 1);
        scene.addChild(debugGfx);
    }

    // eslint-disable-next-line
    function drawColliders() {
        colliders.forEach((collider) => {
            debugGfx.beginFill(0x000000, 0.85);
            debugGfx.drawRect(collider.x, collider.y, collider.w, collider.h);
            debugGfx.endFill();
        });
    }

    function updateCollision(delta, speed) {
        colliders.forEach((collider) => {
            collider.x -= speed * delta;
            if (collider.intersects(bird.collider)) {
                bird.die();
            }
            // drawColliders();
        });
    }

    function update(delta, speed) {
        debugGfx.clear();
        if (!state.isActive) return;

        sprite.position.x -= speed * delta;
        updateCollision(delta, speed);

        if (sprite.position.x + sprite.width < 0) {
            state.deactivate();
        }

        if (isPassed) return;

        if (bird && bird.body.position.x > sprite.position.x + sprite.width) {
            state.emit(config.EVENTS.ENTITY.PASSED);
            isPassed = true;
        }
    }

    // Whenever we reset colliders, we adjust it based on scale....
    function syncCollision() {
        colliders = cloneDeep(colliderMap.get(type));
        colliders.forEach((collider) => {
            collider.x = sprite.position.x + collider.x * scale;
            collider.y *= scale;
            collider.w *= scale;
            collider.h *= scale;
        });
    }

    function setType(t) {
        type = t;
        sprite.texture = textureMap.get(type);
        syncCollision();
    }

    function deactivate() {
        sprite.renderable = false;
        state.isActive = false;
    }


    function setPosition(x, y = undefined) {
        sprite.position.x = x;
        if (y) sprite.position.y = y;
        syncCollision();
    }

    function activate() {
        isPassed = false;
        sprite.renderable = true;
        state.isActive = true;
    }

    function destroy() {
        scene.removeChild(sprite);
    }

    const localState = {
        destroyed: false,
        isActive: false,
        __constructor,
        id,
        setType,
        update,
        deactivate,
        setPosition,
        activate,
        destroy,
    };

    return createState('Pipe', state, {
        localState,
        canEmit: canEmit(state),
    });
};

export default createTree;
