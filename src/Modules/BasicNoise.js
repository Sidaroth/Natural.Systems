import * as PIXI from 'pixi.js';
import config from '../config';
import Module from './Module';
import { Noise } from 'noisejs';

function normalizeInRange(value, oldMin = -1, oldMax = 1, newMin = 0, newMax = 255) {
    return Math.round(((value - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin);
}

export default class BasicNoise extends Module {
    stage = null;
    runtime = 0;
    noiseGen = null;
    texture = null;
    canvas = null;
    ctx = null;
    imageBuffer = null;
    sprite = null;
    width = 4;
    height = 4;

    constructor(stage) {
        super();
        this.stage = stage;
        this.noiseGen = new Noise(Math.random());
    }

    setup() {
        this.height = config.WORLD.height;
        this.width = config.WORLD.width;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.texture = PIXI.Texture.fromCanvas(this.canvas);
        this.sprite = new PIXI.Sprite(this.texture);
        this.imageBuffer = this.ctx.createImageData(this.width, this.height);
        this.generateNoise();

        this.sprite.position = new PIXI.Point(0, 0);
        this.stage.addChild(this.sprite);
    }

    generateNoise() {
        for (let y = 0; y < this.height; y += 1) {
            for (let x = 0; x < this.width; x += 1) {
                const bufferIndex = (y * this.width + x) * 4; // we move 4 by 4 over in X because the array is set up as [R, G, B, A, R, G, B, A...]
                const val = normalizeInRange(this.noiseGen.simplex3(x, y, this.runtime));

                this.imageBuffer.data[bufferIndex] = val; // R
                this.imageBuffer.data[bufferIndex + 1] = val; // G
                this.imageBuffer.data[bufferIndex + 2] = val; // B
                this.imageBuffer.data[bufferIndex + 3] = 255; // A
            }
        }

        this.ctx.putImageData(this.imageBuffer, 0, 0);
    }

    updateSprite() {
        this.texture = PIXI.Texture.fromCanvas(this.canvas);
        this.sprite.texture = this.texture;
    }

    update(delta) {
        this.runtime += delta;
        // this.generateNoise();
        // this.updateSprite();
    }

    clear() {
    }

    render() {
        this.clear();
    }

    destroy() {
        this.stage.removeChild(this.sprite);
        this.texture.destroy();
        this.sprite.destroy();
    }
}
