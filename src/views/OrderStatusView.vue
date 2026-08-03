<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getApiBaseUrl } from '@/config/api'

type Order = { reference: string; buyerEmail?: string; invoice?: { requested: boolean; email?: string }; paymentMethod: 'payphone' | 'transfer'; status: 'awaiting_transfer' | 'pending_payphone' | 'paid' | 'cancelled'; shippingCents: number; totalCents: number; createdAt: string; hasTransferReceipt: boolean; items: { name: string; quantity: number; lineTotalCents: number }[] }
type Payphone = { token: string; storeId: string; clientTransactionId: string; amount: number; amountWithoutTax: number; currency: string; reference: string }
declare global { interface Window { PPaymentButtonBox?: new (config: Record<string, unknown>) => { render: (id: string) => void } } }

const route = useRoute()
const api = getApiBaseUrl()
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
const lookupMessage = ref('')
let paymentLoadingStartedAt = 0
let paymentLoadingTimer: ReturnType<typeof setTimeout> | undefined
const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
const isPayResponse = computed(() => route.path === '/pay-response')
const paymentFailed = computed(() => isPayResponse.value && order.value?.status !== 'paid' && transaction.value?.statusCode !== 3)
const statusLabel = computed(() => paymentFailed.value ? 'Pago no completado' : order.value?.status === 'paid' ? 'Pago confirmado' : order.value?.status === 'awaiting_transfer' ? 'Esperando transferencia' : 'Pago pendiente')
const whatsappUrl = computed(() => order.value ? `https://wa.me/593998655256?text=${encodeURIComponent(`Hola OMG Lashes, necesito ayuda con mi pedido ${order.value.reference}. Estado: ${statusLabel.value}. NO CAMBIES ESTE MENSAJE para que podamos atenderte más rápido.`)}` : '#')

function showPaymentLoadingScreen() {
  if (!isPayResponse.value) return
  paymentLoadingStartedAt = Date.now()
  document.querySelector('.payphone-loading-overlay')?.remove()
  const loading = document.createElement('section')
  loading.className = 'payphone-loading-overlay'
  loading.setAttribute('role', 'status')
  loading.setAttribute('aria-live', 'polite')
  loading.innerHTML = '<div class="payphone-loading-card"><div class="payphone-loading-orbit"><i class="fa-solid fa-lock" aria-hidden="true"></i></div><p>VERIFICACIÓN SEGURA</p><h1>Estamos confirmando<br>tu pago.</h1><span>Conectando de forma segura con PayPhone</span><ol><li class="active"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Conectando con PayPhone</li><li><i class="fa-solid fa-circle-notch" aria-hidden="true"></i> Verificando la transacción</li><li><i class="fa-solid fa-receipt" aria-hidden="true"></i> Actualizando tu pedido</li></ol></div>'
  document.body.appendChild(loading)
  paymentLoadingTimer = setTimeout(() => loading.querySelectorAll('li').forEach((item, index) => item.classList.toggle('active', index < 2)), 420)
}

async function hidePaymentLoadingScreen() {
  if (!isPayResponse.value) return
  const remaining = 950 - (Date.now() - paymentLoadingStartedAt)
  if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining))
  clearTimeout(paymentLoadingTimer)
  const loading = document.querySelector<HTMLElement>('.payphone-loading-overlay')
  if (!loading) return
  loading.classList.add('is-leaving')
  setTimeout(() => loading.remove(), 240)
}

function renderWhatsAppSupport() {
  const copy = document.querySelector<HTMLElement>('.status-copy')
  const emailCard = document.querySelector<HTMLElement>('.email-card')
  if (!copy || !emailCard || !order.value) return
  if (!copy.querySelector('.support-whatsapp')) {
    const link = document.createElement('a')
    link.className = 'whatsapp support-whatsapp'
    link.href = whatsappUrl.value
    link.target = '_blank'
    link.rel = 'noreferrer'
    link.innerHTML = '<i class="fa-brands fa-whatsapp" aria-hidden="true"></i> WhatsApp: no cambies el mensaje'
    const primary = copy.querySelector('.primary')
    if (primary) primary.insertAdjacentElement('afterend', link)
  }
  if (emailCard.querySelector('.email-whatsapp-support')) return
  const support = document.createElement('button')
  support.type = 'button'
  support.className = 'email-whatsapp-support'
  support.style.cssText = 'align-items:center;background:#25d366;border:0;border-radius:0;color:#102c1b;cursor:pointer;display:flex;font:700 12px Arial,sans-serif;gap:10px;letter-spacing:.03em;margin-top:16px;padding:15px 17px;text-transform:uppercase;width:100%'
  support.innerHTML = '<i class="fa-brands fa-whatsapp" aria-hidden="true"></i> ¿Necesitas ayuda por WhatsApp?'
  support.addEventListener('click', showWhatsAppConfirmModal)
  emailCard.appendChild(support)
}

