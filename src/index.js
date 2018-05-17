import * as PIXI from 'pixi.js';
import System from './system';
import config from './config';

let type = 'WebGL';
if (!PIXI.utils.isWebGLSupported) {
    type = 'canvas';
}

PIXI.utils.sayHello(type);
const app = new PIXI.Application({
    width: config.WORLD.width,
    height: config.WORLD.height,
    antialias: true, // default: false
    transparent: false, // default: false
    resolution: 1, // default: 1
});

const content = document.getElementById('content');
content.appendChild(app.view);
app.renderer.backgroundColor = 0xdddddd;
app.renderer.view.style.position = 'absolute';
app.renderer.view.style.display = 'block';
app.renderer.view.style.margin = 'auto';
app.renderer.view.style.padding = 0;
app.renderer.view.style.top = 0;
app.renderer.view.style.bottom = 0;
app.renderer.view.style.left = 0;
app.renderer.view.style.right = 0;

const system = new System(app.stage, app.renderer);

function mainLoop(delta) {
    system.update(delta);
    system.render();
}

function start() {
    system.setup();

    app.ticker.add(delta => mainLoop(delta));
}

start();
