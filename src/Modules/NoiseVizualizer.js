import * as PIXI from 'pixi.js';
import config from '../config';
import Module from './Module';
import { Noise } from 'noisejs';
import store from '../store';

export default class NoiseVisualizer extends Module {
    stage = null;
    runtime = 0;
    noiseGen = null;
    texture = null;
    canvas = null;
    ctx = null;
    imageData = null;
    sprite = null;
    width = 4;
    height = 4;
    type = 'perlin';

    constructor(stage) {
        super();
        this.stage = stage;
        this.noiseGen = new Noise(Math.random());
        this.name = 'noiseViz';
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
        this.setupGUI();
        this.height = config.WORLD.height;
        this.width = config.WORLD.width;
        this.canvas = new OffscreenCanvas(this.width, this.height);
        this.ctx = this.canvas.getContext('2d');
        this.texture = PIXI.Texture.from(this.canvas);
        this.sprite = new PIXI.Sprite(this.texture);
        this.imageData = this.ctx.createImageData(this.width, this.height);
        this.pixels = new Int32Array(this.imageData.data.buffer);
        this.stage.addChild(this.sprite);
    }

    setupGUI() {
        this.folder = store.gui.addFolder('Noise settings');
        this.folder.add(this, 'type', ['perlin', 'simplex', 'perlin32', 'simplex32']).listen();
        this.folder.add(this, 'speed', this.speedMin, this.speedMax).listen();
        this.folder.add(this, 'zoom', this.zoomMin, this.zoomMax).listen();
        this.folder.add(this, 'redThreshold', -50, 50).listen();
        this.folder.add(this, 'greenThreshold', -50, 50).listen();
        this.folder.add(this, 'blueThreshold', -50, 50).listen();
        this.folder.add(this, 'red', 0, 64).listen();
        this.folder.add(this, 'green', 0, 64).listen();
        this.folder.add(this, 'blue', 0, 64).listen();
        this.folder.add(this, 'alpha', 0, 255).listen();
        this.folder.add(this, 'reset');
    }

    // TODO: Fix. RGB Values don't make any sense right now, but it does produce some nice and trippy effects
    generateNoise32Bit() {
        for (let y = 0; y < this.height; y += 1) {
            for (let x = 0; x < this.width; x += 1) {
                const bufferIndex = (y * this.width + x);

                let val;
                if (this.type === 'simplex32') {
                    val = this.noiseGen.simplex3(x / this.zoom, y / this.zoom, this.runtime) * 256;
                } else if (this.type === 'perlin32') {
                    val = this.noiseGen.perlin3(x / this.zoom, y / this.zoom, this.runtime) * 256;
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
    // PIXI.Texture manipulation?
    generateNoise() {
        for (let y = 0; y < this.height; y += 1) {
            for (let x = 0; x < this.width; x += 1) {
                const bufferIndex = (y * this.width + x) * 4; // we move 4 by 4 over in X because the array is set up as [R, G, B, A, R, G, B, A...]

                let val;
                if (this.type === 'simplex') {
                    val = this.noiseGen.simplex3(x / this.zoom, y / this.zoom, this.runtime) * 256;
                } else if (this.type === 'perlin') {
                    val = this.noiseGen.perlin3(x / this.zoom, y / this.zoom, this.runtime) * 256;
                }

                this.imageData.data[bufferIndex] = val + Math.max(0, (this.redThreshold - val) * this.red); // R
                this.imageData.data[bufferIndex + 1] = val + Math.max(0, (this.greenThreshold - val) * this.green); // G
                this.imageData.data[bufferIndex + 2] = val + Math.max(0, (this.blueThreshold - val) * this.blue); // B
                this.imageData.data[bufferIndex + 3] = this.alpha; // A
            }
        }
    }

    update(delta) {
        // only recalculate if a speed is set.
        if (this.speed <= 0) return;

        this.runtime += delta * (this.speed / 1000);
        if (this.type === 'perlin' || this.type === 'simplex') {
            this.generateNoise();
        } else if (this.type === 'perlin32' || this.type === 'simplex32') {
            this.generateNoise32Bit();
        }
    }

    clear() {
        this.ctx.fillColor = 'black';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    render() {
        this.clear();
        this.ctx.putImageData(this.imageData, 0, 0);
        this.texture.update();
    }

    destroy() {
        if (store.gui) {
            store.gui.removeFolder(this.folder);
        }

        this.stage.removeChild(this.sprite);
        this.texture.destroy();
        this.sprite.destroy();
    }
}
