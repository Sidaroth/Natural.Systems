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

        this.degrees = 120;
        this.maxDepth = 8;
        this.startLength = 440;
        this.branchRatio = 0.5;
        this.lineThickness = 15;
        this.lineColor = 0x412910;
        this.lineOpacity = 1;

        this.drawRandomBranches = false;
        this.drawBase = true;

        this.addStraightBranch = true;

        this.swayCurrent = 0;
        this.swaySpeed = 0.1;
        this.swayMax = 7.5;
        this.sway = false;

        this.drawLeaves = false;
        this.leafOpacity = 0.75;
        this.leafRadius = 2.5;
        this.leafColor = 0x4a204;
    }

    setupGUI() {
        this.folder = store.gui.addFolder('Fractal Tree settings');
        this.folder.add(this, 'degrees', 0, 180).listen().onChange(() => this.drawBranches());
        this.folder.add(this, 'maxDepth', 1, 15).listen().onChange((val) => {
            this.maxDepth = Math.round(val);
            this.drawBranches();
        });
        this.folder.add(this, 'startLength', 0, 600).listen().onChange(() => this.drawBranches());
        this.folder.add(this, 'branchRatio', 0, 2).listen().onChange(() => this.drawBranches());
        this.folder.add(this, 'lineThickness', 1, 30).listen().onChange(() => this.drawBranches());
        this.folder.add(this, 'lineOpacity', 0, 1).listen().onChange(() => this.drawBranches());
        this.folder.add(this, 'sway').listen().onChange(() => {
            this.swayCurrent = 0;
            this.drawRandomBranches = false;
            this.drawBranches();
        });
        this.folder.add(this, 'drawLeaves').listen().onChange(() => this.drawBranches());
        this.folder.add(this, 'drawBase').listen().onChange(() => this.drawBranches());
        this.folder.add(this, 'addStraightBranch').listen().onChange(() => this.drawBranches());
        this.folder.add(this, 'leafRadius', 0.15, 10).listen().onChange(() => this.drawBranches());
        this.folder.add(this, 'leafOpacity', 0, 1).listen().onChange(() => this.drawBranches());
        this.folder.addColor(this, 'lineColor').listen().onChange(() => this.drawBranches());
        this.folder.addColor(this, 'leafColor').listen().onChange(() => this.drawBranches());
        // Shortcut functions
        this.folder.add(this, 'makeSierpinski');
        this.folder.add(this, 'makeAntenna');
        this.folder.add(this, 'randomBranches');
        this.folder.add(this, 'randomTree');
        this.folder.open();
    }

    setup() {
        this.gfx = new PIXI.Graphics();
        this.stage.addChild(this.gfx);

        this.drawBranches();
    }

    makeSierpinski() {
        this.degrees = 120;
        this.maxDepth = 8;
        this.startLength = 440;
        this.branchRatio = 0.5;
        this.lineThickness = 15;
        this.lineOpacity = 1;
        this.drawLeaves = false;
        this.drawBase = true;
        this.addStraightBranch = true;
        this.drawBranches();
    }

    makeAntenna() {
        this.degrees = 90;
        this.maxDepth = 13;
        this.startLength = 466;
        this.branchRatio = 0.7;
        this.drawBase = true;
        this.addStraightBranch = false;
        this.drawLeaves = false;
        this.drawBranches();
    }

    randomTree() {
        this.degrees = getRandomInt(15, 100);
        this.maxDepth = getRandomInt(5, 10);
        this.startLength = getRandomInt(150, 375);
        this.branchRatio = getRandomInt(25, 75) / 100;
        this.lineThickness = getRandomInt(1, 20);
        this.addStraightBranch = getRandomInt(0, 1);
        this.drawRandomBranches = getRandomInt(0, 1);

        this.drawBase = true;
        this.drawLeaves = false;
        this.drawBranches();
    }

    randomBranches() {
        this.drawRandomBranches = true;
        this.drawBranches();
        this.drawRandomBranches = false;
    }

    // TODO draw leaf polygon instead of circles?
    drawLeaf(origin) {
        if (!this.drawLeaves) return;

        this.gfx
            .ellipse(origin.x, origin.y, this.leafRadius, this.leafRadius)
            .fill({ color: this.leafColor, alpha: this.leafOpacity });
    }

    drawBranch(depth, origin, length, rot, branchThickness) {
        if (depth > this.maxDepth || length < 0.05) {
            this.drawLeaf(origin);
            return;
        }

        const rotation = depth > 2 ? rot + this.swayCurrent : rot;

        const p = new PIXI.Point(origin.x, origin.y - length);
        const endPoint = rotatePoint(p, degreesToRadians(rotation), origin);

        this.gfx
            .moveTo(origin.x, origin.y)
            .lineTo(endPoint.x, endPoint.y)
            .stroke({ width: branchThickness, color: this.lineColor, alpha: this.lineOpacity });

        let newThickness = branchThickness * 0.67;
        if (newThickness < 1) newThickness = 1;

        const branchLength = length * this.branchRatio;
        const nextDepth = depth + 1;
        const leftRotationChange = this.drawRandomBranches ? getRandomInt(5, this.degrees) : this.degrees;
        const rightRotationChange = this.drawRandomBranches ? getRandomInt(5, this.degrees) : this.degrees;
        this.drawBranch(nextDepth, endPoint, branchLength, rotation - leftRotationChange, newThickness);
        this.drawBranch(nextDepth, endPoint, branchLength, rotation + rightRotationChange, newThickness);

        if (this.addStraightBranch) {
            this.drawBranch(nextDepth, endPoint, branchLength, rotation, newThickness);
        }
    }

    update(delta) {
        if (this.sway) {
            if (Math.abs(this.swayCurrent) > this.swayMax) {
                this.swaySpeed *= -1;
            }

            this.swayCurrent += this.swaySpeed * delta;
            this.drawBranches();
        }
    }

    drawBranches() {
        this.gfx.clear();
        this.gfx.moveTo(config.WORLD.width / 2, config.WORLD.height);

        if (this.drawBase) {
            this.drawBranch(0, this.origin, this.startLength, 0, this.lineThickness);
        } else {
            const center = {
                x: config.WORLD.width / 2,
                y: config.WORLD.height / 2,
            };
            this.drawBranch(0, center, this.startLength, this.degrees, this.lineThickness);
            this.drawBranch(0, center, this.startLength, -this.degrees, this.lineThickness);
            if (this.addStraightBranch) this.drawBranch(0, center, this.startLength, 0, this.lineThickness);
        }
    }

    destroy() {
        if (this.gfx) {
            this.gfx.destroy();
        }
    }
}
