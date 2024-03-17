import { Application, Ticker, isWebGLSupported } from 'pixi.js';
import Rect from 'shapes/rect';
import UrlParam from 'interfaces/urlParam';
import System from './system';
import config from './config';
import store from './store';

const app = new Application();
const options = {
    width: config.WORLD.width,
    height: config.WORLD.height,
    antialias: true, // default: false
    transparent: false, // default: false
    resolution: 1, // default: 1
    backgroundColor: 0xbbbbbb,
};
await app.init(options);

if (!isWebGLSupported()) {
    throw new Error('WebGL is not supported');
}

const content = document.getElementById('app');
if (!content) throw new Error('No div "app" found. Cannot append PIXI Canvas to DOM');

content.appendChild(app.canvas);

store.app = app;
store.renderer = app.renderer;
store.worldBoundary = new Rect(0, 0, config.WORLD.width, config.WORLD.height);

// Replaces renderer.plugins.interaction.mouse.global in Pixi v7+
app.stage.eventMode = 'static';
app.stage.hitArea = app.screen;
app.stage.addEventListener('pointermove', (e) => {
    store.mousePosition.x = e.global.x;
    store.mousePosition.y = e.global.y;
});

// Source code link.
const div = document.createElement('div');
const sourceTag = document.createElement('a');
sourceTag.setAttribute('href', 'https://github.com/Sidaroth/Natural.Systems');
sourceTag.innerHTML = 'Source code';
div.appendChild(sourceTag);
content.appendChild(div);

const descriptionDiv = document.createElement('div');
const p = document.createElement('p');
p.innerHTML = 'Placeholder Description';
p.id = 'description';
descriptionDiv.appendChild(p);
content.appendChild(descriptionDiv);

function getURLParams(): UrlParam {
    const params: UrlParam = {};
    const query = decodeURIComponent(window.location.href.slice(window.location.href.indexOf('?') + 1));
    query.split('&').forEach((param) => {
        const parts = param.split('=', 2);
        const key = parts[0];
        const value = parts[1];

        if (key !== undefined && value !== undefined) {
            params[key] = value;
        }
    });

    return params;
}

const system = new System(app.stage, app.renderer);

function mainLoop(ticker: Ticker) {
    const delta = ticker.deltaTime;

    system.update(delta);
    system.render();
}

function start() {
    const params = getURLParams();
    system.setup(params);

    app.ticker.add(mainLoop);
}

start();
