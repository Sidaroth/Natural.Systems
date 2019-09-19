import * as PIXI from 'pixi.js';
import System from './system';
import config from './config';
import store from './store';

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

store.app = app;
store.renderer = app.renderer;

// Source code link.
const div = document.createElement('div');
const sourceTag = document.createElement('a');
sourceTag.setAttribute('href', 'https://github.com/Sidaroth/Natural.Systems');
sourceTag.innerHTML = 'Source code';
div.appendChild(sourceTag);
content.appendChild(div);

const system = new System(app.stage, app.renderer);

function mainLoop(delta) {
    system.update(delta);
    system.render();
}

function getURLParams() {
    const params = {};
    const query = decodeURIComponent(window.location.href.slice(window.location.href.indexOf('?') + 1));
    query.split('&').forEach((param, k) => {
        const parts = param.split('=', 2);
        const key = parts[0];
        const value = parts[1];
        params[key] = value;
    });

    return params;
}

function start() {
    const params = getURLParams();
    system.setup(params);

    app.ticker.add(delta => mainLoop(delta));
}

start();
