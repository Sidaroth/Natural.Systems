import * as PIXI from 'pixi.js';
import config from '../config';
import Module from './Module';

import getRandomInt from 'math/getRandomInt';
import constrain from 'math/constrain';
import Worker from '../components/test.worker';

export default class RandomWalker extends Module {
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
        super();
        this.stage = stage;
        this.position = new PIXI.Point(x, y);
        this.name = 'randomWalker';
    }

    setup() {
        this.gfx = new PIXI.Graphics();
        this.stage.addChild(this.gfx);

        // const worker = new Worker('components/Worker.js');
        // worker.onmessage = (e) => {
        //     console.log('message from worker: ', e);
        // };

        // worker.postMessage([1, 2, 3]);
        // console.log('Message posted to worker');
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
        // this.gfx.clear();
        this.gfx.beginFill(0x000000);
        this.gfx.drawCircle(this.position.x, this.position.y, this.radius);
        this.gfx.endFill();
    }

    destroy() {
        if (this.gfx) {
            this.stage.removeChild(this.gfx);
            this.gfx.destroy();
        }
    }
}
