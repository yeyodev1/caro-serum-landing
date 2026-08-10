<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import WizardContactStep from './WizardContactStep.vue'
import WizardDeliveryStep from './WizardDeliveryStep.vue'
import WizardPaymentStep from './WizardPaymentStep.vue'
import { checkoutStep, delivery, isCheckoutWizardOpen, useCheckout } from '@/composables/useCheckout'

const { openLocationPicker, onEnterPaymentStep } = useCheckout()
const isChangingStep = ref(false)
let animationTimer: ReturnType<typeof setTimeout> | undefined

watch(checkoutStep, (step) => {
  isChangingStep.value = false
  void nextTick().then(() => { isChangingStep.value = true })
  clearTimeout(animationTimer)
  animationTimer = setTimeout(() => { isChangingStep.value = false }, 380)

  if (step === 2) void nextTick().then(() => openLocationPicker(delivery.value.province ? 'city' : 'province'))
  if (step === 3) onEnterPaymentStep()
})
</script>

<template>
  <Transition name="overlay">
    <div
      v-if="isCheckoutWizardOpen" class="overlay checkout-wizard-overlay"
      @click.self="isCheckoutWizardOpen = false">
      <section
        class="checkout-wizard" :class="{ 'is-changing-step': isChangingStep }"
        role="dialog" aria-modal="true" aria-labelledby="wizard-title">
        <button class="close" type="button" aria-label="Cerrar checkout" @click="isCheckoutWizardOpen = false">×</button>
        <header>
          <p class="eyebrow"><span></span> CHECKOUT SEGURO</p>
          <ol aria-label="Progreso de compra">
            <li :class="{ active: checkoutStep >= 1 }">1. Contacto</li>
            <li :class="{ active: checkoutStep >= 2 }">2. Entrega</li>
            <li :class="{ active: checkoutStep >= 3 }">3. Pago</li>
          </ol>
        </header>
        <WizardContactStep v-if="checkoutStep === 1" />
        <WizardDeliveryStep v-else-if="checkoutStep === 2" />
        <WizardPaymentStep v-else />
      </section>
    </div>
  </Transition>
</template>
