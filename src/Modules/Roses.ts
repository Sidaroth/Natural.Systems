import { Color, Container, Graphics } from 'pixi.js';
import degreesToRadians from 'math/degreesToRadians';
import config from 'root/config';
import Module from 'modules/Module';

// See https://www.wikiwand.com/en/Maurer_rose for formula.
// Interesting petal & d combinations:
// petals = 2; d = 39;
// petals = 3; d = 47;
// petals = 4; d = 31;
// petals = 5; d = 97;
// petals = 6; d = 71;
// petals = 7; d = 19;
export default class Roses extends Module {
    backgroundColor?: number;

    stage: Container;

    radius: number = 300;

    petals: number = 0; // petals = N if odd, 2n petals if even.

    angleMultiplier: number = 0; // d

    outerColor: Color = new Color('#ff0000');

    innerColor: Color = new Color('#0000ff');

    innerWidth: number = 0;

    outerWidth: number = 0;

    gfx: Graphics = new Graphics();

    constructor(stage: Container) {
        super();
        this.stage = stage;
        this.name = 'roses';
        this.description = `Visualization of Maurer roses. 
        Some combinations of petals (n) and d work better than others.
        
        <br/><br/>Some examples:<br/>
        petals = 2; d = 39;<br/>
        petals = 3; d = 47;<br/>
        petals = 4; d = 31;<br/>
        petals = 5; d = 97;<br/>
        petals = 6; d = 71;<br/>
        petals = 7; d = 19;<br/><br/>
        Make use of the panel on the right to play around with some settings.`;
    }

    setup() {
        this.reset();
        this.gfx = new Graphics();
        this.stage.addChild(this.gfx);
    }

    reset() {
        this.radius = 300;
        this.petals = 5;
        this.angleMultiplier = 97;
        this.outerColor = new Color('#ff0000');
        this.innerColor = new Color('#0000ff');
        this.innerWidth = 1;
        this.outerWidth = 3;
    }

    /* eslint-disable */
    update(delta: number): void { }
    /* eslint-enable */

    render() {
        this.gfx.clear();
        const centerY = config.WORLD.height / 2;
        let centerX = config.WORLD.width / 2;

        if (this.petals === 1) {
            centerX -= this.radius / 2;
        }

        this.gfx.moveTo(centerX, centerY);
        for (let angle = 0; angle <= 360; angle += 1) {
            const rotation = angle * this.angleMultiplier;

            // Radial coordinate in a polar coordinate system.
            const radial = this.radius * Math.sin(degreesToRadians(this.petals * rotation));
            const x = centerX + (radial * Math.sin(degreesToRadians(rotation)));
            const y = centerY + (radial * Math.cos(degreesToRadians(rotation)));

            this.gfx.lineTo(x, y);
        }
        this.gfx.stroke({ width: this.innerWidth, color: this.innerColor.toHex() });

        // Draws the outer bounds of the rose in a red color. Visually a much more neat look.
        this.gfx.moveTo(centerX, centerY);
        for (let angle = 0; angle <= 360; angle += 1) {
            // Radial coordinate in a polar coordinate system.
            const radial = this.radius * Math.sin(degreesToRadians(this.petals * angle));
            const x = centerX + (radial * Math.sin(degreesToRadians(angle)));
            const y = centerY + (radial * Math.cos(degreesToRadians(angle)));

            this.gfx.lineTo(x, y);
        }
        this.gfx.stroke({ width: this.outerWidth, color: this.outerColor.toHex() });
    }

    destroy() {
        if (this.gfx) {
            this.stage.removeChild(this.gfx);
            this.gfx.destroy();
        }
    }
}
