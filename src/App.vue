<template>
  <div id="main">
    <div id="top-section">
      <h1>TEST TITLE</h1>
    </div>
    <Suspense>
      <template #default>
        <PixiCanvas />
      </template>
      <template #fallback>
        <div> Loading... </div>
      </template>
    </Suspense>
  </div>
</template>

<script setup lang="ts">
import PixiCanvas from 'components/vue/PixiCanvas.vue';

</script>

<style>
#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
</style>
