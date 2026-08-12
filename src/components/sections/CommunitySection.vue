<script setup lang="ts">
import { chatTestimonials } from '@/config/landing-content'
import { useImageLoad } from '@/composables/useImageLoad'

const { imageLoaded, markImageLoaded } = useImageLoad()
</script>

<template>
  <!-- SLIDE 7: Comunidad OMG Lashes & Testimonios de Chat Reales -->
  <section id="comunidad" class="community-section">
    <div class="section-heading centered">
      <p class="eyebrow"><span></span> LA COMUNIDAD OMGLASHES</p>
      <h2>Ellas fueron constantes.<br><em>Mira sus resultados.</em></h2>
      <p class="subheading">Testimonios y capturas reales de clientas.</p>
    </div>

    <!-- La estrella y el comentario van debajo de cada foto, no en una fila aparte. -->
    <div class="chat-gallery">
      <div v-for="(chat, i) in chatTestimonials" :key="i" class="chat-card">
        <div class="chat-image" :class="{ loaded: imageLoaded(chat.url) }">
          <img :src="chat.url" :alt="chat.quote" loading="lazy" @load="markImageLoaded(chat.url)">
        </div>
        <div class="chat-meta">
          <div class="stars">★★★★★</div>
          <p>{{ chat.quote }}</p>
          <span class="verified">✓ {{ chat.author }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
