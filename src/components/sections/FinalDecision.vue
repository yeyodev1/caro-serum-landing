<script setup lang="ts">
import { combos } from '@/config/catalog'
import { useCart } from '@/composables/useCart'
import { useImageLoad } from '@/composables/useImageLoad'

const { addToCart } = useCart()
const { imageLoaded, markImageLoaded } = useImageLoad()

const trio = combos[1]!
const trioMasks = combos[2]!
</script>

<template>
  <!-- SLIDE 12: Última Decisión -->
  <section class="final-decision-section">
    <div class="section-heading centered">
      <p class="eyebrow"><span></span> ÚLTIMA DECISIÓN</p>
      <h2>¿Con cuál empiezas hoy?</h2>
    </div>
    <div class="decision-cards">
      <div class="decision-card">
        <div class="decision-image" :class="{ loaded: imageLoaded(trio.image) }">
          <img :src="trio.image" :alt="trio.name" loading="lazy" @load="markImageLoaded(trio.image)">
        </div>
        <h3>TRÍO COMPLETO</h3>
        <p class="desc">Ahorras $16 · Envío gratis</p>
        <div class="price"><s>$75</s> <strong>$59.00</strong></div>
        <button class="button button-dark" type="button" @click="addToCart(trio)">
          QUIERO EL TRÍO <span>→</span>
        </button>
      </div>
      <div class="decision-card featured">
        <span class="badge best">MEJOR VALOR</span>
        <div class="decision-image" :class="{ loaded: imageLoaded(trioMasks.image) }">
          <img :src="trioMasks.image" :alt="trioMasks.name" loading="lazy" @load="markImageLoaded(trioMasks.image)">
        </div>
        <h3>TRÍO + 5 MASCARILLAS</h3>
        <p class="desc">Rutina completa · Envío gratis</p>
        <div class="price"><s>$90</s> <strong>$69.00</strong></div>
        <button class="button button-dark" type="button" @click="addToCart(trioMasks)">
          QUIERO TODO <span>→</span>
        </button>
      </div>
    </div>
  </section>
</template>
