import * as PIXI from 'pixi.js';
import Module from './Module';
import PhysicsObject from '../components/PhysicsObject';
import config from '../config';
import getRandomInt from '../math/getRandomInt';
import Vector from '../math/Vector';
import store from '../store';
import { Noise } from 'noisejs';
import Region from '../components/Region';

export default class WindySnow extends Module {
    count = 300;
    snowFlakes = [];
    bgfx;
    gravity;
    snowflakeTextures = [];
    regions = [];

    constructor(stage) {
        super();
        this.stage = stage;
        this.name = 'windySnow';
        this.noiseGen = new Noise(Math.random());
        this.gravity = new Vector(0, 1);
    }

    /* eslint-disable class-methods-use-this */
    checkEdges(snowFlake) {
        if (snowFlake.position.x > config.WORLD.width) {
            snowFlake.position.x = 0;
        }

        if (snowFlake.position.x < 0) {
            snowFlake.position.x = config.WORLD.width;
        }

        // Randomize end position on the ground.
        if (snowFlake.position.y > getRandomInt(config.WORLD.height * 0.85, config.WORLD.height)) {
            snowFlake.position.y = getRandomInt(-config.WORLD.height / 2, 0);
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
        const size = getRandomInt(1, 3);
        snowFlake.setMass(size / 100000); // The weight of a snowflake is about 0.02 grams, generate flakes in weightrange 0.01 - 0.03 grams.
        snowFlake.setTexture(this.snowflakeTextures[size - 1]);

        snowFlake.position.set(getRandomInt(0, config.WORLD.width), getRandomInt(0, config.WORLD.height));
        this.stage.addChild(snowFlake.sprite);
        this.snowFlakes.push(snowFlake);
    }

    addWindRegions() {
        const topRegion = new Region(0, 100, config.WORLD.width, 200);
        const bottomRegion = new Region(0, 300, config.WORLD.width, 200);

        topRegion.setForce(new Vector(-0.00001, -0.000001));
        bottomRegion.setForce(new Vector(0.00001, 0));

        this.regions.push(topRegion);
        this.regions.push(bottomRegion);

        // topRegion.render(0xffffff);
        // bottomRegion.render(0xaaaaaa);
        // this.stage.addChild(topRegion.gfx);
        // this.stage.addChild(bottomRegion.gfx);
    }

    // TODO fix module options for wind speeds, gravity and number of snowflake modifiers.
    setup(gui) {
        this.time = 0;
        this.bgfx = new PIXI.Graphics();
        this.stage.addChild(this.bgfx);
        this.drawBackground();

        // Create 3 sizes of snowflakes for some parallax effects.
        const gfx = new PIXI.Graphics();
        gfx.beginFill(0xFFFFFF);
        gfx.drawCircle(0, 0, 2.5);
        this.snowflakeTextures.push(store.renderer.generateTexture(gfx));
        gfx.endFill();
        gfx.clear();

        gfx.beginFill(0xFFFFFF);
        gfx.drawCircle(0, 0, 2);
        this.snowflakeTextures.push(store.renderer.generateTexture(gfx));
        gfx.endFill();
        gfx.clear();

        gfx.beginFill(0xFFFFFF);
        gfx.drawCircle(0, 0, 1.5);
        this.snowflakeTextures.push(store.renderer.generateTexture(gfx));
        gfx.endFill();


        this.addWindRegions();

        for (let i = 0; i < this.count; i += 1) {
            this.addSnowflake();
        }
    }

    update(delta) {
        this.time += delta / 1000;

        for (let i = 0; i < this.snowFlakes.length; i += 1) {
            const snowFlake = this.snowFlakes[i];
            snowFlake.applyForce(Vector.multiply(this.gravity, snowFlake.mass));
            snowFlake.calculateDrag(1);

            for (let j = 0; j < this.regions.length; j += 1) {
                if (this.regions[j].contains(snowFlake)) {
                    snowFlake.applyForce(this.regions[j].force);
                }
            }

            snowFlake.update();
            this.checkEdges(snowFlake);
        }
    }

    render() {}

    destroy() {
        this.snowFlakes.forEach((flake) => {
            this.stage.removeChild(flake.sprite);
            flake.destroy();
        });
        this.snowFlakes = [];

        this.snowflakeTextures.forEach((texture) => {
            texture.destroy();
        });
        this.snowflakeTextures = [];

        if (this.bgfx) {
            this.stage.removeChild(this.bgfx);
            this.bgfx.destroy();
        }
    }
}
