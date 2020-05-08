import Vector from '../math/Vector';
import store from '../store';
import * as PIXI from 'pixi.js';

export default function createBoidTextures(size = 8.5) {
    const boidWidth = size;
    const boidHeight = boidWidth * 2.5;

    const textures = [];
    const p1 = new Vector(0, 0);
    const p2 = new Vector(-boidWidth, boidHeight);
    const p3 = new Vector(boidWidth, boidHeight);
    const gfx = new PIXI.Graphics();

    let scalar = 1;
    const colors = [0x03a9f4, 0x009688, 0x607d8b, 0x00bcd4];
    for (let i = 0; i < colors.length; i += 1) {
        scalar += 0.1;

        gfx.clear();
        gfx.beginFill(colors[i]);
        gfx.moveTo(p1.x / scalar, p1.x / scalar);
        gfx.lineTo(p2.x / scalar, p2.y / scalar);
        gfx.lineTo(p3.x / scalar, p3.y / scalar);
        gfx.endFill();

        textures.push(store.renderer.generateTexture(gfx));
    }

    return textures;
}
