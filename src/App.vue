<template>
  <div class="container">
    <div class="top-section">
      <h1 class="title">
        Natural.Systems
      </h1>
      <p class="description">This is a test lorem ipsum sit dolor et amet</p>
    </div>
    <Suspense>
      <template #default>
        <PixiCanvas />
      </template>
      <template #fallback>
        <ProgressSpinner />
      </template>
    </Suspense>
    <ThemeChanger />
  </div>
</template>

<script setup lang="ts">
import PixiCanvas from 'components/vue/PixiCanvas.vue';
import ProgressSpinner from 'primevue/progressspinner';
import ThemeChanger from 'components/vue/ThemeChanger.vue';

</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh; /* Adjust as needed */
}

.top-section {
  margin-top: 1rem;
}

body {
    background-color: var(--surface-b);
}

.title {
    font-family: var(--font-family);
    text-align: center;
    font-size: 3rem;
    margin-top: 1%;
    color: var(--primary-500);
}

.description {
    font-family: var(--font-family);
    text-align: center;
    font-size: 1.25rem;
}
</style>
