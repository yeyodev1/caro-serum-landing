<script setup lang="ts">
import { masks, formatPrice } from '@/config/catalog'
import { maskHeroBanner, maskProductImage } from '@/config/images'
import { useCart } from '@/composables/useCart'
import { useImageLoad } from '@/composables/useImageLoad'

const { addToCart } = useCart()
const { imageLoaded, markImageLoaded } = useImageLoad()
</script>

<template>
  <!-- SLIDE 10: Mascarilla Hidrotensora (Upsell Piel de Cristal) -->
  <section id="mascarilla" class="upsell">
    <div class="upsell-copy">
      <div class="mask-image" :class="{ loaded: imageLoaded(maskHeroBanner) }">
        <img :src="maskHeroBanner" alt="Mascarilla de colágeno OMG Lashes - Piel de cristal" loading="lazy" @load="markImageLoaded(maskHeroBanner)">
      </div>
      <p class="eyebrow"><span></span> COMPLETA TU MOMENTO OMG.</p>
      <h2>Piel de Cristal con<br><em>Mascarilla hidrotensora</em></h2>
      <p>
        Hidratación profunda de colágeno.
        Pasa de blanco a transparente cuando ya se absorbió por completo.
        Complementando tu rutina facial.
      </p>
    </div>
    <div class="mask-options">
      <img :src="maskProductImage" alt="Mascarilla de colágeno hydrogel OMG" loading="lazy" :class="{ loaded: imageLoaded(maskProductImage) }" @load="markImageLoaded(maskProductImage)">
      <p>AGREGA A TU PEDIDO</p>
      <div class="mask-buttons">
        <button v-for="mask in masks" :key="mask.id" type="button" @click="addToCart(mask)">
          <span>{{ mask.size }}</span>
          <b>{{ formatPrice(mask.price) }}</b>
          <i>+ AGREGAR</i>
        </button>
      </div>
    </div>
  </section>
</template>
