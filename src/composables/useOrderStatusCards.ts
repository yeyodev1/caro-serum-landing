import type { Order } from '@/types/order-status'

// Tarjetas que se añaden al DOM sobre la ficha del pedido: soporte por WhatsApp
// y el aviso de facturación. Reciben el pedido ya cargado.
const WHATSAPP_PHONE = '593998655256'

function whatsappLink(order: Order, statusLabel: string) {
  const text = `Hola OMG Lashes, necesito ayuda con mi pedido ${order.reference}. Estado: ${statusLabel}. NO CAMBIES ESTE MENSAJE para que podamos atenderte más rápido.`
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`
}

export function showWhatsAppConfirmModal(order: Order | null, statusLabel: string) {
  if (!order) return
  document.querySelector('.whatsapp-confirm-overlay')?.remove()
  const modal = document.createElement('section')
  modal.className = 'whatsapp-confirm-overlay'
  modal.setAttribute('role', 'dialog')
  modal.setAttribute('aria-modal', 'true')
  const preview = `Hola OMG Lashes, necesito ayuda con mi pedido ${order.reference}. Estado: ${statusLabel}. NO CAMBIES ESTE MENSAJE para que podamos atenderte más rápido.`
  modal.innerHTML = `<div class="whatsapp-confirm-card">
    <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
    <p>ATENCIÓN RÁPIDA</p>
    <h2>Te preparamos<br>el mensaje.</h2>
    <strong>No cambies el mensaje por defecto.</strong>
    <span>Incluye tu referencia y estado para que podamos ayudarte más rápido.</span>
    <div class="whatsapp-message-preview">${preview}</div>
    <div>
      <button class="whatsapp-cancel" type="button">Cancelar</button>
      <a class="whatsapp-open" href="${whatsappLink(order, statusLabel)}" target="_blank" rel="noreferrer">Abrir WhatsApp</a>
    </div>
  </div>`
  modal.querySelector('.whatsapp-cancel')?.addEventListener('click', () => modal.remove())
  modal.addEventListener('click', (event) => { if (event.target === modal) modal.remove() })
  document.body.appendChild(modal)
}

export function renderWhatsAppSupport(order: Order | null, statusLabel: string, whatsappUrl: string) {
  const copy = document.querySelector<HTMLElement>('.status-copy')
  const emailCard = document.querySelector<HTMLElement>('.email-card')
  if (!copy || !emailCard || !order) return

  if (!copy.querySelector('.support-whatsapp')) {
    const link = document.createElement('a')
    link.className = 'whatsapp support-whatsapp'
    link.href = whatsappUrl
    link.target = '_blank'
    link.rel = 'noreferrer'
    link.innerHTML = '<i class="fa-brands fa-whatsapp" aria-hidden="true"></i> WhatsApp: no cambies el mensaje'
    copy.querySelector('.primary')?.insertAdjacentElement('afterend', link)
  }

  if (emailCard.querySelector('.email-whatsapp-support')) return
  const support = document.createElement('button')
  support.type = 'button'
  support.className = 'email-whatsapp-support'
  support.innerHTML = '<i class="fa-brands fa-whatsapp" aria-hidden="true"></i> ¿Necesitas ayuda por WhatsApp?'
  support.addEventListener('click', () => showWhatsAppConfirmModal(order, statusLabel))
  emailCard.appendChild(support)
}

export function renderInvoiceStatus(order: Order | null) {
  const emailCard = document.querySelector<HTMLElement>('.email-card')
  if (!emailCard || !order?.invoice?.requested || emailCard.querySelector('.invoice-inline')) return
  const card = document.createElement('section')
  card.className = 'invoice-inline'
  card.innerHTML = '<i class="fa-solid fa-file-invoice" aria-hidden="true"></i><div><p>FACTURACIÓN SOLICITADA</p><b>Tu factura está en preparación.</b><span>La enviaremos pronto a </span></div>'
  const email = document.createElement('strong')
  email.textContent = order.invoice.email === 'correo registrado'
    ? order.buyerEmail || 'tu correo registrado'
    : order.invoice.email || 'tu correo registrado'
  card.querySelector('div')?.appendChild(email)
  emailCard.appendChild(card)
}
