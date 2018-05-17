import * as dat from 'dat.gui';
import RandomWalker from './Modules/RandomWalker';
import GaussianDistribution from './Modules/GaussianDistribution';
import config from './config';

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

    setup() {
        this.createModules();
        this.setupGui();

        this.startText = new PIXI.Text('Use the selector to select a module');
        this.startText.anchor.set(0.5, 0.5);
        this.startText.x = config.WORLD.width / 2;
        this.startText.y = config.WORLD.height / 2;
        this.stage.addChild(this.startText);
    }

    setupGui() {
        this.gui = new dat.GUI();
        this.gui.addFolder('Module Select');
        this.guiData = {
            active: '',
        };
        const guiController = this.gui.add(this.guiData, 'active', { Walker: this.walker.id, gaussianDistrib: this.gaussianDistrib.id });

        guiController.onChange((id) => {
            this.switchModule(id);
        });
    }

    switchModule(id) {
        const mod = this.modules.find(m => m.id === id);
        if (mod) {
            if (this.startText) this.stage.removeChild(this.startText);
            if (this.activeModule) this.activeModule.clear();

            mod.setup();
            this.activeModule = mod;
        }
    }

    createModules() {
        this.walker = new RandomWalker(this.stage, 200, 200);
        this.gaussianDistrib = new GaussianDistribution(this.stage);

        this.modules.push(this.walker);
        this.modules.push(this.gaussianDistrib);
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
        this.renderer.render(this.stage);
    }
}
