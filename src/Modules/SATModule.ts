import { Container, Graphics } from 'pixi.js';
import Vector from 'math/Vector';
import SAT from 'math/sat';
import Region from 'components/Region';
import Polygon from 'shapes/polygon';
import Module from 'modules/Module';
import config from 'root/config';
import Point from 'root/math/point';
import { ModuleSettings } from './IModule';

// Showcasing an implementation of the separating axis theorem (SAT) in 2D.
export default class SATModule extends Module {
    stage: Container;

    backgroundColor?: number;

    edges: Polygon[];

    obstacles: Polygon[];

    gfx: Graphics;

    innerRegionOffset: number;

    innerRegionWidth: number;

    innerRegionHeight: number;

    innerRegion: Region;

    edgeThickness: number;

    boxWidth: number;

    boxHeight: number;

    box: Polygon;

    directionVector: Vector;

    boxSpeed: number;

    boxRotation: number;

    obstacleRotation: number;

    settings: ModuleSettings;

    constructor(stage: Container) {
        super();

        this.edges = [];
        this.obstacles = [];
        this.gfx = new Graphics();

        this.innerRegionOffset = 40;
        this.innerRegionWidth = config.WORLD.width - (2 * this.innerRegionOffset);
        this.innerRegionHeight = config.WORLD.height - (2 * this.innerRegionOffset);
        this.innerRegion = new Region(
            this.innerRegionOffset,
            this.innerRegionOffset,
            this.innerRegionWidth,
            this.innerRegionHeight,
        );

        this.box = new Polygon([new Point(0, 0), new Point(0, 1), new Point(1, 1), new Point(1, 0)]);

        this.edgeThickness = 10;

        this.boxWidth = 25;
        this.boxHeight = 25;
        this.directionVector = new Vector();

        this.boxSpeed = 5;
        this.boxRotation = 3;
        this.obstacleRotation = 3;

        this.stage = stage;
        this.name = 'SAT';

        this.settings = {
            id: this.id,
            label: this.name,
            title: this.name,
            description: 'A separating axis theorem module.',
            options: [],
        }
    }

    getSettings() {
        return this.settings;
    }

    drawBoundary() {
        this.innerRegion.render(0xaaaaaa);
        this.stage.addChild(this.innerRegion.gfx);
    }

    createBoundingBox() {
        const leftEdge = this.createRect(
            this.innerRegion.bounds.x - this.edgeThickness,
            this.innerRegion.bounds.y - this.edgeThickness,
            this.edgeThickness,
            this.innerRegionHeight + (2 * this.edgeThickness),
        );

        const rightEdge = this.createRect(
            this.innerRegion.bounds.x + this.innerRegionWidth,
            this.innerRegion.bounds.y - this.edgeThickness,
            this.edgeThickness,
            this.innerRegionHeight + (2 * this.edgeThickness),
        );
        const topEdge = this.createRect(
            this.innerRegion.bounds.x,
            this.innerRegion.bounds.y - this.edgeThickness,
            this.innerRegionWidth,
            this.edgeThickness,
        );
        const bottomEdge = this.createRect(
            this.innerRegion.bounds.x,
            this.innerRegion.bounds.y + this.innerRegionHeight,
            this.innerRegionWidth,
            this.edgeThickness,
        );

        this.edges.push(leftEdge);
        this.edges.push(topEdge);
        this.edges.push(rightEdge);
        this.edges.push(bottomEdge);
    }

    createRect(x: number, y: number, width: number, height: number, isObstacle = false) {
        const rect = new Polygon([
            new Point(x, y),
            new Point(x + width, y),
            new Point(x + width, y + height),
            new Point(x, y + height),
        ]);

        if (isObstacle) this.obstacles.push(rect);

        return rect;
    }

    createObstacles() {
        this.createBoundingBox();
        const triangle1 = new Polygon([
            new Point(150, 150),
            new Point(150, 200),
            new Point(200, 150),
        ]);

        const triangle2 = new Polygon([
            new Point(1000, 750),
            new Point(900, 800),
            new Point(965, 725),
        ]);

        const triangle3 = new Polygon([
            new Point(900, 100),
            new Point(1000, 175),
            new Point(800, 175),
        ]);

        this.obstacles.push(triangle1);
        this.obstacles.push(triangle2);
        this.obstacles.push(triangle3);

        this.createRect(800, 500, 100, 100, true);
        this.createRect(400, 300, 100, 100, true);

        const hexagon = new Polygon([
            new Point(150, 600),
            new Point(150, 650),
            new Point(250, 700),
            new Point(350, 650),
            new Point(350, 600),
            new Point(250, 550),
        ]);
        this.obstacles.push(hexagon);

        const concavePolygon = new Polygon([
            new Point(100, 400),
            new Point(150, 345),
            new Point(200, 400),
            new Point(175, 325),
            new Point(125, 325),
        ]);
        this.obstacles.push(concavePolygon);
    }

    stop() {
        this.boxSpeed = 0;
        this.boxRotation = 0;
        this.obstacleRotation = 0;
    }

    setup() {
        this.edges = [];
        this.obstacles = [];
        this.gfx = new Graphics();
        this.innerRegion = new Region(
            this.innerRegionOffset,
            this.innerRegionOffset,
            this.innerRegionWidth,
            this.innerRegionHeight,
        );

        this.drawBoundary();
        this.createObstacles();
        this.stage.addChild(this.gfx);

        const boxPosX = this.innerRegion.bounds.x + (this.innerRegionWidth / 2);
        const boxPosY = this.innerRegion.bounds.y + 200;
        this.box = this.createRect(boxPosX, boxPosY, this.boxWidth, this.boxHeight);
        this.directionVector = new Vector(1, 1);
    }

    checkCollision(obj: Polygon) {
        const SATResponse = SAT.checkPolygonPolygon(this.box, obj);
        if (!SATResponse.isSeparating) {
            // Flip direction of movement to bounce off the object along path of movement (mostly).
            this.directionVector = Math.abs(SATResponse.overlapAxis.x) > Math.abs(SATResponse.overlapAxis.y)
                ? new Vector(this.directionVector.x * -1, this.directionVector.y)
                : new Vector(this.directionVector.x, this.directionVector.y * -1);

            const x = this.box.position.x + SATResponse.overlapAxis.x;
            const y = this.box.position.y + SATResponse.overlapAxis.y;
            this.box.setPosition(x, y);
        }
    }

    update(delta: number) {
        const velocityVec = Vector.multiply(this.directionVector, delta * this.boxSpeed);
        this.box.setPosition(this.box.position.x + velocityVec.x, this.box.position.y + velocityVec.y);
        this.box.rotateBy((this.boxRotation / 100) * delta, this.box.getCentroid());

        this.obstacles.forEach((obj) => {
            obj.rotateBy((this.obstacleRotation / 100) * delta, obj.getCentroid());
            this.checkCollision(obj);
        });

        this.edges.forEach((edge) => {
            this.checkCollision(edge);
        });
    }

    render() {
        this.gfx.clear();
        this.box.render(this.gfx);
        this.obstacles.forEach((obstacle) => {
            obstacle.render(this.gfx);
        });

        this.edges.forEach((edge) => {
            edge.render(this.gfx);
        });

        const centroid = this.box.getCentroid();
        this.gfx.circle(centroid.x, centroid.y, 1).fill(0x000000);
    }

    destroy() {
        this.stage.removeChild(this.innerRegion.gfx);
        this.stage.removeChild(this.gfx);
        this.gfx.destroy();
        this.innerRegion.destroy();
    }
}
