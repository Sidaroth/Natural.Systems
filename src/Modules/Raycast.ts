import { Container, Graphics, StrokeStyle } from 'pixi.js';
import Vector from 'math/Vector';
import Circle from 'shapes/circle';
import Line from 'shapes/line';
import store from 'root/store';
import Module from 'modules/Module';
import Point from 'math/point';
import { ModuleSettings } from './IModule';

interface CircleData {
    x: number;
    y: number;
    r: number;
}

export default class Raycast extends Module {
    stage: Container;

    backgroundColor?: number;

    rayOrigin: Vector;

    obstacles: Circle[];

    // Could probably just use Circle and remove the interface.
    circleData: CircleData[];

    circleLinestyle: StrokeStyle;

    lineStyle: StrokeStyle;

    currentX: number;

    currentY: number;

    movingRight: boolean;

    gfx: Graphics;

    ray: Line;

    settings: ModuleSettings;

    constructor(stage: Container) {
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
        this.ray = new Line(new Point(0, 0), new Point(0, 0));
        this.gfx = new Graphics();

        this.settings = {
            id: this.id,
            label: this.name,
            title: this.name,
            description: 'A raycast module.',
            options: [],
        };
    }

    setup() {
        this.reset();
        this.gfx = new Graphics();
        this.stage.addChild(this.gfx);
    }

    reset() {
        this.obstacles = [];
        this.circleData.forEach((circle) => {
            const { x, y, r } = circle;
            this.obstacles.push(new Circle(x, y, r));
        });

        this.currentX = 0;
        this.currentY = store.worldBoundary.h;
    }

    getSettings() {
        return this.settings;
    }

    update() {
        const target = new Point(this.currentX, this.currentY);
        this.ray = new Line(this.rayOrigin, target);

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
