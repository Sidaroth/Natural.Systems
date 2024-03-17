import { Graphics } from 'pixi.js';
import Vector from 'math/Vector';
import Circle from 'shapes/circle';
import Line from 'shapes/line.ts';
import store from '../store';
import Module from './Module';

export default class Raycast extends Module {
    constructor(stage) {
        super();
        this.stage = stage;
        this.name = 'raycast';
        this.description = 'Visualization of Raycasting / Raymarching.';

        this.backgroundColor = 0x000000;

        this.rayOrigin = new Vector(0, store.worldBoundary.h / 2);
        this.obstacles = [];

        this.circleData = [{ x: 300, y: 300, r: 100 }, { x: 600, y: 400, r: 60 }, { x: 900, y: 600, r: 150 }];
        this.circleLinestyle = { color: 0xFFFFFF, width: 1 };
        this.lineStyle = { color: 0xFFFFFF, width: 1 };

        this.currentX = 0;
        this.currentY = store.worldBoundary.h;
        this.movingRight = true;
    }

    setup() {
        this.reset();
        this.gfx = new Graphics();
        this.stage.addChild(this.gfx);
    }

    reset() {
        this.obstacles = [];
        for (let i = 0; i < this.circleData.length; i += 1) {
            const { x, y, r } = this.circleData[i];
            this.obstacles.push(new Circle(x, y, r));
        }

        this.currentX = 0;
        this.currentY = store.worldBoundary.h;
    }

    update() {
        this.ray = new Line(this.rayOrigin, { x: this.currentX, y: this.currentY });

        if (this.movingRight === true) {
            this.currentX += 1;
        } else if (this.currentY === 0) {
            this.currentX -= 1;
        }

        if (this.currentX === store.worldBoundary.w) {
            this.currentY -= 1;
            this.movingRight = false;
        }

        if (this.currentX === 0 && this.currentY === 0) {
            this.movingRight = true;
            this.currentY = store.worldBoundary.h;
        }
    }

    render() {
        this.gfx.clear();

        this.obstacles.forEach((obstacle) => {
            obstacle.render(this.gfx, this.circleLinestyle);
        });
        this.ray.render(this.gfx, this.lineStyle);
    }

    destroy() {
        if (this.gfx) {
            this.stage.removeChild(this.gfx);
            this.gfx.destroy();
        }
    }
}
