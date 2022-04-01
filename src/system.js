import * as dat from 'dat.gui';
import * as PIXI from 'pixi.js';
import RandomWalker from './Modules/RandomWalker';
import GaussianDistribution from './Modules/GaussianDistribution';
import NoiseVisualizer from './Modules/NoiseVizualizer';
import WindySnow from './Modules/WindySnow';
import SAT from './Modules/SATModule';
import Boids from './Modules/Boids';
import QuadtreeMod from './Modules/QuadTreeMod';
import config from './config';
import store from './store';
import Roses from './Modules/Roses';
import FractalTreesMod from './Modules/FractalTrees';
import ShaderMod from './Modules/ShaderMod';
import Raycast from './Modules/Raycast';

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
        this.setupGui();
        this.fps = 0;
        this.lastTick = 0;
        this.lastFPSUpdate = 0;

        this.startText = new PIXI.Text('Use the selector to select a module');
        this.startText.anchor.set(0.5, 0.5);
        this.startText.x = config.WORLD.width / 2;
        this.startText.y = config.WORLD.height / 2 - this.startText.height * 2;
        this.stage.addChild(this.startText);

        this.warningText = new PIXI.Text('Some of the modules use new/experimental browser features.\nThey may not work in your browser version.');

        this.warningText.anchor.set(0.5, 0.5);
        this.warningText.x = config.WORLD.width / 2;
        this.warningText.y = config.WORLD.height / 2;
        this.stage.addChild(this.warningText);

        if (params.module) {
            const startingModule = this.modules.find(m => m.name === params.module);
            if (startingModule) {
                this.switchModule(startingModule.id);
            }
        }
    }

    setupGui() {
        this.gui = new dat.GUI();
        this.gui.addFolder('Module Select');
        this.guiData = {
            active: '',
            fps: 0,
        };

        store.gui = this.gui;

        // Generate an object for dat.gui that contains name -> id references for each module.
        const modules = this.modules.reduce((obj, mod) => {
            obj[mod.name] = mod.id;
            return obj;
        }, {});

        const guiController = this.gui.add(this.guiData, 'active', modules);
        guiController.onChange(id => this.switchModule(id));
        this.gui.add(this.guiData, 'fps').listen();
    }

    switchModule(id) {
        const mod = this.modules.find(m => m.id === id);
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
            this.guiData.fps = Math.floor(1000 / (now - this.lastTick));
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
        this.modules.forEach(mod => mod.destroy());

        this.startText.destroy();
        this.warningText.destroy();
        this.gui.destroy();
        this.stage.destroy();
        this.renderer.destroy();
    }
}
