<script setup lang="ts">
import { retailersStrip } from '@/config/images'
import { useImageLoad } from '@/composables/useImageLoad'

const { imageLoaded, markImageLoaded } = useImageLoad()
</script>

<template>
  <!-- SLIDE 9: Barra de confianza y puntos de venta -->
  <section class="trust-bar" aria-label="Respaldo de la marca">
    <p class="trust-claim"><b>Marca ecuatoriana</b> · 10 años de experiencia en cejas y pestañas · Disponible en tiendas físicas</p>
    <div class="trust-logos" :class="{ loaded: imageLoaded(retailersStrip) }">
      <img :src="retailersStrip" alt="Disponible en Cejas y Pestañas by ME, Pharmacy's y Gloss Beauty Shop" loading="lazy" @load="markImageLoaded(retailersStrip)">
    </div>
  </section>
</template>
