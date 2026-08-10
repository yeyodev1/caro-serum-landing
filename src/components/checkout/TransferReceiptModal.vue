<script setup lang="ts">
import { formatPrice } from '@/config/catalog'
import { useToast } from '@/composables/useToast'
import { useOrderSubmission } from '@/composables/useOrderSubmission'
import {
  hasConfirmedTransferAmount, isTransferReceiptOpen, isUploadingReceipt,
  selectedTransferReceipt, transferSuccess,
} from '@/composables/useCheckout'

const { notify } = useToast()
const { uploadTransferReceipt } = useOrderSubmission()

async function selectTransferReceipt(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
    selectedTransferReceipt.value = null
    notify('Selecciona una imagen JPG, PNG o WEBP de hasta 5 MB.')
    return
  }
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('No pudimos leer la imagen.'))
    reader.readAsDataURL(file)
  })
  selectedTransferReceipt.value = { name: file.name, dataUrl }
  notify('Comprobante listo. Confirma el envío cuando estés lista.')
}
</script>

<template>
  <Transition name="overlay">
    <div
      v-if="isTransferReceiptOpen && transferSuccess" class="overlay transfer-receipt-overlay"
      @click.self="isTransferReceiptOpen = false">
      <section class="transfer-receipt-modal" role="dialog" aria-modal="true" aria-labelledby="transfer-receipt-title">
        <button class="close" type="button" aria-label="Cerrar transferencia" @click="isTransferReceiptOpen = false">×</button>
        <p class="eyebrow"><span></span> PAGO POR TRANSFERENCIA</p>
        <h2 id="transfer-receipt-title">Tu pedido está casi listo.</h2>
        <p class="transfer-intro">Realiza tu transferencia con estos datos y luego confirma el envío de tu comprobante.</p>

        <div class="transfer-amount">
          <span>MONTO EXACTO A TRANSFERIR</span>
          <b>{{ formatPrice(transferSuccess.totalCents) }}</b>
          <small>Incluye el costo de envío, si aplica.</small>
        </div>
        <div class="bank-details">
          <span>TITULAR</span><b>BEAUTYCOMP SA</b>
          <span>RUC</span><b>0993115347001</b>
          <span>BANCO</span><b>Banco Pichincha</b>
          <span>CUENTA CORRIENTE</span><b>2100185792</b>
        </div>
        <p class="transfer-reference">Referencia de pedido: <b>{{ transferSuccess.reference }}</b></p>

        <label class="receipt-picker">
          <span>Comprobante de transferencia</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" @change="selectTransferReceipt">
          <b>{{ selectedTransferReceipt ? selectedTransferReceipt.name : 'Seleccionar imagen' }}</b>
          <small>JPG, PNG o WEBP · Máximo 5 MB</small>
        </label>
        <figure v-if="selectedTransferReceipt" class="receipt-preview">
          <img :src="selectedTransferReceipt.dataUrl" alt="Previsualización del comprobante de transferencia">
          <figcaption>Previsualización: revisa que el comprobante sea legible antes de confirmarlo.</figcaption>
        </figure>
        <label class="amount-confirmation">
          <input v-model="hasConfirmedTransferAmount" type="checkbox">
          <span>
            Confirmo que el comprobante muestra claramente el monto transferido de
            <b>{{ formatPrice(transferSuccess.totalCents) }}</b>.
          </span>
        </label>

        <button
          class="button button-dark receipt-confirm" type="button"
          :disabled="isUploadingReceipt || !selectedTransferReceipt || !hasConfirmedTransferAmount"
          @click="uploadTransferReceipt">
          {{ isUploadingReceipt ? 'Enviando comprobante...' : 'Confirmar y enviar comprobante' }} <span>→</span>
        </button>
        <button class="transfer-later" type="button" @click="isTransferReceiptOpen = false">Lo enviaré más tarde</button>
      </section>
    </div>
  </Transition>
</template>
