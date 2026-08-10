import { computed, nextTick, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getApiBaseUrl } from '@/config/api'
import { hidePaymentLoadingScreen, showPaymentLoadingScreen } from '@/composables/useOrderStatusOverlays'
import { renderInvoiceStatus, renderWhatsAppSupport } from '@/composables/useOrderStatusCards'
import type { Order, Payphone } from '@/types/order-status'

const api = getApiBaseUrl()

export function useOrderStatusData() {
  const route = useRoute()
  const order = ref<Order | null>(null)
  const transaction = ref<{ statusCode: number | null; status: string } | null>(null)
  const message = ref('')
  const isLoading = ref(true)
  const isRetrying = ref(false)
  const retryOpen = ref(false)
  const recipientEmail = ref('')
  const verificationContact = ref('')
  const resendMessage = ref('')
  const lookupContact = ref('')
  const foundOrders = ref<Order[]>([])
  const selectedSearchOrder = ref<Order | null>(null)
  const lookupMessage = ref('')
  const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
  const isPayResponse = computed(() => route.path === '/pay-response')
  const paymentFailed = computed(() => isPayResponse.value && order.value?.status !== 'paid' && transaction.value?.statusCode !== 3)
  const statusLabel = computed(() => paymentFailed.value ? 'Pago no completado' : order.value?.status === 'paid' ? 'Pago confirmado' : order.value?.status === 'awaiting_transfer' ? 'Esperando transferencia' : 'Pago pendiente')
  const whatsappUrl = computed(() => order.value ? `https://wa.me/593998655256?text=${encodeURIComponent(`Hola OMG Lashes, necesito ayuda con mi pedido ${order.value.reference}. Estado: ${statusLabel.value}. NO CAMBIES ESTE MENSAJE para que podamos atenderte más rápido.`)}` : '#')

  async function json(response: Response) { return response.json() as Promise<{ order?: Order; orders?: Order[]; transaction?: { statusCode: number | null; status: string }; payphone?: Payphone; message?: string; recipient?: string }> }
  async function loadOrder() {
    isLoading.value = true; message.value = ''; showPaymentLoadingScreen(isPayResponse.value)
    try {
      if (isPayResponse.value) {
        const id = String(route.query.id || ''); const clientTransactionId = String(route.query.clientTransactionId || '')
        if (!id || !clientTransactionId) throw new Error('No encontramos los datos de respuesta de PayPhone.')
        const response = await fetch(`${api}/orders/payphone/confirm`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, clientTransactionId }) })
        const data = await json(response); if (!response.ok || !data.order) throw new Error(data.message || 'No pudimos revisar tu pago.')
        order.value = data.order; transaction.value = data.transaction || null
      } else {
        const reference = String(route.query.reference || ''); if (!reference) throw new Error('Ingresa una referencia de pedido para consultar el estado.')
        const response = await fetch(`${api}/orders/${encodeURIComponent(reference)}`); const data = await json(response)
        if (!response.ok || !data.order) throw new Error(data.message || 'No encontramos este pedido.'); order.value = data.order
      }
    } catch (error) { message.value = error instanceof Error ? error.message : 'No pudimos consultar el pedido.' } finally { await hidePaymentLoadingScreen(isPayResponse.value); isLoading.value = false; void nextTick().then(() => { renderWhatsAppSupport(order.value, statusLabel.value, whatsappUrl.value); renderInvoiceStatus(order.value) }) }
  }
  async function loadPayphoneWidget() {
    if (window.PPaymentButtonBox) return
    await new Promise<void>((resolve, reject) => { const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://cdn.payphonetodoesposible.com/box/v2.0/payphone-payment-box.css'; document.head.appendChild(css); const script = document.createElement('script'); script.type = 'module'; script.src = 'https://cdn.payphonetodoesposible.com/box/v2.0/payphone-payment-box.js'; script.onload = () => resolve(); script.onerror = () => reject(new Error('No pudimos cargar PayPhone.')); document.head.appendChild(script) })
  }
  async function retryPayment() {
    if (!order.value) return
    isRetrying.value = true; message.value = ''
    try {
      const response = await fetch(`${api}/orders/${encodeURIComponent(order.value.reference)}/payphone/retry`, { method: 'POST' }); const data = await json(response)
      if (!response.ok || !data.payphone) throw new Error(data.message || 'No pudimos preparar un nuevo intento de pago.')
      retryOpen.value = true; await loadPayphoneWidget(); await nextTick()
      if (!window.PPaymentButtonBox) throw new Error('PayPhone no está disponible.')
      new window.PPaymentButtonBox({ ...data.payphone, lang: 'es', defaultMethod: 'card', timeZone: -5, backgroundColor: '#b86f54' }).render('retry-payphone-button')
    } catch (error) { message.value = error instanceof Error ? error.message : 'No pudimos preparar el pago.' } finally { isRetrying.value = false }
  }
  async function resendEmail() {
    if (!order.value) return
    const contact = verificationContact.value.includes('@') ? { email: verificationContact.value } : { phone: verificationContact.value }
    const response = await fetch(`${api}/orders/${encodeURIComponent(order.value.reference)}/resend-email`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recipientEmail: recipientEmail.value || undefined, contact }) })
    const data = await json(response); resendMessage.value = response.ok ? `Listo. Enviamos la información a ${data.recipient}. Revisa también spam.` : data.message || 'No pudimos reenviar el correo.'
  }
  async function lookupOrders() {
    const contact = lookupContact.value.includes('@') ? { email: lookupContact.value } : { phone: lookupContact.value }
    const response = await fetch(`${api}/orders/lookup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(contact) }); const data = await json(response)
    foundOrders.value = data.orders || []; lookupMessage.value = response.ok ? (foundOrders.value.length ? '' : 'No encontramos pedidos con esos datos.') : data.message || 'No pudimos buscar los pedidos.'
    await nextTick()
    document.querySelectorAll<HTMLAnchorElement>('.lookup .result').forEach((link) => {
      if (link.dataset.modalBound) return
      link.dataset.modalBound = 'true'
      link.addEventListener('click', (event) => {
        event.preventDefault()
        event.stopImmediatePropagation()
        const reference = new URL(link.href).searchParams.get('reference')
        if (reference) void openFoundOrder(reference)
      }, { capture: true })
    })
  }
  async function openFoundOrder(reference: string) {
    try {
      const response = await fetch(`${api}/orders/${encodeURIComponent(reference)}`)
      const data = await json(response)
      if (!response.ok || !data.order) throw new Error(data.message || 'No pudimos abrir este pedido.')
      selectedSearchOrder.value = data.order
      await nextTick()
      const modal = document.querySelector<HTMLElement>('.order-detail-modal')
      const title = modal?.querySelector<HTMLElement>('h2')
      if (title) title.dataset.reference = data.order.reference
      if (!modal?.querySelector('.order-detail-whatsapp')) {
        const support = document.createElement('a')
        support.className = 'order-detail-whatsapp'
        support.href = `https://wa.me/593998655256?text=${encodeURIComponent(`Hola OMG Lashes, necesito ayuda con mi pedido ${data.order.reference}. Pago: ${data.order.paymentMethod === 'payphone' ? 'PayPhone' : 'Transferencia'}. Estado: ${data.order.status === 'paid' ? 'Pagado' : data.order.status === 'awaiting_transfer' ? 'Esperando transferencia' : 'Pago pendiente'}. NO CAMBIES ESTE MENSAJE para una atención más rápida.`)}`
        support.target = '_blank'
        support.rel = 'noreferrer'
        support.innerHTML = '<i class="fa-brands fa-whatsapp" aria-hidden="true"></i><span><b>¿Necesitas ayuda?</b><small>Escríbenos por WhatsApp</small></span><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>'
        const fullDetail = document.createElement('a')
        fullDetail.className = 'order-detail-full'
        fullDetail.href = `/order-status?reference=${encodeURIComponent(data.order.reference)}`
        fullDetail.innerHTML = '<i class="fa-solid fa-receipt" aria-hidden="true"></i> Ver seguimiento completo <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>'
        modal?.querySelector('.order-detail-done')?.insertAdjacentElement('beforebegin', support)
        modal?.querySelector('.order-detail-done')?.insertAdjacentElement('beforebegin', fullDetail)
      }
    } catch (error) { lookupMessage.value = error instanceof Error ? error.message : 'No pudimos abrir este pedido.' }
  }
  return {
    order, transaction, message, isLoading, isRetrying, retryOpen, recipientEmail,
    verificationContact, resendMessage, lookupContact, foundOrders, selectedSearchOrder,
    lookupMessage, money, isPayResponse, paymentFailed, statusLabel, whatsappUrl,
    loadOrder, retryPayment, resendEmail, lookupOrders, openFoundOrder,
  }
}
