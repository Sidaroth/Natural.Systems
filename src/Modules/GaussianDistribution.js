import * as PIXI from 'pixi.js';
import config from '../config';
import Module from './Module';

import gaussian from '../utils/gaussian';
import constrain from '../utils/constrain';

export default class GaussianDistribution extends Module {
    stage = null;
    numberOfColumns = 20;
    columnWidth = 0;
    columns = [];
    growth = 2;

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

        // TODO: base this on number of columns.
        this.gen = gaussian(10, 2);

        this.gfx = new PIXI.Graphics();
        this.stage.addChild(this.gfx);
    }

    update() {
        const index = constrain(parseInt(this.gen()), 0, this.numberOfColumns - 1);
        this.columns[index].y -= this.growth;
        this.columns[index].height += this.growth;

        this.columns.y = constrain(this.columns[index].y, 0, config.WORLD.height);
        this.columns.height = constrain(this.columns[index].height, 0, config.WORLD.height);
    }

    clear() {
        this.gfx.clear();
    }

    render() {
        this.clear();
        this.gfx.beginFill(0xaaaaaa);
        this.gfx.lineStyle(1, 0x000000, 1);

        this.columns.forEach((column) => {
            this.gfx.drawRect(column.x, column.y, this.columnWidth, column.height);
        });
        this.gfx.endFill();
    }

    destroy() {}
}
