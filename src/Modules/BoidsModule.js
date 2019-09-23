import * as PIXI from 'pixi.js';
import Module from './Module';
import config from '../config';
import store from '../store';
import Vector from '../math/Vector';
import getRandomInt from '../math/getRandomInt';
import degreesToRadians from '../math/degreesToRadians';
import edgeIntersectPoint from '../math/edgeIntersectPoint';
import Line from '../shapes/line';
import drawVector from '../utils/graphicalUtils';
import distanceToLine from '../math/distanceToLine';
import createBoid from '../components/Boid';

// 2D Boids - Flock behaviour, obstacle avoidance.
export default class Boids extends Module {
    numBoids = 5000;
    boids = [];
    obstacles = [];
    textures = [];

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
        const boid = createBoid(this.textures[textureIdx]);
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
        this.folder.add(this, 'spawnBoid');
        this.folder.add(this, 'reset');
        this.folder.open();
    }

    setup() {
        this.setupGUI();
        this.createTextures();
        this.createEdges();

        this.reset();
        this.gfx = new PIXI.Graphics();
        this.stage.addChild(this.gfx);

        this.obstacles = [];
    }

    isHeadingForCollision(boid) {
        // vision debugs.
        // drawVector(this.gfx, boid.position, Vector.multiply(boid.direction, boid.vision));
        // this.gfx.beginFill(0xaaaaaa, 0.3);
        // this.gfx.lineStyle(0.5, 0x000000);
        // this.gfx.drawCircle(boid.position.x, boid.position.y, boid.vision);
        // this.gfx.endFill();

        for (let i = 0; i < this.edges.length; i += 1) {
            const edge = this.edges[i];
            const dist = distanceToLine(boid.position, edge);
            if (dist < boid.vision) {
                const ray = new Line(boid.position, Vector.add(boid.position, boid.direction));
                const intersectPoint = edgeIntersectPoint(ray, edge);
                if (intersectPoint && Vector.sub(boid.position, intersectPoint).getLength() < boid.vision) return edge;
            }
        }

        return false;
    }

    avoidObstacles(boid) {
        const firstCollidingEdge = this.isHeadingForCollision(boid);
        if (firstCollidingEdge) {
            let foundEscapeVector = false;
            const testAngles = boid.getTestAngles();
            testAngles.every((angle) => {
                const directionVector = boid.direction.clone().rotateBy(angle);
                const ray = new Line(boid.position, Vector.add(boid.position, directionVector));

                const intersectPoint = edgeIntersectPoint(ray, firstCollidingEdge);
                if (!intersectPoint || Vector.sub(boid.position, intersectPoint).getLength() > boid.vision) {
                    boid.direction = directionVector.getUnit();
                    foundEscapeVector = true;

                    return false;
                }

                return true;
            });

            if (!foundEscapeVector) {
                boid.direction = boid.direction.rotateBy(testAngles[testAngles.length - 1]).getUnit();
            }
        }
    }

    update(delta) {
        this.gfx.clear();
        this.boids.forEach((boid) => {
            this.avoidObstacles(boid);
            boid.update(delta);
        });
    }

    render() {
        this.edges.forEach((edge) => {
            edge.render(this.gfx);
        });
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