function showWhatsAppConfirmModal() {
  if (!order.value) return
  document.querySelector('.whatsapp-confirm-overlay')?.remove()
  const modal = document.createElement('section')
  modal.className = 'whatsapp-confirm-overlay'
  modal.setAttribute('role', 'dialog')
  modal.setAttribute('aria-modal', 'true')
  modal.innerHTML = `<div class="whatsapp-confirm-card"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i><p>ATENCIÓN RÁPIDA</p><h2>Te preparamos<br>el mensaje.</h2><strong>No cambies el mensaje por defecto.</strong><span>Incluye tu referencia y estado para que podamos ayudarte más rápido.</span><div class="whatsapp-message-preview">${`Hola OMG Lashes, necesito ayuda con mi pedido ${order.value.reference}. Estado: ${statusLabel.value}. NO CAMBIES ESTE MENSAJE para que podamos atenderte más rápido.`}</div><div><button class="whatsapp-cancel" type="button">Cancelar</button><a class="whatsapp-open" href="${whatsappUrl.value}" target="_blank" rel="noreferrer">Abrir WhatsApp</a></div></div>`
  modal.querySelector('.whatsapp-cancel')?.addEventListener('click', () => modal.remove())
  modal.addEventListener('click', (event) => { if (event.target === modal) modal.remove() })
  document.body.appendChild(modal)
}

async function json(response: Response) { return response.json() as Promise<{ order?: Order; orders?: Order[]; transaction?: { statusCode: number | null; status: string }; payphone?: Payphone; message?: string; recipient?: string }> }
async function loadOrder() {
  isLoading.value = true; message.value = ''; showPaymentLoadingScreen()
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
  } catch (error) { message.value = error instanceof Error ? error.message : 'No pudimos consultar el pedido.' } finally { await hidePaymentLoadingScreen(); isLoading.value = false; void nextTick().then(renderWhatsAppSupport) }
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
}
onMounted(() => {
  const action = document.querySelector<HTMLAnchorElement>('.status-page .header-search')
  if (action) {
    action.href = '/'
    action.innerHTML = '<i class="fa-solid fa-bag-shopping" aria-hidden="true"></i> Volver a comprar'
  }
  void loadOrder()
})
onBeforeUnmount(() => { document.querySelector('.payphone-direct-support')?.remove(); document.querySelector('.whatsapp-confirm-overlay')?.remove() })
</script>

