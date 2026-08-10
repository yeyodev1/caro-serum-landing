import type { OrderResponse } from '@/types/landing'

const CSS_URL = 'https://cdn.payphonetodoesposible.com/box/v2.0/payphone-payment-box.css'
const JS_URL = 'https://cdn.payphonetodoesposible.com/box/v2.0/payphone-payment-box.js'

export function getPayPhone(response: OrderResponse) {
  return response.payphone || {
    token: response.token,
    storeId: response.storeId,
    clientTransactionId: response.clientTransactionId,
    amount: undefined,
    amountWithoutTax: undefined,
    currency: undefined,
    reference: response.reference,
  }
}

export async function loadPayPhoneWidget() {
  if (window.PPaymentButtonBox) return
  await new Promise<void>((resolve, reject) => {
    if (!document.querySelector(`link[href="${CSS_URL}"]`)) {
      const stylesheet = document.createElement('link')
      stylesheet.rel = 'stylesheet'
      stylesheet.href = CSS_URL
      document.head.appendChild(stylesheet)
    }
    const script = document.createElement('script')
    script.type = 'module'
    script.src = JS_URL
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('No se pudo cargar el método de pago.'))
    document.head.appendChild(script)
  })
}

export function renderPayPhoneBox(
  payphone: ReturnType<typeof getPayPhone>,
  totalCents: number,
  fallbackReference: string,
) {
  if (!window.PPaymentButtonBox) throw new Error('El botón de pago no está disponible.')
  new window.PPaymentButtonBox({
    token: payphone.token,
    storeId: payphone.storeId,
    clientTransactionId: payphone.clientTransactionId,
    amount: payphone.amount ?? totalCents / 100,
    amountWithoutTax: payphone.amountWithoutTax ?? totalCents / 100,
    currency: payphone.currency || 'USD',
    reference: payphone.reference || fallbackReference,
    lang: 'es',
    defaultMethod: 'card',
    timeZone: -5,
    backgroundColor: '#b86f54',
  }).render('payphone-gateway-button')
}
