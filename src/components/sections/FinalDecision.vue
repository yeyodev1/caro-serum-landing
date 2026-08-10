<script setup lang="ts">
import { combos } from '@/config/catalog'
import { useCart } from '@/composables/useCart'

const { addToCart } = useCart()
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
        <h3>TRÍO COMPLETO</h3>
        <p class="desc">Ahorras $16 · Envío gratis</p>
        <div class="price"><s>$75</s> <strong>$59.00</strong></div>
        <button class="button button-dark" type="button" @click="addToCart(combos[1]!)">
          QUIERO EL TRÍO <span>→</span>
        </button>
      </div>
      <div class="decision-card featured">
        <span class="badge best">MEJOR VALOR</span>
        <h3>TRÍO + 5 MASCARILLAS</h3>
        <p class="desc">Rutina completa · Envío gratis</p>
        <div class="price"><s>$90</s> <strong>$69.00</strong></div>
        <button class="button button-dark" type="button" @click="addToCart(combos[2]!)">
          QUIERO TODO <span>→</span>
        </button>
      </div>
    </div>
  </section>
</template>
