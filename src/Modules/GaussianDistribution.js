import * as PIXI from 'pixi.js';
import gaussian from 'math/gaussian';
import constrain from 'math/constrain';
import config from '../config';
import Module from './Module';

export default class GaussianDistribution extends Module {
    stage = null;

    numberOfColumns = 60;

    columnWidth = 0;

    columns = [];

    growth = 5;

    constructor(stage) {
        super();
        this.stage = stage;
        this.name = 'gaussianDistribution';
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

        this.gen = gaussian(this.numberOfColumns / 2, this.numberOfColumns / 10);

        this.gfx = new PIXI.Graphics();
        this.stage.addChild(this.gfx);
    }

    update() {
        const random = parseInt(this.gen(), 10);
        const index = constrain(random, 0, this.numberOfColumns - 1);

        this.columns[index].y -= this.growth;
        this.columns[index].height += this.growth;

        this.columns.y = constrain(this.columns[index].y, 0, config.WORLD.height);
        this.columns.height = constrain(this.columns[index].height, 0, config.WORLD.height);
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
