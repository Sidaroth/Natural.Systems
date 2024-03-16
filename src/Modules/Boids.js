import * as PIXI from 'pixi.js';
import Module from './Module';
import config from '../config';
import store from '../store';
import Vector from '../math/Vector';
import getRandomInt from '../math/getRandomInt';
import Line from '../shapes/line';
import createBoid from '../components/Boid';
import createBoidTextures from '../components/createBoidTextures';
import createQuadTree from '../components/QuadTree';

// 2D Boids - Flock behaviour, obstacle avoidance.
export default class Boids extends Module {
    numBoids = 100;

    obstacles = [];

    textures = [];

    boids = [];

    treeSize = 1;

    boidTree;

    // Visualization
    renderBoidConnections = false;

    renderBoidVision = false;

    renderQuadTree = false;

    enableAlignment = true;

    enableCohesion = true;

    enableSeparation = true;

    boidSpeed = 5;

    debugGfx;

    constructor(stage) {
        super();
        this.stage = stage;
        this.name = 'boids';
    }

    spawn50Boids() {
        for (let i = 0; i < 50; i += 1) {
            this.spawnBoid();
        }
    }

    spawnBoid() {
        const textureIdx = getRandomInt(0, this.textures.length - 1);
        const boid = createBoid(this.textures[textureIdx], this.debugGfx);
        boid.setPosition(getRandomInt(25, config.WORLD.width - 25), getRandomInt(25, config.WORLD.height - 25));

        let xDir = 0;
        let yDir = 0;

        do {
            xDir = (getRandomInt(0, 200) / 100) - 1;
            yDir = (getRandomInt(0, 200) / 100) - 1;
        } while (xDir === 0 && yDir === 0);

        boid.velocity.set(xDir, yDir);
        boid.setSpeed(this.boidSpeed);
        this.boidTree.insert(boid);
        this.boids.push(boid);
        this.stage.addChild(boid.sprite);

        boid.setVizualizationStatus(
            this.renderBoidConnections,
            this.renderBoidVision,
            this.enableSeparation,
            this.enableAlignment,
            this.enableCohesion,
        );
    }

    reset() {
        if (this.boids.length) {
            this.boids.forEach((boid) => {
                this.stage.removeChild(boid.sprite);
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

    onVizChange() {
        this.boids.forEach((boid) => {
            boid.setVizualizationStatus(
                this.renderBoidConnections,
                this.renderBoidVision,
                this.enableSeparation,
                this.enableAlignment,
                this.enableCohesion,
            );
        });
    }

    setupGUI() {
        this.folder = store.gui.addFolder('Boids Settings');
        this.folder.add(this, 'treeSize', 1, 200).listen();
        this.folder
            .add(this, 'boidSpeed', 0, 25)
            .listen()
            .onChange((v) => this.boids.forEach((b) => b.setSpeed(v)));
        this.folder.add(this, 'renderQuadTree');
        this.folder.add(this, 'renderBoidConnections').onChange(() => this.onVizChange());
        this.folder.add(this, 'renderBoidVision').onChange(() => this.onVizChange());
        this.folder.add(this, 'enableSeparation').onChange(() => this.onVizChange());
        this.folder.add(this, 'enableAlignment').onChange(() => this.onVizChange());
        this.folder.add(this, 'enableCohesion').onChange(() => this.onVizChange());
        this.folder.add(this, 'spawnBoid');
        this.folder.add(this, 'spawn50Boids');
        this.folder.add(this, 'reset');
        this.folder.open();
    }

    setup() {
        this.gfx = new PIXI.Graphics();
        this.setupGUI();
        this.textures = createBoidTextures();
        this.createEdges();
        this.stage.addChild(this.gfx);
        this.debugGfx = new PIXI.Graphics();
        this.stage.addChild(this.debugGfx);

        this.obstacles = [];
        this.reset();
    }

    update(delta) {
        this.gfx.clear();
        this.debugGfx.clear();
        // Rearrange quad tree to reflect any changes in position.
        this.boidTree = createQuadTree(store.worldBoundary, this.treeSize);
        this.boids.forEach((boid) => this.boidTree.insert(boid));

        this.boids.forEach((boid) => {
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
            });
        }

        if (this.gfx) {
            this.stage.removeChild(this.gfx);
            this.gfx.destroy();
        }

        store.gui.removeFolder(this.folder);
    }
}
