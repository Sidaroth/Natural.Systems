import { Container, Graphics, Texture } from 'pixi.js';
import { Noise } from 'noisejs';
import getRandomInt from 'math/getRandomInt';
import Vector from 'math/Vector';
import Module from 'modules/Module';
import PhysicsBody from 'components/PhysicsBody';
import store from 'root/store';
import Region from 'components/Region';
import { ModuleSettings } from './IModule';

export default class WindySnow extends Module {
    stage: Container;

    backgroundColor?: number;

    count = 2500;

    snowFlakes: PhysicsBody[] = [];

    bgfx: Graphics;

    gravity;

    snowflakeTextures: Texture[] = [];

    regions: Region[] = [];

    noiseGen: Noise;

    time: number;

    settings: ModuleSettings;

    constructor(stage: Container) {
        super();

        this.stage = stage;
        this.name = 'windySnow';
        this.noiseGen = new Noise(Math.random());
        this.gravity = new Vector(0, 1);
        this.time = 0;
        this.bgfx = new Graphics();

        this.settings = {
            id: this.id,
            label: this.name,
            title: this.name,
            description: 'A windy snow module.',
            options: [],
        };
    }

    getSettings() {
        return this.settings;
    }

    // eslint-disable-next-line class-methods-use-this
    checkEdges(flake: PhysicsBody) {
        if (flake.position.x > store.width) {
            flake.position.x = 0;
        }

        if (flake.position.x < 0) {
            flake.position.x = store.width;
        }

        // Randomize end position on the ground.
        if (flake.position.y > getRandomInt(store.height * 0.85, store.height)) {
            flake.position.y = getRandomInt(-store.height / 2, 0);
            flake.velocity.zero();
        }
    }

    drawBackground() {
        // sky
        this.bgfx
            .rect(0, 0, store.width, store.height * 0.85)
            .fill(0x222222);

        // moon
        this.bgfx
            .circle(store.width * 0.8, store.height * 0.18, 45)
            .fill(0xffffff);

        // moon dots
        this.bgfx
            .circle(store.width * 0.805, store.height * 0.19, 4)
            .circle(store.width * 0.825, (store.height * 0.18) + 2, 4)
            .circle(store.width * 0.81, (store.height * 0.18) - 10, 7)
            .circle(store.width * 0.78, (store.height * 0.18) + 7, 10)
            .fill({ color: 0xcccccc, alpha: 0.75 });

        // ground
        this.bgfx
            .rect(0, store.height - (store.height * 0.15), store.width, store.height * 0.33)
            .fill(0xdddddd);
    }

    addSnowflake() {
        // Generate a random size snowflake.
        const size = getRandomInt(1, 3);
        const texture = this.snowflakeTextures[size - 1];

        if (!texture) return;

        const snowFlake = new PhysicsBody();
        snowFlake.setMass(size / 100000); // The weight of a snowflake is about 0.02 grams, generate flakes in weightrange 0.01 - 0.03 grams.
        snowFlake.setTexture(texture);

        snowFlake.position.set(getRandomInt(0, store.width), getRandomInt(0, store.height));
        this.stage.addChild(snowFlake.sprite);
        this.snowFlakes.push(snowFlake);
    }

    // TODO https://youtu.be/c1yuYXg4IeE make smarter wind regions.
    addWindRegions() {
        const topRegion = new Region(0, 100, store.width, 200);
        const bottomRegion = new Region(0, 300, store.width, 200);

        topRegion.setForce(new Vector(-0.00001, -0.000001));
        bottomRegion.setForce(new Vector(0.00001, 0));

        this.regions.push(topRegion);
        this.regions.push(bottomRegion);
    }

    setup() {
        if (!store.renderer) {
            throw new Error('Renderer not accessible. Cant create snow without a renderer.');
        }

        this.time = 0;
        this.bgfx = new Graphics();
        this.stage.addChild(this.bgfx);
        this.drawBackground();

        // Create 3 sizes of snowflakes for some parallax effects.
        const gfx = new Graphics();
        gfx.circle(0, 0, 2.5).fill(0xFFFFFF);
        this.snowflakeTextures.push(store.renderer.generateTexture(gfx));
        gfx.clear();

        gfx.circle(0, 0, 2).fill(0xFFFFFF);
        this.snowflakeTextures.push(store.renderer.generateTexture(gfx));
        gfx.clear();

        gfx.circle(0, 0, 1.5).fill(0xFFFFFF);
        this.snowflakeTextures.push(store.renderer.generateTexture(gfx));

        this.addWindRegions();

        for (let i = 0; i < this.count; i += 1) {
            this.addSnowflake();
        }
    }

    update(delta: number) {
        this.time += delta;

        this.snowFlakes.forEach((snowFlake) => {
            snowFlake.applyForce(Vector.multiply(this.gravity, snowFlake.mass));
            snowFlake.calculateDrag(1);

            this.regions.forEach((region) => {
                if (region.contains(snowFlake)) {
                    snowFlake.applyForce(region.force);
                }
            });

            snowFlake.update(delta);
            this.checkEdges(snowFlake);
        });
    }

    // eslint-disable-next-line class-methods-use-this
    render(): void { }

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
