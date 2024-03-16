import * as PIXI from 'pixi.js';
import Module from './Module';
import config from '../config';
import Region from '../components/Region';
import Polygon from '../shapes/polygon';
import Vector from '../math/Vector';
import SAT from '../math/sat';
import store from '../store';

// Showcasing an implementation of the separating axis theorem (SAT) in 2D.
export default class SATModule extends Module {
    constructor(stage) {
        super();

        this.edges = [];
        this.obstacles = [];
        this.gfx = undefined;

        this.innerRegionOffset = 40;
        this.innerRegionWidth = config.WORLD.width - 2 * this.innerRegionOffset;
        this.innerRegionHeight = config.WORLD.height - 2 * this.innerRegionOffset;
        this.innerRegion = undefined;

        this.edgeThickness = 10;

        this.boxWidth = 25;
        this.boxHeight = 25;
        this.box = undefined;
        this.directionVector = undefined;

        this.stage = stage;
        this.name = 'SAT';
    }

    drawBoundary() {
        this.innerRegion.render(0xaaaaaa);
        this.stage.addChild(this.innerRegion.gfx);
    }

    createBoundingBox() {
        const leftEdge = this.createRect(this.innerRegion.bounds.x - this.edgeThickness, this.innerRegion.bounds.y - this.edgeThickness, this.edgeThickness, this.innerRegionHeight + (2 * this.edgeThickness));
        const rightEdge = this.createRect(this.innerRegion.bounds.x + this.innerRegionWidth, this.innerRegion.bounds.y - this.edgeThickness, this.edgeThickness, this.innerRegionHeight + (2 * this.edgeThickness));
        const topEdge = this.createRect(this.innerRegion.bounds.x, this.innerRegion.bounds.y - this.edgeThickness, this.innerRegionWidth, this.edgeThickness);
        const bottomEdge = this.createRect(this.innerRegion.bounds.x, this.innerRegion.bounds.y + this.innerRegionHeight, this.innerRegionWidth, this.edgeThickness);

        this.edges.push(leftEdge);
        this.edges.push(topEdge);
        this.edges.push(rightEdge);
        this.edges.push(bottomEdge);
    }

    createRect(x, y, width, height, isObstacle = false) {
        const rect = new Polygon([
            new Vector(x, y),
            new Vector(x + width, y),
            new Vector(x + width, y + height),
            new Vector(x, y + height),
        ]);

        if (isObstacle) this.obstacles.push(rect);

        return rect;
    }

    createObstacles() {
        this.createBoundingBox();
        const triangle1 = new Polygon([new Vector(150, 150), new Vector(150, 200), new Vector(200, 150)]);
        this.obstacles.push(triangle1);

        const triangle2 = new Polygon([new Vector(1000, 750), new Vector(900, 800), new Vector(965, 725)]);
        this.obstacles.push(triangle2);

        const triangle3 = new Polygon([new Vector(900, 100), new Vector(1000, 175), new Vector(800, 175)]);
        this.obstacles.push(triangle3);

        this.createRect(800, 500, 100, 100, true);
        this.createRect(400, 300, 100, 100, true);

        const hexagon = new Polygon([
            new Vector(150, 600),
            new Vector(150, 650),
            new Vector(250, 700),
            new Vector(350, 650),
            new Vector(350, 600),
            new Vector(250, 550),
        ]);
        this.obstacles.push(hexagon);

        const concavePolygon = new Polygon([
            new Vector(100, 400),
            new Vector(150, 345),
            new Vector(200, 400),
            new Vector(175, 325),
            new Vector(125, 325),
        ]);
        this.obstacles.push(concavePolygon);
        window.concave = concavePolygon;
    }

    stop() {
        this.boxSpeed = 0;
        this.boxRotation = 0;
        this.obstacleRotation = 0;
    }

    setupGUI() {
        this.stop();
        this.folder = store.gui.addFolder('SAT Settings');
        this.folder.add(this, 'boxSpeed', 0, 10).listen();
        this.folder.add(this, 'boxRotation', -20, 20).listen();
        this.folder.add(this, 'obstacleRotation', -20, 20).listen();
        this.folder.add(this, 'stop');
        this.folder.open();
    }

    setup() {
        this.edges = [];
        this.obstacles = [];
        this.gfx = new PIXI.Graphics();
        this.innerRegion = new Region(this.innerRegionOffset, this.innerRegionOffset, this.innerRegionWidth, this.innerRegionHeight);

        this.setupGUI();
        this.drawBoundary();
        this.createObstacles();
        this.stage.addChild(this.gfx);

        const boxPosX = this.innerRegion.bounds.x + this.innerRegionWidth / 2;
        const boxPosY = this.innerRegion.bounds.y + 200;
        this.box = this.createRect(boxPosX, boxPosY, this.boxWidth, this.boxHeight);
        this.directionVector = new Vector(1, 1);
    }

    checkCollision(obj) {
        const SATResponse = SAT.checkPolygonPolygon(this.box, obj);
        if (!SATResponse.isSeparating) {
            // Flip direction of movement to bounce off the object along path of movement (mostly).
            this.directionVector = Math.abs(SATResponse.overlapAxis.x) > Math.abs(SATResponse.overlapAxis.y)
                ? new Vector(this.directionVector.x * -1, this.directionVector.y)
                : new Vector(this.directionVector.x, this.directionVector.y * -1);

            this.box.setPosition(this.box.position.x + SATResponse.overlapVector.x, this.box.position.y + SATResponse.overlapVector.y);
        }
    }

    update(delta) {
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
        this.gfx.beginFill(0x000000);
        this.gfx.drawCircle(centroid.x, centroid.y, 1);
        this.gfx.endFill();
    }

    destroy() {
        if (store.gui) {
            store.gui.removeFolder(this.folder);
        }

        this.stage.removeChild(this.innerRegion.gfx);
        this.stage.removeChild(this.gfx);
        this.gfx.destroy();
        this.innerRegion.destroy();
    }
}
