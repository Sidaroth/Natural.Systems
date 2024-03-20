<template>
  <div class="theme-container">
    <Button :icon="ref(isDarkTheme).value ? 'pi pi-sun' : 'pi pi-moon'" @click="toggleTheme" />
  </div>
</template>

<script setup lang="ts">
import { usePrimeVue } from 'primevue/config';
import { ref, onMounted } from 'vue';
import Button from 'primevue/button';

const PrimeVue = usePrimeVue();
const isDarkTheme = ref(true);

const toggleTheme = () => {
  if (isDarkTheme.value) {
    PrimeVue.changeTheme('lara-dark-teal', 'lara-light-teal', 'theme-link');
  } else {
    PrimeVue.changeTheme('lara-light-teal', 'lara-dark-teal', 'theme-link');
  }

  isDarkTheme.value = !isDarkTheme.value;
};

onMounted(() => {
  PrimeVue.changeTheme('lara-light-teal', 'lara-dark-teal', 'theme-link');
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
