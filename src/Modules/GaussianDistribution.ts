import { Container, Graphics } from 'pixi.js';
import gaussian from 'math/gaussian';
import constrain from 'math/constrain';
import config from '../config';
import Module from './Module';
import { ModuleSettings } from './IModule';

interface Column {
    x: number;
    y: number;
    height: number;
}

export default class GaussianDistribution extends Module {
    backgroundColor?: number;

    stage: Container;

    numberOfColumns = 60;

    columnWidth = 0;

    columns: Column[];

    growth = 5;

    randomGaussian: () => number;

    gfx: Graphics;

    settings: ModuleSettings;

    constructor(stage: Container) {
        super();
        this.stage = stage;
        this.name = 'gaussianDistribution';
        this.columns = [];
        this.randomGaussian = gaussian(this.numberOfColumns / 2, this.numberOfColumns / 10);
        this.gfx = new Graphics();

        this.settings = {
            id: this.id,
            label: this.name,
            title: this.name,
            description: 'A gaussian distribution module.',
            options: [],
        };
    }

    setup() {
        this.columns = [];
        this.columnWidth = config.WORLD.width / this.numberOfColumns;
        for (let i = 0; i < this.numberOfColumns; i += 1) {
            this.columns.push({
                x: i * this.columnWidth,
                y: config.WORLD.height,
                height: 0,
            });
        }

        this.randomGaussian = gaussian(this.numberOfColumns / 2, this.numberOfColumns / 10);

        this.gfx = new Graphics();
        this.stage.addChild(this.gfx);
    }

    update() {
        const random = Math.floor(this.randomGaussian());
        const index = constrain(random, 0, this.numberOfColumns - 1);
        const column = this.columns[index];

        if (!column) return;

        column.y -= this.growth;
        column.height += this.growth;

        column.y = constrain(column.y, 0, config.WORLD.height);
        column.height = constrain(column.height, 0, config.WORLD.height);
    }

    getSettings() {
        return this.settings;
    }

    render() {
        this.gfx.clear();

        this.columns.forEach((column) => {
            this.gfx
                .rect(column.x, column.y, this.columnWidth, column.height)
                .stroke({ width: 1, color: 0x000000 })
                .fill({ color: 0x888888 });
        });
    }

    destroy() {
        if (this.gfx) {
            this.stage.removeChild(this.gfx);
            this.gfx.destroy();
        }
    }
}
