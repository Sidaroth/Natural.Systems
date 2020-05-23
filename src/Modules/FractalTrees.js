import * as PIXI from 'pixi.js';
import Module from './Module';
import store from '../store';
import config from '../config';
import rotatePoint from '../math/rotatePoint';
import degreesToRadians from '../math/degreesToRadians';

export default class FractalTreesMod extends Module {
    constructor(stage) {
        super();
        this.stage = stage;
        this.name = 'fractalTree';

        this.origin = {
            x: config.WORLD.width / 2,
            y: config.WORLD.height,
        };

        this.degrees = 17;
        this.maxDepth = 11;
        this.startLength = 190;
        this.branchLengthMod = 1.25;
        this.lineThickness = 16;
        this.lineColor = 0x000000;
        this.lineOpacity = 0.8;
    }

    setupGUI() {
        this.folder = store.gui.addFolder('Fractal Tree settings');
        this.folder.add(this, 'degrees', 0, 180).listen();
        this.folder.add(this, 'maxDepth', 1, 20).listen();
        this.folder.add(this, 'startLength', 0, 600).listen();
        this.folder.add(this, 'branchLengthMod', 0.25, 15).listen();
        this.folder.add(this, 'lineThickness', 1, 20).listen();
        this.folder.add(this, 'lineOpacity', 0, 1).listen();
        this.folder.addColor(this, 'lineColor').listen();
        this.folder.open();
    }

    setup() {
        this.setupGUI();
        this.gfx = new PIXI.Graphics();
        this.stage.addChild(this.gfx);
    }

    drawBranch(depth, origin, length, rotation, branchThickness) {
        if (depth > this.maxDepth || length < 0.05) return;

        const p = new PIXI.Point(origin.x, origin.y - length);
        const endPoint = rotatePoint(p, degreesToRadians(rotation), origin);
        this.gfx.lineStyle(branchThickness, this.lineColor, this.lineOpacity);
        let newThickness = branchThickness * 0.67;
        if (newThickness < 1) newThickness = 1;

        this.gfx.moveTo(origin.x, origin.y);
        this.gfx.lineTo(endPoint.x, endPoint.y);
        this.drawBranch(depth + 1, endPoint, length / this.branchLengthMod, rotation - this.degrees, newThickness);
        this.drawBranch(depth + 1, endPoint, length / this.branchLengthMod, rotation + this.degrees, newThickness);
    }

    update() {
        this.gfx.clear();
        this.gfx.moveTo(config.WORLD.width / 2, config.WORLD.height);

        this.gfx.lineStyle(this.lineThickness, this.lineColor, this.lineOpacity);
        this.drawBranch(0, this.origin, this.startLength, 0, this.lineThickness);
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
