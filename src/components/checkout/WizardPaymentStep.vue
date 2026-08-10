<script setup lang="ts">
import { formatPrice } from '@/config/catalog'
import { useCart } from '@/composables/useCart'
import { useOrderSubmission } from '@/composables/useOrderSubmission'
import { checkoutError, checkoutStep, isSubmitting, paymentMethod } from '@/composables/useCheckout'

const { shippingCents, totalCents } = useCart()
const { submitOrder } = useOrderSubmission()
</script>

<template>
  <div>
    <h2 id="wizard-title">Revisa y<br><em>finaliza.</em></h2>
    <div class="wizard-total">
      <span>Total a pagar</span>
      <b>{{ formatPrice(totalCents) }}</b>
      <small>{{ shippingCents ? 'Incluye envío estándar de $6' : 'Envío gratis aplicado' }}</small>
    </div>
    <fieldset class="wizard-payment">
      <legend>Elige tu método de pago</legend>
      <label :class="{ selected: paymentMethod === 'payphone' }">
        <input v-model="paymentMethod" type="radio" value="payphone"> <b>PayPhone</b>
        <small>Pago inmediato y seguro con tarjeta o saldo PayPhone.</small>
      </label>
      <label :class="{ selected: paymentMethod === 'transfer' }">
        <input v-model="paymentMethod" type="radio" value="transfer"> <b>Transferencia bancaria</b>
        <small>Sube tu comprobante después de crear el pedido.</small>
      </label>
    </fieldset>
    <div id="payphone-button" v-show="paymentMethod === 'payphone'"></div>
    <p v-if="checkoutError" class="wizard-error" role="status">{{ checkoutError }}</p>
    <div class="wizard-actions">
      <button class="wizard-back" type="button" @click="checkoutStep = 2">← Volver a entrega</button>
      <button class="button button-dark" type="button" :disabled="isSubmitting" @click="submitOrder">
        {{ isSubmitting ? 'Preparando pago...' : paymentMethod === 'payphone' ? 'Continuar a PayPhone' : 'Continuar con transferencia' }}
        <span>→</span>
      </button>
    </div>
  </div>
</template>
