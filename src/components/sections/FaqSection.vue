<script setup lang="ts">
import { ref } from 'vue'
import { faqs } from '@/config/landing-content'

const openFaqIndex = ref<number | null>(null)
function toggleFaq(index: number) { openFaqIndex.value = openFaqIndex.value === index ? null : index }
</script>

<template>
  <!-- SLIDE 11: Preguntas Frecuentes -->
  <section id="faq" class="faq-section">
    <div class="section-heading">
      <p class="eyebrow"><span></span> PREGUNTAS FRECUENTES</p>
      <h2>Todo lo que<br><em>necesitas saber.</em></h2>
    </div>
    <div class="faq-list">
      <div v-for="(faq, i) in faqs" :key="i" class="faq-item" :class="{ active: openFaqIndex === i }">
        <button class="faq-question" type="button" @click="toggleFaq(i)">
          <span>{{ faq.question }}</span>
          <b aria-hidden="true">{{ openFaqIndex === i ? '−' : '+' }}</b>
        </button>
        <div v-if="openFaqIndex === i" class="faq-answer">
          <p>{{ faq.answer }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
