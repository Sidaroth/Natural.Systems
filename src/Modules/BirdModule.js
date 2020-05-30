import * as PIXI from 'pixi.js';
import Module from './Module';
import store from '../store';
import getRandomInt from '../math/getRandomInt';
import createBird from '../components/bird/createBird';
import Vector from '../math/Vector';
import config from '../config';
import createTree from '../components/bird/createTree';
import Rect from '../shapes/rect';

// TODO List:
// ** Add SFX for death and flapping.
// ** Add in more foreground/background clutter.
// ** Make autoflapper.
export default class BirdModule extends Module {
    constructor(stage) {
        super();
        this.name = 'bird';
        this.description = 'Trees, flapping, what more do you need?\nPress LMB to flap!';
        this.stage = stage;
        this.autoBird = false;
        this.speed = 12.5;
        this.maxSpeed = 20;
        this.flapForce = 11;
        this.gravity = 0.7;
        this.textures = [];
        this.trees = [];
        this.fgSprites = [];
        this.bushSprites = [];
        this.bgmVolume = 25;
        this.treeColliderMap = new Map();

        this.SFXVolume = 50;
        store.SFXVolume = this.SFXVolume / 100;

        this.loadSpritesheets();
        this.loadAudio();
    }

    // Load collision rects from Tiled Tsx dataset.
    // NOTE: Support polygons using the SAT module instead of just rects? Probably overkill.
    // TODO: Swap to async load, or use a pixi loader.
    loadTiledData() {
        const xmlhttp = new XMLHttpRequest();
        xmlhttp.open('GET', '../../assets/images/trees/trees.tsx', false);
        xmlhttp.send();
        const tiledXml = xmlhttp.responseXML;
        const tiles = tiledXml.getElementsByTagName('tile');

        for (let i = 0; i < tiles.length; i += 1) {
            const tile = tiles[i];
            const colliders = [];
            const colliderObjects = tile.getElementsByTagName('object');

            for (let j = 0; j < colliderObjects.length; j += 1) {
                const colliderObj = colliderObjects[j];
                const x = +colliderObj.getAttribute('x');
                const y = +colliderObj.getAttribute('y');
                const width = +colliderObj.getAttribute('width');
                const height = +colliderObj.getAttribute('height');

                const collider = new Rect(x, y, width, height);
                colliders.push(collider);
            }

            this.treeColliderMap.set(`tree${i + 1}`, colliders);
        }
    }

    /* eslint-disable class-methods-use-this */
    loadAudio() {
        PIXI.Loader.shared.add('birdBgm', 'assets/sounds/bgm.wav');
        PIXI.Loader.shared.add('swoosh1', 'assets/sounds/Swoosh_Swipe-Thick_01.wav');
        PIXI.Loader.shared.add('swoosh2', 'assets/sounds/Swoosh_Swipe-Thick_02.wav');
        PIXI.Loader.shared.add('swoosh3', 'assets/sounds/Swoosh_Swipe-Thick_03.wav');
        PIXI.Loader.shared.add('crashGround', 'assets/sounds/collision_paper_soft_02.wav');
        PIXI.Loader.shared.add('crashTree', 'assets/sounds/collision_hallow_01.wav');
    }

    loadSpritesheets() {
        PIXI.Loader.shared.add('birdSheet', 'assets/images/bird/bird_packed.json');
        PIXI.Loader.shared.add('parallaxSheet', 'assets/images/parallax/parallax.json');
        PIXI.Loader.shared.add('treeSheet', 'assets/images/trees/trees.json');
        PIXI.Loader.shared.add('clutterSheet', 'assets/images/clutter/clutter.json');
    }

    mapSFX(resources) {
        store.SFXMap = new Map();
        store.SFXMap.set('swoosh1', resources.swoosh1.sound);
        store.SFXMap.set('swoosh2', resources.swoosh2.sound);
        store.SFXMap.set('swoosh3', resources.swoosh3.sound);
        store.SFXMap.set('crashGround', resources.crashGround.sound);
        store.SFXMap.set('crashTree', resources.crashTree.sound);
    }
    /* eslint-enable class-methods-use-this */

    setupGui() {
        this.folder = store.gui.addFolder('Bird Settings');
        // this.folder.add(this, 'autoBird').listen().onChange(() => this.onAutoBird());
        this.folder.add(this, 'flapForce', 0, 50).listen().onChange(v => this.onFlapForceChanged(v));
        this.folder.add(this, 'maxSpeed', 0, 100).listen();
        this.folder.add(this, 'gravity', 0, 1.5).listen().onChange(v => this.onGravityChanged(v));
        this.folder.add(this, 'speed', 0, 30).listen();
        this.folder.add(this, 'bgmVolume', 0, 100).listen().onChange(v => this.onBgmVolumeChanged(v));

        this.folder.add(this, 'SFXVolume', 0, 100).listen().onChange((v) => {
            store.SFXVolume = v / 100;
        });

        this.folder.add(this, 'reset');
        this.folder.open();
    }

    onGravityChanged(value) {
        this.birdGravity.y = value;
    }

    onFlapForceChanged(value) {
        this.bird.setFlapForce(-value);
    }

