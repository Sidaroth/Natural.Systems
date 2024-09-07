import {
    Container, Graphics, Sprite, Texture,
} from 'pixi.js';
import getRandomInt from 'math/getRandomInt';
import getUUID from 'math/getUUID';
import config from 'root/config';
import Module from 'modules/Module';
import createQuadTree from 'components/QuadTree';
import Rect from 'shapes/rect';
import Circle from 'shapes/circle';
import store from 'root/store';
import { Entity, QuadTree } from 'root/interfaces/entities';
import Point from 'math/point';
import { ModuleSettings } from './IModule';

export default class QuadTreeMod extends Module {
    stage: Container;

    backgroundColor?: number;

    vision = 0;

    numPoints = 0;

    treeCapacity = 0;

    treeDepth = 8;

    checks = 0;

    entities: Entity[] = [];

    pointTexture: Texture;

    quadTree: QuadTree;

    gfx: Graphics;

    highlightTexture: Texture;

    highlights: Entity[] = [];

    settings: ModuleSettings;

    constructor(stage: Container) {
        super();
        this.stage = stage;
        this.name = 'quadTree';
        this.gfx = new Graphics();
        this.pointTexture = new Texture();
        this.highlightTexture = new Texture();
        this.quadTree = createQuadTree(new Rect(0, 0, 0, 0), 0, 0);

        this.settings = {
            id: this.id,
            label: this.name,
            title: this.name,
            description: 'A quad tree module.',
            options: [],
        }
    }

    addPoints() {
        this.entities.forEach((p) => this.stage.removeChild(p.sprite));
        this.entities = [];

        for (let i = 0; i < this.numPoints; i += 1) {
            const point: Entity = {
                id: getUUID(),
                position: new Point(getRandomInt(0, config.WORLD.width), getRandomInt(0, config.WORLD.height)),
                sprite: new Sprite(this.pointTexture),
            };

            point.sprite.position.x = point.position.x;
            point.sprite.position.y = point.position.y;

            this.stage.addChild(point.sprite);
            this.entities.push(point);
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
        this.quadTree = createQuadTree(boundary, this.treeCapacity, this.treeDepth);

        this.entities.forEach((p) => this.quadTree.insert(p));
    }

    setup() {
        this.gfx = new Graphics();
        this.stage.addChild(this.gfx);

        if (!store.renderer) {
            throw new Error('Renderer not found');
        }

        // Black texture
        this.gfx.circle(0, 0, 2).fill(0x000000).stroke({ width: 1, color: 0x000000 });
        this.pointTexture = store.renderer.generateTexture(this.gfx);

        // Highlight texture.
        this.gfx.circle(0, 0, 2).fill(0xff0000).stroke({ width: 1, color: 0x000000 });
        this.highlightTexture = store.renderer.generateTexture(this.gfx);

        this.stage.on('mousedown', this.onMouseDown, this);

        this.reset();
    }

    getSettings() {
        return this.settings;
    }

    update() {
        store.count = 0;
        const testShape = new Circle(store.mousePosition.x, store.mousePosition.y, this.vision);

        this.highlights = this.quadTree.query(testShape);
        this.checks = store.count;
    }

    onMouseDown() {
        this.highlights.forEach((entity: Entity) => {
            const idx = this.entities.indexOf(entity);
            if (idx !== -1) {
                this.quadTree.remove(entity);
                this.entities.splice(idx, 1);
                this.stage.removeChild(entity.sprite);
            }
        });
        this.highlights = [];
    }

    render() {
        this.gfx.clear();
        this.quadTree.render(this.gfx);

        this.gfx
            .circle(store.mousePosition.x, store.mousePosition.y, this.vision)
            .stroke({ width: 2, color: 0xff0000 });

        this.entities
            .filter((p) => !this.highlights.find((point: Entity) => p === point))
            .forEach((p) => {
                p.sprite.texture = this.pointTexture;
            });

        this.highlights.forEach((point: Entity) => {
            point.sprite.texture = this.highlightTexture;
        });
    }

    destroy() {
        this.entities.forEach((p) => {
            this.stage.removeChild(p.sprite);
        });

        if (this.gfx) {
            this.stage.removeChild(this.gfx);
            this.gfx.destroy();
        }

        this.stage.off('mousedown', this.onMouseDown, this);
    }
}
