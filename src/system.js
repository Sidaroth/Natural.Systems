import RandomWalker from './RandomWalker';

export default class System {
    stage = null;
    renderer = null;

    constructor(stage, renderer) {
        this.stage = stage;
        this.renderer = renderer;
    }

    setup() {
        this.walker = new RandomWalker(this.stage, 200, 200);
        this.walker.setup();
    }

    update(delta) {
        this.walker.update(delta);
    }

    render() {
        this.walker.render();
        this.renderer.render(this.stage);
    }
}
