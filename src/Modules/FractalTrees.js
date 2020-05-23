import * as PIXI from 'pixi.js';
import Module from './Module';
import store from '../store';
import config from '../config';
import rotatePoint from '../math/rotatePoint';
import degreesToRadians from '../math/degreesToRadians';
import getRandomInt from '../math/getRandomInt';

export default class FractalTreesMod extends Module {
    constructor(stage) {
        super();
        this.stage = stage;
        this.name = 'fractalTree';
        this.description = 'Fractal based tree "generator" with various options.';

        this.origin = {
            x: config.WORLD.width / 2,
            y: config.WORLD.height,
        };

        this.degrees = 17;
        this.maxDepth = 11;
        this.startLength = 190;
        this.branchRatio = 0.75;
        this.lineThickness = 20;
        this.lineColor = 0x412910;
        this.lineOpacity = 1;

        this.randomBranches = false;

        this.drawLeaves = false;
        this.leafOpacity = 1;
        this.leafRadius = 4;
        this.leafColor = 0x4a204;
    }

    setupGUI() {
        this.folder = store.gui.addFolder('Fractal Tree settings');
        this.folder.add(this, 'degrees', 0, 180).listen().onChange(() => this.drawBranches());
        this.folder.add(this, 'maxDepth', 1, 15).listen().onChange(() => this.drawBranches());
        this.folder.add(this, 'startLength', 0, 600).listen().onChange(() => this.drawBranches());
        this.folder.add(this, 'branchRatio', 0, 2).listen().onChange(() => this.drawBranches());
        this.folder.add(this, 'lineThickness', 1, 30).listen().onChange(() => this.drawBranches());
        this.folder.add(this, 'lineOpacity', 0, 1).listen().onChange(() => this.drawBranches());
        this.folder.add(this, 'randomBranches').listen().onChange(() => this.drawBranches());
        this.folder.add(this, 'drawLeaves').listen().onChange(() => this.drawBranches());
        this.folder.add(this, 'leafRadius', 0.15, 10).listen().onChange(() => this.drawBranches());
        this.folder.add(this, 'leafOpacity', 0, 1).listen().onChange(() => this.drawBranches());
        this.folder.addColor(this, 'lineColor').listen().onChange(() => this.drawBranches());
        this.folder.addColor(this, 'leafColor').listen().onChange(() => this.drawBranches());
        this.folder.open();
    }

    setup() {
        this.setupGUI();
        this.gfx = new PIXI.Graphics();
        this.stage.addChild(this.gfx);

        this.drawBranches();
    }

    // TODO draw leaf polygon instead of cirlces?
    drawLeaf(origin, isLeft) {
        if (!this.drawLeaves) return;

        this.gfx.beginFill(this.leafColor, this.leafOpacity);
        this.gfx.drawEllipse(origin.x, origin.y, this.leafRadius, this.leafRadius);
        this.gfx.endFill();
    }

    drawBranch(depth, origin, length, rotation, branchThickness) {
        if (depth > this.maxDepth || length < 0.05) {
            this.drawLeaf(origin, rotation < 0);
            return;
        }

        const p = new PIXI.Point(origin.x, origin.y - length);
        const endPoint = rotatePoint(p, degreesToRadians(rotation), origin);
        this.gfx.lineStyle(branchThickness, this.lineColor, this.lineOpacity);
        let newThickness = branchThickness * 0.67;
        if (newThickness < 1) newThickness = 1;

        this.gfx.moveTo(origin.x, origin.y);
        this.gfx.lineTo(endPoint.x, endPoint.y);

        if (this.randomBranches) {
            this.drawBranch(depth + 1, endPoint, length * this.branchRatio, rotation - getRandomInt(5, this.degrees), newThickness);
            this.drawBranch(depth + 1, endPoint, length * this.branchRatio, rotation + getRandomInt(5, this.degrees), newThickness);
        } else {
            this.drawBranch(depth + 1, endPoint, length * this.branchRatio, rotation - this.degrees, newThickness);
            this.drawBranch(depth + 1, endPoint, length * this.branchRatio, rotation + this.degrees, newThickness);
        }
    }

    drawBranches() {
        this.gfx.clear();
        this.gfx.moveTo(config.WORLD.width / 2, config.WORLD.height);
        this.gfx.lineStyle(this.lineThickness, this.lineColor, this.lineOpacity);
        this.drawBranch(0, this.origin, this.startLength, 0, this.lineThickness);

        // Because we're only using one graphics object and not splitting it up into several for drawing
        // or collecting it into a texture, for large amounts of leafnodes/branches, Uint16 arrays will overflow and die.
        this.gfx.geometry.updateBatches();
        this.gfx.geometry._indexBuffer.update(new Uint32Array(this.gfx.geometry.indices));
    }

    destroy() {
        if (this.gfx) {
            this.gfx.destroy();
        }

        if (this.folder && store.gui) {
            store.gui.removeFolder(this.folder);
        }
    }
}
