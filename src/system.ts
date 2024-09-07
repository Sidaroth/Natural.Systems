import { Container, Renderer, Text } from 'pixi.js';
import RandomWalker from './modules/RandomWalker';
import GaussianDistribution from './modules/GaussianDistribution';
import NoiseVisualizer from './modules/NoiseVizualizer';
import WindySnow from './modules/WindySnow';
import SAT from './modules/SATModule';
import Boids from './modules/Boids';
import QuadtreeMod from './modules/QuadTreeMod';
import config from './config';
import Roses from './modules/Roses';
import FractalTreesMod from './modules/FractalTrees';
import Raycast from './modules/Raycast';
import Module from './modules/Module';

export default class System {
    modules: Module[];

    activeModule: Module | null;

    stage: Container;

    renderer: Renderer;

    fps: number;

    lastTick: number;

    lastFPSUpdate: number;

    startText: Text;

    warningText: Text;

    constructor(stage: Container, renderer: Renderer) {
        this.modules = [];
        this.activeModule = null;
        this.stage = stage;
        this.renderer = renderer;

        this.fps = 0;
        this.lastTick = -Infinity;
        this.lastFPSUpdate = -Infinity;
        this.startText = new Text({ text: 'Use the selector to select a module' });
        this.warningText = new Text({ text: 'Requires WebGL and an up to date browser' });
    }

    setup() {
        this.createModules();

        this.startText.anchor.set(0.5, 0.5);
        this.startText.x = config.WORLD.width / 2;
        this.startText.y = (config.WORLD.height / 2) - (this.startText.height * 2);
        this.stage.addChild(this.startText);

        this.warningText.anchor.set(0.5, 0.5);
        this.warningText.x = config.WORLD.width / 2;
        this.warningText.y = config.WORLD.height / 2;
        this.stage.addChild(this.warningText);
    }

    switchModule(id: string) {
        const module = this.modules.find((m) => m.id === id);
        if (!module) return;

        if (this.startText) this.stage.removeChild(this.startText);
        if (this.warningText) this.stage.removeChild(this.warningText);
        if (this.activeModule) this.activeModule.destroy();

        // TODO Fix
        // if (module.backgroundColor !== undefined) {
        //     this.renderer.backgroundColor = module.backgroundColor;
        // } else {
        //     this.renderer.backgroundColor = 0xdddddd;
        // }

        module.setup();
        this.activeModule = module;
        const description = document.getElementById('description');
        if (description) {
            description.textContent = module.description;
        }
    }

    getModuleSettings() {
        console.log('requesting module options');
        return this.modules.map((mod) => mod.getSettings());
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
        this.modules.push(new Raycast(this.stage));
    }

    update(delta: number) {
        const now = Date.now();
        this.lastTick = now;

        if (this.activeModule && this.activeModule.update) {
            this.activeModule.update(delta);
        }
    }

    render() {
        if (this.activeModule && this.activeModule.render) {
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
