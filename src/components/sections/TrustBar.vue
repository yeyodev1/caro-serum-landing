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
        <!-- Sin `loading="lazy"`: el logo no tiene alto propio hasta que carga, así que
             la caja mide 0x0 y Chrome nunca dispara la carga diferida. La barra va
             arriba del todo y los tres archivos pesan poco, no hay nada que diferir. -->
        <img :src="logo.src" :alt="logo.alt" @load="markImageLoaded(logo.src)">
      </li>
    </ul>
  </section>
</template>
