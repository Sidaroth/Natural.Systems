import { Container, Graphics, Texture } from 'pixi.js';
import { QuadTree, Boid } from 'root/interfaces/entities';
import Module from './Module';
import config from '../config';
import store from '../store';
import Vector from '../math/Vector';
import getRandomInt from '../math/getRandomInt';
import Line from '../shapes/line';
import createBoid from '../components/Boid';
import createBoidTextures from '../components/createBoidTextures';
import createQuadTree from '../components/QuadTree';
import { ModuleSettings } from './IModule';

// 2D Boids - Flock behaviour, obstacle avoidance.
export default class Boids extends Module {
    stage: Container;

    backgroundColor?: number;

    numBoids = 50;

    boidSpeed = 5;

    treeSize = 1;

    obstacles = [];

    textures: Texture[];

    boids: Boid[];

    boidTree: QuadTree;

    edges: Line[];

    // Visualization
    renderBoidConnections = false;

    renderBoidVision = false;

    renderQuadTree = false;

    enableAlignment = true;

    enableCohesion = true;

    enableSeparation = true;

    gfx: Graphics;

    debugGfx: Graphics;

    settings: ModuleSettings;

    constructor(stage: Container) {
        super();
        this.stage = stage;
        this.name = 'boids';
        this.boids = [];
        this.textures = [];
        this.edges = [];
        this.boidTree = createQuadTree(store.worldBoundary, this.treeSize);
        this.gfx = new Graphics();
        this.debugGfx = new Graphics();

        this.settings = {
            id: this.id,
            label: this.name,
            title: this.name,
            description: 'A boids module.',
            options: [],
        }
    }

    getSettings() {
        return this.settings;
    }

    spawn50Boids() {
        for (let i = 0; i < 50; i += 1) {
            this.spawnBoid();
        }
    }

    spawnBoid() {
        const textureIdx = getRandomInt(0, this.textures.length - 1);
        const texture = this.textures[textureIdx];
        if (!texture) {
            console.error('No texture found for index:', textureIdx);
            return;
        }

        const boid = createBoid(texture, this.debugGfx);
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
        this.stage?.addChild(boid.sprite);

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
        const bottomRight = new Vector(config.WORLD.width, config.WORLD.height);
        const topRight = new Vector(config.WORLD.width, 0);
        const topLeft = new Vector(0, 0);
        const bottomLeft = new Vector(0, config.WORLD.height);

        const left = new Line(topLeft, bottomLeft);
        const right = new Line(topRight, bottomRight);
        const top = new Line(topLeft, topRight);
        const bottom = new Line(bottomLeft, bottomRight);

        this.edges.push(top);
        this.edges.push(left);
        this.edges.push(right);
        this.edges.push(bottom);
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

    setup() {
        this.gfx = new Graphics();
        this.textures = createBoidTextures();
        this.createEdges();
        this.stage.addChild(this.gfx);
        this.debugGfx = new Graphics();
        this.stage.addChild(this.debugGfx);

        this.obstacles = [];
        this.reset();
    }

    update(delta: number) {
        this.gfx.clear();
        this.debugGfx.clear();

        // Rearrange quad tree to reflect any changes in position.
        this.boidTree = createQuadTree(store.worldBoundary, this.treeSize);
        this.boids.forEach((boid) => this.boidTree.insert(boid));

        this.boids.forEach((boid) => {
            boid.setTree(this.boidTree);
            boid.update(delta);
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
    }
}
