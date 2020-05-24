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
    const bushScale = 0.45;
    const groundLevel = 150;
    const treeTypes = 10;
    const bushTypes = 5;

    let type = `tree${getRandomInt(1, treeTypes)}`;
    let isPassed = false;

    let colliders;
    const bird = birdRef;
    const sprite = new PIXI.Sprite(textureMap.get(type));
    sprite.scale.set(scale);

    const bushSprite = new PIXI.Sprite(textureMap.get(`bush${getRandomInt(1, bushTypes)}`));
    bushSprite.scale.set(bushScale);

    const debugGfx = new PIXI.Graphics();

    function __constructor() {
        state.setPosition(spawnPoint, config.WORLD.height - groundLevel - sprite.height);
        scene.addChild(sprite);
        scene.addChild(bushSprite);
        scene.addChild(debugGfx);
    }

    function updateCollision(delta, speed) {
        colliders.forEach((collider) => {
            collider.x -= speed * delta;
            if (collider.intersects(bird.getCollider())) {
                bird.die();
            }

            collider.render(debugGfx);
        });
    }

    function update(delta, speed) {
        debugGfx.clear();
        if (!state.isActive) return;

        sprite.position.x -= speed * delta;
        bushSprite.position.x -= speed * delta;
        updateCollision(delta, speed);

        if (Math.max(sprite.position.x + sprite.width, bushSprite.position.x + bushSprite.width) < 0) {
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
        bushSprite.renderable = false;
        state.isActive = false;
    }


    function setPosition(x, y = undefined) {
        sprite.position.x = x;
        bushSprite.position.x = x;
        bushSprite.position.y = config.WORLD.height - groundLevel - bushSprite.height * 0.9;
        if (y) {
            sprite.position.y = y;
        }
        syncCollision();
    }

    function activate() {
        isPassed = false;
        sprite.renderable = true;
        bushSprite.renderable = true;
        state.isActive = true;
    }

    function destroy() {
        scene.removeChild(bushSprite);
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