    onBgmVolumeChanged(value) {
        if (this.birdBgm) {
            this.birdBgm.sound.volume = value / 100;
        }
    }

    onAutoBird() {
        console.log(this.autoBird);
    }

    onBirdDeath(e) {
        this.reset();
    }

    createBackground(resources) {
        const { textures } = resources.parallaxSheet.spritesheet;
        this.skySprite = new PIXI.Sprite(textures['sky.png']);
        this.stage.addChild(this.skySprite);

        this.farTreeSprites = this.createBgSprites(2, textures['furthest_trees.png']);
        this.nearTreeSprites = this.createBgSprites(2, textures['nearest_trees.png']);
        this.bushSprites = this.createBgSprites(3, textures['background_bushes.png'], 0.9);
        this.fgSprites = this.createBgSprites(5, textures['foreground_tile.png'], 1.5);
    }

    // Create a map of textures for easy access.
    mapTextures(resources) {
        const treeTextures = resources.treeSheet.spritesheet.textures;
        const clutterTextures = resources.clutterSheet.spritesheet.textures;

        this.textureMap = new Map();
        this.textureMap.set('tree1', treeTextures['completeTree1.png']);
        this.textureMap.set('tree2', treeTextures['completeTree2.png']);
        this.textureMap.set('tree3', treeTextures['completeTree3.png']);
        this.textureMap.set('tree4', treeTextures['completeTree4.png']);
        this.textureMap.set('tree5', treeTextures['completeTree5.png']);
        this.textureMap.set('tree6', treeTextures['completeTree6.png']);
        this.textureMap.set('tree7', treeTextures['completeTree7.png']);
        this.textureMap.set('tree8', treeTextures['completeTree8.png']);
        this.textureMap.set('tree9', treeTextures['completeTree9.png']);
        this.textureMap.set('tree10', treeTextures['completeTree10.png']);

        this.textureMap.set('bush1', clutterTextures['bush_04.png']);
        this.textureMap.set('bush2', clutterTextures['bush_05.png']);
        this.textureMap.set('bush3', clutterTextures['bush_06.png']);

        this.textureMap.set('clutter1', clutterTextures['rocks_01.png']);
        this.textureMap.set('clutter2', clutterTextures['rocks_02.png']);
        this.textureMap.set('clutter3', clutterTextures['rocks_03.png']);
        this.textureMap.set('clutter4', clutterTextures['rocks_04.png']);
        this.textureMap.set('clutter5', clutterTextures['rocks_05.png']);
        this.textureMap.set('clutter6', clutterTextures['rocks_06.png']);
    }

    createBgSprites(count, texture, heightModifier = 1) {
        const sprites = [];
        for (let i = 0; i < count; i += 1) {
            const sprite = new PIXI.Sprite(texture);
            sprite.position.x = sprite.width * i;
            sprite.position.y = config.WORLD.height - sprite.height / heightModifier;
            sprites.push(sprite);
            this.stage.addChild(sprite);
        }

        return sprites;
    }

    createTrees() {
        for (let i = 0; i < 20; i += 1) {
            const tree = createTree(2000, this.textureMap, this.treeColliderMap, this.stage, this.bird);
            tree.on(config.EVENTS.ENTITY.PASSED, this.updateScore, this);
            this.trees.push(tree);
        }
    }

    updateScore() {
        this.score += 1;
        this.scoreText.text = this.score;
        this.scoreText.position.x = config.WORLD.width / 2 - this.scoreText.width / 2;
    }

    addText() {
        this.bgText = new PIXI.Text('Flap to begin!', {
            fontFamily: 'Tahoma',
            fontSize: 72,
            fill: 0xFFFFFF,
            align: 'center',
            fontWeight: 'bold',
            strokeThickness: 3,
            dropShadow: true,
        });
        this.bgText.position.x = config.WORLD.width / 2 - this.bgText.width / 2;
        this.bgText.position.y = config.WORLD.height / 10;
        this.bgText.zIndex = 999;

        this.scoreText = new PIXI.Text('0', {
            fontFamily: 'Tahoma',
            fontSize: 100,
            fill: 0xFFFFFF,
            align: 'center',
            fontWeight: 'bold',
            strokeThickness: 4,
            dropShadow: true,
        });
        this.scoreText.zIndex = 999;
        this.scoreText.position.x = config.WORLD.width / 2 - this.scoreText.width / 2;
        this.scoreText.position.y = config.WORLD.height / 10;
        this.scoreText.visible = false;

        this.stage.addChild(this.bgText);
        this.stage.addChild(this.scoreText);
    }

    // ------------------- ACTUAL GAME LOGIC ------------------------
    /* eslint-disable class-methods-use-this */
    parallaxSprite(sprite, array, idx, speed) {
        sprite.position.x -= speed;
        if (sprite.position.x + sprite.width < 0) {
            // The previous sprite, if we need to move, should be the one at the end currently.
            const index = idx ? idx - 1 : array.length - 1;
            const lastSprite = array[index];
            sprite.position.x = lastSprite.x + lastSprite.width - speed;
        }
    }
    /* eslint-enable class-methods-use-this */

