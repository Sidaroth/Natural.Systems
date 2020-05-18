import * as PIXI from 'pixi.js';
import createState from 'utils/createState';
import canEmit from 'components/events/canEmit';
import config from '../../config';
import getUUID from 'math/getUUID';
import getRandomInt from '../../math/getRandomInt';

const createTree = (spawnPoint, textureMap, scene, birdRef) => {
    const state = {};
    const id = getUUID();

    const scale = 0.375;
    const groundLevel = 150;
    const treeTypes = 4;

    let type = `tree${getRandomInt(1, treeTypes)}`;
    let isPassed = false;

    const bird = birdRef;
    const sprite = new PIXI.Sprite(textureMap.get(type));
    sprite.scale.set(scale);

    function __constructor() {
        sprite.position.x = spawnPoint;
        scene.addChildAt(sprite, scene.children.length - 3); // Add below UI text and bird

        if (sprite.texture.baseTexture.valid) {
            sprite.position.y = config.WORLD.height - groundLevel - sprite.height;
        }
    }

    function update(delta, speed) {
        if (!state.isActive) return;

        sprite.position.x -= speed * delta;

        if (sprite.position.x + sprite.width < 0) {
            state.deactivate();
        }

        if (!isPassed && bird && bird.body.position.x > sprite.position.x + sprite.width) {
            state.emit(config.EVENTS.ENTITY.PASSED);
            isPassed = true;
        }
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
