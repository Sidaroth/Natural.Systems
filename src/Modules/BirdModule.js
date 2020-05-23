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
// ** TexturePack all assets.
// ** More effects, visually and auditory.
// ** Add in more foreground/background clutter.
// ** Make autoflapper.
export default class BirdModule extends Module {
    constructor(stage) {
        super();
        this.name = 'bird';
        this.description = 'Bird, trees, flapping, what more do you need?';
        this.stage = stage;
        this.autoBird = false;
        this.speed = 16;
        this.maxSpeed = 20;
        this.flapForce = 11;
        this.gravity = 0.7;
        this.textures = [];
        this.trees = [];
        this.fgSprites = [];
        this.bushSprites = [];
        this.bgmVolume = 0;
        this.treeColliderMap = new Map();
        PIXI.Loader.shared.add('birdBgm', 'assets/sounds/bgm.wav');

        this.loadBirdAssets();
        this.loadBackgroundTextures();
        this.loadTreeAndBushTrextures();
    }

    // Load collision rects from Tiled Tsx dataset.
    // NOTE: Support polygons using the SAT module instead of just rects? Probably overkill.
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
    loadBirdAssets() {
        PIXI.Loader.shared.add('birdSheet', 'assets/images/bird/bird_packed.json');
    }

    loadBackgroundTextures() {
        PIXI.Loader.shared.add('skyTexture', '../../assets/images/sky.png')
            .add('farTreesTexture', '../../assets/images/furthest_trees.png')
            .add('nearTreesTexture', '../../assets/images/nearest__trees.png')
            .add('bushesTexture', '../../assets/images/background_bushes.png')
            .add('foregroundTexture', '../../assets/images/foreground_tile.png');
    }

    loadTreeAndBushTrextures() {
        PIXI.Loader.shared
            .add('tree1', '../../assets/images/trees/completeTree1.png')
            .add('tree2', '../../assets/images/trees/completeTree2.png')
            .add('tree3', '../../assets/images/trees/completeTree3.png')
            .add('tree4', '../../assets/images/trees/completeTree4.png')
            .add('tree5', '../../assets/images/trees/completeTree5.png')
            .add('tree6', '../../assets/images/trees/completeTree6.png')
            .add('tree7', '../../assets/images/trees/completeTree7.png')
            .add('tree8', '../../assets/images/trees/completeTree8.png')
            .add('tree9', '../../assets/images/trees/completeTree9.png')
            .add('tree10', '../../assets/images/trees/completeTree10.png')
            .add('bush1', '../../assets/images/bushes/bush_04.png')
            .add('bush2', '../../assets/images/bushes/bush_05.png')
            .add('bush3', '../../assets/images/bushes/bush_06.png')
            .add('bush4', '../../assets/images/bushes/bush_12.png')
            .add('bush5', '../../assets/images/bushes/bush_14.png')
            .add('bush6', '../../assets/images/bushes/bush_19.png')
            .add('bush7', '../../assets/images/bushes/bush_20.png')
            .add('bush8', '../../assets/images/bushes/bush_25.png')
            .add('bush9', '../../assets/images/bushes/bush_34.png')
            .add('bush10', '../../assets/images/bushes/bush_39.png');
    }
    /* eslint-enable class-methods-use-this */

    setupGui() {
        this.folder = store.gui.addFolder('Bird Settings');
        this.folder.add(this, 'autoBird').listen().onChange(() => this.onAutoBird());
        this.folder.add(this, 'flapForce', 0, 50).listen().onChange(v => this.onFlapForceChanged(v));
        this.folder.add(this, 'maxSpeed', 0, 100).listen();
        this.folder.add(this, 'gravity', 0, 1.5).listen().onChange(v => this.onGravityChanged(v));
        this.folder.add(this, 'speed', 0, 30).listen();
        this.folder.add(this, 'bgmVolume', 0, 100).listen().onChange(v => this.onBgmVolumeChanged(v));
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
        this.bgText.visible = true;
        this.bgText.zIndex = 1000;
        this.reset();
    }

    createBackground(resources) {
        this.backgroundSprites = [];
        this.skySprite = new PIXI.Sprite(resources.skyTexture.texture);

        this.stage.addChild(this.skySprite);

        this.farTreeSprite = this.createBgSprites(2, resources.farTreesTexture.texture);
        this.nearTreeSprites = this.createBgSprites(2, resources.nearTreesTexture.texture);
        this.bushSprites = this.createBgSprites(3, resources.bushesTexture.texture, 0.9);
        this.fgSprites = this.createBgSprites(5, resources.foregroundTexture.texture, 1.5);
    }

