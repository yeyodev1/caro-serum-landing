<script setup lang="ts">
</script>

<template>
  <div class="app-container">
    <RouterView v-slot="{ Component, route }">
      <!-- Solo el panel funde entre vistas; la landing monta directo. -->
      <Transition :name="route.meta?.motion ? 'view' : ''" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </div>
</template>

<style lang="scss">
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
