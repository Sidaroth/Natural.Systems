import { Texture, Sprite, Container } from 'pixi.js';
import { Noise } from 'noisejs';
import config from '../config';
import Module from './Module';

export default class NoiseVisualizer extends Module {
    backgroundColor?: number;

    stage: Container;

    runtime = 0;

    noiseGen: Noise;

    texture: Texture;

    imageData: ImageData;

    ctx: OffscreenCanvasRenderingContext2D | null;

    sprite: Sprite;

    canvas: OffscreenCanvas;

    width = 4;

    height = 4;

    type = 'perlin';

    zoom: number;

    speedMax: number;

    speedMin: number;

    zoomMax: number;

    zoomMin: number;

    speed: number;

    redThreshold: number;

    greenThreshold: number;

    blueThreshold: number;

    red: number;

    green: number;

    blue: number;

    alpha: number;

    pixels: Int32Array;

    settings: ModuleSettings;

    constructor(stage: Container) {
        super();
        this.stage = stage;
        this.noiseGen = new Noise(Math.random());
        this.name = 'noiseViz';
        this.zoom = 50;
        this.speedMax = 250;
        this.speedMin = 0;
        this.zoomMax = 150;
        this.zoomMin = 1;
        this.speed = 10;

        this.redThreshold = 0;
        this.greenThreshold = 0;
        this.blueThreshold = 0;
        this.pixels = new Int32Array(0);

        this.red = 16;
        this.green = 0;
        this.blue = 0;
        this.alpha = 255;
        this.canvas = new OffscreenCanvas(this.width, this.height);
        this.ctx = this.canvas.getContext('2d');

        this.texture = Texture.from(this.canvas);
        this.sprite = new Sprite(this.texture);

        this.imageData = new ImageData(this.width, this.height);
        const imageData = this.ctx?.createImageData(this.width, this.height);
        if (!imageData) return;

        this.pixels = new Int32Array(imageData.data.buffer);
        this.imageData = imageData;

        this.settings = {
            id: this.id,
            label: this.name,
            title: this.name,
            description: 'A noise visualizer module.',
            options: [],
        }
    }

    reset() {
        this.zoom = 50;
        this.speedMax = 250;
        this.speedMin = 0;
        this.zoomMax = 150;
        this.zoomMin = 1;
        this.speed = 10;

        this.redThreshold = 0;
        this.greenThreshold = 0;
        this.blueThreshold = 0;

        this.red = 16;
        this.green = 0;
        this.blue = 0;
        this.alpha = 255;
    }

    setup() {
        this.reset();
        this.height = config.WORLD.height;
        this.width = config.WORLD.width;
        this.canvas = new OffscreenCanvas(this.width, this.height);
        this.ctx = this.canvas.getContext('2d');
        this.texture = Texture.from(this.canvas);
        this.sprite = new Sprite(this.texture);
        const imageData = this.ctx?.createImageData(this.width, this.height);
        if (imageData) {
            this.imageData = imageData;
            this.pixels = new Int32Array(imageData.data.buffer);
        }

        this.stage.addChild(this.sprite);
    }

    // TODO: Fix. RGB Values don't make any sense right now, but it does produce some nice and trippy effects
    generateNoise32Bit() {
        for (let y = 0; y < this.height; y += 1) {
            for (let x = 0; x < this.width; x += 1) {
                const bufferIndex = ((y * this.width) + x);

                let val;
                if (this.type === 'simplex32') {
                    val = this.noiseGen.simplex3(x / this.zoom, y / this.zoom, this.runtime) * 256;
                } else if (this.type === 'perlin32') {
                    val = this.noiseGen.perlin3(x / this.zoom, y / this.zoom, this.runtime) * 256;
                }

                if (val === undefined) {
                    throw new Error('val is undefined - Noise32Bit can only be used with type simplex32 or perlin32');
                }

                /* eslint-disable no-bitwise */
                const R = (val /* + Math.max(0, (this.redThreshold - val) */ * this.red);
                const G = (val /* + Math.max(0, (this.greenThreshold - val) */ * this.green);
                const B = (val /* + Math.max(0, (this.blueThreshold - val) */ * this.blue);

                this.pixels[bufferIndex] = (this.alpha << 24) | (B << 16) | (G << 8) | R;
                /* eslint-enable */
            }
        }
    }

    // TODO: This gets laggy at large height * width sizes. Optimize by doing 32bit manip or something...https://jsperf.com/canvas-pixel-manipulation/8
    generateNoise() {
        for (let y = 0; y < this.height; y += 1) {
            for (let x = 0; x < this.width; x += 1) {
                const bufferIndex = ((y * this.width) + x) * 4; // we move 4 by 4 over in X because the array is set up as [R, G, B, A, R, G, B, A...]

                let val;
                if (this.type === 'simplex') {
                    val = this.noiseGen.simplex3(x / this.zoom, y / this.zoom, this.runtime) * 256;
                } else if (this.type === 'perlin') {
                    val = this.noiseGen.perlin3(x / this.zoom, y / this.zoom, this.runtime) * 256;
                }

                if (val === undefined) {
                    throw new Error('val is undefined - Noise can only be used with type simplex or perlin');
                }

                this.imageData.data[bufferIndex] = val + Math.max(0, (this.redThreshold - val) * this.red); // R
                this.imageData.data[bufferIndex + 1] = val + Math.max(0, (this.greenThreshold - val) * this.green); // G
                this.imageData.data[bufferIndex + 2] = val + Math.max(0, (this.blueThreshold - val) * this.blue); // B
                this.imageData.data[bufferIndex + 3] = this.alpha; // A
            }
        }
    }

    update(delta: number) {
        // only recalculate if a speed is set.
        if (this.speed <= 0) return;

        this.runtime += delta * (this.speed);
        if (this.type === 'perlin' || this.type === 'simplex') {
            this.generateNoise();
        } else if (this.type === 'perlin32' || this.type === 'simplex32') {
            this.generateNoise32Bit();
        }
    }

    getSettings() {
        return this.settings;
    }

    clear() {
        if (!this.ctx) return;

        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    render() {
        this.clear();
        if (!this.ctx) return;

        this.ctx.putImageData(this.imageData, 0, 0);
        this.texture.update();
    }

    destroy() {
        this.stage.removeChild(this.sprite);
        this.texture.destroy();
        this.sprite.destroy();
    }
}
