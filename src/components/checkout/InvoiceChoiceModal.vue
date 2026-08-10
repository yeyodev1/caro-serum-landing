<script setup lang="ts">
import { isInvoiceChoiceOpen, useCheckout } from '@/composables/useCheckout'

const { chooseInvoice } = useCheckout()
</script>

<template>
  <Transition name="overlay">
    <div v-if="isInvoiceChoiceOpen" class="overlay invoice-overlay">
      <section class="invoice-choice" role="dialog" aria-modal="true" aria-labelledby="invoice-choice-title">
        <p class="eyebrow"><span></span> FACTURACIÓN</p>
        <h2 id="invoice-choice-title">¿Deseas<br><em>factura?</em></h2>
        <p>Tu compra no supera los $50, pero podemos emitir factura si la necesitas.</p>
        <button class="button button-dark" type="button" @click="chooseInvoice(true)">
          Sí, ingresar datos de factura <span>→</span>
        </button>
        <button class="invoice-choice-skip" type="button" @click="chooseInvoice(false)">No necesito factura</button>
      </section>
    </div>
  </Transition>
</template>
