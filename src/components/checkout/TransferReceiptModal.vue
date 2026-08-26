<script setup lang="ts">
import { nextTick, useTemplateRef } from 'vue'
import { formatPrice } from '@/config/catalog'
import { useToast } from '@/composables/useToast'
import { useOrderSubmission } from '@/composables/useOrderSubmission'
import {
  hasConfirmedTransferAmount, isTransferReceiptOpen, isUploadingReceipt,
  selectedTransferReceipt, transferSuccess,
} from '@/composables/useCheckout'

const { notify } = useToast()
const { uploadTransferReceipt } = useOrderSubmission()
const previewRef = useTemplateRef<HTMLElement>('preview')

// La imagen recién asignada todavía no ocupa su alto: sin esperarla, el modal
// se desplaza a un fondo que aún no existe y la foto queda debajo del pliegue.
async function revealPreview() {
  const preview = previewRef.value
  const modal = preview?.closest<HTMLElement>('.transfer-receipt-modal')
  if (!preview || !modal) return
  const image = preview.querySelector('img')
  if (image && !image.complete) {
    await new Promise<void>((resolve) => {
      const done = () => resolve()
      image.addEventListener('load', done, { once: true })
      image.addEventListener('error', done, { once: true })
      window.setTimeout(done, 1500)
    })
  }
  // Salto directo: el desplazamiento suave se corta a medio camino cuando la
  // imagen termina de cargar y el contenido del modal crece.
  modal.scrollTop = Math.max(0, preview.offsetTop - 20)
}

function openReceiptInNewTab() {
  if (!selectedTransferReceipt.value) return
  const viewer = window.open()
  if (!viewer) { notify('Permite las ventanas emergentes para ver el comprobante en grande.'); return }
  viewer.document.write(`<title>Comprobante</title><body style="margin:0;background:#1D1D1B;display:grid;place-items:center;min-height:100vh"><img src="${selectedTransferReceipt.value.dataUrl}" style="max-width:100%;max-height:100vh"></body>`)
  viewer.document.close()
}

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
  await nextTick()
  await revealPreview()
  notify('Comprobante listo. Revisa que se lea bien y confirma el envío.')
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
          <small>{{ selectedTransferReceipt ? 'Toca aquí si quieres cambiar la imagen' : 'JPG, PNG o WEBP · Máximo 5 MB' }}</small>
        </label>
        <figure v-if="selectedTransferReceipt" ref="preview" class="receipt-preview">
          <img :src="selectedTransferReceipt.dataUrl" alt="Previsualización del comprobante de transferencia">
          <figcaption>Así se verá tu comprobante. Revisa que se lean el monto y la fecha antes de enviarlo.</figcaption>
          <button class="receipt-zoom" type="button" @click="openReceiptInNewTab">Ver en grande</button>
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
