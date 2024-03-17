import { Graphics } from 'pixi.js';
import getRandomInt from 'math/getRandomInt.ts';
import constrain from 'math/constrain.ts';
import Point from 'math/point.ts';
import config from '../config';
import Module from './Module';

export default class RandomWalker extends Module {
    stage;

    position;

    radius = 2;

    DIRECTION = {
        left: 0,
        right: 1,
        up: 2,
        down: 3,
    };

    constructor(stage, x, y) {
        super();
        this.stage = stage;
        this.position = new Point(x, y);
        this.name = 'randomWalker';
    }

    setup() {
        this.gfx = new Graphics();
        this.stage.addChild(this.gfx);
    }

    update(delta) {
        const direction = getRandomInt(0, 3);
        this.move(direction);
    }

    move(direction) {
        switch (direction) {
            case this.DIRECTION.left:
                this.position.x -= 1;
                break;
            case this.DIRECTION.right:
                this.position.x += 1;
                break;
            case this.DIRECTION.up:
                this.position.y -= 1;
                break;
            case this.DIRECTION.down:
                this.position.y += 1;
                break;
            default:
                console.error('The random number generator somehow managed to produce something out of range.');
        }

        this.position.x = constrain(this.position.x, 0, config.WORLD.width);
        this.position.y = constrain(this.position.y, 0, config.WORLD.height);
    }

    render() {
        this.gfx.circle(this.position.x, this.position.y, this.radius);
        this.gfx.fill(0x000000);
    }

    destroy() {
        if (this.gfx) {
            this.stage.removeChild(this.gfx);
            this.gfx.destroy();
        }
    }
}
