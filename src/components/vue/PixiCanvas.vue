<template>
  <div id="pixi-canvas" />
</template>

<script setup lang="ts">
import config from 'root/config';
import {
  onBeforeUnmount, onMounted, provide, ref,
} from 'vue';
import {
  Application, Text, Renderer, FederatedPointerEvent, isWebGLSupported, Ticker,
} from 'pixi.js';
import store from 'root/store';
import Rect from 'shapes/rect';
import System from 'root/system';
import UrlParam from 'interfaces/urlParam';

if (!isWebGLSupported()) {
  throw new Error('WebGL is not supported');
}

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

const app = ref<Application<Renderer> | null>(null);
provide('app', app);

const appOptions = {
  width: config.WORLD.width,
  height: config.WORLD.height,
  antialias: true, // default: false
  transparent: false, // default: false
  resolution: 1, // default: 1
  backgroundColor: 0xbbbbbb,
};

const application = new Application();
await application.init(appOptions);

store.renderer = application.renderer;
store.worldBoundary = new Rect(0, 0, config.WORLD.width, config.WORLD.height);

application.stage.eventMode = 'static';
application.stage.hitArea = application.screen;
application.stage.addEventListener('pointermove', (e: FederatedPointerEvent) => {
  store.mousePosition.x = e.global.x;
  store.mousePosition.y = e.global.y;
});

const FPSCounter = new Text({ text: 'FPS: 0' });
FPSCounter.scale = 0.75;
FPSCounter.zIndex = 99999;
FPSCounter.x = 5;
FPSCounter.y = 5;

application.stage.addChild(FPSCounter);

const system = new System(application.stage, application.renderer);

function mainLoop(ticker: Ticker) {
  const delta = ticker.deltaTime;
  FPSCounter.text = `FPS: ${Math.round(ticker.FPS)}`;

  system.update(delta);
  system.render();
}

onMounted(() => {
  const canvasDiv = document.getElementById('pixi-canvas');
  if (!canvasDiv) throw new Error('No mounting div found. Cannot append PIXI Canvas to DOM');
  canvasDiv.appendChild(application.canvas);

  const params = getURLParams();
  system.setup(params);

  application.ticker.add(mainLoop);
});

onBeforeUnmount(() => {
  application.stop();
});

</script>
