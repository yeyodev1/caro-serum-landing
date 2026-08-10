import { nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { getApiBaseUrl } from '@/config/api'
import { useCart } from '@/composables/useCart'
import { useToast } from '@/composables/useToast'
import { getPayPhone, loadPayPhoneWidget, renderPayPhoneBox } from '@/composables/usePayphone'
import {
  buyer, checkoutError, checkoutStep, delivery, invoice, isCheckoutWizardOpen,
  isPayphoneGatewayOpen, isSubmitting, isTransferConfirmationOpen, isTransferReceiptOpen,
  isUploadingReceipt, paymentMethod, paymentStatus, selectedTransferReceipt,
  transferSuccess, useCheckout,
} from '@/composables/useCheckout'
import type { OrderResponse } from '@/types/landing'

const apiBaseUrl = getApiBaseUrl()

export function useOrderSubmission() {
  const router = useRouter()
  const { notify } = useToast()
  const { cart, totalCents, emptyCart } = useCart()
  const { shouldCollectInvoice } = useCheckout()

  async function createOrder() {
    if (!cart.value.length) return
    isSubmitting.value = true
    checkoutError.value = ''
    try {
      const response = await fetch(`${apiBaseUrl}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: cart.value,
          buyer: buyer.value,
          delivery: delivery.value,
          invoice: shouldCollectInvoice.value ? invoice.value : undefined,
          paymentMethod: paymentMethod.value,
        }),
      })
      const data = await response.json() as OrderResponse
      if (!response.ok) throw new Error((data as { message?: string }).message || 'No pudimos crear tu pedido.')

      if (paymentMethod.value === 'transfer') {
        const instructions = Array.isArray(data.transfer?.instructions)
          ? data.transfer.instructions
          : [data.transfer?.instructions || 'Te contactaremos con los datos de transferencia.']
        transferSuccess.value = {
          reference: data.order?.reference || data.reference || 'Pendiente',
          instructions,
          totalCents: totalCents.value,
        }
        emptyCart()
        isCheckoutWizardOpen.value = false
        isTransferReceiptOpen.value = true
        return
      }

      const payphone = getPayPhone(data)
      if (!payphone.token || !payphone.storeId || !payphone.clientTransactionId) {
        throw new Error('No recibimos los datos de pago. Intenta nuevamente.')
      }
      isCheckoutWizardOpen.value = false
      isPayphoneGatewayOpen.value = true
      await loadPayPhoneWidget()
      await nextTick()
      renderPayPhoneBox(payphone, totalCents.value, data.order?.reference || 'OMG Lashes')
    } catch (error) {
      if (isPayphoneGatewayOpen.value) {
        isPayphoneGatewayOpen.value = false
        isCheckoutWizardOpen.value = true
        checkoutStep.value = 3
      }
      notify(error instanceof Error ? error.message : 'No pudimos procesar tu pedido.')
    } finally {
      isSubmitting.value = false
    }
  }

  function submitOrder() {
    if (paymentMethod.value === 'transfer') { isTransferConfirmationOpen.value = true; return }
    void createOrder()
  }

  function confirmTransferOrder() { isTransferConfirmationOpen.value = false; void createOrder() }
  function returnToPayPhone() { paymentMethod.value = 'payphone'; isTransferConfirmationOpen.value = false }

  async function uploadTransferReceipt() {
    if (!transferSuccess.value || !selectedTransferReceipt.value) {
      notify('Selecciona el comprobante antes de confirmar.'); return
    }
    isUploadingReceipt.value = true
    try {
      const reference = encodeURIComponent(transferSuccess.value.reference)
      const response = await fetch(`${apiBaseUrl}/orders/${reference}/transfer-receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl: selectedTransferReceipt.value.dataUrl }),
      })
      const data = await response.json() as { message?: string }
      if (!response.ok) throw new Error(data.message || 'No pudimos enviar el comprobante.')
      isTransferReceiptOpen.value = false
      notify('Comprobante enviado. Verificaremos tu pago muy pronto.')
      const ref = transferSuccess.value?.reference || ''
      window.setTimeout(() => { void router.push({ path: '/order-status', query: { reference: ref } }) }, 900)
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No pudimos enviar el comprobante.')
    } finally {
      isUploadingReceipt.value = false
    }
  }

  // PayPhone regresa al sitio con id y clientTransactionId en la URL.
  async function confirmPayPhoneReturn() {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('id')
    const clientTransactionId = params.get('clientTransactionId')
    if (!id || !clientTransactionId) return
    try {
      const response = await fetch(`${apiBaseUrl}/orders/payphone/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, clientTransactionId }),
      })
      const data = await response.json() as OrderResponse
      const paid = response.ok && data.order?.status === 'paid'
      paymentStatus.value = {
        title: paid ? 'Pago confirmado' : 'Pago pendiente',
        paid,
        message: paid
          ? 'Tu pago fue confirmado. Gracias por elegir OMG Lashes.'
          : 'Tu pago aún no aparece como confirmado. Si realizaste el pago, vuelve a revisar en unos minutos.',
      }
      if (paid) emptyCart()
    } catch {
      paymentStatus.value = {
        title: 'No pudimos confirmar el pago',
        paid: false,
        message: 'Revisa tu correo o comunícate con nosotras para confirmar tu pedido.',
      }
    } finally {
      window.history.replaceState({}, '', `${window.location.pathname}${window.location.hash}`)
    }
  }

  return { createOrder, submitOrder, confirmTransferOrder, returnToPayPhone, uploadTransferReceipt, confirmPayPhoneReturn }
}
