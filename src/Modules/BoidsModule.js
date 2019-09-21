import * as PIXI from 'pixi.js';
import Module from './Module';
import config from '../config';
import store from '../store';

// 2D Boids - Flock behaviour, obstacle avoidance.
export default class Boids extends Module {
    numBoids = 25;
    boids;

    numTextures = 4;
    textures;

    constructor(stage) {
        super();
        this.stage = stage;
        this.name = 'boids';
    }

    createTextures() {
        const gfx = new PIXI.Graphics();
    }

    reset() {
        this.boids = [];
        this.createTextures();
    }

    setupGUI() {
        this.reset();
        this.folder = store.gui.addFolder('Boids Settings');
        this.folder.add(this, 'reset');
        this.folder.open();
    }

    setup() {
        this.setupGUI();
    }

    update(delta) {
        this.boids.forEach((boid) => {
            // boid.update();
        });
    }

    render() {}

    destroy() {
        store.gui.removeFolder(this.folder);
    }
}
