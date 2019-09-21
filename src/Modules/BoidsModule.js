import * as PIXI from 'pixi.js';
import Module from './Module';
import config from '../config';
import store from '../store';
import { Vector } from 'sat';

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
        this.textures = [];
        const gfx = new PIXI.Graphics();
        const p1 = new Vector(10, 0);
        const p2 = new Vector(20, 15);
        const p3 = new Vector(0, 15);

        for (let i = 0; i < this.numTextures; i += 1) {
            gfx.clear();
            gfx.beginFill(0xffffff);
            gfx.endFill();
        }


        this.textures.push(store.renderer.generateTexture(gfx));
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
