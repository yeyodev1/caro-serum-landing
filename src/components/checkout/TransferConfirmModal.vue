<script setup lang="ts">
import { isSubmitting, isTransferConfirmationOpen } from '@/composables/useCheckout'
import { useOrderSubmission } from '@/composables/useOrderSubmission'

const { confirmTransferOrder, returnToPayPhone } = useOrderSubmission()
</script>

<template>
  <Transition name="overlay">
    <div
      v-if="isTransferConfirmationOpen" class="overlay transfer-confirmation-overlay"
      @click.self="isTransferConfirmationOpen = false">
      <section
        class="transfer-confirmation-modal" role="dialog" aria-modal="true"
        aria-labelledby="transfer-confirmation-title" aria-describedby="transfer-confirmation-description">
        <button
          class="close" type="button" aria-label="Cerrar confirmación de transferencia"
          @click="isTransferConfirmationOpen = false">×</button>
        <p class="eyebrow"><span></span> TRANSFERENCIA BANCARIA</p>
        <h2 id="transfer-confirmation-title">¿Estás 100% segura?</h2>
        <p id="transfer-confirmation-description">
          La transferencia pasa por verificación manual y puede tomar de
          <strong>2 a 3 días laborables adicionales</strong> antes de reservar y despachar tu pedido.
        </p>
        <p class="transfer-no-fees">No hay cargos adicionales por pagar mediante transferencia.</p>
        <div class="transfer-confirmation-actions">
          <button class="button button-dark" type="button" :disabled="isSubmitting" @click="confirmTransferOrder">
            Sí, continuar con transferencia <span>→</span>
          </button>
          <button class="transfer-back" type="button" @click="returnToPayPhone">Volver a PayPhone</button>
        </div>
      </section>
    </div>
  </Transition>
</template>
