<script setup lang="ts">
import { beforeAfterGallery } from '@/config/landing-content'
import { useImageLoad } from '@/composables/useImageLoad'

const { imageLoaded, markImageLoaded } = useImageLoad()
</script>

<template>
  <!-- SLIDE 2: Mira lo que la constancia puede hacer -->
  <section id="resultados" class="results-section">
    <div class="section-heading centered">
      <p class="eyebrow"><span></span> CAMBIOS REALES</p>
      <h2>Mira lo que la constancia<br><em>puede hacer.</em></h2>
      <p class="subheading">El cambio real en cejas y pestañas con su rutina diaria.</p>
    </div>
    <div class="results-grid">
      <article v-for="(item, idx) in beforeAfterGallery" :key="idx" class="result-card">
        <div class="result-image" :class="{ loaded: imageLoaded(item.url) }">
          <img :src="item.url" :alt="item.subtitle" loading="lazy" @load="markImageLoaded(item.url)">
        </div>
        <div class="result-info">
          <span class="badge-client">{{ item.title }}</span>
          <h3>{{ item.subtitle }}</h3>
        </div>
      </article>
    </div>
  </section>
</template>
