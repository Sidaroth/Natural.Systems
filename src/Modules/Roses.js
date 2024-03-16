import { Color, Graphics } from 'pixi.js';
import config from '../config';
import Module from './Module';
import degreesToRadians from '../math/degreesToRadians';

// See https://www.wikiwand.com/en/Maurer_rose for formula.
// Interesting petal & d combinations:
// petals = 2; d = 39;
// petals = 3; d = 47;
// petals = 4; d = 31;
// petals = 5; d = 97;
// petals = 6; d = 71;
// petals = 7; d = 19;
export default class Roses extends Module {
    stage = null;

    radius = 300;

    petals = 0; // petals = N if odd, 2n petals if even.

    d = 0;

    outerColor = '#ff0000';

    innerColor = '#0000ff';

    innerWidth = 0;

    outerWidth = 0;

    constructor(stage) {
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

    // setupGUI() {
    //     this.folder = store.gui.addFolder('Rose Settings');
    //     this.folder.add(this, 'radius', 5, 600).listen();
    //     this.folder.add(this, 'petals', 1, 15).listen().onChange((v) => {
    //         this.petals = parseInt(v, 10);
    //     });
    //     this.folder.add(this, 'd', 1, 150).listen().onChange((v) => {
    //         this.d = parseInt(v, 10);
    //     });
    //     this.folder.addColor(this, 'outerColor').listen();
    //     this.folder.add(this, 'outerWidth', 0.1, 10).listen();
    //     this.folder.addColor(this, 'innerColor').listen();
    //     this.folder.add(this, 'innerWidth', 0.1, 10).listen();
    //     this.folder.add(this, 'reset');
    //     this.folder.open();
    // }

    setup() {
        this.reset();
        this.gfx = new Graphics();
        this.stage.addChild(this.gfx);
    }

    reset() {
        this.radius = 300;
        this.petals = 5;
        this.d = 97;
        this.outerColor = new Color('#ff0000');
        this.innerColor = new Color('#0000ff');
        this.innerWidth = 1;
        this.outerWidth = 3;
    }

    render() {
        this.gfx.clear();
        const centerY = config.WORLD.height / 2;
        let centerX = config.WORLD.width / 2;

        if (this.petals === 1) {
            centerX -= this.radius / 2;
        }

        this.gfx.moveTo(centerX, centerY);
        for (let a = 0; a <= 360; a += 1) {
            const k = a * this.d;
            const r = this.radius * Math.sin(degreesToRadians(this.petals * k));
            const x = centerX + (r * Math.sin(degreesToRadians(k)));
            const y = centerY + (r * Math.cos(degreesToRadians(k)));

            this.gfx.lineTo(x, y);
        }
        this.gfx.stroke({ width: this.innerWidth, color: this.innerColor.toHex() });

        // Draws the outer bounds of the rose in a red color. Visually a much more neat look.
        this.gfx.moveTo(centerX, centerY);
        for (let a = 0; a <= 360; a += 1) {
            const k = a;
            const r = this.radius * Math.sin(degreesToRadians(this.petals * k));
            const x = centerX + (r * Math.sin(degreesToRadians(k)));
            const y = centerY + (r * Math.cos(degreesToRadians(k)));

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
