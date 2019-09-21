import * as dat from 'dat.gui';
import * as PIXI from 'pixi.js';
import RandomWalker from './Modules/RandomWalker';
import GaussianDistribution from './Modules/GaussianDistribution';
import NoiseVisualizer from './Modules/NoiseVizualizer';
import WindySnow from './Modules/WindySnow';
import SAT from './Modules/SATModule';
import config from './config';
import Boids from './Modules/BoidsModule';
import store from './store';

export default class System {
    stage = null;
    renderer = null;
    gui = null;
    modules = [];
    activeModule = null;

    constructor(stage, renderer) {
        this.stage = stage;
        this.renderer = renderer;
    }

    setup(params) {
        this.createModules();
        this.setupGui();

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
        };

        store.gui = this.gui;

        // Generate an object for dat.gui that contains name -> id references for each module.
        const modules = this.modules.reduce((obj, mod) => {
            obj[mod.name] = mod.id;
            return obj;
        }, {});

        const guiController = this.gui.add(this.guiData, 'active', modules);
        guiController.onChange(id => this.switchModule(id));
    }

    switchModule(id) {
        const mod = this.modules.find(m => m.id === id);
        if (mod) {
            if (this.startText) this.stage.removeChild(this.startText);
            if (this.warningText) this.stage.removeChild(this.warningText);
            if (this.activeModule) this.activeModule.destroy();

            mod.setup();
            this.activeModule = mod;
        }
    }

    createModules() {
        this.walker = new RandomWalker(this.stage, 200, 200);
        this.gaussianDistrib = new GaussianDistribution(this.stage);
        this.basicNoise = new NoiseVisualizer(this.stage);
        this.windySnow = new WindySnow(this.stage);
        this.sat = new SAT(this.stage);
        this.boids = new Boids(this.stage);

        this.modules.push(this.walker);
        this.modules.push(this.gaussianDistrib);
        this.modules.push(this.basicNoise);
        this.modules.push(this.windySnow);
        this.modules.push(this.sat);
        this.modules.push(this.boids);
    }

    update(delta) {
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
