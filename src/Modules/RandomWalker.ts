import { Color, Container, Graphics } from 'pixi.js';
import getRandomInt from 'math/getRandomInt';
import constrain from 'math/constrain';
import Point from 'math/point';
import config from 'root/config';
import Module from 'modules/Module';
import { ModuleSettings } from './IModule';

enum DIRECTION {
    left = 0,
    right = 1,
    up = 2,
    down = 3,
}

export default class RandomWalker extends Module {
    backgroundColor?: number;

    stage: Container;

    position: Point;

    radius = 3;

    speed = 3;

    color: Color = new Color(0x123456);

    gfx: Graphics;

    settings: ModuleSettings;

    constructor(stage: Container, x: number, y: number) {
        super();
        this.stage = stage;
        this.position = new Point(x, y);
        this.name = 'randomWalker';
        this.gfx = new Graphics();

        this.settings = {
            id: this.id,
            label: this.name,
            title: this.name,
            description: 'A random walker module.',
            options: [],
        };
    }

    setup() {
        this.gfx = new Graphics();
        this.stage.addChild(this.gfx);
    }

    update(_dt: number) {
        const direction = getRandomInt(0, 3);

        this.move(direction);
    }

    move(direction: DIRECTION) {
        switch (direction) {
            case DIRECTION.left:
                this.position.x -= this.speed;
                break;
            case DIRECTION.right:
                this.position.x += this.speed;
                break;
            case DIRECTION.up:
                this.position.y -= this.speed;
                break;
            case DIRECTION.down:
                this.position.y += this.speed;
                break;
            default:
                console.error('The random number generator somehow managed to produce something out of range.');
        }

        this.position.x = constrain(this.position.x, 0, config.WORLD.width);
        this.position.y = constrain(this.position.y, 0, config.WORLD.height);
    }

    getSettings() {
        return this.settings;
    }

    render() {
        this.gfx.circle(this.position.x, this.position.y, this.radius).fill(this.color);
    }

    destroy() {
        if (this.gfx) {
            this.stage.removeChild(this.gfx);
            this.gfx.destroy();
        }
    }
}
