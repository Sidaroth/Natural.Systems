import * as PIXI from 'pixi.js';
import Vector from '../math/Vector';
import store from '../store';

export default class Circle {
    x;
    y;
    r;

    sprite;

    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;

        const gfx = new PIXI.Graphics();
        gfx.beginFill(0x00aa00);
        gfx.lineStyle(2, 0x000000);
        gfx.drawCircle(this.x, this.y, this.r);
        gfx.endFill();

        this.sprite = new PIXI.Sprite(store.renderer.generateTexture(gfx));
        this.sprite.position.x = this.x;
        this.sprite.position.y = this.y;
    }

    getRadius() {
        return this.r;
    }

    getPosition() {
        return new Vector(this.x, this.y);
    }
}
