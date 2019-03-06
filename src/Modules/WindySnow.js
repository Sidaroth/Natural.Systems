import * as PIXI from 'pixi.js';
import Module from './Module';
import PhysicsObject from '../components/PhysicsObject';
import config from '../config';
import getRandomInt from 'math/getRandomInt';
import constrain from 'math/constrain';
import Vector from '../math/Vector';
import { Noise } from 'noisejs';

export default class WindySnow extends Module {
    stage = null;
    count = 400;
    snowFlakes = [];
    bgfx;
    gravity;
    gfx;

    constructor(stage) {
        super();
        this.stage = stage;
        this.name = 'windySnow';
        this.noiseGen = new Noise(Math.random());
        this.gravity = new Vector(0, 0.01);
    }

    /* eslint-disable class-methods-use-this */
    checkEdges(snowFlake) {
        if (snowFlake.location.x > config.WORLD.width) {
            snowFlake.location.x = 0;
        }

        if (snowFlake.location.x < 0) {
            snowFlake.location.x = config.WORLD.width;
        }

        if (snowFlake.location.y > getRandomInt(config.WORLD.height * 0.85, config.WORLD.height)) {
            snowFlake.location.y = getRandomInt(-config.WORLD.height / 2, 0);
            snowFlake.velocity.zero();
        }
    }
    /* eslint-enable class-methods-use-this */

    drawBackground() {
        // sky
        this.bgfx.beginFill(0x222222);
        this.bgfx.drawRect(0, 0, config.WORLD.width, config.WORLD.height * 0.85);
        this.bgfx.endFill();

        // moon
        this.bgfx.beginFill(0xffffff);
        this.bgfx.drawCircle(config.WORLD.width * 0.8, config.WORLD.height * 0.18, 45);
        this.bgfx.endFill();

        // moon dots
        this.bgfx.beginFill(0xccccccdd);
        this.bgfx.drawCircle(config.WORLD.width * 0.805, config.WORLD.height * 0.19, 4);
        this.bgfx.drawCircle(config.WORLD.width * 0.825, config.WORLD.height * 0.18 + 2, 4);
        this.bgfx.drawCircle(config.WORLD.width * 0.81, config.WORLD.height * 0.18 - 10, 7);
        this.bgfx.drawCircle(config.WORLD.width * 0.78, config.WORLD.height * 0.18 + 7, 10);
        this.bgfx.endFill();

        // ground
        this.bgfx.beginFill(0xdddddd);
        this.bgfx.drawRect(0, config.WORLD.height - config.WORLD.height * 0.15, config.WORLD.width, config.WORLD.height * 0.33);
        this.bgfx.endFill();
    }

    addSnowflake() {
        const snowFlake = new PhysicsObject();
        snowFlake.location.set(getRandomInt(0, config.WORLD.width), getRandomInt(0, config.WORLD.height));
        this.snowFlakes.push(snowFlake);
    }

    // TODO fix module options for wind speed, gravity and number of snowflake modifiers.
    setup(gui) {
        this.time = 0;
        this.bgfx = new PIXI.Graphics();
        this.gfx = new PIXI.Graphics();
        this.stage.addChild(this.bgfx);
        this.stage.addChild(this.gfx);
        this.drawBackground();

        for (let i = 0; i < this.count; i += 1) {
            this.addSnowflake();
        }
    }

    update(delta) {
        this.time += delta / 1000;
        for (let i = 0; i < this.snowFlakes.length; i += 1) {
            const snowFlake = this.snowFlakes[i];
            const noise = this.noiseGen.perlin3(snowFlake.location.x, snowFlake.location.y, this.time);
            const windForce = new Vector(noise, noise);
            snowFlake.applyForce(windForce);
            snowFlake.applyForce(this.gravity);
            snowFlake.update();
            snowFlake.velocity.limit(5);
            this.checkEdges(snowFlake);
        }
    }

    render() {
        this.gfx.clear();
        this.gfx.beginFill(0xFFFFFF);
        this.snowFlakes.forEach((flake) => {
            this.gfx.drawCircle(flake.location.x, flake.location.y, 2.5);
        });
        this.gfx.endFill();
    }

    destroy() {
        this.snowFlakes = [];

        if (this.bgfx) {
            this.stage.removeChild(this.bgfx);
            this.bgfx.destroy();
        }

        if (this.gfx) {
            this.stage.removeChild(this.gfx);
            this.gfx.destroy();
        }
    }
}
