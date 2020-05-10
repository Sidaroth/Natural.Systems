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
        this.pipeGap = 250;
        this.pipeTexture = PIXI.Texture.from('../../assets/images/greenPipe.png');
        this.birdTexture = PIXI.Texture.from('../../assets/images/bird.png');
        this.bgTexture = PIXI.Texture.from('../../assets/images/bg.png');
        this.bgmVolume = 50;
        PIXI.Loader.shared.add('birdBgm', 'assets/sounds/bgm.wav');
    }

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

        if (this.firstPipeAdded) {
            this.distanceToNextPipe -= this.speed;
            if (this.distanceToNextPipe < 0) {
                this.addPipePair();
                this.distanceToNextPipe = getRandomInt(700, 900);
            }
        }
    }

    updateScore() {
        this.score += 1;
        this.scoreText.text = this.score;
    }

    addPipePair() {
        let spawnPoint = 1400;
        if (!this.firstPipeAdded) {
            this.distanceToNextPipe = spawnPoint;
            this.firstPipeAdded = true;
            spawnPoint *= 1.5;
        }

        this.distanceToEdge = config.WORLD.width - this.bird.body.position.x;
        const spawnHeight = getRandomInt(150, 500);
        const topPipe = createPipe(this.bird, this.pipeTexture, 'top', spawnPoint, this.pipeGap, spawnHeight);
        const bottomPipe = createPipe(this.bird, this.pipeTexture, 'bottom', spawnPoint, this.pipeGap, spawnHeight);
        topPipe.once(config.EVENTS.ENTITY.PASSED, () => this.updateScore());
        this.stage.addChildAt(topPipe.sprite, 1); // zIndex 1, 0 is the bg.
        this.stage.addChildAt(bottomPipe.sprite, 1);
        this.pipes.push(topPipe);
        this.pipes.push(bottomPipe);
    }

    reset() {
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

        this.firstPipeAdded = false;
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

    setup() {
        store.renderer.view.style.width = `${this.worldWidth}px`;
        store.renderer.view.style.height = `${this.worldHeight}px`;
        this.bgSprite = new PIXI.Sprite(this.bgTexture);
        this.stage.addChild(this.bgSprite);
        this.birdGravity = new Vector(0, this.gravity);

        this.bgText = new PIXI.Text('Flap to begin!', {
            fontFamily: 'Tahoma',
            fontSize: 72,
            fill: 0x505050,
            align: 'center',
            fontWeight: 'bold',
            strokeThickness: 3,
            dropShadow: true,
        });
        this.bgText.position.x = config.WORLD.width / 2 - this.bgText.width / 2;
        this.bgText.position.y = config.WORLD.height / 2 - this.bgText.height * 2;

        this.scoreText = new PIXI.Text('0', {
            fontFamily: 'Tahoma',
            fontSize: 100,
            fill: 0xEEEEEE,
            align: 'center',
            fontWeight: 'bold',
            strokeThickness: 4,
            dropShadow: true,
        });
        this.scoreText.position.x = config.WORLD.width / 2 - this.scoreText.width / 2;
        this.scoreText.position.y = config.WORLD.height / 10;

        PIXI.Loader.shared.load((loader, resources) => {
            this.birdBgm = resources.birdBgm;
            this.birdBgm.sound.play({
                loop: true,
                singleInstance: true,
            });
            this.birdBgm.sound.volume = this.bgmVolume / 100;
        });

        this.gfx = new PIXI.Graphics();
        this.setupGui();

        this.reset();
        this.stage.addChild(this.gfx);
        this.stage.addChild(this.bgText);
        this.stage.addChild(this.scoreText);
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

        if (this.bgSprite) {
            this.stage.removeChild(this.bgSprite);
            this.bgSprite.destroy();
        }

        store.renderer.view.style.width = `${config.WORLD.width}px`;
        store.renderer.view.style.height = `${config.WORLD.height}px`;
    }

    render() { }
}
