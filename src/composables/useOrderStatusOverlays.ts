// Pantalla de carga del retorno de PayPhone. Se inyecta en el DOM porque aparece
// antes de que la vista tenga los datos del pedido.
let startedAt = 0
let timer: ReturnType<typeof setTimeout> | undefined

const LOADING_HTML = `
  <div class="payphone-loading-card">
    <div class="payphone-loading-orbit"><i class="fa-solid fa-lock" aria-hidden="true"></i></div>
    <p>VERIFICACIÓN SEGURA</p>
    <h1>Estamos confirmando<br>tu pago.</h1>
    <span>Conectando de forma segura con PayPhone</span>
    <ol>
      <li class="active"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Conectando con PayPhone</li>
      <li><i class="fa-solid fa-circle-notch" aria-hidden="true"></i> Verificando la transacción</li>
      <li><i class="fa-solid fa-receipt" aria-hidden="true"></i> Actualizando tu pedido</li>
    </ol>
  </div>`

export function showPaymentLoadingScreen(isPayResponse: boolean) {
  if (!isPayResponse) return
  startedAt = Date.now()
  document.querySelector('.payphone-loading-overlay')?.remove()
  const loading = document.createElement('section')
  loading.className = 'payphone-loading-overlay'
  loading.setAttribute('role', 'status')
  loading.setAttribute('aria-live', 'polite')
  loading.innerHTML = LOADING_HTML
  document.body.appendChild(loading)
  timer = setTimeout(
    () => loading.querySelectorAll('li').forEach((item, index) => item.classList.toggle('active', index < 2)),
    420,
  )
}

// Se mantiene visible un mínimo de 950 ms para que no parpadee.
export async function hidePaymentLoadingScreen(isPayResponse: boolean) {
  if (!isPayResponse) return
  const remaining = 950 - (Date.now() - startedAt)
  if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining))
  clearTimeout(timer)
  const loading = document.querySelector<HTMLElement>('.payphone-loading-overlay')
  if (!loading) return
  loading.classList.add('is-leaving')
  setTimeout(() => loading.remove(), 240)
}

export function clearOverlayTimers() { clearTimeout(timer) }

export function removeOverlays() {
  document.querySelector('.payphone-direct-support')?.remove()
  document.querySelector('.payphone-loading-overlay')?.remove()
  document.querySelector('.whatsapp-confirm-overlay')?.remove()
  document.querySelector('.invoice-inline')?.remove()
}
