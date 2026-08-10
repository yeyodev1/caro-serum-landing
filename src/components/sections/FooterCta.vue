<script setup lang="ts">
import { combos } from '@/config/catalog'
import { useCart } from '@/composables/useCart'

const { addToCart } = useCart()
</script>

<template>
  <!-- SLIDE 13: Footer CTA & Footer -->
  <section class="footer-cta-banner">
    <div class="banner-content">
      <p class="eyebrow banner-eyebrow"><span></span> EMPIEZA HOY</p>
      <h2>Dentro de 28 días agradecerás<br><em>haber comenzado hoy.</em></h2>
      <p class="banner-copy">
        Elige el sérum que mejor encaja contigo y dale a tus cejas y pestañas el cuidado constante que merecen.
      </p>
      <button class="button button-dark" type="button" @click="addToCart(combos[1]!)">
        QUIERO EMPEZAR HOY! <span>→</span>
      </button>
      <div class="trust-footer-badges">
        <span>Compra segura · Envíos a Ecuador</span>
      </div>
    </div>
  </section>
</template>
