import * as PIXI from 'pixi.js';
import Module from './Module';
import store from '../store';
import getRandomInt from '../math/getRandomInt';
import createBird from '../components/bird/createBird';
import Vector from '../math/Vector';
import config from '../config';
import createPipe from '../components/bird/createPipe';

// TODO List:
// ** Add bird animations.
// ** Add in parallaxing backgrounds
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
        this.pipes = [];
        this.fgSprites = [];
        this.bushSprites = [];
        this.pipeGap = 250;
        this.bgmVolume = 0;
        this.pipeTexture = PIXI.Texture.from('../../assets/images/greenPipe.png');
        this.birdTexture = PIXI.Texture.from('../../assets/images/bird.png');
        PIXI.Loader.shared.add('birdBgm', 'assets/sounds/bgm.wav');

        // Parallax
        this.loadBackgroundTextures();
    }

    /* eslint-disable class-methods-use-this */
    loadBackgroundTextures() {
        PIXI.Loader.shared.add('skyTexture', '../../assets/images/sky.png')
            .add('farTreesTexture', '../../assets/images/furthest_trees.png')
            .add('nearTreesTexture', '../../assets/images/nearest__trees.png')
            .add('bushesTexture', '../../assets/images/background_bushes.png')
            .add('foregroundTexture', '../../assets/images/foreground_tile.png');
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
        this.reset();
    }

    update(delta) {
        this.gfx.clear();
        this.bird.applyForce(this.birdGravity);
        this.bird.update(delta);
        this.updateBackground();


        for (let i = this.pipes.length - 1; i >= 0; i -= 1) {
            const pipe = this.pipes[i];
            if (!pipe) return;

            pipe.update(delta, this.speed);
            if (pipe.destroyed) {
                this.stage.removeChild(pipe.sprite);
                pipe.destroy();
                this.pipes.splice(i, 1);
            }
        }

        if (this.isFlying) {
            this.distanceToNextPipe -= this.speed;
            if (this.distanceToNextPipe < 0) {
                this.addPipePair();
                this.distanceToNextPipe = getRandomInt(700, 900);
            }
        }

        this.gfx.beginFill(0x333333);
        this.gfx.drawRect(100, 100, 1000, 20);
        this.gfx.endFill();
    }

    updateScore() {
        this.score += 1;
        this.scoreText.text = this.score;
        this.scoreText.position.x = config.WORLD.width / 2 - this.scoreText.width / 2;
    }

    addPipePair() {
        // Special case handling of first pipe pair so that it spawns a bit further away from the bird.
        let spawnPoint = 1400;
        if (!this.isFlying) {
            this.distanceToNextPipe = spawnPoint;
            this.isFlying = true;
            spawnPoint *= 1.5;
        }

        // Spawns a top/bottom pipe pair at X pos = spawnPoint, and top pipe y protruding spawnHeight down.
        // the bottom pipe then spawns itself based on the gap and spawnHeight.
        const spawnHeight = getRandomInt(150, 500);
        const topPipe = createPipe(this.bird, this.pipeTexture, 'top', spawnPoint, this.pipeGap, spawnHeight);
        const bottomPipe = createPipe(this.bird, this.pipeTexture, 'bottom', spawnPoint, this.pipeGap, spawnHeight);

        // We don't need to listen on both pipes as they're (currently) always on the same X coordinate.
        topPipe.once(config.EVENTS.ENTITY.PASSED, () => this.updateScore());

        // TODO Fix Z-indexing.
        this.stage.addChildAt(topPipe.sprite, this.stage.children.length - this.fgSprites.length);
        this.stage.addChildAt(bottomPipe.sprite, this.stage.children.length - this.fgSprites.length);
        this.pipes.push(topPipe);
        this.pipes.push(bottomPipe);
    }

    reset() {
        this.birdGravity = new Vector(0, this.gravity);
        this.score = 0;
        this.scoreText.text = 0;
        this.scoreText.visible = false;

        if (this.bird) {
            this.stage.removeChild(this.bird.body.sprite);
            this.bird.destroy();
        }

        this.pipes.forEach((pipe) => {
            pipe.destroy();
        });
        this.pipes = [];

        this.isFlying = false;
        this.bird = createBird(this.birdTexture, new Vector(0, -this.flapForce), this.maxSpeed);
        this.bird.enableMouse();
        this.bird.once(config.EVENTS.ENTITY.DIE, e => this.onBirdDeath(e));
        this.bird.once(config.EVENTS.ENTITY.FIRSTFLAP, (e) => {
            this.bgText.visible = false;
            this.scoreText.visible = true;
            this.addPipePair();
        });

        this.stage.addChild(this.bird.body.sprite);
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
    }

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

    updateBackground() {
        if (!this.isFlying) return;
        this.fgSprites.forEach((sprite, i) => {
            this.parallaxSprite(sprite, this.fgSprites, i, this.speed);
        });

        this.bushSprites.forEach((sprite, i) => {
            this.parallaxSprite(sprite, this.bushSprites, i, this.speed / 3);
        });

        this.nearTreeSprites.forEach((sprite, i) => {
            this.parallaxSprite(sprite, this.nearTreeSprites, i, this.speed / 5);
        });

        this.farTreeSprite.forEach((sprite, i) => {
            this.parallaxSprite(sprite, this.farTreeSprite, i, this.speed / 7);
        });
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

    setup() {
        PIXI.Loader.shared.load((loader, resources) => {
            this.birdBgm = resources.birdBgm;
            this.birdBgm.sound.play({
                loop: true,
                singleInstance: true,
            });
            this.birdBgm.sound.volume = this.bgmVolume / 100;

            this.createBackground(resources);
        });
        this.farTreeSprite = [];
        this.nearTreeSprites = [];
        this.bushSprites = [];
        this.fgSprites = [];

        this.addText();
        this.stage.addChild(this.bgText);
        this.stage.addChild(this.scoreText);
        this.setupGui();
        this.reset();

        this.gfx = new PIXI.Graphics();
        this.stage.addChild(this.gfx);
    }

    destroy() {
        if (this.gfx) {
            this.stage.removeChild(this.gfx);
            this.gfx.destroy();
        }

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

        this.pipes.forEach((pipe) => {
            pipe.destroy();
        });

        this.textures.forEach((texture) => {
            texture.destroy();
        });

        // this.backgroundSprites.forEach((sprite) => {
        //     this.stage.removeChild(sprite);
        //     sprite.destroy();
        // });

        // store.renderer.view.style.width = `${config.WORLD.width}px`;
        // store.renderer.view.style.height = `${config.WORLD.height}px`;
    }

    render() { }
}
