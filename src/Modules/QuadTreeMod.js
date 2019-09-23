import * as PIXI from 'pixi.js';
import config from '../config';
import Module from './Module';
import getRandomInt from '../math/getRandomInt';
import createQuadTree from '../components/QuadTree';
import Rect from '../shapes/rect';
import Circle from '../shapes/circle';
import store from '../store';

export default class QuadTreeMod extends Module {
    vision = 0;
    numPoints = 0;
    treeCapacity = 0;
    checks = 0;
    points = [];

    constructor(stage) {
        super();
        this.stage = stage;
        this.name = 'quadTree';
    }

    setupGUI() {
        this.folder = store.gui.addFolder('QuadTree settings');
        this.folder.add(this, 'vision', 10, 200).listen();
        this.folder
            .add(this, 'numPoints', 0, 2000)
            .listen()
            .onChange(() => {
                this.addPoints();
            });
        this.folder.add(this, 'treeCapacity', 1, 200).listen();
        this.folder.add(this, 'checks').listen();
        this.folder.add(this, 'reset');
        this.folder.open();
    }

    addPoints() {
        this.recalculateTree();
        this.points = [];
        for (let i = 0; i < this.numPoints; i += 1) {
            const entity = {
                position: {
                    x: getRandomInt(0, config.WORLD.width),
                    y: getRandomInt(0, config.WORLD.height),
                },
            };
            this.points.push(entity);
            this.qTree.insert(entity);
        }
    }

    reset() {
        this.numPoints = 1000;
        this.treeCapacity = 25;
        this.vision = 80;
        this.addPoints();
    }

    recalculateTree() {
        const boundary = new Rect(0, 0, config.WORLD.width, config.WORLD.height);
        this.qTree = createQuadTree(boundary, this.treeCapacity);
        for (let i = 0; i < this.points.length; i += 1) {
            this.qTree.insert(this.points[i]);
        }
    }

    setup() {
        this.setupGUI();
        this.reset();
        this.gfx = new PIXI.Graphics();
        this.stage.addChild(this.gfx);
    }

    update() {
        store.count = 0;
        this.recalculateTree();
        // const testShape = new Rect(store.mouse.x - this.vision / 2, store.mouse.y - this.vision / 2, this.vision, this.vision);
        const testShape = new Circle(store.mouse.x, store.mouse.y, this.vision);

        this.highlights = this.qTree.query(testShape);
        this.checks = store.count;
    }

    render() {
        this.gfx.clear();
        this.qTree.render(this.gfx);

        this.gfx.lineStyle(2, 0xff0000);
        this.gfx.drawCircle(store.mouse.x, store.mouse.y, this.vision);
        // this.gfx.drawRect(store.mouse.x - this.vision / 2, store.mouse.y - this.vision / 2, this.vision, this.vision);

        this.gfx.beginFill(0x00ff00);
        this.highlights.forEach((point) => {
            this.gfx.drawCircle(point.position.x, point.position.y, 1);
        });
        this.gfx.endFill();
    }

    destroy() {
        if (this.gfx) {
            this.stage.removeChild(this.gfx);
            this.gfx.destroy();
        }

        if (this.folder && store.gui) {
            store.gui.removeFolder(this.folder);
        }
    }
}
