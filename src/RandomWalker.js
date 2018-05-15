import * as PIXI from 'pixi.js';

import getRandomInt from 'utils/getRandomInt';
import constrain from 'utils/constrain';
import config from './config';

export default class RandomWalker {
    stage = null;
    position = null;
    radius = 2;

    DIRECTION = {
        left: 0,
        right: 1,
        up: 2,
        down: 3,
    };

    constructor(stage, x, y) {
        // super();
        this.stage = stage;
        this.position = new PIXI.Point(x, y);
    }

    setup() {
        this.gfx = new PIXI.Graphics();
        this.stage.addChild(this.gfx);
    }

    update() {
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
        this.gfx.beginFill(0x000000);
        this.gfx.drawCircle(this.position.x, this.position.y, this.radius);
        this.gfx.endFill();
    }

    destroy() {
        this.stage.removeChild(this.gfx);
    }
}
