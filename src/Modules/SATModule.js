import * as PIXI from 'pixi.js';
import Module from './Module';
import config from '../config';
import Region from '../components/Region';
import Rect from '../shapes/rect';
import Polygon from '../shapes/polygon';
import Circle from '../shapes/circle';
import store from '../store';
import Vector from '../math/Vector';
import SAT from '../math/sat';
import SATJS from 'sat';

// Showcasing an implementation of the separating axis theorem (SAT) in 2D.
// https://www.wikiwand.com/en/Hyperplane_separation_theorem
export default class SATModule extends Module {
    rects = [];
    gfx = new PIXI.Graphics();

    innerRegionOffset = 40;
    innerRegionWidth = config.WORLD.width - 2 * this.innerRegionOffset;
    innerRegionHeight = config.WORLD.height - 2 * this.innerRegionOffset;
    innerRegion = new Region(this.innerRegionOffset, this.innerRegionOffset, this.innerRegionWidth, this.innerRegionHeight);

    boxWidth = 25;
    boxHeight = 25;
    box;

    constructor(stage) {
        super();
        this.stage = stage;
        this.name = 'SAT';
    }

    drawBoundary() {
        this.innerRegion.render(0xaaaaaa);
        this.stage.addChild(this.innerRegion.gfx);
    }

    setup() {
        this.drawBoundary();
        SAT.setDebugStage(this.stage);

        const v1 = new Vector(125, 125);
        const v2 = new Vector(325, 125);
        const v4 = new Vector(125, 325);
        this.triangle = new Polygon([v1, v2, v4], 'trianglePoly');

        const boxPosX = this.innerRegion.bounds.x + 200;
        const boxPosY = this.innerRegion.bounds.y + 10;

        const boxVertices = [
            new Vector(boxPosX, boxPosY),
            new Vector(boxPosX + this.boxWidth, boxPosY),
            new Vector(boxPosX + this.boxWidth, boxPosY + this.boxHeight),
            new Vector(boxPosX, boxPosY + this.boxHeight),
        ];
        this.box = new Polygon(boxVertices, 'mouseBox');
        this.stage.addChild(this.gfx);
    }

    update() {
        const mousePos = store.renderer.plugins.interaction.mouse.global;
        this.box.setPosition(mousePos.x, mousePos.y);

        const SATResponse = SAT.checkPolygonPolygon(this.box, this.triangle);

        // Rendering here for debug drawing for now...
        this.gfx.clear();
        this.triangle.render(this.gfx);
        this.box.render(this.gfx);

        if (!SATResponse.isSeparating) {
            // console.log(SATResponse.overlapVector, satjsResponse.overlapV);
            this.gfx.beginFill();
            this.gfx.lineStyle(3, 0xff0000);
            this.gfx.moveTo(this.box.position.x, this.box.position.y);
            this.gfx.lineTo(this.box.position.x + SATResponse.overlapVector.x, this.box.position.y + SATResponse.overlapVector.y);
            this.gfx.endFill();
            this.box.setPosition(this.box.position.x + SATResponse.overlapVector.x, this.box.y + SATResponse.overlapVector.y);
        }
    }

    render() {}

    destroy() {
        this.stage.removeChild(this.innerRegion.gfx);
        this.stage.removeChild(this.gfx);
        this.gfx.destroy();
    }
}
