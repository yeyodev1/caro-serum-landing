<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getApiBaseUrl } from '@/config/api'
import { combos, masks, products } from '@/config/catalog'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminModal from '@/components/admin/AdminModal.vue'

type OrderItem = { productId: string; name: string; contents?: string; unitPriceCents: number; quantity: number; lineTotalCents: number }
type Invoice = { identification: string; firstName: string; lastName: string; email: string; address: string }
type Order = {
  reference: string
  status: 'awaiting_transfer' | 'pending_payphone' | 'paid' | 'cancelled'
  paymentMethod: 'payphone' | 'transfer'
  createdAt: string
  items: OrderItem[]
  subtotalCents: number
  shippingCents: number
  totalCents: number
  buyer: { firstName: string; lastName: string; email: string; phone: string }
  delivery: { province: string; city: string; address: string; reference: string; googleMapsUrl?: string }
  invoice?: Invoice | null
  hasTransferReceipt: boolean
}
type Section = 'transfers' | 'all' | 'pending' | 'paid'

const router = useRouter()
const api = getApiBaseUrl()
const orders = ref<Order[]>([])
const section = ref<Section>('transfers')
const toast = ref('')
const isLoading = ref(true)
const detailTarget = ref<Order | null>(null)
const approveTarget = ref<Order | null>(null)
const approvingReference = ref('')
const receipt = ref<{ order: Order | null; url: string; isLoading: boolean }>({ order: null, url: '', isLoading: false })

// Los pedidos viejos se guardaron sin el detalle del combo, asi que resolvemos texto
// e imagen desde el catalogo de la landing: el panel muestra siempre que compraron.
const catalogById = Object.fromEntries([...products, ...combos, ...masks].map((product) => [product.id, product]))
const contentsByProductId = Object.fromEntries(Object.entries(catalogById).map(([id, product]) => [id, product.detail]))

