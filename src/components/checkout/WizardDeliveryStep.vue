<script setup lang="ts">
import { provinces } from '@/config/ecuador-locations'
import { checkoutStep, delivery, isLocationPickerOpen, useCheckout } from '@/composables/useCheckout'
import { ecuadorCantonsByProvince } from '@/config/ecuadorCantons'
import { computed } from 'vue'

const { openLocationPicker } = useCheckout()
const cities = computed(() => ecuadorCantonsByProvince[delivery.value.province] || [])
const locationSummary = computed(() => {
  if (delivery.value.city) return `ENTREGA EN: ${delivery.value.province} · ${delivery.value.city}`
  if (delivery.value.province) return `PROVINCIA: ${delivery.value.province} · AHORA ELIGE TU CANTÓN`
  return 'SELECCIONA PROVINCIA Y CANTÓN CON EL BUSCADOR'
})
</script>

<template>
  <div>
    <h2 id="wizard-title">¿A dónde<br><em>lo enviamos?</em></h2>
    <p class="wizard-copy">Elige provincia y luego tu ciudad o cantón. Puedes volver si necesitas revisar tus datos.</p>
    <form @submit.prevent="checkoutStep = 3">
      <fieldset class="delivery-section" :data-location="locationSummary">
        <legend>Datos de entrega</legend>
        <label>País<select v-model="delivery.country" required><option value="Ecuador">Ecuador</option></select></label>
        <div class="field-grid">
          <label>
            Provincia
            <select v-model="delivery.province" required>
              <option disabled value="">Selecciona tu provincia</option>
              <option v-for="province in provinces" :key="province" :value="province">{{ province }}</option>
            </select>
          </label>
          <label>
            Ciudad o cantón
            <select v-model="delivery.city" required :disabled="!delivery.province">
              <option disabled value="">
                {{ delivery.province ? 'Selecciona tu ciudad o cantón' : 'Primero selecciona provincia' }}
              </option>
              <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
            </select>
          </label>
        </div>
        <label>
          Dirección completa
          <input v-model.trim="delivery.address" required autocomplete="street-address" placeholder="Calle, número, sector o urbanización">
        </label>
        <label>
          Referencia para entrega
          <input v-model.trim="delivery.reference" required placeholder="Ej. casa blanca de 2 pisos, junto a la farmacia">
        </label>
        <p class="reference-help">Mientras más clara sea la referencia, más fácil será entregarte el pedido.</p>
      </fieldset>
      <div class="wizard-actions">
        <button class="wizard-back" type="button" @click="checkoutStep = 1">← Volver a contacto</button>
        <button class="button button-dark" type="submit">Continuar al pago <span>→</span></button>
      </div>
    </form>
    <button
      v-if="!isLocationPickerOpen" class="location-reopen" type="button"
      style="bottom:28px" @click="openLocationPicker()">Cambiar provincia o cantón</button>
  </div>
</template>
