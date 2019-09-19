import * as PIXI from 'pixi.js';
import Module from './Module';
import config from '../config';
import Region from '../components/Region';
import Polygon from '../shapes/polygon';
import store from '../store';
import Vector from '../math/Vector';
import getRandomInt from '../math/getRandomInt';
import SAT from '../math/sat';

// Showcasing an implementation of the separating axis theorem (SAT) in 2D.
// https://www.wikiwand.com/en/Hyperplane_separation_theorem
export default class SATModule extends Module {
    obstacles = [];
    gfx = new PIXI.Graphics();

    innerRegionOffset = 40;
    innerRegionWidth = config.WORLD.width - 2 * this.innerRegionOffset;
    innerRegionHeight = config.WORLD.height - 2 * this.innerRegionOffset;
    innerRegion = new Region(this.innerRegionOffset, this.innerRegionOffset, this.innerRegionWidth, this.innerRegionHeight);

    boxWidth = 25;
    boxHeight = 25;
    box;
    forceVec = new Vector();

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

        this.obstacles.push(leftEdge);
        this.obstacles.push(topEdge);
        this.obstacles.push(rightEdge);
        this.obstacles.push(bottomEdge);

        let pos = new Vector(75, 75);
        const obs1 = new Polygon([pos, new Vector(75, 125), new Vector(125, 75)]);
        this.obstacles.push(obs1);

        pos = new Vector(150, 150);
        const obs2 = new Polygon([pos, new Vector(225, 150), new Vector(225, 225), new Vector(150, 225)]);
        this.obstacles.push(obs2);

        pos = new Vector(400, 300);
        const obs3 = new Polygon([pos, new Vector(500, 300), new Vector(500, 400), new Vector(400, 400)]);
        this.obstacles.push(obs3);

        pos = new Vector(600, 400);
        const obs4 = new Polygon([pos, new Vector(650, 450), new Vector(615, 375)]);
        this.obstacles.push(obs4);

        pos = new Vector(150, 400);
        const obs5 = new Polygon([pos, new Vector(150, 450), new Vector(250, 500), new Vector(350, 450), new Vector(350, 400), new Vector(250, 350)]);
        this.obstacles.push(obs5);

        pos = new Vector(600, 75);
        const obs6 = new Polygon([pos, new Vector(700, 150), new Vector(500, 150)]);
        this.obstacles.push(obs6);
    }

    setup() {
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

        this.forceVec = new Vector(1, 1);
    }

    drawVector(pos, vector) {
        this.gfx.beginFill();
        this.gfx.lineStyle(3, 0xff0000);
        this.gfx.moveTo(pos.x, pos.y);
        this.gfx.lineTo(pos.x + vector.x, pos.y + vector.y);
        this.gfx.endFill();
    }

    update(delta) {
        this.box.setPosition(this.box.position.x + (this.forceVec.x * delta), this.box.position.y + (this.forceVec.y * delta));
        this.box.rotateBy(0.05, this.box.getCentroid());

        this.obstacles.forEach((obj) => {
            const SATResponse = SAT.checkPolygonPolygon(this.box, obj);

            if (!SATResponse.isSeparating) {
                // TODO: Do something more exciting on collisions...
                const xSign = getRandomInt(0, 1) ? 1 : -1;
                const ySign = getRandomInt(0, 1) ? 1 : -1;
                this.forceVec = new Vector(3 * xSign, 3 * ySign);
                this.box.setPosition(this.box.position.x + SATResponse.overlapVector.x, this.box.position.y + SATResponse.overlapVector.y);
            }
        });
    }

    render() {
        this.gfx.clear();
        this.box.render(this.gfx);
        this.obstacles.forEach((obstacle) => {
            obstacle.render(this.gfx);
        });

        const centroid = this.box.getCentroid();
        this.gfx.beginFill(0x000000);
        this.gfx.drawCircle(centroid.x, centroid.y, 1);
        this.gfx.endFill();
    }

    destroy() {
        this.stage.removeChild(this.innerRegion.gfx);
        this.stage.removeChild(this.gfx);
        this.gfx.destroy();
    }
}
