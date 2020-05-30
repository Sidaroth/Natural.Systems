import * as PIXI from 'pixi.js';
import createState from 'utils/createState';
import canEmit from 'components/events/canEmit';
import createTree from 'components/bird/createTree';
import createBird from 'components/bird/createBird';
import hasContainer from 'components/hasContainer';
import hasParallax from 'components/hasParallax';
import hasMusic from 'components/audio/hasMusic';

import getRandomInt from 'math/getRandomInt';
import Vector from 'math/Vector';

import config from '../../config';
import store from '../../store';

// TODO List:
// ** Seperate out the level(s) from the game module.
// ** Add in more foreground/background clutter.
// ** Make autoflapper.
const createEndlessForest = function createEndlessForestFunc(settings) {
    const state = {};

    let {
        flapForce, maxSpeed, autoBird,
    } = settings;

    const gravity = new Vector(0, settings.gravity);
    let flightSpeed = 12;

    const trees = [];

    let distanceToNextTree = 400;
    let isFlying = false;
    let bird;
    let skySprite;

    function spawnTree(spawnPoint = config.WORLD.width) {
        const inactiveTrees = trees.filter(tree => !tree.isActive);

        if (inactiveTrees.length) {
            // Activate a random inactive tree.
            const index = getRandomInt(0, inactiveTrees.length - 1);
            const tree = inactiveTrees[index];
            tree.activate();
            tree.setPosition(spawnPoint);
        } else {
            // We're out of inactive trees to activate, we have to add another tree. Unlikely to happen.
            const tree = createTree(spawnPoint, state.textureMap, state.treeColliderMap, state.stage, state.bird);
            trees.push(tree);
        }
    }

    function update(delta) {
        bird.applyForce(Vector.multiply(gravity, delta));
        bird.update(delta, flightSpeed);

        if (!isFlying) return;

        state.updateParallax(delta);
        for (let i = trees.length - 1; i >= 0; i -= 1) {
            trees[i].update(delta, flightSpeed);
        }

        distanceToNextTree -= flightSpeed * delta;
        if (distanceToNextTree < 0) {
            distanceToNextTree = getRandomInt(700, 900);
            spawnTree();
        }
    }

    // --------------- Setup and Plumbing ----------------
    function setupBird() {
        bird = createBird(new Vector(0, -flapForce), maxSpeed, store.textureMap.get('birdSpritesheet'));
        bird.enableMouse();
        bird.setZIndex(1000);
        bird.setSpriteAnchor(0.5);
        bird.setAnimationSpeed(0.30);
        state.addChild(bird.getSprite());

        bird.on(config.EVENTS.ENTITY.DIE, (e) => {
            isFlying = false;
            trees.forEach((tree) => {
                tree.deactivate();
            });

            state.emit(config.EVENTS.ENTITY.DIE, (e));
        });

        bird.on(config.EVENTS.ENTITY.FIRSTFLAP, (e) => {
            state.emit(config.EVENTS.ENTITY.FIRSTFLAP, e);
            distanceToNextTree = 400;
            isFlying = true;
        });
    }

    function createTrees() {
        for (let i = 0; i < 20; i += 1) {
            const tree = createTree(2000, store.textureMap, store.treeColliderMap, state.getContainer(), bird);
            tree.on(config.EVENTS.ENTITY.PASSED, () => {
                // Bubble the event up.
                state.emit(config.EVENTS.ENTITY.PASSED);
            });

            trees.push(tree);
        }
    }

    function setupParallaxBG() {
        skySprite = new PIXI.Sprite(store.textureMap.get('sky'));
        state.addChild(skySprite);

        state.addParallaxLayer('farTrees', store.textureMap.get('farTrees'), 2, flightSpeed / 7);
        state.addParallaxLayer('nearTrees', store.textureMap.get('nearTrees'), 2, flightSpeed / 5);
        state.addParallaxLayer('backgroundBushes', store.textureMap.get('backgroundBushes'), 3, flightSpeed / 3, 0.9);
        state.addParallaxLayer('foregroundTiles', store.textureMap.get('foregroundTile'), 5, flightSpeed, 1.5);
    }

    function setup() {
        setupParallaxBG();
        setupBird();
        createTrees();

        spawnTree(500);

        state.playMusic('endlessForestBGM');

        state.reset();
    }

    function reset() {
        trees.forEach((tree) => {
            tree.deactivate();
        });

        state.updateZIndexes();
        bird.reset();
        isFlying = false;
    }

    function destroy() {
        state.stopMusic();

        if (skySprite) skySprite.destroy();

        if (bird) {
            state.removeChild(bird.getSprite());
            bird.destroy();
            bird = null;
        }

        trees.forEach((tree) => {
            tree.destroy();
        });
        state.trees = [];
    }

    // To allow for easy Dat.Gui tweaking of variables.
    function updateSettings(newSettings) {
        ({ flapForce, maxSpeed, autoBird } = newSettings);

        bird.setFlapForce(-flapForce);
        gravity.y = newSettings.gravity;

        if (flightSpeed !== newSettings.speed) {
            flightSpeed = newSettings.speed;
            state.setParallaxSpeedOnLayer('foregroundTiles', flightSpeed);
            state.setParallaxSpeedOnLayer('backgroundBushes', flightSpeed / 3);
            state.setParallaxSpeedOnLayer('nearTrees', flightSpeed / 5);
            state.setParallaxSpeedOnLayer('farTrees', flightSpeed / 7);
        }
    }

    const localState = {
        setup,
        update,
        destroy,
        reset,
        updateSettings,
    };

    return createState('endlessForest', state, {
        localState,
        canEmit: canEmit(state),
        hasMusic: hasMusic(state),
        hasParallax: hasParallax(state),
        hasContainer: hasContainer(state),
    });
};

export default createEndlessForest;
