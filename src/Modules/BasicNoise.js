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
    zoom = 20;

    speedMax = 250;
    speedMin = 1;
    zoomMax = 150;
    zoomMin = 1;
    speed = 20;

    gui = null;
    type = 'perlin';

    constructor(stage) {
        super();
        this.stage = stage;
        this.noiseGen = new Noise(Math.random());
    }

    setup(gui) {
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
        this.folder.add(this, 'type', ['perlin', 'simplex']);
        this.folder.add(this, 'speed', this.speedMin, this.speedMax);
        this.folder.add(this, 'zoom', this.zoomMin, this.zoomMax);
    }

    generateNoise() {
        for (let y = 0; y < this.height; y += 1) {
            for (let x = 0; x < this.width; x += 1) {
                const bufferIndex = (y * this.width + x) * 4; // we move 4 by 4 over in X because the array is set up as [R, G, B, A, R, G, B, A...]

                let val;
                // simplex3
                if (this.type === 'simplex') {
                    val = normalizeInRange(this.noiseGen.simplex3(x / this.zoom, y / this.zoom, this.runtime));
                    this.imageBuffer.data[bufferIndex] = val; // R
                } else if (this.type === 'perlin') {
                    // perlin3 with coloring.
                    val = this.noiseGen.perlin3(x / this.zoom, y / this.zoom, this.runtime) * 256;
                    this.imageBuffer.data[bufferIndex] = val + Math.max(0, (25 - val) * 8); // R
                }

                // other channels.
                this.imageBuffer.data[bufferIndex + 1] = val; // G
                this.imageBuffer.data[bufferIndex + 2] = val; // B
                this.imageBuffer.data[bufferIndex + 3] = 255; // A
            }
        }
    }

    update(delta) {
        this.runtime += delta * (this.speed / 1000);
        this.generateNoise();
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
