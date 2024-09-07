<template>
  <div class="container">
    <div class="sidebar">
      <div v-for="module in moduleOptions" 
      :key="module.label" 
      class="sidebar-item"
      @click="toggleModule(module)"
      :class="{ 'selected': module === selectedModule }">
        <span>{{ module.label }}</span>
        <ul v-if="module === selectedModule">
          <li v-for="option in module.options" :key="option">{{ option }}</li>
        </ul>
      </div>
    </div>
    <div class="main-content">
      <div class="top-section">
        <h1 class="title"> {{ title }} </h1>
        <p class="description">{{ description }}</p>
      </div>
      <Suspense>
        <template #default>
          <PixiCanvas @system-ready="onSystemReady"/>
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
import ProgressSpinner from 'primevue/progressspinner';
import { ref, computed, onMounted } from 'vue';
import System from './system';
import { ModuleSettings } from './modules/IModule';

onMounted(() => {
});

const selectedModule = ref<ModuleSettings | undefined>(undefined);
const system = ref<System | undefined>(undefined);
const moduleOptions = ref<ModuleSettings[]>([]);

const title = computed(() => {
  return selectedModule.value?.title || 'Natural.Systems';
});

const description = computed(() => {
  return selectedModule.value?.description ?? 'This is a test lorem ipsum sit dolor et amet';
});

function toggleModule(module: ModuleSettings) {
  if (selectedModule.value === module) {
    selectedModule.value = undefined;
  } else {
    selectedModule.value = module;
  }

  system.value?.switchModule(module.id);
}

function onSystemReady(sys: System) {
  system.value = sys;
  moduleOptions.value = sys.getModuleSettings();
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

.sidebar {
  width: 200px;
  padding: 1rem;
  overflow-y: auto;
  border-right: 1px solid var(--p-primary-500);
}

.sidebar-item {
  cursor: pointer;
  padding: 10px;
  position: relative;
  display: block;
}

.sidebar-item span {
  display: inline-block;
  font-family: var(--p-font-family);
  color: var(--p-text-color);
}

.sidebar-item::before {
  content: "";
  position: absolute;
  display: block;
  width: 100%;
  height: 2px;
  bottom: 5px;
  left: 0;
  background-color: var(--p-primary-500);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.sidebar-item:hover::before {
  transform: scaleX(1);
}


.sidebar-item ul {
  list-style-type: none;
  padding-left: 20px;
}
</style>
