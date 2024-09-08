<template>
  <div class="container">
    <Sidebar @toggle-module="onModuleToggled" />
    <div class="main-content">
      <div class="top-section">
        <h1 class="title">
          {{ title }}
        </h1>
        <p class="description">{{ description }}</p>
      </div>
      <Suspense>
        <template #default>
          <PixiCanvas @system-ready="onSystemReady" />
        </template>
        <template #fallback>
          <ProgressSpinner />
        </template>
      </Suspense>
    </div>
  </div>
</template>

<script setup lang="ts">
import PixiCanvas from 'components/vue/PixiCanvas.vue';
import Sidebar from 'components/vue/Sidebar.vue';
import ProgressSpinner from 'primevue/progressspinner';
import { ref, computed, provide } from 'vue';
import mitt from 'mitt';
import System from './system';
import { ModuleSettings } from './modules/IModule';
import { Events } from './components/events/IEvents';

const eventbus = mitt<Events>();
provide('eventbus', eventbus);

const selectedModule = ref<ModuleSettings | undefined>(undefined);
const system = ref<System | undefined>(undefined);
const moduleOptions = ref<ModuleSettings[]>([]);

const title = computed(() => selectedModule.value?.title ?? 'Natural.Systems');

const description = computed(() => selectedModule.value?.description ?? 'This is a test lorem ipsum sit dolor et amet');

function onSystemReady(sys: System) {
  system.value = sys;
  moduleOptions.value = sys.getModuleSettings();

  provide('system', system);
  provide('moduleOptions', moduleOptions);
  eventbus.emit('modules-ready', moduleOptions.value);
}

function onModuleToggled(module: ModuleSettings) {
  console.log('module toggled', module);

  selectedModule.value = module;
}

</script>

<style>
.container {
  display: flex;
  height: 98vh;
}

.title {
  font-family: var(--p-font-family);
  text-align: center;
  font-size: 3rem;
  margin-top: 1%;
  color: var(--p-primary-500);
}

.description {
  font-family: var(--p-font-family);
  text-align: center;
  font-size: 1.25rem;
  color: var(--p-text-color)
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
