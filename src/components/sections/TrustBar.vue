<script setup lang="ts">
import { retailerLogos } from '@/config/images'
import { useImageLoad } from '@/composables/useImageLoad'

const { imageLoaded, markImageLoaded } = useImageLoad()
</script>

<template>
  <!-- SLIDE 9: Barra de confianza y puntos de venta -->
  <section class="trust-bar" aria-label="Respaldo de la marca">
    <p class="trust-claim"><b>Marca ecuatoriana</b> · 10 años de experiencia en cejas y pestañas · Disponible en tiendas físicas</p>
    <!-- Un archivo por tienda, no una sola tira: cada logo mantiene su nitidez. -->
    <ul class="trust-logos">
      <li
        v-for="logo in retailerLogos" :key="logo.src"
        class="trust-logo" :class="{ loaded: imageLoaded(logo.src), plated: !!logo.plate }"
        :style="{ '--logo-width': `${logo.width}px`, '--logo-plate': logo.plate }">
        <img :src="logo.src" :alt="logo.alt" loading="lazy" @load="markImageLoaded(logo.src)">
      </li>
    </ul>
  </section>
</template>
