<script setup lang="ts">
import { applicationSteps } from '@/config/landing-content'
import { howToApplyImage } from '@/config/images'
import { products } from '@/config/catalog'
import { useCart } from '@/composables/useCart'
import { useImageLoad } from '@/composables/useImageLoad'

const { addToCart } = useCart()
const { imageLoaded, markImageLoaded } = useImageLoad()
</script>

<template>
  <!-- SLIDE 8: Solo toma unos segundos -->
  <section id="aplicacion" class="howto-section">
    <div class="section-heading centered">
      <p class="eyebrow"><span></span> FÁCIL DE USAR</p>
      <h2>Solo toma <em>unos segundos.</em></h2>
    </div>
    <div class="howto-content">
      <ol class="howto-steps">
        <li v-for="(step, idx) in applicationSteps" :key="step.title">
          <b>{{ idx + 1 }}</b>
          <div><h3>{{ step.title }}</h3><p>{{ step.detail }}</p></div>
        </li>
      </ol>
      <div class="howto-visual">
        <figure :class="{ loaded: imageLoaded(howToApplyImage) }">
          <img :src="howToApplyImage" alt="Cómo aplicar OMG Lashes en cejas y pestañas" loading="lazy" @load="markImageLoaded(howToApplyImage)">
        </figure>
        <p class="howto-caption">No necesitas utilizar mucho producto. Lo más importante es ser constante.</p>
      </div>
    </div>
    <button class="button button-dark howto-cta" type="button" @click="addToCart(products[0]!)">
      EMPEZAR MI RUTINA OMGLASHES <span>→</span>
    </button>
  </section>
</template>
