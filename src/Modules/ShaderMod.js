import * as PIXI from 'pixi.js';
import testFragment from 'shaders/test.frag';
import Module from './Module';
import config from '../config';

export default class ShaderMod extends Module {
    constructor(stage) {
        super();
        this.stage = stage;
        this.name = 'shader';
    }

    setup() {
        this.uniforms = {
            u_time: 0,
            u_resolution: {
                x: config.WORLD.width,
                y: config.WORLD.height,
            },
        };

        this.canvas = new OffscreenCanvas(config.WORLD.width, config.WORLD.height);
        this.texture = PIXI.Texture.from(this.canvas);
        this.sprite = new PIXI.Sprite(this.texture);
        this.stage.addChild(this.sprite);
    }

    update(delta) {
        this.uniforms.u_time += delta / 1000;
        this.sprite.filters = [new PIXI.Filter(undefined, testFragment, this.uniforms)];
    }

    destroy() {
        this.sprite.destroy();
    }
}
