<template>
  <div class="theme-container">
    <Button :icon="ref(isDarkTheme).value ? 'pi pi-sun' : 'pi pi-moon'" @click="toggleTheme" />
  </div>
</template>

<script setup lang="ts">
import { usePreset } from '@primevue/themes';
import { ref, onMounted } from 'vue';
import Button from 'primevue/button';

const isDarkTheme = ref(true);

const toggleTheme = () => {
  if (isDarkTheme.value) {
    usePreset('lara-light-teal');
  } else {
    usePreset('lara-dark-teal');
  }

  isDarkTheme.value = !isDarkTheme.value;
};

onMounted(() => {
  usePreset('lara-dark-teal');
  isDarkTheme.value = true;
});

</script>

<style scoped>
  .theme-container {
  position: absolute;
  top: 0;
  right: 0;
  margin: 1rem;
  }
</style>