    updateBackground(delta) {
        if (!this.isFlying) return;

        this.fgSprites.forEach((sprite, i) => {
            this.parallaxSprite(sprite, this.fgSprites, i, this.speed * delta);
        });

        this.bushSprites.forEach((sprite, i) => {
            this.parallaxSprite(sprite, this.bushSprites, i, this.speed * delta / 3);
        });

        this.nearTreeSprites.forEach((sprite, i) => {
            this.parallaxSprite(sprite, this.nearTreeSprites, i, this.speed * delta / 5);
        });

        this.farTreeSprites.forEach((sprite, i) => {
            this.parallaxSprite(sprite, this.farTreeSprites, i, this.speed * delta / 7);
        });
    }

    addTree(spawnPoint) {
        const inactiveTrees = this.trees.filter(tree => !tree.isActive);

        if (inactiveTrees.length) {
            const index = getRandomInt(0, inactiveTrees.length - 1);
            const tree = inactiveTrees[index];
            tree.activate();
            tree.setPosition(spawnPoint);
        } else {
            const tree = createTree(spawnPoint, this.textureMap, this.treeColliderMap, this.stage, this.bird);
            this.trees.push(tree);
        }
    }

    update(delta) {
        if (this.debugGfx) this.debugGfx.clear();
        if (!this.isLoaded) return;

        this.bird.applyForce(Vector.multiply(this.birdGravity, delta));
        this.bird.update(delta, this.speed);
        this.updateBackground(delta);

        for (let i = this.trees.length - 1; i >= 0; i -= 1) {
            const tree = this.trees[i];
            tree.update(delta, this.speed);
        }

        if (this.isFlying) {
            this.distanceToNextTree -= this.speed * delta;
            if (this.distanceToNextTree < 0) {
                this.addTree(1300);
                this.distanceToNextTree = getRandomInt(700, 900);
            }
        }
    }

    createBird() {
        if (this.bird) {
            this.stage.removeChild(this.bird.getSprite());
            this.bird.destroy();
        }
        this.bird = createBird(new Vector(0, -this.flapForce), this.maxSpeed, this.birdSheet);
        this.bird.setAnimationSpeed(0.30);
        this.bird.getSprite().anchor.set(0.5);
        this.bird.enableMouse();
        this.bird.on(config.EVENTS.ENTITY.DIE, e => this.onBirdDeath(e));
        this.bird.on(config.EVENTS.ENTITY.FIRSTFLAP, (e) => {
            this.bgText.visible = false;
            this.scoreText.visible = true;
            this.distanceToNextTree = 400;
            this.isFlying = true;
        });

        this.bird.getSprite().zIndex = 1000;
        this.stage.addChild(this.bird.getSprite());
    }

    async setup() {
        this.isLoaded = false;
        this.loadTiledData();

        PIXI.Loader.shared.load((loader, resources) => {
            this.birdBgm = resources.birdBgm;
            this.birdBgm.sound.play({
                loop: true,
                singleInstance: true,
            });
            this.birdBgm.sound.volume = this.bgmVolume / 100;
            this.birdSheet = resources.birdSheet.spritesheet;

            this.createBird();
            this.createBackground(resources);
            this.mapTextures(resources);
            this.mapSFX(resources);
            this.addText();
            this.createTrees();
            this.reset();

            // this.debugCollider = new Circle(0, 0, 50);
            this.debugGfx = new PIXI.Graphics();
            this.stage.addChild(this.debugGfx);
            this.isLoaded = true;
        });

        this.setupGui();
    }

    reset() {
        this.birdGravity = new Vector(0, this.gravity);
        this.score = 0;
        if (this.scoreText) {
            this.scoreText.text = 0;
            this.scoreText.position.x = config.WORLD.width / 2 - this.scoreText.width / 2;
            this.scoreText.visible = false;
        }

        this.bgText.visible = true;

        this.trees.forEach((tree) => {
            tree.deactivate();
        });

        this.stage.sortChildren();
        this.bird.reset();

        this.isFlying = false;
    }

    destroy() {
        if (this.birdBgm) {
            this.birdBgm.sound.stop();
        }

        if (this.folder) {
            store.gui.removeFolder(this.folder);
        }

        if (this.bgText) {
            this.stage.removeChild(this.bgText);
            this.bgText.destroy();
        }

        if (this.scoreText) {
            this.stage.removeChild(this.scoreText);
            this.scoreText.destroy();
        }

        if (this.bird) {
            this.stage.removeChild(this.bird.getSprite());
            this.bird.destroy();
            this.bird = null;
        }

        this.trees.forEach((tree) => {
            tree.destroy();
        });
        this.trees = [];

        this.farTreeSprites.forEach((tree) => {
            tree.destroy();
        });
        this.nearTreeSprites.forEach((tree) => {
            tree.destroy();
        });
        this.bushSprites.forEach((tree) => {
            tree.destroy();
        });
        this.fgSprites.forEach((tree) => {
            tree.destroy();
        });

        this.skySprite.destroy();

        this.textures.forEach((texture) => {
            texture.destroy();
        });
    }
}
