import * as PIXI from 'pixi.js';
import config from '../config';
import Module from './Module';
import { Noise } from 'noisejs';
import Vector from 'math/Vector';

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
    gui = null;
    type = 'perlin';

    constructor(stage) {
        super();
        this.stage = stage;
        this.noiseGen = new Noise(Math.random());
        this.name = 'basicNoise';
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

    setup(gui) {
        this.reset();
        this.setupGUI(gui);
        this.height = config.WORLD.height;
        this.width = config.WORLD.width;
        this.canvas = new OffscreenCanvas(this.width, this.height);
        this.ctx = this.canvas.getContext('2d');
        this.texture = PIXI.Texture.fromCanvas(this.canvas);
        this.sprite = new PIXI.Sprite(this.texture);
        this.imageBuffer = this.ctx.createImageData(this.width, this.height);
        this.stage.addChild(this.sprite);
    }

    setupGUI(gui) {
        this.gui = gui;
        this.folder = this.gui.addFolder('Noise settings');
        this.folder.add(this, 'type', ['perlin', 'simplex']).listen();
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

                this.imageBuffer.data[bufferIndex] = val + Math.max(0, (this.redThreshold - val) * this.red); // R
                this.imageBuffer.data[bufferIndex + 1] = val + Math.max(0, (this.greenThreshold - val) * this.green); // G
                this.imageBuffer.data[bufferIndex + 2] = val + Math.max(0, (this.blueThreshold - val) * this.blue); // B
                this.imageBuffer.data[bufferIndex + 3] = this.alpha; // A
            }
        }
    }

    update(delta) {
        // only recalculate if a speed is set.
        if (this.speed > 0) {
            this.runtime += delta * (this.speed / 1000);
            this.generateNoise();
        }
    }

    clear() {
        this.ctx.fillColor = 'black';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    render() {
        this.clear();
        this.ctx.putImageData(this.imageBuffer, 0, 0);
        this.texture.update();
    }

    destroy() {
        if (this.gui) {
            this.gui.removeFolder(this.folder);
        }

        this.stage.removeChild(this.sprite);
        this.texture.destroy();
        this.sprite.destroy();
    }
}
