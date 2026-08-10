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

    <div class="quotes-highlight">
      <div class="quote-card">
        <div class="stars">★★★★★</div>
        <p>“Se siente ligero y no deja sensación grasosa.”</p>
        <span class="verified">✓ Compra verificada</span>
      </div>
      <div class="quote-card">
        <div class="stars">★★★★★</div>
        <p>“La regla me ayudó a ser constante.”</p>
        <span class="verified">✓ Compra verificada</span>
      </div>
      <div class="quote-card">
        <div class="stars">★★★★★</div>
        <p>“Lo uso también en mis cejas.”</p>
        <span class="verified">✓ Compra verificada</span>
      </div>
    </div>

    <div class="chat-gallery">
      <div v-for="(chat, i) in chatTestimonials" :key="i" class="chat-card">
        <div class="chat-image" :class="{ loaded: imageLoaded(chat.url) }">
          <img :src="chat.url" :alt="chat.quote" loading="lazy" @load="markImageLoaded(chat.url)">
        </div>
        <div class="chat-meta">
          <p>{{ chat.quote }}</p>
          <span>★★★★★ {{ chat.author }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
