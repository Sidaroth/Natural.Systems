<template>
  <div class="sidebar">
    <div v-for="module in moduleOptions" :key="module.label" class="sidebar-item" @click="toggleModule(module)"
      :class="{ 'selected': module === selectedModule }">
      <span>{{ module.label }}</span>
      <ul v-if="module === selectedModule">
        <li v-for="option in module.options" :key="option">{{ option }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Emitter } from 'mitt';
import { ModuleSettings } from 'root/modules/IModule';
import { ref, onMounted, inject } from 'vue';
import { Events } from '../events/IEvents';
import System from 'root/system';

const emits = defineEmits(['toggle-module']);

const selectedModule = ref<ModuleSettings>();
const moduleOptions = ref<ModuleSettings[]>([]);
const system = ref<System>();
const eventbus = ref<Emitter<Events>>();

function toggleModule(module: ModuleSettings) {
  if (selectedModule.value === module) {
    selectedModule.value = undefined;
  } else {
    selectedModule.value = module;
  }

  emits('toggle-module', selectedModule.value);
}

function onModulesReady(modules: ModuleSettings[]) {
  moduleOptions.value = modules;
}

onMounted(() => {
  eventbus.value = inject<Emitter<Events>>('eventbus');
  system.value = inject('system');

  if (eventbus) {
    eventbus.value?.on('modules-ready', onModulesReady);

    if (!system.value) {
      eventbus.value?.on('system-ready', (sys) => {
        system.value = sys;
        moduleOptions.value = sys.getModuleSettings();
      });
    }
  }
});

</script>

<style scoped>
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