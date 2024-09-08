import degreesToRadians from 'math/degreesToRadians';
import getRandomInt from 'math/getRandomInt';
import Point from 'math/point';
import { Container, Graphics } from 'pixi.js';
import Module from 'modules/Module';
import store from 'root/store';
import { ModuleSettings } from './IModule';

export default class FractalTreesMod extends Module {
    backgroundColor?: number;

    stage: Container;

    leafRadius: number;

    origin: Point;

    degrees: number;

    maxDepth: number;

    startLength: number;

    branchRatio: number;

    lineThickness: number;

    lineColor: number;

    lineOpacity: number;

    drawRandomBranches: boolean;

    drawBase: boolean;

    addStraightBranch: boolean;

    swayCurrent: number;

    swaySpeed: number;

    swayMax: number;

    sway: boolean;

    drawLeaves: boolean;

    leafOpacity: number;

    leafColor: number;

    gfx: Graphics;

    settings: ModuleSettings;

    constructor(stage: Container) {
        super();
        this.stage = stage;
        this.name = 'fractalTree';
        this.description = 'Fractal based tree "generator" with various options.';

        this.origin = new Point(store.width / 2, store.height);

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
        this.gfx = new Graphics();

        this.settings = {
            id: this.id,
            label: this.name,
            title: this.name,
            description: 'A fractal tree module.',
            options: [],
        };
    }

    setup() {
        this.gfx = new Graphics();
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
        this.addStraightBranch = !!getRandomInt(0, 1);
        this.drawRandomBranches = !!getRandomInt(0, 1);

        this.drawBase = true;
        this.drawLeaves = false;
        this.drawBranches();
    }

    randomBranches() {
        this.drawRandomBranches = true;
        this.drawBranches();
        this.drawRandomBranches = false;
    }

    getSettings() {
        return this.settings;
    }

    // TODO draw leaf polygon instead of circles?
    drawLeaf(origin: Point) {
        if (!this.drawLeaves) return;

        this.gfx
            .ellipse(origin.x, origin.y, this.leafRadius, this.leafRadius)
            .fill({ color: this.leafColor, alpha: this.leafOpacity });
    }

    drawBranch(depth: number, origin: Point, length: number, rot: number, branchThickness: number) {
        if (depth > this.maxDepth || length < 0.05) {
            this.drawLeaf(origin);
            return;
        }

        const rotation = depth > 2 ? rot + this.swayCurrent : rot;

        const endPoint = new Point(origin.x, origin.y - length);
        endPoint.rotate(degreesToRadians(rotation), origin);

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

    update(delta: number) {
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
        this.gfx.moveTo(store.width / 2, store.height);

        if (this.drawBase) {
            this.drawBranch(0, this.origin, this.startLength, 0, this.lineThickness);
        } else {
            const center = new Point(store.width / 2, store.height / 2);

            this.drawBranch(0, center, this.startLength, this.degrees, this.lineThickness);
            this.drawBranch(0, center, this.startLength, -this.degrees, this.lineThickness);
            if (this.addStraightBranch) this.drawBranch(0, center, this.startLength, 0, this.lineThickness);
        }
    }

    // eslint-disable-next-line class-methods-use-this
    render(): void { }

    destroy() {
        if (this.gfx) {
            this.gfx.destroy();
        }
    }
}
