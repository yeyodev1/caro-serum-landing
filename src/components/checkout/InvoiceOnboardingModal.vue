<script setup lang="ts">
import { useCart } from '@/composables/useCart'
import { checkoutStep, invoice, isInvoiceOpen, useCheckout } from '@/composables/useCheckout'

const { requiresInvoice } = useCart()
const { completeInvoiceOnboarding } = useCheckout()
</script>

<template>
  <Transition name="overlay">
    <div v-if="isInvoiceOpen" class="overlay invoice-overlay">
      <section class="invoice-onboarding" role="dialog" aria-modal="true" aria-labelledby="invoice-title">
        <p class="eyebrow"><span></span> DATOS DE FACTURACIÓN</p>
        <p class="invoice-step">{{ requiresInvoice ? 'PEDIDO MAYOR A $50' : 'FACTURA SOLICITADA' }}</p>
        <h2 id="invoice-title">Tus datos,<br><em>en orden.</em></h2>
        <p>Para emitir tu factura necesitamos estos datos. La factura se emitirá pronto y llegará a tu correo.</p>
        <form @submit.prevent="completeInvoiceOnboarding">
          <label>
            Cédula o RUC
            <input
              v-model.trim="invoice.identification" required inputmode="numeric"
              minlength="10" maxlength="13" pattern="[0-9]{10}|[0-9]{13}" placeholder="Ej. 0912345678">
          </label>
          <div class="invoice-fields">
            <label>Nombres<input v-model.trim="invoice.firstName" required autocomplete="given-name"></label>
            <label>Apellidos<input v-model.trim="invoice.lastName" required autocomplete="family-name"></label>
          </div>
          <label>Correo para factura<input v-model.trim="invoice.email" required type="email" autocomplete="email"></label>
          <label>
            Dirección de facturación
            <input v-model.trim="invoice.address" required autocomplete="street-address" placeholder="Calle, número y sector">
          </label>
          <button class="button button-dark" type="submit">Confirmar datos de facturación <span>→</span></button>
          <button class="invoice-back" type="button" @click="isInvoiceOpen = false; checkoutStep = 2">← Volver a entrega</button>
        </form>
      </section>
    </div>
  </Transition>
</template>
