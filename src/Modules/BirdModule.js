import * as PIXI from 'pixi.js';
import Module from './Module';
import store from '../store';
import getRandomInt from '../math/getRandomInt';
import createBird from '../components/bird/createBird';
import Vector from '../math/Vector';
import config from '../config';
import createTree from '../components/bird/createTree';

// TODO List:
// ** Add bird animations.
// ** More effects, visually and auditory.
// ** Add in more foreground/background clutter.
// ** Make autoflapper.
export default class BirdModule extends Module {
    constructor(stage) {
        super();
        this.name = 'bird';
        this.description = 'Bird, pipes, flapping, what more do you need?';
        this.stage = stage;
        this.autoBird = false;
        this.speed = 16;
        this.maxSpeed = 20;
        this.flapForce = 11;
        this.gravity = 0.7;
        this.worldWidth = 600;
        this.worldHeight = 800;
        this.textures = [];
        this.trees = [];
        this.fgSprites = [];
        this.bushSprites = [];
        this.pipeGap = 250;
        this.groundLevel = 150;
        this.bgmVolume = 0;
        this.pipeTexture = PIXI.Texture.from('../../assets/images/greenPipe.png');
        this.birdTexture = PIXI.Texture.from('../../assets/images/bird.png');
        PIXI.Loader.shared.add('birdBgm', 'assets/sounds/bgm.wav');

        // Parallax
        this.loadBackgroundTextures();
        this.loadTreeAndBushTrextures();
    }

    /* eslint-disable class-methods-use-this */
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
            .add('bushOne', '../../assets/images/bushes/bush_04.png');
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
        this.treeAndBushTextureMap.set('bushOne', resources.bushOne.texture);
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
            const tree = createTree(2000, this.treeAndBushTextureMap, this.stage, this.bird);
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
            const tree = createTree(spawnPoint, this.treeAndBushTextureMap, this.stage, this.bird);
            this.trees.push(tree);
        }
    }

    update(delta) {
        if (!this.isLoaded) return;
        this.debugGfx.clear();

        this.bird.applyForce(Vector.multiply(this.birdGravity, delta));
        this.bird.update(delta, this.debugGfx);
        this.updateBackground(delta);

        for (let i = this.trees.length - 1; i >= 0; i -= 1) {
            const tree = this.trees[i];
            tree.update(delta, this.speed);
        }

        // this.addTree(getRandomInt(500, 500));

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
            this.stage.removeChild(this.bird.body.sprite);
            this.bird.destroy();
        }
        this.bird = createBird(this.birdTexture, new Vector(0, -this.flapForce), this.maxSpeed);
        this.bird.enableMouse();
        this.bird.once(config.EVENTS.ENTITY.DIE, e => this.onBirdDeath(e));
        this.bird.once(config.EVENTS.ENTITY.FIRSTFLAP, (e) => {
            this.bgText.visible = false;
            this.scoreText.visible = true;
            this.distanceToNextTree = 1400;
            this.isFlying = true;
        });

        this.stage.addChild(this.bird.body.sprite);
    }

    setup() {
        this.isLoaded = false;
        PIXI.Loader.shared.load((loader, resources) => {
            this.isLoaded = true;
            this.birdBgm = resources.birdBgm;
            this.birdBgm.sound.play({
                loop: true,
                singleInstance: true,
            });
            this.birdBgm.sound.volume = this.bgmVolume / 100;

            this.createBird();
            this.createBackground(resources);
            this.createTreesAndBushes(resources);
            this.addText();
            this.createTrees();
            this.reset();
            this.debugGfx = new PIXI.Graphics();
            this.stage.addChild(this.debugGfx);
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