<template>
  <main class="status-page"><header><RouterLink class="brand" to="/"><img src="/omg-lashes-logo.png" alt="OMG Lashes"></RouterLink><a class="header-search" href="#buscar">Buscar mi pedido <span>→</span></a></header><section class="hero"><div class="status-copy"><p class="eyebrow">{{ isPayResponse ? 'RESPUESTA DE PAGO' : 'SEGUIMIENTO DE PEDIDO' }}</p><p v-if="isLoading">Estamos revisando tu pedido...</p><template v-else-if="order"><span class="status" :class="{ failed: paymentFailed, paid: order.status === 'paid' }">{{ statusLabel }}</span><h1>{{ paymentFailed ? 'Tu pago no se completó.' : order.status === 'paid' ? 'Tu pago fue confirmado.' : order.paymentMethod === 'transfer' ? 'Tu transferencia está en revisión.' : 'Tu pago está pendiente.' }}</h1><p class="lead">{{ paymentFailed ? 'No se realizó ningún cobro. Tu pedido sigue guardado y puedes reintentar de forma segura.' : `Pedido ${order.reference}` }}</p><button v-if="paymentFailed" class="primary" :disabled="isRetrying" @click="retryPayment">{{ isRetrying ? 'Preparando pago...' : 'Reintentar pago con PayPhone' }} <span>→</span></button><a v-else class="whatsapp" :href="whatsappUrl" target="_blank" rel="noreferrer">Consultar por WhatsApp <span>→</span></a></template><p v-else class="error">{{ message }}</p></div><div class="hero-visual" aria-hidden="true"></div></section><section v-if="order" class="details"><div class="summary"><p><span>Referencia</span><b>{{ order.reference }}</b></p><p><span>Total</span><b>{{ money(order.totalCents) }}</b></p><p><span>Pago</span><b>{{ order.paymentMethod === 'payphone' ? 'PayPhone' : 'Transferencia' }}</b></p></div><div class="items"><h2>Detalles de tu pedido</h2><p v-for="item in order.items" :key="item.name"><span>{{ item.quantity }} × {{ item.name }}</span><b>{{ money(item.lineTotalCents) }}</b></p></div><div class="email-card"><h2>Información por correo</h2><p>El correo original del pedido es <b>{{ order.buyerEmail || 'el correo registrado' }}</b>.</p><p>Si no lo encuentras, revisa spam o reenvíalo.</p><button @click="resendEmail">Reenviar al correo original</button><label>Enviar a otro correo<input v-model.trim="recipientEmail" type="email" placeholder="nuevo@correo.com"></label><label v-if="recipientEmail">Confirma el correo o WhatsApp usado en la compra<input v-model.trim="verificationContact" placeholder="correo o +593..."></label><button v-if="recipientEmail" @click="resendEmail">Enviar a este correo</button><small v-if="resendMessage">{{ resendMessage }}</small></div></section><section id="buscar" class="lookup"><p class="eyebrow">AYUDA RÁPIDA</p><h2>Busca tu pedido.</h2><p>Ingresa el correo o WhatsApp que usaste al comprar.</p><form @submit.prevent="lookupOrders"><input v-model.trim="lookupContact" required placeholder="correo@ejemplo.com o +593..."><button>Buscar</button></form><small v-if="lookupMessage">{{ lookupMessage }}</small><RouterLink v-for="result in foundOrders" :key="result.reference" class="result" :to="{ path: '/order-status', query: { reference: result.reference } }"><span>{{ result.reference }} · {{ new Date(result.createdAt).toLocaleDateString('es-EC') }}</span><b>{{ result.status === 'paid' ? 'PAGADO' : 'VER PEDIDO' }} →</b></RouterLink></section><Transition name="overlay"><div v-if="retryOpen" class="retry-overlay"><section class="retry-card"><button class="close" @click="retryOpen = false">×</button><p class="eyebrow">REINTENTO SEGURO</p><h2>Completa tu pago.</h2><p>Usa PayPhone para finalizar tu pedido.</p><div id="retry-payphone-button"></div></section></div></Transition></main>
  <section v-if="order?.invoice?.requested" class="invoice-status"><p>FACTURACIÓN</p><h2>Datos recibidos.</h2><span><i class="fa-solid fa-file-invoice"></i> Tu factura se emitirá pronto y llegará a {{ order.invoice.email || 'tu correo registrado' }}.</span></section>
</template>

