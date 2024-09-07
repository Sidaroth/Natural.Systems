<template>
  <div class="theme-container">
    <Button :icon="ref(isDarkTheme).value ? 'pi pi-sun' : 'pi pi-moon'" @click="toggleTheme" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import { usePreset } from '@primevue/themes';
import Lara from '@primevue/themes/lara';
import Nora from '@primevue/themes/nora';



const isDarkTheme = ref(false);

const toggleTheme = () => {
  usePreset(ref(isDarkTheme).value ? Lara : Nora);
  isDarkTheme.value = !isDarkTheme.value;
}

</script>

<style scoped>
  .theme-container {
  position: absolute;
  top: 0;
  right: 0;
  margin: 1rem;
  }
</style>
