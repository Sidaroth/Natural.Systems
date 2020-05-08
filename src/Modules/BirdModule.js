import * as PIXI from 'pixi.js';
import Module from './Module';
import store from '../store';
import createBoidTextures from '../components/createBoidTextures';
import getRandomInt from '../math/getRandomInt';
import createBird from '../components/bird/createBird';
import Vector from '../math/Vector';
import config from '../config';
import createPipe from '../components/bird/createPipe';

// TODO List:
// 2. Create pipes
// 3. make pipes move across screen, destroy when needed.
// 4. Add some artful assets / BGM.
// 4. Make autoflapper.
export default class BirdModule extends Module {
    constructor(stage) {
        super();
        this.name = 'bird';
        this.description = 'Bird, pipes, flapping, what more do you need?';
        this.stage = stage;
        this.autoBird = false;
        this.pipeSpeed = -4;
        this.flapForce = -6;
        this.birdGravityForce = 0.20;
        this.birdSize = 50;
        this.worldWidth = 600;
        this.worldHeight = 800;
        this.textures = [];
        this.pipes = [];
        this.pipeGap = 300;
        this.distanceToNextPipe = getRandomInt(500, 800);
        this.pipeTexture = PIXI.Texture.from('../../assets/images/greenPipe.png');
        this.birdTexture = PIXI.Texture.from('../../assets/images/bird.png');
        this.bgTexture = PIXI.Texture.from('../../assets/images/bg.png');
    }

    setupGui() {
        this.folder = store.gui.addFolder('Bird Settings');
        this.folder.add(this, 'autoBird').listen().onChange(() => this.onAutoBird());
        this.folder.add(this, 'flapForce', -15, -0.5).listen().onChange(v => this.onFlapForceChanged(v));
        this.folder.add(this, 'birdGravityForce', 0, 0.75).listen().onChange(v => this.onGravityChanged(v));
        this.folder.add(this, 'pipeSpeed', -15, 0).listen();
        this.folder.add(this, 'reset');
        this.folder.open();
    }

    onGravityChanged(value) {
        this.birdGravity.y = value;
    }

    onFlapForceChanged(value) {
        this.bird.setFlapForce(value);
    }

    onAutoBird() {
        console.log(this.autoBird);
    }

    reset() {
        this.firstPipeAdded = false;
        if (this.bird) {
            this.stage.removeChild(this.bird.body.sprite);
            this.bird.destroy();
        }

        this.pipes.forEach((pipe) => {
            pipe.destroy();
        });
        this.pipes = [];

        // TODO fix so pipes only start moving/appearing after the user flaps once.
        setTimeout(() => {
            this.addPipePair();
            this.firstPipeAdded = true;
        }, 1500);

        this.distanceToNextPipe = getRandomInt(400, 700);
        this.bird = createBird();
        this.bird.enableMouse();
        this.birdGravity = new Vector(0, this.birdGravityForce);
        this.bird.setFlapForce(this.flapForce);

        // this.textures = createBoidTextures(this.birdSize);
        // const textureSeed = getRandomInt(0, this.textures.length - 1);
        this.bird.setTexture(this.birdTexture);

        this.stage.addChild(this.bird.body.sprite);
    }

    update(delta) {
        this.bird.applyForce(this.birdGravity);
        this.bird.update(delta);

        for (let i = this.pipes.length - 1; i >= 0; i -= 1) {
            const pipe = this.pipes[i];
            pipe.update(delta, this.pipeSpeed);

            if (pipe.position.x + pipe.sprite.width < 0) {
                this.stage.removeChild(pipe.sprite);
                pipe.destroy();
                this.pipes.splice(i, 1);
            }
        }

        if (this.firstPipeAdded) {
            this.distanceToNextPipe += this.pipeSpeed;
            if (this.distanceToNextPipe < 0) {
                this.addPipePair();
                this.distanceToNextPipe = getRandomInt(500, 800);
            }
        }
    }

    addPipePair() {
        this.distanceToEdge = config.WORLD.width - this.bird.body.position.x;
        const heightAdjustment = getRandomInt(150, 500);
        const topPipe = createPipe([this.bird], this.pipeTexture, 'top', 1400, this.pipeGap, heightAdjustment);
        const bottomPipe = createPipe([this.bird], this.pipeTexture, 'bottom', 1400, this.pipeGap, heightAdjustment);
        this.stage.addChild(topPipe.sprite);
        this.stage.addChild(bottomPipe.sprite);
        this.pipes.push(topPipe);
        this.pipes.push(bottomPipe);
    }

    setup() {
        store.renderer.view.style.width = `${this.worldWidth}px`;
        store.renderer.view.style.height = `${this.worldHeight}px`;
        this.bgSprite = new PIXI.Sprite(this.bgTexture);
        this.stage.addChild(this.bgSprite);

        this.reset();

        this.gfx = new PIXI.Graphics();
        this.setupGui();
        this.stage.addChild(this.gfx);
    }

    destroy() {
        if (this.gfx) {
            this.stage.removeChild(this.gfx);
            this.gfx.destroy();
        }

        if (this.folder) {
            store.gui.removeFolder(this.folder);
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
