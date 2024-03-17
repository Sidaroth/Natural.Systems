import { Graphics } from 'pixi.js';
import Vector from 'math/Vector';
import store from 'root/store';

export default function createBoidTextures(size: number = 8.5) {
    const boidWidth = size;
    const boidHeight = boidWidth * 2.5;

    const textures = [];
    const p1 = new Vector(0, 0);
    const p2 = new Vector(-boidWidth, boidHeight);
    const p3 = new Vector(boidWidth, boidHeight);
    const gfx = new Graphics();

    let scalar = 1;
    const colors = [0x03a9f4, 0x009688, 0x607d8b, 0x00bcd4];
    for (let i = 0; i < colors.length; i += 1) {
        scalar += 0.1;

        gfx.clear();
        gfx.moveTo(p1.x / scalar, p1.x / scalar);
        gfx.lineTo(p2.x / scalar, p2.y / scalar);
        gfx.lineTo(p3.x / scalar, p3.y / scalar);
        gfx.fill(colors[i]);

        const texture = store.renderer?.generateTexture(gfx);
        if (texture) textures.push(texture);
    }

    return textures;
}
