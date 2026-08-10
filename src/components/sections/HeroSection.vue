<script setup lang="ts">
import { heroCollage } from '@/config/images'
import { combos } from '@/config/catalog'
import { useCart } from '@/composables/useCart'
import { useImageLoad } from '@/composables/useImageLoad'

const { addToCart } = useCart()
const { imageLoaded, markImageLoaded } = useImageLoad()
</script>

<template>
  <!-- SLIDE 1: Hero Section -->
  <section id="inicio" class="hero">
    <div class="hero-copy">
      <p class="eyebrow"><span></span> 01 EL SÉRUM #1 EN ECUADOR 🥇</p>
      <h1>Cejas y Pestañas<br>que se ven <em>más largas</em>, fuertes y abundantes.</h1>
      <ul class="hero-bullets">
        <li>✓ Estimula el crecimiento</li>
        <li>✓ Fortalece y nutre desde la raíz</li>
        <li>✓ Sin efectos secundarios</li>
      </ul>
      <div class="hero-actions">
        <button class="button button-dark hero-cta" type="button" @click="addToCart(combos[1]!)">
          COMPRAR OMGLASHES 🔒 <span>→</span>
        </button>
        <a class="text-link" href="#resultados">Ver cambios reales <span>↓</span></a>
      </div>
      <div class="hero-trust">
        <span>🔒 Compra segura</span>
        <span>🚚 Envíos a todo Ecuador</span>
      </div>
    </div>
    <div class="hero-visual">
      <div class="sunburst"></div>
      <div class="hero-note note-top">FÓRMULA ALTA EFICACIA<br>SIN EFECTOS SECUNDARIOS</div>
      <div class="photo-frame" :class="{ loaded: imageLoaded(heroCollage) }">
        <img :src="heroCollage" alt="OMG Lashes Sérum para cejas y pestañas" fetchpriority="high" @load="markImageLoaded(heroCollage)">
      </div>
      <div class="hero-note note-bottom">RESULTADOS EN 28 DÍAS</div>
      <div class="circle-stamp">EL SÉRUM<br><b>#1 EN</b><br>ECUADOR</div>
    </div>
  </section>
</template>
