import * as PIXI from 'pixi.js';
import createState from 'utils/createState';
import canEmit from 'components/events/canEmit';
import config from '../../config';
import getUUID from 'math/getUUID';
import getRandomInt from '../../math/getRandomInt';
import Rect from '../../shapes/rect';

const createTree = (spawnPoint, textureMap, scene, birdRef) => {
    const state = {};
    const id = getUUID();

    const scale = 0.375;
    const groundLevel = 150;
    const treeTypes = 4;

    let type = `tree${getRandomInt(1, 1)}`;
    let isPassed = false;

    let collider1;
    let collider2;

    const bird = birdRef;
    const sprite = new PIXI.Sprite(textureMap.get(type));
    sprite.scale.set(scale);

    const debugGfx = new PIXI.Graphics();

    function __constructor() {
        sprite.position.x = spawnPoint;
        scene.addChildAt(sprite, scene.children.length - 1);
        sprite.position.y = config.WORLD.height - groundLevel - sprite.height;

        switch (type) {
            case 'tree1':
                collider1 = new Rect(sprite.position.x + sprite.width / 3.1, 0, 160, 350);
                collider2 = new Rect(sprite.position.x + sprite.width / 3.1, config.WORLD.height - groundLevel - 150, 160, 150);
                break;
            case 'tree2':
                collider1 = new Rect(sprite.position.x + sprite.width / 3.1, 0, 160, 168);
                collider2 = new Rect(sprite.position.x + sprite.width / 3.1, 415, 160, 450);
                break;
            case 'tree3':
                collider1 = new Rect(sprite.position.x + sprite.width / 3.1, 0, 160, 168);
                collider2 = new Rect(sprite.position.x + sprite.width / 3.1, 415, 160, 450);
                break;
            case 'tree4':
                collider1 = new Rect(sprite.position.x + sprite.width / 3.1, 0, 160, 70);
                collider2 = new Rect(sprite.position.x + sprite.width / 3.1, 310, 160, 450);
                break;
            default:
                collider1 = new Rect(0, 0, 0, 0);
                collider2 = new Rect(0, 0, 0, 0);
        }

        scene.addChild(debugGfx);
    }

    function update(delta, speed) {
        if (!state.isActive) return;
        debugGfx.clear();

        sprite.position.x -= speed * delta;
        collider1.x -= speed * delta;
        collider2.x -= speed * delta;

        if (sprite.position.x + sprite.width < 0) {
            state.deactivate();
        }

        if (isPassed) return;

        if (bird && bird.body.position.x > sprite.position.x + sprite.width) {
            state.emit(config.EVENTS.ENTITY.PASSED);
            isPassed = true;
        }

        const hit1 = collider1.intersects(bird.collider);
        const hit2 = collider2.intersects(bird.collider);

        console.log(hit1, hit2);

        if (hit1 || hit2) {
            bird.die();
        }

        debugGfx.beginFill(0x000000, 0.85);
        debugGfx.drawRect(collider1.x, collider1.y, collider1.w, collider1.h);
        debugGfx.drawRect(collider2.x, collider2.y, collider2.w, collider2.h);
        debugGfx.endFill();
    }

    function setType(t) {
        type = t;
        sprite.texture = textureMap.get(type);
    }

    function deactivate() {
        sprite.renderable = false;
        state.isActive = false;
    }

    function setPosition(position) {
        sprite.position.x = spawnPoint;
        collider1.x = sprite.position.x + sprite.width / 3.1;
        collider2.x = sprite.position.x + sprite.width / 3.1;
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
