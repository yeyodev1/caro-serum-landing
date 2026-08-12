<script setup lang="ts">
import { rulerImage } from '@/config/images'
import { useImageLoad } from '@/composables/useImageLoad'

const { imageLoaded, markImageLoaded } = useImageLoad()
</script>

<template>
  <!-- SLIDE 6: La Regla de Constancia -->
  <section id="constancia" class="constancy-section">
    <div class="constancy-content">
      <div class="constancy-copy">
        <p class="eyebrow"><span></span> LA REGLA OMGLASHES</p>
        <!-- El titular “Consejo: la constancia vende más…” salió del deck como
             nota interna, no como copy para la clienta: Carolina pidió quitarlo. -->
        <h2>Comprueba tu avance<br><em>sin adivinar.</em></h2>
        <p class="constancy-tip">Los cambios diarios pueden ser difíciles de notar. Por eso creamos una forma sencilla de comprobar tu constancia: <strong>la Regla de Medición OMGLASHES</strong>.</p>
        <div class="constancy-steps">
          <div><b>01</b><span>Mide tus pestañas el Día 1</span></div>
          <div><b>02</b><span>Aplica OMG Lashes día y noche</span></div>
          <div><b>03</b><span>Comprueba tu avance exacto a los 28 días</span></div>
        </div>
      </div>
      <div class="constancy-visual" :class="{ loaded: imageLoaded(rulerImage) }">
        <img :src="rulerImage" alt="Regla de medición OMGLASHES" loading="lazy" @load="markImageLoaded(rulerImage)">
      </div>
    </div>
  </section>
</template>
