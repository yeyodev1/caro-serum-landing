<script setup lang="ts">
import { useCart } from '@/composables/useCart'

const { isCartOpen } = useCart()
</script>

<template>
  <button class="announcement" type="button" @click="isCartOpen = true">
    ENVÍO GRATIS EN TODOS LOS COMBOS <span>·</span> RESULTADOS VISIBLES EN 28 DÍAS <b>COMPRAR OMGLASHES →</b>
  </button>
</template>