<style scoped lang="scss">
.status-page { --ink:#211e1d;--cream:#fbf7f2;--pink:#f4d9d5;--copper:#b86f54;background:var(--cream);color:var(--ink);font-family:Arial,sans-serif;min-height:100vh;padding:28px 5vw 70px }.status-page>header { align-items:center;display:flex;justify-content:space-between;margin:auto;max-width:1300px }.brand img { display:block;width:210px }.header-search { border-bottom:1px solid var(--ink);color:var(--ink);font:600 11px Arial,sans-serif;letter-spacing:.08em;padding:7px 0;text-decoration:none;text-transform:uppercase }.header-search span { color:var(--copper) }.hero { background:var(--ink);color:var(--cream);display:grid;grid-template-columns:1.1fr .9fr;margin:48px auto 0;max-width:1300px;min-height:430px }.status-copy { align-self:center;padding:58px }.eyebrow { color:var(--copper);font:600 10px Arial,sans-serif;letter-spacing:.13em }.status { background:#f8e4ba;color:#765219;display:inline-block;font:600 10px Arial,sans-serif;letter-spacing:.07em;margin:22px 0 15px;padding:8px 10px;text-transform:uppercase }.status.failed { background:#f3d3cd;color:#973a2e }.status.paid { background:#d8eadb;color:#216235 }.hero h1 { font:600 clamp(48px,6vw,82px)/.9 Georgia,serif;letter-spacing:-.07em;margin:0;max-width:620px }.lead { color:#eaded8;font-size:16px;line-height:1.55;max-width:540px }.primary,.whatsapp,.email-card button,.lookup button { background:var(--copper);border:0;color:#fffaf5;cursor:pointer;display:flex;font:600 11px Arial,sans-serif;justify-content:space-between;letter-spacing:.07em;margin-top:26px;padding:16px 19px;text-transform:uppercase }.primary:disabled { opacity:.6 }.whatsapp { background:transparent;border:1px solid #fffaf5;text-decoration:none;width:max-content }.hero-visual { background:linear-gradient(90deg,rgba(33,30,29,.12),rgba(33,30,29,.05)),url('https://res.cloudinary.com/dcoqwxbd/image/upload/f_auto,q_auto,w_900/omglashes/assets/hero-eyeliner.jpg') center/cover }.details,.lookup { display:grid;gap:28px;grid-template-columns:1fr 1fr;margin:0 auto;max-width:1100px;padding:60px 0 }.summary { background:var(--pink);display:grid;gap:14px;grid-column:1/-1;grid-template-columns:repeat(3,1fr);padding:20px }.summary p { display:grid;gap:6px;margin:0 }.summary span { color:var(--copper);font-size:10px;letter-spacing:.07em;text-transform:uppercase }.summary b { font-size:14px }.items,.email-card { border-top:1px solid #cdbfba;padding-top:20px }.items h2,.email-card h2,.lookup h2 { font:600 29px Georgia,serif;margin:0 0 12px }.items p { display:flex;font-size:13px;justify-content:space-between;margin:0;padding:11px 0 }.email-card p,.lookup>p { font-size:13px;line-height:1.5 }.email-card label { display:grid;font-size:11px;gap:7px;margin-top:14px }.email-card input,.lookup input { border:1px solid #bcaeaa;font:14px Arial,sans-serif;padding:12px }.email-card button { margin-top:14px }.email-card small,.lookup small { color:#a53c32;display:block;font-size:12px;margin-top:10px }.lookup { border-top:1px solid #cdbfba;display:block }.lookup form { display:flex;gap:10px;margin-top:18px;max-width:600px }.lookup input { flex:1 }.lookup button { margin:0 }.result { align-items:center;border-top:1px solid #d9ccc7;color:var(--ink);display:flex;font-size:12px;justify-content:space-between;margin-top:16px;max-width:700px;padding:14px 0;text-decoration:none }.result b { color:var(--copper) }.retry-overlay { align-items:center;background:rgba(33,30,29,.7);display:flex;inset:0;justify-content:center;position:fixed;z-index:10 }.retry-card { background:var(--cream);max-height:calc(100dvh - 36px);max-width:580px;overflow:auto;padding:45px;position:relative;width:min(580px,100%) }.retry-card .close { background:none;border:0;font-size:35px;position:absolute;right:20px;top:10px }.retry-card h2 { font:600 52px/.9 Georgia,serif;margin:18px 0 }.retry-card p { line-height:1.5 }.error { color:#f3d3cd }@media (max-width:720px) { .status-page { padding:20px 0 50px }.status-page>header { padding:0 20px }.brand img { width:165px }.header-search { font-size:9px }.hero { display:flex;flex-direction:column;margin-top:28px }.status-copy { padding:38px 24px }.hero h1 { font-size:51px }.hero-visual { min-height:200px;order:-1 }.details,.lookup { display:block;padding:40px 24px }.summary { grid-template-columns:1fr }.email-card { margin-top:30px }.lookup form { display:grid }.lookup button { justify-content:center }.retry-card { margin:18px;padding:38px 24px } }
</style>
<style scoped lang="scss">
.invoice-status { background:#f4d9d5;margin:0 auto;max-width:1300px;padding:28px 5vw 42px; }.invoice-status p { color:#b86f54;font:600 10px Arial,sans-serif;letter-spacing:.12em;margin:0 0 8px; }.invoice-status h2 { font:600 30px Georgia,serif;letter-spacing:-.05em;margin:0 0 10px; }.invoice-status span { font:14px/1.5 Arial,sans-serif; }.invoice-status i { color:#b86f54;margin-right:7px; }
</style>
<style scoped lang="scss">
.status-copy.is-loading { min-height:270px; position:relative; }
.status-copy.is-loading::after { animation:payment-spin .9s linear infinite; border:3px solid rgba(244,217,213,.25); border-right-color:var(--copper); border-top-color:#fffaf5; border-radius:50%; content:''; height:42px; margin-top:28px; width:42px; }
.status-copy.is-loading p:not(.eyebrow) { color:#fffaf5; font:500 15px/1.5 Arial,sans-serif; margin:22px 0 0; max-width:310px; }
@keyframes payment-spin { to { transform:rotate(360deg); } }
@media (prefers-reduced-motion:reduce) { .status-copy.is-loading::after { animation:none; } }
</style>
<style lang="scss">
.payphone-loading-overlay { align-items:center; background:radial-gradient(circle at center,#4a3027 0,#211e1d 68%); color:#fffaf5; display:flex; inset:0; justify-content:center; opacity:1; position:fixed; transition:opacity .24s ease; z-index:9999; }
.payphone-loading-overlay.is-leaving { opacity:0; }
.payphone-loading-card { max-width:430px; padding:30px; text-align:center; width:100%; }
.payphone-loading-orbit { align-items:center; animation:payphone-orbit 1.15s linear infinite; border:3px solid rgba(244,217,213,.2); border-right-color:#c2785a; border-top-color:#fffaf5; border-radius:50%; display:flex; font-size:20px; height:76px; justify-content:center; margin:0 auto 28px; width:76px; }
.payphone-loading-orbit i { animation:payphone-orbit-reverse 1.15s linear infinite; color:#f4d9d5; }
.payphone-loading-card>p { color:#c2785a; font:600 10px Arial,sans-serif; letter-spacing:.14em; }
.payphone-loading-card h1 { font:600 clamp(42px,8vw,62px)/.9 Georgia,serif; letter-spacing:-.07em; margin:15px 0; }
.payphone-loading-card>span { color:#eaded8; font:14px/1.5 Arial,sans-serif; }
.payphone-loading-card ol { display:grid; gap:11px; list-style:none; margin:32px 0 0; padding:0; text-align:left; }
.payphone-loading-card li { color:#a99c97; font:13px Arial,sans-serif; transition:color .25s; }
.payphone-loading-card li i { color:#765d54; margin-right:10px; width:16px; }
.payphone-loading-card li.active { color:#fffaf5; }
.payphone-loading-card li.active i { color:#c2785a; }
@keyframes payphone-orbit { to { transform:rotate(360deg); } }
@keyframes payphone-orbit-reverse { to { transform:rotate(-360deg); } }
@media (prefers-reduced-motion:reduce) { .payphone-loading-orbit,.payphone-loading-orbit i { animation:none; } .payphone-loading-overlay { transition:none; } }
</style>
<style lang="scss">
.payphone-direct-support { align-items:center; background:#25d366; border:2px solid #fff; border-radius:999px; bottom:22px; box-shadow:0 12px 30px rgba(33,30,29,.28); color:#102c1b; display:flex; gap:10px; padding:10px 17px 10px 12px; position:fixed; right:22px; text-decoration:none; transition:transform .2s,box-shadow .2s; z-index:500; }
.payphone-direct-support:hover { box-shadow:0 16px 35px rgba(33,30,29,.34); transform:translateY(-3px); }
.payphone-direct-support>i { font-size:26px; }
.payphone-direct-support span { display:grid; gap:2px; }
.payphone-direct-support b { font:700 11px Arial,sans-serif; }
.payphone-direct-support small { font:10px Arial,sans-serif; }
@media (max-width:600px) { .payphone-direct-support { bottom:16px; left:16px; right:16px; justify-content:center; } }
</style>
<style lang="scss">
.email-whatsapp-support { align-items:center; background:#25d366 !important; color:#102c1b !important; display:flex; gap:9px; margin-top:14px !important; }
.email-whatsapp-support i { font-size:18px; }
.whatsapp-confirm-overlay { align-items:center; background:rgba(33,30,29,.72); display:flex; inset:0; justify-content:center; position:fixed; z-index:9999; }
.whatsapp-confirm-card { background:#fbf7f2; box-shadow:18px 18px 0 #211e1d; max-width:520px; padding:42px; text-align:center; width:min(520px,calc(100% - 36px)); }
.whatsapp-confirm-card>i { color:#25d366; font-size:42px; }
.whatsapp-confirm-card>p { color:#b86f54; font:600 10px Arial,sans-serif; letter-spacing:.12em; margin:14px 0 8px; }
.whatsapp-confirm-card h2 { font:600 clamp(40px,7vw,58px)/.9 Georgia,serif; letter-spacing:-.07em; margin:0 0 16px; }
.whatsapp-confirm-card strong { color:#a23d31; display:block; font:700 13px Arial,sans-serif; }
.whatsapp-confirm-card>span { display:block; font:13px/1.5 Arial,sans-serif; margin:10px auto 18px; max-width:340px; }
.whatsapp-message-preview { background:#e8f7ea; border-left:4px solid #25d366; font:12px/1.5 Arial,sans-serif; padding:14px; text-align:left; }
.whatsapp-confirm-card>div:last-child { display:flex; gap:12px; justify-content:center; margin-top:22px; }
.whatsapp-confirm-card button,.whatsapp-open { border:0; cursor:pointer; font:600 11px Arial,sans-serif; letter-spacing:.06em; padding:14px 16px; text-decoration:none; text-transform:uppercase; }
.whatsapp-cancel { background:#e9dfda; color:#211e1d; }
.whatsapp-open { background:#25d366; color:#102c1b; }
@media (max-width:600px) { .whatsapp-confirm-card { box-shadow:9px 9px 0 #211e1d; padding:32px 22px; } .whatsapp-confirm-card>div:last-child { display:grid; } }
</style>
