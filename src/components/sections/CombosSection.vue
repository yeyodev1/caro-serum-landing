<script setup lang="ts">
import { combos, comboCompareAt, featuredComboIds, formatPrice, products } from '@/config/catalog'
import { useCart } from '@/composables/useCart'
import { useImageLoad } from '@/composables/useImageLoad'

const { addToCart } = useCart()
const { imageLoaded, markImageLoaded } = useImageLoad()
</script>

<template>
  <!-- SLIDE 4 & 5: Encuentra tu OMGLASHES / Packs & Rutinas -->
  <section id="combos" class="combos-section">
    <div class="combo-heading">
      <p class="eyebrow"><span></span> MÁS CONSTANCIA · MÁS AHORRO</p>
      <h2>ENCUENTRA TU OMGLASHES</h2>
      <p class="combo-lead">Elige cómo quieres empezar.</p>
      <h3 class="combo-subheading">Elige tu rutina OMGLASHES</h3>
      <p>Obtén producto para más tiempo, evita interrumpir tu rutina y recibe <strong>Envío GRATIS</strong>.</p>
    </div>
    <div class="combo-grid">
      <article
        v-for="combo in combos" :key="combo.id" class="combo-card"
        :class="{ featured: featuredComboIds.includes(combo.id) }">
        <div class="combo-image" :class="{ loaded: imageLoaded(combo.image) }">
          <img :src="combo.image" :alt="combo.name" loading="lazy" @load="markImageLoaded(combo.image)">
        </div>
        <p class="tag">{{ combo.size }}</p>
        <h3>{{ combo.name }}</h3>
        <p class="combo-items">{{ combo.detail }}<br><span class="free-shipping">✦ Envío gratis incluido</span></p>
        <div class="combo-price">
          <s>{{ comboCompareAt[combo.id] }}</s>
          <strong>{{ formatPrice(combo.price) }}</strong>
        </div>
        <button class="button button-dark" type="button" @click="addToCart(combo)">
          Elegir este pack <span>→</span>
        </button>
      </article>
    </div>

    <!-- Productos Individuales -->
    <div id="productos" class="individual-products">
      <div class="section-heading">
        <p class="eyebrow"><span></span> PRODUCTOS INDIVIDUALES</p>
        <h3>O elige una <em>unidad individual:</em></h3>
      </div>
      <div class="product-grid">
        <article v-for="(product, index) in products" :key="product.id" class="product-card">
          <span class="product-number">0{{ index + 1 }}</span>
          <div class="product-image" :class="{ loaded: imageLoaded(product.image) }">
            <img :src="product.image" :alt="product.name" loading="lazy" @load="markImageLoaded(product.image)">
          </div>
          <div class="product-info">
            <p>{{ product.size }}</p>
            <h3>{{ product.name }}</h3>
            <span>{{ product.detail }}</span>
            <div>
              <strong>{{ formatPrice(product.price) }}</strong>
              <button type="button" :aria-label="`Agregar ${product.name}`" @click="addToCart(product)">→</button>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
