<script setup lang="ts">
import { formatPrice } from '@/config/catalog'
import { useCart } from '@/composables/useCart'
import { isPayphoneGatewayOpen } from '@/composables/useCheckout'

const { totalCents } = useCart()
</script>

<template>
  <Transition name="overlay">
    <div v-if="isPayphoneGatewayOpen" class="overlay payphone-gateway-overlay">
      <section class="payphone-gateway" role="dialog" aria-modal="true" aria-labelledby="payphone-gateway-title">
        <p class="eyebrow"><span></span> PASO FINAL · PAGO SEGURO</p>
        <h2 id="payphone-gateway-title">Completa tu<br><em>pago seguro.</em></h2>
        <div class="payphone-gateway-total">
          <span>Total a pagar</span><b>{{ formatPrice(totalCents) }}</b>
        </div>
        <p class="payphone-gateway-copy">
          Tus datos de contacto ya van cargados: solo elige tarjeta o PayPhone y paga. Tu pedido se confirma apenas se aprueba el pago.
        </p>
        <div id="payphone-gateway-button"></div>
        <button class="payphone-cancel" type="button" @click="isPayphoneGatewayOpen = false">Cancelar pago</button>
      </section>
    </div>
  </Transition>
</template>
