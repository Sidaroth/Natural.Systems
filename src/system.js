import { Text } from 'pixi.js';
import RandomWalker from './modules/RandomWalker';
import GaussianDistribution from './modules/GaussianDistribution';
import NoiseVisualizer from './modules/NoiseVizualizer';
import WindySnow from './modules/WindySnow';
import SAT from './modules/SATModule';
import Boids from './modules/Boids';
import QuadtreeMod from './modules/QuadTreeMod';
import config from './config';
import store from './store';
import Roses from './modules/Roses';
import FractalTreesMod from './modules/FractalTrees';
import ShaderMod from './modules/ShaderMod';
import Raycast from './modules/Raycast';

export default class System {
    constructor(stage, renderer) {
        this.renderer = null;
        this.gui = null;
        this.modules = [];
        this.activeModule = null;
        this.stage = stage;
        this.renderer = renderer;
    }

    setup(params) {
        this.createModules();
        this.fps = 0;
        this.lastTick = 0;
        this.lastFPSUpdate = 0;

        this.startText = new Text({ text: 'Use the selector to select a module' });
        this.startText.anchor.set(0.5, 0.5);
        this.startText.x = config.WORLD.width / 2;
        this.startText.y = (config.WORLD.height / 2) - (this.startText.height * 2);
        this.stage.addChild(this.startText);

        this.warningText = new Text({ text: 'Some of the modules use new/experimental browser features.\nThey may not work in your browser version.' });

        this.warningText.anchor.set(0.5, 0.5);
        this.warningText.x = config.WORLD.width / 2;
        this.warningText.y = config.WORLD.height / 2;
        this.stage.addChild(this.warningText);

        if (params.module) {
            const startingModule = this.modules.find((m) => m.name === params.module);
            if (startingModule) {
                this.switchModule(startingModule.id);
            }
        }
    }

    switchModule(id) {
        const mod = this.modules.find((m) => m.id === id);
        if (mod) {
            if (this.startText) this.stage.removeChild(this.startText);
            if (this.warningText) this.stage.removeChild(this.warningText);
            if (this.activeModule) this.activeModule.destroy();

            if (mod.backgroundColor !== undefined) {
                store.app.renderer.backgroundColor = mod.backgroundColor;
            } else {
                store.app.renderer.backgroundColor = 0xdddddd;
            }

            mod.setup();
            this.activeModule = mod;
            document.getElementById('description').innerHTML = mod.description;
        }
    }

    createModules() {
        this.modules.push(new RandomWalker(this.stage, 200, 200));
        this.modules.push(new GaussianDistribution(this.stage));
        this.modules.push(new NoiseVisualizer(this.stage));
        this.modules.push(new WindySnow(this.stage));
        this.modules.push(new SAT(this.stage));
        this.modules.push(new Boids(this.stage));
        this.modules.push(new QuadtreeMod(this.stage));
        this.modules.push(new Roses(this.stage));
        this.modules.push(new FractalTreesMod(this.stage));
        this.modules.push(new ShaderMod(this.stage));
        this.modules.push(new Raycast(this.stage));
    }

    update(delta) {
        const now = Date.now();
        if (now - this.lastFPSUpdate > 200) {
            this.lastFPSUpdate = now;
        }
        this.lastTick = now;

        if (this.activeModule) {
            this.activeModule.update(delta);
        }
    }

    render() {
        if (this.activeModule) {
            this.activeModule.render();
        }
    }

    destroy() {
        this.modules.forEach((mod) => mod.destroy());

        this.startText.destroy();
        this.warningText.destroy();
        this.stage.destroy();
        this.renderer.destroy();
    }
}
