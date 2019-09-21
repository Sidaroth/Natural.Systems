import * as PIXI from 'pixi.js';
import Module from './Module';
import config from '../config';
import Region from '../components/Region';
import Polygon from '../shapes/polygon';
import Vector from '../math/Vector';
import SAT from '../math/sat';
import store from '../store';


// Showcasing an implementation of the separating axis theorem (SAT) in 2D.
// https://www.wikiwand.com/en/Hyperplane_separation_theorem
export default class SATModule extends Module {
    edges;
    obstacles;
    gfx;

    innerRegionOffset = 40;
    innerRegionWidth = config.WORLD.width - 2 * this.innerRegionOffset;
    innerRegionHeight = config.WORLD.height - 2 * this.innerRegionOffset;
    innerRegion;

    boxWidth = 25;
    boxHeight = 25;
    box;
    directionVector;

    constructor(stage) {
        super();
        this.stage = stage;
        this.name = 'SAT';
    }

    drawBoundary() {
        this.innerRegion.render(0xaaaaaa);
        this.stage.addChild(this.innerRegion.gfx);
    }

    createObstacles() {
        const leftEdge = new Polygon([
            new Vector(this.innerRegion.bounds.x, this.innerRegion.bounds.y),
            new Vector(this.innerRegion.bounds.x, this.innerRegion.bounds.y + this.innerRegionHeight),
            new Vector(this.innerRegion.bounds.x - 10, this.innerRegion.bounds.y + this.innerRegionHeight),
            new Vector(this.innerRegion.bounds.x - 10, this.innerRegion.bounds.y),
        ]);
        const topEdge = new Polygon([
            new Vector(this.innerRegion.bounds.x, this.innerRegion.bounds.y),
            new Vector(this.innerRegion.bounds.x, this.innerRegion.bounds.y - 10),
            new Vector(this.innerRegion.bounds.x + this.innerRegionWidth, this.innerRegion.bounds.y - 10),
            new Vector(this.innerRegion.bounds.x + this.innerRegionWidth, this.innerRegion.bounds.y),
        ]);
        const rightEdge = new Polygon([
            new Vector(this.innerRegion.bounds.x + this.innerRegionWidth, this.innerRegion.bounds.y),
            new Vector(this.innerRegion.bounds.x + this.innerRegionWidth + 10, this.innerRegion.bounds.y),
            new Vector(this.innerRegion.bounds.x + this.innerRegionWidth + 10, this.innerRegion.bounds.y + this.innerRegionHeight),
            new Vector(this.innerRegion.bounds.x + this.innerRegionWidth, this.innerRegion.bounds.y + this.innerRegionHeight),
        ]);
        const bottomEdge = new Polygon([
            new Vector(this.innerRegion.bounds.x, this.innerRegion.bounds.y + this.innerRegionHeight),
            new Vector(this.innerRegion.bounds.x + this.innerRegionWidth, this.innerRegion.bounds.y + this.innerRegionHeight),
            new Vector(this.innerRegion.bounds.x + this.innerRegionWidth, this.innerRegion.bounds.y + this.innerRegionHeight + 10),
            new Vector(this.innerRegion.bounds.x, this.innerRegion.bounds.y + this.innerRegionHeight + 10),
        ]);

        this.edges.push(leftEdge);
        this.edges.push(topEdge);
        this.edges.push(rightEdge);
        this.edges.push(bottomEdge);

        let pos = new Vector(150, 150);
        const obs1 = new Polygon([pos, new Vector(150, 200), new Vector(200, 150)]);
        this.obstacles.push(obs1);

        pos = new Vector(800, 500);
        const obs2 = new Polygon([pos, new Vector(900, 500), new Vector(900, 600), new Vector(800, 600)]);
        this.obstacles.push(obs2);

        pos = new Vector(400, 300);
        const obs3 = new Polygon([pos, new Vector(500, 300), new Vector(500, 400), new Vector(400, 400)]);
        this.obstacles.push(obs3);

        pos = new Vector(1000, 750);
        const obs4 = new Polygon([pos, new Vector(900, 800), new Vector(965, 725)]);
        this.obstacles.push(obs4);

        pos = new Vector(150, 600);
        const obs5 = new Polygon([
            pos,
            new Vector(150, 650),
            new Vector(250, 700),
            new Vector(350, 650),
            new Vector(350, 600),
            new Vector(250, 550),
        ]);
        this.obstacles.push(obs5);

        pos = new Vector(900, 100);
        const obs6 = new Polygon([pos, new Vector(1000, 175), new Vector(800, 175)]);
        this.obstacles.push(obs6);
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
        this.innerRegion = new Region(this.innerRegionOffset, this.innerRegionOffset, this.innerRegionWidth, this.innerRegionHeight)

        this.setupGUI();
        this.drawBoundary();
        this.createObstacles();
        this.stage.addChild(this.gfx);

        const boxPosX = this.innerRegion.bounds.x + this.innerRegionWidth / 2;
        const boxPosY = this.innerRegion.bounds.y + 200;
        const boxVertices = [
            new Vector(boxPosX, boxPosY),
            new Vector(boxPosX + this.boxWidth, boxPosY),
            new Vector(boxPosX + this.boxWidth, boxPosY + this.boxHeight),
            new Vector(boxPosX, boxPosY + this.boxHeight),
        ];
        this.box = new Polygon(boxVertices);
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
