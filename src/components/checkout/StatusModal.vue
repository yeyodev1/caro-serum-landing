<script setup lang="ts">
import { paymentStatus } from '@/composables/useCheckout'
</script>

<template>
  <Transition name="overlay">
    <div v-if="paymentStatus" class="overlay" @click.self="paymentStatus = null">
      <section class="status-modal" role="dialog" aria-modal="true" aria-labelledby="payment-title">
        <button class="close" type="button" aria-label="Cerrar estado de pago" @click="paymentStatus = null">×</button>
        <p class="eyebrow"><span></span> PAYPHONE</p>
        <h2 id="payment-title">{{ paymentStatus.title }}</h2>
        <p>{{ paymentStatus.message }}</p>
        <button class="button button-dark" type="button" @click="paymentStatus = null">Volver a OMG <span>→</span></button>
      </section>
    </div>
  </Transition>
</template>
