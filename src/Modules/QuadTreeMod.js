import { Graphics, Sprite } from 'pixi.js';
import getRandomInt from 'math/getRandomInt';
import getUUID from 'math/getUUID';
import config from '../config';
import Module from './Module';
import createQuadTree from '../components/QuadTree';
import Rect from '../shapes/rect';
import Circle from '../shapes/circle';
import store from '../store';

export default class QuadTreeMod extends Module {
    vision = 0;

    numPoints = 0;

    treeCapacity = 0;

    treeDepth = 8;

    checks = 0;

    points = [];

    constructor(stage) {
        super();
        this.stage = stage;
        this.name = 'quadTree';
    }

    // setupGUI() {
    //     this.folder = store.gui.addFolder('QuadTree settings');
    //     this.folder.add(this, 'vision', 10, 200).listen();
    //     this.folder
    //         .add(this, 'numPoints', 0, 5000)
    //         .listen()
    //         .onChange(() => {
    //             this.addPoints();
    //         });
    //     this.folder
    //         .add(this, 'treeDepth', 0, 15)
    //         .listen()
    //         .onChange((v) => {
    //             this.treeDepth = parseInt(v, 10);
    //             this.recalculateTree();
    //         });
    //     this.folder
    //         .add(this, 'treeCapacity', 1, 200)
    //         .listen()
    //         .onChange(() => this.recalculateTree());
    //     this.folder.add(this, 'checks').listen();
    //     this.folder.add(this, 'reset');
    //     this.folder.open();
    // }

    addPoints() {
        this.points.forEach((p) => this.stage.removeChild(p.sprite));

        this.points = [];
        for (let i = 0; i < this.numPoints; i += 1) {
            const entity = {
                id: getUUID(),
                position: {
                    x: getRandomInt(0, config.WORLD.width),
                    y: getRandomInt(0, config.WORLD.height),
                },
                sprite: new Sprite(this.pointTexture),
            };

            entity.sprite.position.x = entity.position.x;
            entity.sprite.position.y = entity.position.y;

            this.stage.addChild(entity.sprite);
            this.points.push(entity);
        }

        this.recalculateTree();
    }

    reset() {
        this.numPoints = 500;
        this.treeCapacity = 25;
        this.vision = 80;
        this.addPoints();
    }

    recalculateTree() {
        const boundary = new Rect(0, 0, config.WORLD.width, config.WORLD.height);
        this.qTree = createQuadTree(boundary, this.treeCapacity, this.treeDepth);
        for (let i = 0; i < this.points.length; i += 1) {
            this.qTree.insert(this.points[i]);
        }
    }

    setup() {
        this.gfx = new Graphics();
        this.stage.addChild(this.gfx);

        // Black texture
        this.gfx.circle(0, 0, 2).fill(0x000000).stroke({ width: 1, color: 0x000000 });
        this.pointTexture = store.renderer.generateTexture(this.gfx);

        // Highlight texture.
        this.gfx.circle(0, 0, 2).fill(0xff0000).stroke({ width: 1, color: 0x000000 });
        this.highlightTexture = store.renderer.generateTexture(this.gfx);

        store.app.stage.on('mousedown', this.onMouseDown, this);

        this.reset();
    }

    update() {
        store.count = 0;
        const testShape = new Circle(store.mousePosition.x, store.mousePosition.y, this.vision);

        this.highlights = this.qTree.query(testShape);
        this.checks = store.count;
    }

    onMouseDown() {
        this.highlights.forEach((entity) => {
            const idx = this.points.indexOf(entity);
            if (idx !== -1) {
                this.qTree.remove(entity);
                this.points.splice(idx, 1);
                this.stage.removeChild(entity.sprite);
            }
        });
        this.highlights = [];
    }

    render() {
        this.gfx.clear();
        this.qTree.render(this.gfx);

        this.gfx
            .circle(store.mousePosition.x, store.mousePosition.y, this.vision)
            .stroke({ width: 2, color: 0xff0000 });

        this.points
            .filter((p) => !this.highlights.find((point) => p === point))
            .forEach((p) => {
                p.sprite.texture = this.pointTexture;
            });

        this.highlights.forEach((point) => {
            point.sprite.texture = this.highlightTexture;
        });
    }

    destroy() {
        this.points.forEach((p) => {
            this.stage.removeChild(p.sprite);
        });

        if (this.gfx) {
            this.stage.removeChild(this.gfx);
            this.gfx.destroy();
        }

        store.app.stage.off('mousedown', this.onMouseDown, this);
    }
}