    createTreesAndBushes(resources) {
        this.treeAndBushTextureMap = new Map();
        this.treeAndBushTextureMap.set('tree1', resources.tree1.texture);
        this.treeAndBushTextureMap.set('tree2', resources.tree2.texture);
        this.treeAndBushTextureMap.set('tree3', resources.tree3.texture);
        this.treeAndBushTextureMap.set('tree4', resources.tree4.texture);
        this.treeAndBushTextureMap.set('tree5', resources.tree5.texture);
        this.treeAndBushTextureMap.set('tree6', resources.tree6.texture);
        this.treeAndBushTextureMap.set('tree7', resources.tree7.texture);
        this.treeAndBushTextureMap.set('tree8', resources.tree8.texture);
        this.treeAndBushTextureMap.set('tree9', resources.tree9.texture);
        this.treeAndBushTextureMap.set('tree10', resources.tree10.texture);

        // Bushes
        this.treeAndBushTextureMap.set('bush1', resources.bush1.texture);
        this.treeAndBushTextureMap.set('bush2', resources.bush2.texture);
        this.treeAndBushTextureMap.set('bush3', resources.bush3.texture);
        this.treeAndBushTextureMap.set('bush4', resources.bush4.texture);
        this.treeAndBushTextureMap.set('bush5', resources.bush5.texture);
        this.treeAndBushTextureMap.set('bush6', resources.bush6.texture);
        this.treeAndBushTextureMap.set('bush7', resources.bush7.texture);
        this.treeAndBushTextureMap.set('bush8', resources.bush8.texture);
        this.treeAndBushTextureMap.set('bush9', resources.bush9.texture);
        this.treeAndBushTextureMap.set('bush10', resources.bush10.texture);
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
        for (let i = 0; i < 10; i += 1) {
            const tree = createTree(2000, this.treeAndBushTextureMap, this.treeColliderMap, this.stage, this.bird);
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

        this.scoreText = new PIXI.Text('0', {
            fontFamily: 'Tahoma',
            fontSize: 100,
            fill: 0xFFFFFF,
            align: 'center',
            fontWeight: 'bold',
            strokeThickness: 4,
            dropShadow: true,
        });
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

        this.farTreeSprite.forEach((sprite, i) => {
            this.parallaxSprite(sprite, this.farTreeSprite, i, this.speed * delta / 7);
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
            const tree = createTree(spawnPoint, this.treeAndBushTextureMap, this.treeColliderMap, this.stage, this.bird);
            this.trees.push(tree);
        }
    }

    update(delta) {
        if (!this.isLoaded) return;
        if (this.debugGfx) this.debugGfx.clear();

        this.bird.applyForce(Vector.multiply(this.birdGravity, delta));
        this.bird.update(delta, this.debugGfx);
        this.updateBackground(delta);

        for (let i = this.trees.length - 1; i >= 0; i -= 1) {
            const tree = this.trees[i];
            tree.update(delta, this.speed);
        }

        if (this.isFlying) {
            this.distanceToNextTree -= this.speed * delta;
            if (this.distanceToNextTree < 0) {
                this.addTree(getRandomInt(1400, 1700));
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
        this.bird.setAnimationSpeed(0.35);
        this.bird.enableMouse();
        this.bird.once(config.EVENTS.ENTITY.DIE, e => this.onBirdDeath(e));
        this.bird.once(config.EVENTS.ENTITY.FIRSTFLAP, (e) => {
            this.bgText.visible = false;
            this.scoreText.visible = true;
            this.distanceToNextTree = 1400;
            this.isFlying = true;
        });

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
            this.createTreesAndBushes(resources);
            this.addText();
            this.createTrees();
            this.reset();
            // this.addTree(getRandomInt(500, 500));

            this.debugGfx = new PIXI.Graphics();
            this.stage.addChild(this.debugGfx);
            this.isLoaded = true;
        });

        this.farTreeSprite = [];
        this.nearTreeSprites = [];
        this.bushSprites = [];
        this.fgSprites = [];

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


        this.trees.forEach((tree) => {
            tree.deactivate();
        });

        this.isFlying = false;
        this.createBird();
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
            this.stage.removeChild(this.bird.body.sprite);
            this.bird.destroy();
            this.bird = null;
        }

        this.trees.forEach((tree) => {
            tree.destroy();
        });

        this.textures.forEach((texture) => {
            texture.destroy();
        });
    }
}
