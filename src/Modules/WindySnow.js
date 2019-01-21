import * as PIXI from 'pixi.js';
import Module from './Module';
import PhysicsObject from '../components/PhysicsObject';
import config from '../config';
import getRandomInt from 'math/getRandomInt';
import Vector from '../math/Vector';
import { Noise } from 'noisejs';

export default class WindySnow extends Module {
    stage = null;
    count = 400;
    snowFlakes = [];
    bgfx;
    gravity;

    constructor(stage) {
        super();
        this.stage = stage;
        this.name = 'windySnow';
        this.noiseGen = new Noise(Math.random());
        this.gravity = new Vector(0, 0.0981);
    }

    checkEdges() {
        this.snowFlakes.forEach((snowFlake) => {
            if (snowFlake.location.x > config.WORLD.width) {
                snowFlake.location.x = 0;
            }

            if (snowFlake.location.x < 0) {
                snowFlake.location.x = config.WORLD.width;
            }

            if (snowFlake.location.y < 0) {
                snowFlake.location.y = config.WORLD.height;
            }

            if (snowFlake.location.y > (getRandomInt(config.WORLD.height * 0.85, config.WORLD.height))) {
                snowFlake.location.y = 0;
            }
        });
    }

    addSnowflake() {
        const snowFlake = new PhysicsObject();
        snowFlake.limitVelocityTo(5);
        snowFlake.location.set(getRandomInt(0, config.WORLD.width), getRandomInt(0, config.WORLD.height));

        this.stage.addChild(snowFlake);
        this.snowFlakes.push(snowFlake);
    }

    // TODO fix module options for wind speed, gravity and number of snowflake modifiers.
    setup(gui) {
        this.time = 0;
        this.bgfx = new PIXI.Graphics();
        this.stage.addChild(this.bgfx);

        for (let i = 0; i < this.count; i += 1) {
            this.addSnowflake();
        }
    }

    update(delta) {
        this.time += delta / 1000;

        this.snowFlakes.forEach((snowFlake) => {
            const noise = this.noiseGen.perlin3(snowFlake.location.x, snowFlake.location.y, this.time);
            const wind = new Vector(noise, noise);
            snowFlake.applyForce(wind);
            snowFlake.applyForce(this.gravity);
            snowFlake.update();
        });

        this.checkEdges();
    }

    render() {
        this.bgfx.clear();
        // sky
        this.bgfx.beginFill(0x222222);
        this.bgfx.drawRect(0, 0, config.WORLD.width, config.WORLD.height * 0.85);
        this.bgfx.endFill();

        // moon
        this.bgfx.beginFill(0xFFFFFF);
        this.bgfx.drawCircle(config.WORLD.width * 0.80, config.WORLD.height * 0.18, 45);
        this.bgfx.endFill();

        // moon dots
        this.bgfx.beginFill(0xCCCCCCDD);
        this.bgfx.drawCircle(config.WORLD.width * 0.805, config.WORLD.height * 0.19, 4);
        this.bgfx.drawCircle(config.WORLD.width * 0.825, config.WORLD.height * 0.18 + 2, 4);
        this.bgfx.drawCircle(config.WORLD.width * 0.81, config.WORLD.height * 0.18 - 10, 7);
        this.bgfx.drawCircle(config.WORLD.width * 0.78, config.WORLD.height * 0.18 + 7, 10);
        this.bgfx.endFill();


        // ground
        this.bgfx.beginFill(0xDDDDDD);
        this.bgfx.drawRect(0, config.WORLD.height - config.WORLD.height * 0.15, config.WORLD.width, config.WORLD.height * 0.33);
        this.bgfx.endFill();

        this.snowFlakes.forEach(snowFlake => snowFlake.render());
    }

    destroy() {
        this.snowFlakes.forEach((snowFlake) => {
            this.stage.removeChild(snowFlake);
            snowFlake.destroy();
        });
        this.snowFlakes = [];

        if (this.bgfx) {
            this.stage.removeChild(this.bgfx);
            this.bgfx.destroy();
        }
    }
}
