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
        <img :src="heroCollage" alt="Antes y después de usar OMG Lashes: pestañas y cejas más largas y abundantes en 28 días" fetchpriority="high" @load="markImageLoaded(heroCollage)">
        <!-- Las dos fotos de la izquierda del collage son el antes y el después de una
             clienta; Carolina pidió rotularlas. El marco es cuadrado y la imagen también,
             así que los porcentajes caen siempre sobre la misma foto. -->
        <span class="photo-tag tag-before">ANTES</span>
        <span class="photo-tag tag-after">DESPUÉS</span>
      </div>
      <div class="hero-note note-bottom">RESULTADOS EN 28 DÍAS</div>
      <!-- Todo el texto va en un solo <span>: el sello es flex y, sueltos, cada trozo
           de texto era un ítem aparte que se ponía al lado del otro y se leía
           "EL #1 SÉRUMEN ECUADOR". -->
      <div class="circle-stamp"><span>EL SÉRUM<br><b>#1 EN</b><br>ECUADOR</span></div>
    </div>
  </section>
</template>