const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
const itemContents = (item: OrderItem) => item.contents || contentsByProductId[item.productId] || ''
// El catalogo pide las fotos a 1254-1536 px para la landing; aqui la mas grande
// es la del detalle (76 px, 152 en pantallas 2x), asi que le bajamos el ancho a
// Cloudinary. Las que viven en /public se sirven tal cual.
const itemImage = (item: OrderItem) => (catalogById[item.productId]?.image || '').replace(/,w_\d+\//, ',w_160/')
const itemCount = (order: Order) => order.items.reduce((total, item) => total + item.quantity, 0)
const statusLabel = (status: Order['status']) => status === 'paid' ? 'PAGADO' : status === 'awaiting_transfer' ? 'TRANSFERENCIA POR REVISAR' : status === 'cancelled' ? 'CANCELADO' : 'PAGO PENDIENTE'

function formatPhone(phone: string) {
  const local = phone.replace(/\D/g, '').replace(/^593/, '')
  return /^9\d{8}$/.test(local) ? `+593 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}` : phone
}

const visibleOrders = computed(() => orders.value.filter((order) => section.value === 'all' || (section.value === 'transfers' && order.paymentMethod === 'transfer' && order.status === 'awaiting_transfer') || (section.value === 'pending' && order.status === 'pending_payphone') || (section.value === 'paid' && order.status === 'paid')))
const counts = computed(() => ({ transfers: orders.value.filter((order) => order.paymentMethod === 'transfer' && order.status === 'awaiting_transfer').length, pending: orders.value.filter((order) => order.status === 'pending_payphone').length, paid: orders.value.filter((order) => order.status === 'paid').length }))

function headers() { return { Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`, 'Content-Type': 'application/json' } }
function notify(message: string) { toast.value = message; window.setTimeout(() => { toast.value = '' }, 3500) }
function setSection(value: Section | 'users') { if (value !== 'users') section.value = value }

function whatsappLink(order: Order) {
  const phone = order.buyer.phone.replace(/\D/g, '')
  const international = phone.startsWith('593') ? phone : phone.startsWith('0') ? `593${phone.slice(1)}` : phone
  return `https://wa.me/${international}?text=${encodeURIComponent(`Hola ${order.buyer.firstName}, te escribimos de OMG Lashes sobre tu pedido ${order.reference}.`)}`
}

// Bloque listo para pegar en la guia del courier sin volver a tipear nada.
function shippingSummary(order: Order) {
  const lines = [
    `Pedido ${order.reference}`,
    `Cliente: ${order.buyer.firstName} ${order.buyer.lastName}`,
    `WhatsApp: ${formatPhone(order.buyer.phone)}`,
    `Correo: ${order.buyer.email}`,
    `Ciudad: ${order.delivery.city}, ${order.delivery.province}`,
    `Dirección: ${order.delivery.address}`,
    `Referencia: ${order.delivery.reference}`,
    '',
    'Productos:',
    ...order.items.map((item) => `${item.quantity} x ${item.name}${itemContents(item) ? ` (${itemContents(item)})` : ''}`),
    `Total: ${money(order.totalCents)} (${order.paymentMethod === 'transfer' ? 'Transferencia' : 'PayPhone'})`,
  ]
  if (order.invoice?.identification) {
    lines.push('', 'Facturación:', `${order.invoice.identification} · ${order.invoice.firstName} ${order.invoice.lastName}`, order.invoice.email, order.invoice.address)
  }
  return lines.join('\n')
}

// El portapapeles moderno falla en contexto inseguro o sin foco, por eso el respaldo.
function copyWithTextarea(text: string) {
  const field = document.createElement('textarea')
  field.value = text
  field.setAttribute('readonly', '')
  field.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0'
  document.body.appendChild(field)
  field.select()
  const copied = document.execCommand('copy')
  document.body.removeChild(field)
  return copied
}

async function copyShipping(order: Order) {
  const summary = shippingSummary(order)
  try {
    await navigator.clipboard.writeText(summary)
    notify('Datos del pedido copiados. Pégalos en la guía de envío.')
  } catch {
    notify(copyWithTextarea(summary)
      ? 'Datos del pedido copiados. Pégalos en la guía de envío.'
      : 'Tu navegador bloqueó el copiado. Selecciona los datos manualmente.')
  }
}

async function loadOrders() {
  isLoading.value = true
  try {
    const response = await fetch(`${api}/orders/admin/list`, { headers: headers() })
    const data = await response.json() as { orders?: Order[]; message?: string }
    if (!response.ok) throw new Error(data.message || 'No pudimos cargar los pedidos.')
    orders.value = data.orders || []
  } catch (error) {
    notify(error instanceof Error ? error.message : 'No pudimos cargar los pedidos.')
  } finally {
    isLoading.value = false
  }
}

// Aprobar dispara el correo de confirmacion al cliente, asi que se confirma antes.
async function confirmApprove() {
  const order = approveTarget.value
  if (!order) return
  approvingReference.value = order.reference
  try {
    const response = await fetch(`${api}/orders/admin/${encodeURIComponent(order.reference)}/status`, { method: 'PATCH', headers: headers(), body: JSON.stringify({ status: 'paid' }) })
    const data = await response.json() as { message?: string }
    if (!response.ok) throw new Error(data.message || 'No pudimos aprobar la transferencia.')
    order.status = 'paid'
    approveTarget.value = null
    notify('Transferencia aprobada. Se envió el correo de confirmación al cliente.')
  } catch (error) {
    notify(error instanceof Error ? error.message : 'No pudimos aprobar la transferencia.')
  } finally {
    approvingReference.value = ''
  }
}

function approveFromDetail(order: Order) { detailTarget.value = null; approveTarget.value = order }

async function openReceipt(order: Order) {
  detailTarget.value = null
  receipt.value = { order, url: '', isLoading: true }
  try {
    const response = await fetch(`${api}/orders/admin/${encodeURIComponent(order.reference)}/receipt`, { headers: headers() })
    const data = await response.json() as { url?: string; message?: string }
    if (!response.ok || !data.url) throw new Error(data.message || 'No encontramos el comprobante.')
    receipt.value = { order, url: data.url, isLoading: false }
  } catch (error) {
    receipt.value = { order: null, url: '', isLoading: false }
    notify(error instanceof Error ? error.message : 'No pudimos abrir el comprobante.')
  }
}

onMounted(() => {
  const requested = router.currentRoute.value.query.section
  if (typeof requested === 'string' && ['transfers', 'pending', 'paid', 'all'].includes(requested)) section.value = requested as Section
  void loadOrders()
})
</script>

<template>
  <main class="admin">
    <AdminSidebar :active="section" :counts="counts" @select="setSection" />
    <section class="content">
      <header class="content-header">
        <div class="header-title">
          <div>
            <p>OPERACIÓN OMG</p>
            <Transition name="swap" mode="out-in">
              <h1 :key="section">{{ section === 'transfers' ? 'Transferencias por revisar.' : 'Pedidos y pagos.' }}</h1>
            </Transition>
          </div>
        </div>
        <button class="refresh" :disabled="isLoading" @click="loadOrders">
          <i class="fa-solid fa-rotate" :class="{ spinning: isLoading }"></i> Actualizar
        </button>
      </header>

      <div class="stats">
        <span><b>{{ counts.transfers }}</b> transferencias por aprobar</span>
        <span><b>{{ counts.pending }}</b> pagos PayPhone pendientes</span>
        <span><b>{{ counts.paid }}</b> pagos confirmados</span>
      </div>

      <div v-if="isLoading" class="orders skeletons">
        <article v-for="placeholder in 3" :key="placeholder" :style="{ '--i': placeholder - 1 }">
          <span class="admin-skeleton bar sm"></span>
          <span class="admin-skeleton bar lg"></span>
          <span class="admin-skeleton bar md"></span>
          <span class="admin-skeleton bar md"></span>
        </article>
      </div>

      <Transition v-else name="swap">
        <p v-if="!visibleOrders.length" class="empty">No hay pedidos en esta sección.</p>
      </Transition>

      <TransitionGroup v-if="!isLoading" name="order" tag="div" class="orders">
        <article v-for="(order, index) in visibleOrders" :key="order.reference" :style="{ '--i': Math.min(index, 7) }">
          <div class="order-head">
            <div>
              <small>{{ new Date(order.createdAt).toLocaleString('es-EC') }}</small>
              <h2>{{ order.reference }}</h2>
            </div>
            <Transition name="badge" mode="out-in">
              <strong :key="order.status" :class="order.status">{{ statusLabel(order.status) }}</strong>
            </Transition>
          </div>

          <div class="order-items">
            <b>Pedido</b>
            <ul>
              <li v-for="item in order.items" :key="item.productId">
                <span class="thumb">
                  <img v-if="itemImage(item)" :src="itemImage(item)" :alt="item.name" loading="lazy">
                  <i v-else class="fa-solid fa-box"></i>
                </span>
                <span class="qty">{{ item.quantity }} ×</span>
                <span class="name">
                  {{ item.name }}
                  <small v-if="itemContents(item)">{{ itemContents(item) }}</small>
                </span>
                <span class="line">{{ money(item.lineTotalCents) }}</span>
              </li>
            </ul>
            <p class="totals">
              <span>Subtotal {{ money(order.subtotalCents) }}</span>
              <span>Envío {{ order.shippingCents ? money(order.shippingCents) : 'gratis' }}</span>
              <span class="grand">Total {{ money(order.totalCents) }}</span>
            </p>
          </div>

          <div class="order-details">
            <p>
              <b>Cliente</b>
              {{ order.buyer.firstName }} {{ order.buyer.lastName }}
              <a :href="`https://wa.me/${order.buyer.phone.replace(/\D/g, '')}`" target="_blank" rel="noopener noreferrer">{{ formatPhone(order.buyer.phone) }}</a>
              <a :href="`mailto:${order.buyer.email}`">{{ order.buyer.email }}</a>
            </p>
            <p>
              <b>Entrega</b>
              {{ order.delivery.city }}, {{ order.delivery.province }}
              <span>{{ order.delivery.address }}</span>
              <span v-if="order.delivery.reference" class="hint">Referencia: {{ order.delivery.reference }}</span>
            </p>
            <p>
              <b>Pago</b>
              {{ money(order.totalCents) }}
              <span>{{ order.paymentMethod === 'transfer' ? 'Transferencia bancaria' : 'PayPhone' }}</span>
            </p>
          </div>

          <div v-if="order.invoice?.identification" class="order-invoice">
            <b><i class="fa-solid fa-file-invoice"></i> Datos de facturación</b>
            <div>
              <p><small>CÉDULA O RUC</small>{{ order.invoice.identification }}</p>
              <p><small>NOMBRE</small>{{ order.invoice.firstName }} {{ order.invoice.lastName }}</p>
              <p><small>CORREO</small><a :href="`mailto:${order.invoice.email}`">{{ order.invoice.email }}</a></p>
              <p><small>DIRECCIÓN</small>{{ order.invoice.address }}</p>
            </div>
          </div>
          <p v-else class="order-invoice-empty">Este pedido no solicitó factura.</p>

          <footer>
            <button class="detail" @click="detailTarget = order"><i class="fa-solid fa-eye"></i> Ver pedido</button>
            <a :href="whatsappLink(order)" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-whatsapp"></i> Contactar cliente</a>
            <button class="copy" @click="copyShipping(order)"><i class="fa-solid fa-copy"></i> Copiar datos de envío</button>
            <template v-if="order.paymentMethod === 'transfer' && order.status === 'awaiting_transfer'">
              <button v-if="order.hasTransferReceipt" class="receipt" @click="openReceipt(order)"><i class="fa-solid fa-receipt"></i> Ver comprobante</button>
              <span v-else class="no-receipt"><i class="fa-solid fa-triangle-exclamation"></i> El cliente no subió comprobante</span>
              <button class="approve" @click="approveTarget = order"><i class="fa-solid fa-check"></i> Aprobar y enviar correo</button>
            </template>
          </footer>
        </article>
      </TransitionGroup>
    </section>

    <AdminModal
      :open="Boolean(detailTarget)"
      wide
      :eyebrow="detailTarget ? `${statusLabel(detailTarget.status)} · ${detailTarget.paymentMethod === 'transfer' ? 'Transferencia bancaria' : 'PayPhone'}` : ''"
      :title="detailTarget?.reference || ''"
      @close="detailTarget = null"
    >
      <template v-if="detailTarget">
        <p class="detail-date">{{ new Date(detailTarget.createdAt).toLocaleString('es-EC') }} · {{ itemCount(detailTarget) }} {{ itemCount(detailTarget) === 1 ? 'producto' : 'productos' }}</p>

        <h3>Qué compró</h3>
        <ul class="detail-items">
          <li v-for="item in detailTarget.items" :key="item.productId">
            <span class="detail-thumb">
              <img v-if="itemImage(item)" :src="itemImage(item)" :alt="item.name" loading="lazy">
              <i v-else class="fa-solid fa-box"></i>
            </span>
            <span class="detail-name">
              <b>{{ item.name }}</b>
              <small v-if="itemContents(item)">{{ itemContents(item) }}</small>
              <small class="unit">{{ item.quantity }} × {{ money(item.unitPriceCents) }}</small>
            </span>
            <span class="detail-line">{{ money(item.lineTotalCents) }}</span>
          </li>
        </ul>
        <p class="detail-totals">
          <span>Subtotal <b>{{ money(detailTarget.subtotalCents) }}</b></span>
          <span>Envío <b>{{ detailTarget.shippingCents ? money(detailTarget.shippingCents) : 'gratis' }}</b></span>
          <span class="grand">Total <b>{{ money(detailTarget.totalCents) }}</b></span>
        </p>

        <div class="detail-grid">
          <div>
            <h3>Cliente</h3>
            <p>{{ detailTarget.buyer.firstName }} {{ detailTarget.buyer.lastName }}</p>
            <p><a :href="`https://wa.me/${detailTarget.buyer.phone.replace(/\D/g, '')}`" target="_blank" rel="noopener noreferrer">{{ formatPhone(detailTarget.buyer.phone) }}</a></p>
            <p><a :href="`mailto:${detailTarget.buyer.email}`">{{ detailTarget.buyer.email }}</a></p>
          </div>
          <div>
            <h3>Entrega</h3>
            <p>{{ detailTarget.delivery.city }}, {{ detailTarget.delivery.province }}</p>
            <p>{{ detailTarget.delivery.address }}</p>
            <p v-if="detailTarget.delivery.reference" class="muted">Referencia: {{ detailTarget.delivery.reference }}</p>
          </div>
        </div>

        <div v-if="detailTarget.invoice?.identification" class="detail-invoice">
          <h3><i class="fa-solid fa-file-invoice"></i> Facturación</h3>
          <p><b>{{ detailTarget.invoice.identification }}</b> · {{ detailTarget.invoice.firstName }} {{ detailTarget.invoice.lastName }}</p>
          <p><a :href="`mailto:${detailTarget.invoice.email}`">{{ detailTarget.invoice.email }}</a></p>
          <p class="muted">{{ detailTarget.invoice.address }}</p>
        </div>
        <p v-else class="muted">Este pedido no solicitó factura.</p>
      </template>

      <template #actions>
        <button class="modal-ghost" @click="copyShipping(detailTarget!)"><i class="fa-solid fa-copy"></i> Copiar datos</button>
        <a class="modal-ghost" :href="detailTarget ? whatsappLink(detailTarget) : '#'" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-whatsapp"></i> Escribir</a>
        <template v-if="detailTarget?.paymentMethod === 'transfer' && detailTarget.status === 'awaiting_transfer'">
          <button v-if="detailTarget.hasTransferReceipt" class="modal-ghost" @click="openReceipt(detailTarget)"><i class="fa-solid fa-receipt"></i> Comprobante</button>
          <button class="modal-primary" @click="approveFromDetail(detailTarget)"><i class="fa-solid fa-check"></i> Aprobar</button>
        </template>
        <button v-else class="modal-primary" @click="detailTarget = null">Listo</button>
      </template>
    </AdminModal>

    <AdminModal
      :open="Boolean(approveTarget)"
      eyebrow="Confirmar transferencia"
      :title="`Aprobar ${approveTarget?.buyer.firstName || ''} ${approveTarget?.buyer.lastName || ''}`.trim() + '.'"
      @close="approvingReference ? null : (approveTarget = null)"
    >
      <p>Vas a marcar el pedido <b>{{ approveTarget?.reference }}</b> como pagado y se enviará automáticamente el correo de confirmación al cliente.</p>
      <p v-if="!approveTarget?.hasTransferReceipt" class="approve-warning">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <span>Este pedido <b>no tiene comprobante subido</b>. Confirma en tu banco que entró el depósito de {{ money(approveTarget?.totalCents || 0) }} de {{ approveTarget?.buyer.firstName }} {{ approveTarget?.buyer.lastName }} antes de aprobarlo.</span>
      </p>
      <ul class="modal-summary">
        <li v-for="item in approveTarget?.items || []" :key="item.productId"><span>{{ item.quantity }} × {{ item.name }}</span><b>{{ money(item.lineTotalCents) }}</b></li>
        <li class="grand"><span>Total</span><b>{{ money(approveTarget?.totalCents || 0) }}</b></li>
      </ul>
      <template #actions>
        <button class="modal-ghost" :disabled="Boolean(approvingReference)" @click="approveTarget = null">Cancelar</button>
        <button class="modal-primary" :disabled="Boolean(approvingReference)" @click="confirmApprove">
          <i class="fa-solid" :class="approvingReference ? 'fa-circle-notch spinning' : 'fa-check'"></i>
          {{ approvingReference ? 'Aprobando...' : 'Sí, aprobar y enviar' }}
        </button>
      </template>
    </AdminModal>

    <AdminModal
      :open="Boolean(receipt.order)"
      eyebrow="Comprobante de transferencia"
      :title="receipt.order?.reference || ''"
      @close="receipt = { order: null, url: '', isLoading: false }"
    >
      <div class="receipt-frame">
        <span v-if="receipt.isLoading" class="admin-skeleton receipt-placeholder"></span>
        <img v-else-if="receipt.url" :src="receipt.url" alt="Comprobante de transferencia">
      </div>
      <template #actions>
        <a v-if="receipt.url" class="modal-ghost" :href="receipt.url" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-arrow-up-right-from-square"></i> Abrir original</a>
        <button class="modal-primary" @click="receipt = { order: null, url: '', isLoading: false }">Listo</button>
      </template>
    </AdminModal>

    <Transition name="toast"><div v-if="toast" class="toast">{{ toast }}</div></Transition>
  </main>
</template>

<style scoped lang="scss">
.admin { --ink:#1D1D1B;--cream:#fbf7f2;--pink:#F1B9A9;--pink-soft:#F9E3DC;--gray:#55565A;--copper:#b86f54;background:var(--cream);color:var(--ink);font-family:Arial,sans-serif;min-height:100vh;overflow-x:hidden }.content { margin:auto;max-width:1400px;min-width:0;padding:30px 5vw 50px }@media (min-width:1025px) { .admin { padding-left:280px }.content { padding:44px 48px 60px } }.content-header { align-items:flex-start;display:flex;justify-content:space-between }.header-title { display:flex;flex-direction:column;gap:24px;min-width:0 }.content-header p { color:var(--copper);font-size:10px;letter-spacing:.12em;margin:0 0 9px }.content h1 { font:600 52px/.92 Georgia,serif;letter-spacing:-.07em;margin:0;max-width:580px }.refresh,.orders footer button,.orders footer a { align-items:center;background:var(--ink);border:0;color:var(--cream);cursor:pointer;display:flex;font:600 11px Arial,sans-serif;gap:8px;letter-spacing:.05em;padding:13px 15px;text-decoration:none;text-transform:uppercase }.stats { display:flex;flex-wrap:wrap;gap:12px;margin:35px 0 25px }.stats span { background:var(--pink);font-size:12px;padding:14px }.stats b { font-size:18px }.orders { display:flex;flex-direction:column;gap:16px;min-width:0;position:relative }.orders article { background:#fffdfa;border:1px solid #e1d6d0;min-width:0;padding:22px }.order-head { align-items:start;border-bottom:1px solid #eaded8;display:flex;gap:14px;justify-content:space-between;padding-bottom:16px }.order-head>div,.order-details p { min-width:0 }.order-head small { color:#77787B;font-size:10px }.order-head h2 { font:600 19px Georgia,serif;margin:6px 0 0;overflow-wrap:anywhere;word-break:break-word }.order-head strong { font-size:10px;letter-spacing:.06em;padding:7px 9px;word-break:break-word }.order-head strong.paid { background:#d9ecdd;color:#216335 }.order-head strong.awaiting_transfer,.order-head strong.pending_payphone { background:#f7e4bc;color:#7b5110 }.order-head strong.cancelled { background:#f3d9d5;color:#8a2f22 }
.order-items { border-bottom:1px solid #eaded8;padding:18px 0 }.order-items>b { color:var(--copper);display:block;font-size:10px;letter-spacing:.07em;text-transform:uppercase }.order-items ul { display:flex;flex-direction:column;gap:10px;list-style:none;margin:12px 0 0;padding:0 }.order-items li { align-items:center;display:flex;font-size:14px;gap:12px;line-height:1.3 }.order-items .thumb { align-items:center;background:var(--pink-soft);border:1px solid #e8dbd4;color:var(--copper);display:flex;flex-shrink:0;height:48px;justify-content:center;overflow:hidden;width:48px }.order-items .thumb img { height:100%;object-fit:cover;width:100% }.order-items .qty { color:var(--copper);flex-shrink:0;font-weight:700 }.order-items .name { display:flex;flex:1;flex-direction:column;gap:3px;min-width:0;overflow-wrap:anywhere }.order-items .name small { color:#77787B;font-size:11px }.order-items .line { flex-shrink:0;font-weight:700 }.order-items .totals { color:#77787B;display:flex;flex-wrap:wrap;font-size:12px;gap:14px;margin:14px 0 0 }.order-items .grand { color:var(--ink);font-weight:700 }
.order-details { display:flex;gap:26px;padding:19px 0 }.order-details p { display:flex;flex:1;flex-direction:column;font-size:13px;gap:6px;line-height:1.35;margin:0;overflow-wrap:anywhere }.order-details b { color:var(--copper);font-size:10px;letter-spacing:.07em;text-transform:uppercase }.order-details a { color:var(--ink);overflow-wrap:anywhere;transition:color var(--admin-micro) var(--admin-ease) }.order-details a:hover { color:var(--copper) }.order-details span { color:#77787B }.order-details .hint { color:#55565A }
.order-invoice { background:var(--pink-soft);padding:16px }.order-invoice>b { align-items:center;color:var(--copper);display:flex;font-size:10px;gap:7px;letter-spacing:.07em;text-transform:uppercase }.order-invoice>div { display:flex;flex-wrap:wrap;gap:16px;margin-top:12px }.order-invoice p { display:flex;flex:1 1 180px;flex-direction:column;font-size:13px;gap:4px;margin:0;overflow-wrap:anywhere }.order-invoice small { color:var(--copper);font:600 9px Arial,sans-serif;letter-spacing:.07em }.order-invoice a { color:var(--ink);overflow-wrap:anywhere }.order-invoice-empty { color:#9a8d87;font-size:12px;margin:0 }
.orders footer { align-items:center;border-top:1px solid #eaded8;display:flex;flex-wrap:wrap;gap:10px;margin-top:18px;padding-top:16px }.orders footer a,.orders footer .copy,.orders footer .receipt { background:transparent;border:1px solid var(--ink);color:var(--ink) }.orders footer .approve { background:#216335;border:1px solid #216335;color:var(--cream) }.approve:disabled { cursor:not-allowed;opacity:.45 }.empty { color:#77787B;margin-top:55px }.toast { background:var(--ink);bottom:24px;box-shadow:0 12px 32px rgba(33,30,29,.26);color:var(--cream);font-size:12px;left:50%;padding:14px 18px;position:fixed;z-index:70 }

/* --- Movimiento --- */
.content-header,.stats span { animation:admin-rise-in var(--admin-enter) var(--admin-ease) both }
.stats span:nth-child(1) { animation-delay:60ms }.stats span:nth-child(2) { animation-delay:110ms }.stats span:nth-child(3) { animation-delay:160ms }
.refresh,.orders footer button,.orders footer a,.orders article { transition:background var(--admin-micro) var(--admin-ease),border-color var(--admin-micro) var(--admin-ease),box-shadow var(--admin-micro) var(--admin-ease),color var(--admin-micro) var(--admin-ease),opacity var(--admin-micro) var(--admin-ease),transform var(--admin-micro) var(--admin-ease) }
.refresh:hover:not(:disabled),.orders footer button:not(:disabled):hover,.orders footer a:hover { box-shadow:0 6px 16px rgba(33,30,29,.18);transform:translateY(-1px) }
.refresh:active:not(:disabled),.orders footer button:not(:disabled):active,.orders footer a:active { box-shadow:none;transform:translateY(0) scale(.985) }
.orders footer .copy:hover,.orders footer .receipt:hover,.orders footer a:hover { background:var(--ink);color:var(--cream) }
.refresh:disabled { cursor:progress;opacity:.65 }
.orders article:hover { border-color:var(--pink);box-shadow:0 10px 30px rgba(33,30,29,.07) }
.spinning { animation:admin-spin .9s linear infinite }
/* La lista escalona la entrada, empuja al reordenar y saca la tarjeta aprobada. */
.order-enter-active { animation:admin-rise-in var(--admin-enter) var(--admin-ease) both;animation-delay:calc(var(--i, 0) * var(--admin-stagger)) }
.order-leave-active { left:0;position:absolute;right:0;transition:opacity 200ms var(--admin-ease-in),transform 200ms var(--admin-ease-in) }
.order-leave-to { opacity:0;transform:translateX(26px) scale(.985) }
.order-move { transition:transform var(--admin-enter) var(--admin-ease) }
.swap-enter-active { transition:opacity var(--admin-state) var(--admin-ease),transform var(--admin-state) var(--admin-ease) }
.swap-leave-active { transition:opacity 120ms var(--admin-ease-in) }
.swap-enter-from { opacity:0;transform:translateY(9px) }
.swap-leave-to { opacity:0 }
.badge-enter-active { transition:opacity var(--admin-state) var(--admin-ease),transform var(--admin-state) var(--admin-ease) }
.badge-leave-active { transition:opacity 110ms var(--admin-ease-in) }
.badge-enter-from { opacity:0;transform:scale(.88) }
.badge-leave-to { opacity:0 }
.toast { transform:translateX(-50%);transition:opacity var(--admin-state) var(--admin-ease),transform var(--admin-state) var(--admin-ease) }
.toast-enter-from,.toast-leave-to { opacity:0;transform:translate(-50%,14px) }
/* Esqueletos: la carga muestra la forma de la tarjeta, no una linea de texto. */
.skeletons article { animation:admin-rise-in var(--admin-enter) var(--admin-ease) both;animation-delay:calc(var(--i, 0) * var(--admin-stagger));display:flex;flex-direction:column;gap:14px }
.skeletons .bar { display:block;height:13px }.skeletons .sm { width:22% }.skeletons .md { width:64% }.skeletons .lg { height:22px;width:82% }
.receipt-frame { align-items:center;background:#f3ece8;display:flex;justify-content:center;min-height:240px;overflow:hidden }
.receipt-frame img { animation:admin-rise-in var(--admin-enter) var(--admin-ease) both;display:block;max-height:60vh;max-width:100%;object-fit:contain }
.receipt-placeholder { display:block;height:240px;width:100% }
.modal-summary { display:flex;flex-direction:column;gap:8px;list-style:none;margin:18px 0 0;padding:0 }
.modal-summary li { display:flex;font-size:13px;gap:12px;justify-content:space-between }
.modal-summary .grand { border-top:1px solid var(--admin-line);font-size:14px;font-weight:700;padding-top:9px }
.modal-primary,.modal-ghost { align-items:center;border:1px solid var(--admin-ink);cursor:pointer;display:flex;font:600 11px Arial,sans-serif;gap:8px;letter-spacing:.05em;padding:13px 16px;text-decoration:none;text-transform:uppercase;transition:box-shadow var(--admin-micro) var(--admin-ease),opacity var(--admin-micro) var(--admin-ease),transform var(--admin-micro) var(--admin-ease) }
.modal-primary { background:var(--admin-ink);color:var(--admin-cream) }.modal-ghost { background:transparent;color:var(--admin-ink) }
.modal-primary:hover:not(:disabled),.modal-ghost:hover:not(:disabled) { box-shadow:0 6px 16px rgba(33,30,29,.18);transform:translateY(-1px) }
.modal-primary:active:not(:disabled),.modal-ghost:active:not(:disabled) { box-shadow:none;transform:translateY(0) scale(.985) }
.modal-primary:disabled,.modal-ghost:disabled { cursor:not-allowed;opacity:.55;transform:none }

.orders footer .no-receipt { align-items:center;color:#8a6d1f;display:flex;font:600 11px Arial,sans-serif;gap:8px;letter-spacing:.05em;padding:13px 0;text-transform:uppercase }
.approve-warning { align-items:flex-start;background:#fbf0d6;color:#7b5110;display:flex;font-size:13px;gap:10px;line-height:1.45;margin:16px 0 0;padding:14px }
.approve-warning i { margin-top:2px }

/* --- Detalle del pedido --- */
.detail-date { color:#77787B;font-size:12px;margin:0 0 22px }
.admin-modal-body h3 { color:var(--copper);font:600 10px Arial,sans-serif;letter-spacing:.09em;margin:0 0 12px;text-transform:uppercase }
.detail-items { display:flex;flex-direction:column;gap:14px;list-style:none;margin:0;padding:0 }
.detail-items li { align-items:center;display:flex;gap:14px }
.detail-thumb { align-items:center;background:var(--admin-pink-soft);border:1px solid #e8dbd4;color:var(--admin-copper);display:flex;flex-shrink:0;font-size:20px;height:76px;justify-content:center;overflow:hidden;width:76px }
.detail-thumb img { height:100%;object-fit:cover;width:100% }
.detail-name { display:flex;flex:1;flex-direction:column;gap:3px;min-width:0;overflow-wrap:anywhere }
.detail-name b { font-size:14px }
.detail-name small { color:#77787B;font-size:11px }
.detail-name .unit { color:var(--admin-copper) }
.detail-line { flex-shrink:0;font-size:15px;font-weight:700 }
.detail-totals { border-top:1px solid var(--admin-line);color:#77787B;display:flex;flex-wrap:wrap;font-size:13px;gap:18px;margin:18px 0 0;padding-top:14px }
.detail-totals .grand { color:var(--admin-ink) }
.detail-grid { display:flex;flex-wrap:wrap;gap:26px;margin-top:28px }
.detail-grid>div { flex:1 1 220px;min-width:0 }
.detail-grid p,.detail-invoice p { font-size:13px;line-height:1.45;margin:0 0 4px;overflow-wrap:anywhere }
.detail-grid a,.detail-invoice a { color:var(--admin-ink) }
.detail-invoice { background:var(--admin-pink-soft);margin-top:26px;padding:16px }
.admin-modal-body .muted { color:#8d817c;font-size:12px;margin-top:22px }
.detail-invoice .muted { margin:4px 0 0 }
.orders footer .detail { background:var(--ink);border:1px solid var(--ink);color:var(--cream) }
@media (max-width:700px) { .content { padding:22px 18px 36px }.content-header { flex-direction:column;gap:20px }.content h1 { font-size:42px }.order-head { flex-direction:column }.order-head strong { align-self:flex-start }.order-details { flex-direction:column;gap:16px }.orders footer { align-items:stretch;flex-direction:column }.orders footer button,.orders footer a { justify-content:center;width:100% }.order-invoice>div { flex-direction:column;gap:14px }.order-invoice p { flex:0 0 auto }.modal-primary,.modal-ghost { justify-content:center;width:100% }.detail-grid { flex-direction:column;gap:20px }.detail-grid>div { flex:0 0 auto }.detail-thumb { height:60px;width:60px }.order-items .thumb { height:42px;width:42px } }
@media (prefers-reduced-motion:reduce) { .content-header,.stats span,.skeletons article,.receipt-frame img,.order-enter-active { animation:none }.spinning { animation-duration:2.4s } }
</style>
