import * as PIXI from 'pixi.js';
import Module from './Module';
import config from '../config';
import store from '../store';
import Vector from '../math/Vector';
import getRandomInt from '../math/getRandomInt';
import degreesToRadians from '../math/degreesToRadians';
import Line from '../shapes/line';
import createBoid from '../components/Boid';
import createQuadTree from '../components/QuadTree';

// 2D Boids - Flock behaviour, obstacle avoidance.
export default class Boids extends Module {
    numBoids = 200;
    obstacles = [];
    textures = [];
    boids = [];
    boidTree;
    renderBoidConnections = false;
    renderBoidVision = false;
    treeSize = 1;
    renderQuadTree = false;

    constructor(stage) {
        super();
        this.stage = stage;
        this.name = 'boids';
    }

    createTextures() {
        const boidWidth = 9;
        const boidHeight = boidWidth * 2.5;

        this.textures = [];
        const gfx = new PIXI.Graphics();
        const p1 = new Vector(0, 0);
        const p2 = new Vector(-boidWidth, boidHeight);
        const p3 = new Vector(boidWidth, boidHeight);

        const colors = [0x03a9f4, 0x009688, 0x607d8b, 0x00bcd4];
        for (let i = 0; i < colors.length; i += 1) {
            gfx.clear();
            gfx.beginFill(colors[i]);
            gfx.moveTo(p1.x, p1.x);
            gfx.lineTo(p2.x, p2.y);
            gfx.lineTo(p3.x, p3.y);
            gfx.endFill();

            this.textures.push(store.renderer.generateTexture(gfx));
        }
    }

    spawnBoid() {
        const textureIdx = getRandomInt(0, this.textures.length - 1);
        const boid = createBoid(this.textures[textureIdx], this.edges, this.stage);
        boid.setPosition(getRandomInt(25, config.WORLD.width - 25), getRandomInt(25, config.WORLD.height - 25));
        boid.setRotation(degreesToRadians(getRandomInt(0, 360)));

        let xDir = 0;
        let yDir = 0;

        do {
            xDir = getRandomInt(0, 200) / 100 - 1;
            yDir = getRandomInt(0, 200) / 100 - 1;
        } while (xDir === 0 && yDir === 0);

        boid.direction.x = xDir;
        boid.direction.y = yDir;
        boid.direction.setLength(1);

        this.boidTree.insert(boid);
        this.boids.push(boid);
        this.stage.addChild(boid.sprite);
    }

    reset() {
        if (this.boids.length) {
            this.boids.forEach((boid) => {
                this.stage.removeChild(boid.sprite);
                boid.destroy();
            });
        }

        this.boids = [];
        this.boidTree = createQuadTree(store.worldBoundary, this.treeSize);

        for (let i = 0; i < this.numBoids; i += 1) {
            this.spawnBoid();
        }
    }

    createEdges() {
        this.edges = [];
        this.edges.push(new Line(new Vector(), new Vector(config.WORLD.width, 0))); // TOP
        this.edges.push(new Line(new Vector(), new Vector(0, config.WORLD.height))); // LEFT
        this.edges.push(new Line(new Vector(config.WORLD.width, 0), new Vector(config.WORLD.width, config.WORLD.height))); // RIGHT
        this.edges.push(new Line(new Vector(0, config.WORLD.height), new Vector(config.WORLD.width, config.WORLD.height))); // BOTTOM
    }

    setupGUI() {
        this.folder = store.gui.addFolder('Boids Settings');
        this.folder.add(this, 'treeSize', 1, 200).listen();
        this.folder.add(this, 'renderQuadTree');
        this.folder.add(this, 'renderBoidConnections');
        this.folder.add(this, 'renderBoidVision');
        this.folder.add(this, 'spawnBoid');
        this.folder.add(this, 'reset');
        this.folder.open();
    }

    setup() {
        this.setupGUI();
        this.createTextures();
        this.createEdges();
        this.gfx = new PIXI.Graphics();
        this.stage.addChild(this.gfx);

        this.obstacles = [];
        this.reset();
    }

    update(delta) {
        this.gfx.clear();
        // Rearrange quad tree to reflect any changes in position.
        this.boidTree = createQuadTree(store.worldBoundary, this.treeSize);
        this.boids.forEach(boid => this.boidTree.insert(boid));

        this.boids.forEach((boid) => {
            boid.setRenderConnections(this.renderBoidConnections);
            boid.setRenderVision(this.renderBoidVision);
            boid.update(delta, this.boidTree);
        });
    }

    render() {
        this.edges.forEach((edge) => {
            edge.render(this.gfx);
        });

        if (this.renderQuadTree) {
            this.boidTree.render(this.gfx);
        }
    }

    destroy() {
        if (this.boids.length) {
            this.boids.forEach((boid) => {
                this.stage.removeChild(boid.sprite);
                boid.destroy();
            });
        }

        if (this.gfx) {
            this.stage.removeChild(this.gfx);
            this.gfx.destroy();
        }

        store.gui.removeFolder(this.folder);
    }
}
