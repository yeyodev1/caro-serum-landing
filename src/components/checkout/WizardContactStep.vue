<script setup lang="ts">
import { buyer, checkoutStep, useCheckout } from '@/composables/useCheckout'

const { normalizedWhatsApp } = useCheckout()
</script>

<template>
  <div>
    <h2 id="wizard-title">Primero,<br><em>te conocemos.</em></h2>
    <p class="wizard-copy">Usaremos estos datos para confirmar tu pedido y mantenerte al tanto.</p>
    <form @submit.prevent="checkoutStep = 2">
      <div class="field-grid">
        <label>Nombres<input v-model.trim="buyer.firstName" required autocomplete="given-name"></label>
        <label>Apellidos<input v-model.trim="buyer.lastName" required autocomplete="family-name"></label>
      </div>
      <label>Correo electrónico<input v-model.trim="buyer.email" required type="email" autocomplete="email"></label>
      <label>
        WhatsApp
        <input
          v-model.trim="buyer.phone" required type="tel" inputmode="tel" autocomplete="tel"
          placeholder="Ej. 0995254965" pattern="(?:0?9\d{8}|(?:\+?593)9\d{8})">
      </label>
      <p class="phone-help">
        Escribe tu WhatsApp como lo usas en Ecuador.
        <span v-if="normalizedWhatsApp">Lo confirmaremos como <b>{{ normalizedWhatsApp }}</b>.</span>
        <span v-else>Ejemplo: 0995254965.</span>
      </p>
      <button class="button button-dark wizard-next" type="submit">Continuar a entrega <span>→</span></button>
    </form>
  </div>
</template>
