<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ecuadorCantonsByProvince } from '@/config/ecuadorCantons'
import { getApiBaseUrl } from '@/config/api'

type Product = { id: string; name: string; detail: string; price: number; size: string; image: string }
type CartItem = { productId: string; name: string; price: number; qty: number }
type PaymentMethod = 'payphone' | 'transfer'
type OrderResponse = {
  order?: { status?: string; reference?: string; clientTransactionId?: string; hasTransferReceipt?: boolean }
  reference?: string
  instructions?: string | string[]
  transfer?: { status?: string; instructions?: string }
  payphone?: { token?: string; storeId?: string; clientTransactionId?: string; amount?: number; amountWithoutTax?: number; currency?: string; reference?: string }
  token?: string
  storeId?: string
  clientTransactionId?: string
}

declare global {
  interface Window {
    PPaymentButtonBox?: new (config: Record<string, unknown>) => { render: (elementId: string) => void }
  }
}

const apiBaseUrl = getApiBaseUrl()
const router = useRouter()
const cartStorageKey = 'omg-lashes-cart'
const instagramUrl = 'https://www.instagram.com/omglashes.ec/'
const serumImage = 'https://res.cloudinary.com/dcoqwxbd/image/upload/f_auto,q_auto,w_900/omglashes/assets/serum-5ml.png'
const eyelinerImage = 'https://res.cloudinary.com/dcoqwxbd/image/upload/f_auto,q_auto,w_900/omglashes/assets/hero-eyeliner.jpg'
const maskHeroImage = 'https://res.cloudinary.com/dcoqwxbd/image/upload/f_auto,q_auto,w_1000/omglashes/masks/mask-hero.webp'
const maskProductImage = 'https://res.cloudinary.com/dcoqwxbd/image/upload/f_auto,q_auto,w_1000/omglashes/masks/mask-product.webp'

const products: Product[] = [
  { id: 'serum-10ml', name: 'OMG Lashes 10 ml', detail: 'Tratamiento de 3 a 5 meses', price: 3500, size: '10 ml', image: serumImage },
  { id: 'serum-5ml', name: 'OMG Lashes 5 ml', detail: 'Tratamiento de 1 a 2 meses', price: 2000, size: '5 ml', image: serumImage },
  { id: 'eyeliner-2in1', name: 'Delineador 2 en 1', detail: 'Crece mientras te maquillas', price: 2000, size: 'Serum + liner', image: eyelinerImage },
]
const heroProduct = products[0]!
const combos: Product[] = [
  { id: 'combo-doble', name: 'Combo Doble Crecimiento · Ahorra $6', detail: '10 ml + 5 ml', price: 4900, size: 'Ahorra $6', image: serumImage },
  { id: 'combo-trio', name: 'Trio OMG · Ahorra $16', detail: '10 ml + 5 ml + delineador', price: 5900, size: 'Mas vendido · Ahorra $16', image: eyelinerImage },
]
const masks: Product[] = [
  { id: 'collagen-mask-1', name: 'Mascarilla de colageno', detail: '1 unidad', price: 250, size: '1 unidad', image: maskProductImage },
  { id: 'collagen-mask-5', name: 'Mascarilla de colageno', detail: '5 unidades', price: 1000, size: '5 unidades', image: maskProductImage },
  { id: 'collagen-mask-10', name: 'Mascarilla de colageno', detail: '10 unidades', price: 1500, size: '10 unidades', image: maskProductImage },
]
const provinces = [
  'Azuay', 'Bolivar', 'Canar', 'Carchi', 'Chimborazo', 'Cotopaxi', 'El Oro', 'Esmeraldas', 'Galapagos', 'Guayas', 'Imbabura', 'Loja',
  'Los Rios', 'Manabi', 'Morona Santiago', 'Napo', 'Orellana', 'Pastaza', 'Pichincha', 'Santa Elena', 'Santo Domingo de los Tsachilas',
  'Sucumbios', 'Tungurahua', 'Zamora Chinchipe',
]
const citiesByProvince: Record<string, string[]> = {
  Azuay: ['Cuenca', 'Gualaceo', 'Paute', 'Giron', 'Sigsig'], Bolivar: ['Guaranda', 'San Miguel', 'Chillanes', 'Chimbo'], Canar: ['Azogues', 'Canar', 'La Troncal', 'El Tambo'], Carchi: ['Tulcan', 'San Gabriel', 'El Angel', 'Huaca'], Chimborazo: ['Riobamba', 'Alausi', 'Guamote', 'Guano'], Cotopaxi: ['Latacunga', 'La Mana', 'Pujili', 'Salcedo', 'Saquisili'], 'El Oro': ['Machala', 'Santa Rosa', 'Pasaje', 'Huaquillas', 'Arenillas'], Esmeraldas: ['Esmeraldas', 'Atacames', 'Quininde', 'Muisne'], Galapagos: ['Puerto Baquerizo Moreno', 'Puerto Ayora', 'Puerto Villamil'], Guayas: ['Guayaquil', 'Duran', 'Samborondon', 'Milagro', 'Daule', 'Playas'], Imbabura: ['Ibarra', 'Otavalo', 'Atuntaqui', 'Cotacachi'], Loja: ['Loja', 'Catamayo', 'Cariamanga', 'Macara'], 'Los Rios': ['Babahoyo', 'Quevedo', 'Vinces', 'Buena Fe'], Manabi: ['Portoviejo', 'Manta', 'Chone', 'Jipijapa', 'Montecristi'], 'Morona Santiago': ['Macas', 'Gualaquiza', 'Sucua', 'Limon Indanza'], Napo: ['Tena', 'Archidona', 'El Chaco', 'Quijos'], Orellana: ['Puerto Francisco de Orellana', 'La Joya de los Sachas', 'Loreto', 'Aguarico'], Pastaza: ['Puyo', 'Mera', 'Santa Clara', 'Arajuno'], Pichincha: ['Quito', 'Cayambe', 'Mejia', 'Ruminahui', 'Pedro Moncayo', 'Puerto Quito'], 'Santa Elena': ['Santa Elena', 'La Libertad', 'Salinas'], 'Santo Domingo de los Tsachilas': ['Santo Domingo', 'La Concordia'], Sucumbios: ['Nueva Loja', 'Shushufindi', 'Lago Agrio', 'Cascales'], Tungurahua: ['Ambato', 'Banos de Agua Santa', 'Pelileo', 'Quero'], 'Zamora Chinchipe': ['Zamora', 'Yantzaza', 'El Pangui', 'Zumba'],
}
const cities = ref<string[]>([])

const cart = ref<CartItem[]>(loadCart())
const isCartOpen = ref(false)
const isCheckoutOpen = ref(false)
const isCheckoutWizardOpen = ref(false)
const isPayphoneGatewayOpen = ref(false)
const checkoutStep = ref<1 | 2 | 3>(1)
const isLocationPickerOpen = ref(false)
const locationPickerTarget = ref<'province' | 'city'>('province')
const locationSearch = ref('')
const toast = ref('')
const loadedImages = ref<string[]>([])
const paymentMethod = ref<PaymentMethod>('payphone')
const buyer = ref({ firstName: '', lastName: '', email: '', phone: '' })
const delivery = ref({ country: 'Ecuador', province: '', city: '', address: '', reference: '', mapsUrl: '' })
watch(() => delivery.value.province, (province) => {
  cities.value = ecuadorCantonsByProvince[province] || citiesByProvince[province] || []
  delivery.value.city = ''
})
const checkoutError = ref('')
const isSubmitting = ref(false)
const isTransferConfirmationOpen = ref(false)
const transferSuccess = ref<{ reference: string; instructions: string[]; totalCents: number } | null>(null)
const isTransferReceiptOpen = ref(false)
const selectedTransferReceipt = ref<{ name: string; dataUrl: string } | null>(null)
const hasConfirmedTransferAmount = ref(false)
const isUploadingReceipt = ref(false)
const paymentStatus = ref<{ title: string; message: string; paid: boolean } | null>(null)

let toastTimer: ReturnType<typeof setTimeout> | undefined
let wizardAnimationTimer: ReturnType<typeof setTimeout> | undefined

const itemCount = computed(() => cart.value.reduce((count, item) => count + item.qty, 0))
const subtotalCents = computed(() => cart.value.reduce((total, item) => total + item.price * item.qty, 0))
const shippingCents = computed(() => cart.value.length && subtotalCents.value < 4900 ? 1100 : 0)
const totalCents = computed(() => subtotalCents.value + shippingCents.value)
const shippingRemaining = computed(() => Math.max(0, 4900 - subtotalCents.value))
const shippingProgress = computed(() => Math.min(100, subtotalCents.value / 49))
const locationOptions = computed(() => {
  const options = locationPickerTarget.value === 'province' ? provinces : cities.value
  const query = locationSearch.value.trim().toLocaleLowerCase('es-EC')
  return query ? options.filter((option) => option.toLocaleLowerCase('es-EC').includes(query)) : options
})
const formatPrice = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
const normalizedWhatsApp = computed(() => {
  const digits = buyer.value.phone.replace(/\D/g, '')
  const localNumber = /^09\d{8}$/.test(digits) ? digits.slice(1) : digits.replace(/^593/, '')
  if (/^9\d{8}$/.test(localNumber)) return `+593 ${localNumber.slice(0, 2)} ${localNumber.slice(2, 5)} ${localNumber.slice(5)}`
  return /^[1-9]\d{6,14}$/.test(digits) ? `+${digits}` : ''
})

function notify(message: string) {
  toast.value = message
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 3200)
}

function loadCart(): CartItem[] {
  try {
    const saved = JSON.parse(localStorage.getItem(cartStorageKey) || '[]') as CartItem[]
    return Array.isArray(saved) ? saved.filter((item) => item && typeof item.productId === 'string' && Number.isFinite(item.price) && Number.isFinite(item.qty)) : []
  } catch { return [] }
}
function saveCart() { localStorage.setItem(cartStorageKey, JSON.stringify(cart.value)) }
function addToCart(product: Product) {
  const item = cart.value.find((cartItem) => cartItem.productId === product.id)
  if (item) item.qty += 1
  else cart.value.push({ productId: product.id, name: product.name, price: product.price, qty: 1 })
  saveCart()
  isCartOpen.value = true
  void nextTick().then(syncMaskUpsell)
  notify(product.id.startsWith('collagen-mask')
    ? 'Mascarilla agregada. Tu ritual ya esta completo.'
    : `${product.name} esta en tu bolsa. Completa tu glow con una mascarilla de colageno.`)
}
function changeQuantity(id: string, amount: number) {
  const item = cart.value.find((cartItem) => cartItem.productId === id)
  if (!item) return
  item.qty += amount
  if (item.qty < 1) cart.value = cart.value.filter((cartItem) => cartItem.productId !== id)
  saveCart()
}
function removeItem(id: string) { cart.value = cart.value.filter((item) => item.productId !== id); saveCart() }
function openCheckout() { isCartOpen.value = false; isCheckoutOpen.value = false; isCheckoutWizardOpen.value = true; checkoutStep.value = 1; checkoutError.value = ''; transferSuccess.value = null; selectedTransferReceipt.value = null; hasConfirmedTransferAmount.value = false; void nextTick().then(() => document.querySelector<HTMLInputElement>('.checkout-wizard input[placeholder="Ej. 0995254965"]')?.setAttribute('pattern', '(?:0?9\\d{8}|\\+?[1-9]\\d{6,14})')) }
function closeOverlays() { isCartOpen.value = false; isCheckoutOpen.value = false; isCheckoutWizardOpen.value = false; isPayphoneGatewayOpen.value = false; isTransferConfirmationOpen.value = false; isTransferReceiptOpen.value = false; paymentStatus.value = null }
function markImageLoaded(url: string) { if (!loadedImages.value.includes(url)) loadedImages.value.push(url) }
function imageLoaded(url: string) { return loadedImages.value.includes(url) }
function syncMaskUpsell() {
  const shipping = document.querySelector<HTMLElement>('.shipping')
  const existing = shipping?.querySelector<HTMLButtonElement>('.cart-mask-quick-add')
  const hasMask = cart.value.some((item) => item.productId.startsWith('collagen-mask'))
  if (!shipping || hasMask) {
    existing?.remove()
    return
  }
  if (existing) return

  const button = document.createElement('button')
  button.className = 'cart-mask-quick-add'
  button.type = 'button'
  button.innerHTML = '<span>Completa tu glow: 5 mascarillas</span><strong>Ahorra $2.50 · Agregar $10</strong>'
  button.addEventListener('click', () => addToCart(masks[1]!))
  shipping.appendChild(button)
}

function getPayPhone(response: OrderResponse) {
  return response.payphone || {
    token: response.token, storeId: response.storeId, clientTransactionId: response.clientTransactionId,
    amount: undefined, amountWithoutTax: undefined, currency: undefined, reference: response.reference,
  }
}
async function loadPayPhoneWidget() {
  if (window.PPaymentButtonBox) return
  await new Promise<void>((resolve, reject) => {
    if (!document.querySelector('link[href="https://cdn.payphonetodoesposible.com/box/v2.0/payphone-payment-box.css"]')) {
      const stylesheet = document.createElement('link')
      stylesheet.rel = 'stylesheet'
      stylesheet.href = 'https://cdn.payphonetodoesposible.com/box/v2.0/payphone-payment-box.css'
      document.head.appendChild(stylesheet)
    }
    const script = document.createElement('script')
    script.type = 'module'
    script.src = 'https://cdn.payphonetodoesposible.com/box/v2.0/payphone-payment-box.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('No se pudo cargar el metodo de pago.'))
    document.head.appendChild(script)
  })
}
async function createOrder() {
  if (!cart.value.length) return
  isSubmitting.value = true
  checkoutError.value = ''
  try {
    const response = await fetch(`${apiBaseUrl}/orders`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cart: cart.value,
        buyer: buyer.value,
        delivery: { ...delivery.value, googleMapsUrl: delivery.value.mapsUrl },
        paymentMethod: paymentMethod.value,
      }),
    })
    const data = await response.json() as OrderResponse
    if (!response.ok) throw new Error((data as { message?: string }).message || 'No pudimos crear tu pedido.')
    if (paymentMethod.value === 'transfer') {
      const instructions = Array.isArray(data.transfer?.instructions)
        ? data.transfer.instructions
        : [data.transfer?.instructions || 'Te contactaremos con los datos de transferencia.']
        transferSuccess.value = { reference: data.order?.reference || data.reference || 'Pendiente', instructions, totalCents: totalCents.value }
       cart.value = []
       saveCart()
       isCheckoutOpen.value = false
       isCheckoutWizardOpen.value = false
       isTransferReceiptOpen.value = true
       return
    }
    const payphone = getPayPhone(data)
    if (!payphone.token || !payphone.storeId || !payphone.clientTransactionId) throw new Error('No recibimos los datos de pago. Intenta nuevamente.')
    isCheckoutWizardOpen.value = false
    isPayphoneGatewayOpen.value = true
    await loadPayPhoneWidget()
    await nextTick()
    if (!window.PPaymentButtonBox) throw new Error('El boton de pago no esta disponible.')
    new window.PPaymentButtonBox({
      token: payphone.token, storeId: payphone.storeId, clientTransactionId: payphone.clientTransactionId,
      amount: payphone.amount ?? totalCents.value / 100, amountWithoutTax: payphone.amountWithoutTax ?? totalCents.value / 100,
      currency: payphone.currency || 'USD', reference: payphone.reference || data.order?.reference || 'OMG Lashes',
      lang: 'es', defaultMethod: 'card', timeZone: -5, backgroundColor: '#b86f54',
    }).render('payphone-gateway-button')
  } catch (error) {
    if (isPayphoneGatewayOpen.value) {
      isPayphoneGatewayOpen.value = false
      isCheckoutWizardOpen.value = true
      checkoutStep.value = 3
    }
    notify(error instanceof Error ? error.message : 'No pudimos procesar tu pedido.')
  }
  finally { isSubmitting.value = false }
}
function submitOrder() {
  if (paymentMethod.value === 'transfer') {
    isTransferConfirmationOpen.value = true
    return
  }
  void createOrder()
}
function confirmTransferOrder() {
  isTransferConfirmationOpen.value = false
  void createOrder()
}
function returnToPayPhone() {
  paymentMethod.value = 'payphone'
  isTransferConfirmationOpen.value = false
}
function openLocationPicker(target: 'province' | 'city' = delivery.value.province ? 'city' : 'province') {
  locationPickerTarget.value = target
  locationSearch.value = ''
  isLocationPickerOpen.value = true
}
function chooseLocation(option: string) {
  if (locationPickerTarget.value === 'province') {
    delivery.value.province = option
    delivery.value.city = ''
    locationPickerTarget.value = 'city'
    locationSearch.value = ''
    return
  }
  delivery.value.city = option
  isLocationPickerOpen.value = false
}
function syncDeliveryLocationSummary() {
  const fieldset = document.querySelector<HTMLElement>('.checkout-wizard .delivery-section')
  if (!fieldset) return
  fieldset.dataset.location = delivery.value.city
    ? `ENTREGA EN: ${delivery.value.province} · ${delivery.value.city} · CAMBIAR UBICACIÓN`
    : delivery.value.province
      ? `PROVINCIA: ${delivery.value.province} · AHORA ELIGE TU CANTÓN`
      : 'SELECCIONA PROVINCIA Y CANTÓN CON EL BUSCADOR'
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
  notify('Comprobante listo. Confirma el envio cuando estes lista.')
}
async function uploadTransferReceipt() {
  if (!transferSuccess.value || !selectedTransferReceipt.value) {
    notify('Selecciona el comprobante antes de confirmar.')
    return
  }
  if (!hasConfirmedTransferAmount.value) {
    notify('Confirma que el monto transferido se ve claramente en el comprobante.')
    return
  }
  isUploadingReceipt.value = true
  try {
    const response = await fetch(`${apiBaseUrl}/orders/${encodeURIComponent(transferSuccess.value.reference)}/transfer-receipt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl: selectedTransferReceipt.value.dataUrl }),
    })
    const data = await response.json() as { message?: string }
    if (!response.ok) throw new Error(data.message || 'No pudimos enviar el comprobante.')
    isTransferReceiptOpen.value = false
    notify('Comprobante enviado. Verificaremos tu pago muy pronto.')
    window.setTimeout(() => { void router.push({ path: '/order-status', query: { reference: transferSuccess.value?.reference || '' } }) }, 900)
  } catch (error) {
    notify(error instanceof Error ? error.message : 'No pudimos enviar el comprobante.')
  } finally {
    isUploadingReceipt.value = false
  }
}
async function confirmPayPhoneReturn() {
  const params = new URLSearchParams(window.location.search)
  const id = params.get('id')
  const clientTransactionId = params.get('clientTransactionId')
  if (!id || !clientTransactionId) return
  try {
    const response = await fetch(`${apiBaseUrl}/orders/payphone/confirm`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, clientTransactionId }) })
    const data = await response.json() as OrderResponse
    const paid = response.ok && data.order?.status === 'paid'
    paymentStatus.value = { title: paid ? 'Pago confirmado' : 'Pago pendiente', paid, message: paid ? 'Tu pago fue confirmado. Gracias por elegir OMG Lashes.' : 'Tu pago aun no aparece como confirmado. Si realizaste el pago, vuelve a revisar en unos minutos.' }
    if (paid) { cart.value = []; saveCart() }
  } catch { paymentStatus.value = { title: 'No pudimos confirmar el pago', paid: false, message: 'Revisa tu correo o comunicate con nosotras para confirmar tu pedido.' } }
  finally { window.history.replaceState({}, '', `${window.location.pathname}${window.location.hash}`) }
}
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    if (isTransferConfirmationOpen.value) isTransferConfirmationOpen.value = false
    else if (isTransferReceiptOpen.value) isTransferReceiptOpen.value = false
    else closeOverlays()
  }
}
onMounted(() => { window.addEventListener('keydown', onKeydown); void confirmPayPhoneReturn() })
onBeforeUnmount(() => { window.removeEventListener('keydown', onKeydown); clearTimeout(toastTimer); clearTimeout(wizardAnimationTimer) })
watch(isCartOpen, (open) => { if (open) void nextTick().then(syncMaskUpsell) })
watch(checkoutStep, () => {
  void nextTick().then(() => {
    const wizard = document.querySelector<HTMLElement>('.checkout-wizard')
    if (!wizard) return
    wizard.classList.remove('is-changing-step')
    void wizard.offsetWidth
    wizard.classList.add('is-changing-step')
    clearTimeout(wizardAnimationTimer)
    wizardAnimationTimer = setTimeout(() => wizard.classList.remove('is-changing-step'), 380)
  })
  if (checkoutStep.value === 2) void nextTick().then(() => { syncDeliveryLocationSummary(); openLocationPicker(delivery.value.province ? 'city' : 'province') })
})
watch([() => delivery.value.province, () => delivery.value.city], () => {
  void nextTick().then(syncDeliveryLocationSummary)
})
</script>

<template>
  <main class="home-view">
    <button class="announcement" type="button" @click="isCartOpen = true">ENVIO GRATIS EN COMPRAS DESDE $49 <span>·</span> RESULTADOS VISIBLES EN 28 DIAS <b>COMPRAR →</b></button>
    <header class="site-header"><a class="logo logo-image" href="#inicio" aria-label="OMG Lashes, inicio"><img src="/omg-lashes-logo.png" alt="OMG Lashes, Lashes N Brows Serum"></a><nav aria-label="Navegacion principal"><a href="#productos">Productos</a><a href="#rutina">Como usar</a><a href="#combos">Combos</a></nav><a class="track-order" href="/order-status"><i class="fa-solid fa-box" aria-hidden="true"></i> Ya tengo mi pedido</a><button class="cart-trigger" type="button" @click="isCartOpen = true"><i class="fa-solid fa-bag-shopping" aria-hidden="true"></i> Carrito <b>{{ itemCount }}</b></button></header>

    <section id="inicio" class="hero"><div class="hero-copy"><p class="eyebrow"><span></span> LASHES & BROWS SERUM</p><h1>Tu mirada,<br><em>en su mejor</em> version.</h1><p class="hero-description">El serum que fortalece, nutre y acompaña el crecimiento natural de tus cejas y pestanas.</p><div class="hero-actions"><button class="button button-dark" type="button" @click="addToCart(heroProduct)">Quiero mi OMG <span>→</span></button><a class="text-link" href="#rutina">Conoce la rutina <span>↓</span></a></div><div class="hero-proof"><strong>28</strong><span>dias para<br>ver tu progreso</span><i></i><span>Formula acuosa<br>sin aceites</span></div></div><div class="hero-visual"><div class="sunburst"></div><div class="hero-note note-top">BIOTINA<br>+ PANTENOL</div><div class="photo-frame" :class="{ loaded: imageLoaded(eyelinerImage) }"><img :src="eyelinerImage" alt="Delineador OMG Lashes 2 en 1" fetchpriority="high" @load="markImageLoaded(eyelinerImage)"></div><div class="hero-note note-bottom">CRECIMIENTO<br>CON ESTILO</div><div class="circle-stamp">RUTINA<br>DE BELLEZA<br><b>DIARIA</b></div></div></section>
    <section class="marquee" aria-label="Beneficios del producto"><div class="marquee-track"><div class="marquee-group"><span>CEJAS MAS FUERTES</span><b>✦</b><span>PESTAÑAS MÁS LARGAS</span><b>✦</b><span>UNA MIRADA QUE HABLA</span><b>✦</b><span>RESULTADOS VISIBLES EN 28 DIAS</span><b>✦</b></div><div class="marquee-group" aria-hidden="true"><span>CEJAS MAS FUERTES</span><b>✦</b><span>PESTAÑAS MÁS LARGAS</span><b>✦</b><span>UNA MIRADA QUE HABLA</span><b>✦</b><span>RESULTADOS VISIBLES EN 28 DIAS</span><b>✦</b></div></div></section>
    <section class="introduction"><div class="intro-visual" :class="{ loaded: imageLoaded(serumImage) }"><img :src="serumImage" alt="Serum OMG Lashes 5 ml" loading="lazy" @load="markImageLoaded(serumImage)"></div><div class="intro-copy"><p class="eyebrow"><span></span> EL GESTO QUE CAMBIA TODO</p><h2>No es magia.<br>Es <em>constancia.</em></h2><p>OMG Lashes es un serum estimulador ideal para sumar a tu rutina facial. Su formula transparente ayuda a fortalecer y nutrir cada pestana y ceja.</p><div class="ingredient-list"><span>01 <b>Biotina</b> fortalece</span><span>02 <b>Pantenol</b> nutre</span><span>03 <b>Formula acuosa</b> sin aceites</span></div></div></section>

    <section id="productos" class="products-section"><div class="section-heading"><p class="eyebrow"><span></span> ELIGE TU RITUAL</p><h2>Un basico para<br><em>cada mirada.</em></h2><a :href="instagramUrl" target="_blank" rel="noreferrer">Conocenos en Instagram ↗</a></div><div class="product-grid"><article v-for="(product, index) in products" :key="product.id" class="product-card" :class="`product-card-${index}`"><span class="product-number">0{{ index + 1 }}</span><div class="product-image" :class="[{ liner: index === 2, loaded: imageLoaded(product.image) }]"><img :src="product.image" :alt="product.name" loading="lazy" @load="markImageLoaded(product.image)"></div><div class="product-info"><p>{{ product.size }}</p><h3>{{ product.name }}</h3><span>{{ product.detail }}</span><div><strong>{{ formatPrice(product.price) }}</strong><button type="button" :aria-label="`Agregar ${product.name}`" @click="addToCart(product)">→</button></div></div></article></div></section>
    <section id="combos" class="combos-section"><div class="combo-heading"><p class="eyebrow"><span></span> MAS RESULTADOS, MAS AHORRO</p><h2>Elige tu <em>combo.</em></h2><p>Todo lo que tu rutina necesita, con envio gratis incluido.</p></div><div class="combo-grid"><article v-for="combo in combos" :key="combo.id" class="combo-card" :class="{ featured: combo.id === 'combo-trio' }"><p class="tag">{{ combo.size }}</p><h3>{{ combo.name.replace(' ', '\n') }}</h3><p class="combo-items">{{ combo.detail }}<br><span>+ envio gratis</span></p><div class="combo-price"><s>{{ combo.id === 'combo-doble' ? '$55' : '$75' }}</s><strong>{{ formatPrice(combo.price) }}</strong></div><button type="button" @click="addToCart(combo)">Lo quiero <span>→</span></button></article></div></section>
    <section id="rutina" class="routine-section"><div class="routine-title"><p class="eyebrow"><span></span> SIMPLE. PODEROSO. DIARIO.</p><h2>Tu ritual de<br><em>4 pasos.</em></h2></div><ol class="steps"><li><b>01</b><div><h3>Limpia</h3><p>Prepara tus cejas y pestanas antes de aplicar.</p></div></li><li><b>02</b><div><h3>Aplica</h3><p>Usa el cepillo en cejas y el delineador en la linea superior de tus pestanas.</p></div></li><li><b>03</b><div><h3>Espera</h3><p>Deja que el serum se absorba unos minutos.</p></div></li><li><b>04</b><div><h3>Repite</h3><p>En la manana y en la noche, todos los dias.</p></div></li></ol></section>
    <section class="upsell"><div class="upsell-copy"><div class="mask-image" :class="{ loaded: imageLoaded(maskHeroImage) }"><img :src="maskHeroImage" alt="Mascarilla de colageno OMG Lashes" loading="lazy" @load="markImageLoaded(maskHeroImage)"></div><p class="eyebrow"><span></span> COMPLEMENTA TU GLOW</p><h2>Piel de cristal,<br><em>mirada OMG.</em></h2><p>Mascarilla hidrotensora de colageno que se transforma de blanca a transparente mientras hidrata profundamente.</p></div><div class="mask-options"><img :src="maskProductImage" alt="Producto mascarilla de colageno" loading="lazy" :class="{ loaded: imageLoaded(maskProductImage) }" @load="markImageLoaded(maskProductImage)"><p>MASCARILLA DE COLAGENO</p><div><button v-for="mask in masks" :key="mask.id" type="button" @click="addToCart(mask)"><span>{{ mask.size }}</span><b>{{ formatPrice(mask.price) }}</b><i>+</i></button></div></div></section>
    <section class="testimonial"><p class="quote-mark">“</p><blockquote>En un mes mis cejitas crecieron, estan tupidas y se dejaron de caer. <em>Esto es magia.</em></blockquote><p>ANDREDU99 · CLIENTA OMG LASHES</p></section>
    <section class="retailers"><p class="eyebrow"><span></span> ENCUENTRANOS CERCA DE TI</p><h2>Tambien estamos<br>en tiendas <em>fisicas.</em></h2><div><span>Pharmacys</span><span>Gloss Beauty Shop</span><span>@byme_ec</span><span>@mebyerikavelez</span></div></section>
    <footer><a class="logo" href="#inicio">OMG <span>LASHES</span></a><p>Tu rutina. Tu mirada. Tu poder.</p><a :href="instagramUrl" target="_blank" rel="noreferrer">@omglashes.ec ↗</a><small>© 2026 OMG Lashes. Todos los derechos reservados.</small></footer>

    <Transition name="toast"><p v-if="toast" class="toast" role="status">{{ toast }}</p></Transition>
    <Transition name="overlay"><div v-if="isCartOpen" class="overlay" @click.self="isCartOpen = false"><aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title"><button class="close" type="button" aria-label="Cerrar carrito" @click="isCartOpen = false">×</button><p class="eyebrow"><span></span> TU SELECCION</p><h2 id="cart-title">Tu bolsa.</h2><div v-if="cart.length" class="cart-items"><article v-for="item in cart" :key="item.productId"><div><h3>{{ item.name }}</h3><p>{{ formatPrice(item.price) }}</p></div><div class="quantity"><button type="button" :aria-label="`Reducir ${item.name}`" @click="changeQuantity(item.productId, -1)">−</button><span>{{ item.qty }}</span><button type="button" :aria-label="`Aumentar ${item.name}`" @click="changeQuantity(item.productId, 1)">+</button><button class="remove" type="button" :aria-label="`Quitar ${item.name}`" @click="removeItem(item.productId)">Quitar</button></div></article></div><p v-else class="empty">Tu bolsa esta esperando su primer ritual.</p><div class="shipping"><p v-if="shippingRemaining">Te faltan <b>{{ formatPrice(shippingRemaining) }}</b> para envio gratis.</p><p v-else><b>Tu envio es gratis.</b></p><i><span :style="{ width: `${shippingProgress}%` }"></span></i></div><div class="cart-total"><span>Total</span><strong>{{ formatPrice(totalCents) }}</strong></div><button class="button button-dark checkout-button" type="button" :disabled="!cart.length" @click="openCheckout">Continuar al pago <span>→</span></button></aside></div></Transition>
    <Transition name="overlay"><div v-if="isCheckoutOpen" class="overlay" @click.self="isCheckoutOpen = false"><section class="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title"><button class="close" type="button" aria-label="Cerrar checkout" @click="isCheckoutOpen = false">×</button><template v-if="transferSuccess"><p class="eyebrow"><span></span> PEDIDO RECIBIDO</p><h2 id="checkout-title">Pedido pendiente de verificacion.</h2><p class="reference">Referencia: <b>{{ transferSuccess.reference }}</b></p><p class="verification-note">Tu transferencia sera verificada manualmente antes de reservar y enviar tu pedido.</p><p v-for="instruction in transferSuccess.instructions" :key="instruction" class="instruction">{{ instruction }}</p><button class="button button-dark" type="button" @click="isCheckoutOpen = false">Entendido <span>→</span></button></template><template v-else><p class="eyebrow"><span></span> CHECKOUT SEGURO</p><h2 id="checkout-title">Finaliza tu ritual.</h2><p class="checkout-total">Total: <b>{{ formatPrice(totalCents) }}</b></p><form @submit.prevent="submitOrder"><div class="field-grid"><label>Nombres<input v-model.trim="buyer.firstName" required autocomplete="given-name"></label><label>Apellidos<input v-model.trim="buyer.lastName" required autocomplete="family-name"></label></div><label>Correo electronico<input v-model.trim="buyer.email" required type="email" autocomplete="email"></label><label>Telefono<input v-model.trim="buyer.phone" required type="tel" autocomplete="tel"></label><fieldset class="delivery-section"><legend>Entrega obligatoria</legend><label>Pais<select v-model="delivery.country" required><option value="Ecuador">Ecuador</option></select></label><div class="field-grid"><label>Provincia<select v-model="delivery.province" required><option disabled value="">Selecciona tu provincia</option><option v-for="province in provinces" :key="province" :value="province">{{ province }}</option></select></label><label>Ciudad<select v-model="delivery.city" required><option disabled value="">Selecciona tu ciudad</option><option v-for="city in cities" :key="city" :value="city">{{ city }}</option></select></label></div><label>Direccion completa<input v-model.trim="delivery.address" required autocomplete="street-address"></label><label>Referencia para entrega<input v-model.trim="delivery.reference" required></label><label>Enlace de Google Maps<input v-model.trim="delivery.mapsUrl" required type="url" inputmode="url" placeholder="https://maps.google.com/..."></label><small class="maps-help">Comparte el enlace de ubicacion para que podamos encontrar tu direccion facilmente.</small></fieldset><fieldset><legend>Metodo de pago</legend><label class="payment-option payment-option-recommended"><input v-model="paymentMethod" type="radio" value="payphone"><span><b>PayPhone <i>RECOMENDADO</i></b><small>Sin recargos adicionales. Pago aprobado = reserva y envio procesados automaticamente.</small></span></label><label class="payment-option"><input v-model="paymentMethod" type="radio" value="transfer"><span><b>Transferencia bancaria</b><small>Sin recargos. Tu pedido queda pendiente de verificacion manual antes de reservar y enviar.</small></span></label></fieldset><p class="no-fees">El total mostrado es el total a pagar. Sin cargos ocultos.</p><p v-if="checkoutError" class="form-error" role="alert">{{ checkoutError }}</p><button class="button button-dark checkout-button" type="submit" :disabled="isSubmitting">{{ isSubmitting ? 'Creando pedido...' : paymentMethod === 'payphone' ? 'Ir a PayPhone' : 'Confirmar pedido' }} <span>→</span></button></form><div id="payphone-button" aria-live="polite"></div></template></section></div></Transition>
    <Transition name="overlay"><div v-if="paymentStatus" class="overlay" @click.self="paymentStatus = null"><section class="status-modal" role="dialog" aria-modal="true" aria-labelledby="payment-title"><button class="close" type="button" aria-label="Cerrar estado de pago" @click="paymentStatus = null">×</button><p class="eyebrow"><span></span> PAYPHONE</p><h2 id="payment-title">{{ paymentStatus.title }}</h2><p>{{ paymentStatus.message }}</p><button class="button button-dark" type="button" @click="paymentStatus = null">Volver a OMG <span>→</span></button></section></div></Transition>
    <Transition name="overlay"><div v-if="isTransferConfirmationOpen" class="overlay transfer-confirmation-overlay" @click.self="isTransferConfirmationOpen = false"><section class="transfer-confirmation-modal" role="dialog" aria-modal="true" aria-labelledby="transfer-confirmation-title" aria-describedby="transfer-confirmation-description"><button class="close" type="button" aria-label="Cerrar confirmacion de transferencia" @click="isTransferConfirmationOpen = false">×</button><p class="eyebrow"><span></span> TRANSFERENCIA BANCARIA</p><h2 id="transfer-confirmation-title">¿Estas 100% segura?</h2><p id="transfer-confirmation-description">La transferencia pasa por verificacion manual y puede tomar de <strong>2 a 3 dias laborables adicionales</strong> antes de reservar y despachar tu pedido.</p><p class="transfer-no-fees">No hay cargos adicionales por pagar mediante transferencia.</p><div class="transfer-confirmation-actions"><button class="button button-dark" type="button" :disabled="isSubmitting" @click="confirmTransferOrder">Si, continuar con transferencia <span>→</span></button><button class="transfer-back" type="button" @click="returnToPayPhone">Volver a PayPhone</button></div></section></div></Transition>
    <Transition name="overlay"><div v-if="isTransferReceiptOpen && transferSuccess" class="overlay transfer-receipt-overlay" @click.self="isTransferReceiptOpen = false"><section class="transfer-receipt-modal" role="dialog" aria-modal="true" aria-labelledby="transfer-receipt-title"><button class="close" type="button" aria-label="Cerrar transferencia" @click="isTransferReceiptOpen = false">×</button><p class="eyebrow"><span></span> PAGO POR TRANSFERENCIA</p><h2 id="transfer-receipt-title">Tu pedido esta casi listo.</h2><p class="transfer-intro">Realiza tu transferencia con estos datos y luego confirma el envio de tu comprobante.</p><div class="transfer-amount"><span>MONTO EXACTO A TRANSFERIR</span><b>{{ formatPrice(transferSuccess.totalCents) }}</b><small>Incluye el costo de envio, si aplica.</small></div><div class="bank-details"><span>TITULAR</span><b>BEAUTYCOMP SA</b><span>RUC</span><b>0993115347001</b><span>BANCO</span><b>Banco Pichincha</b><span>CUENTA CORRIENTE</span><b>2100185792</b></div><p class="transfer-reference">Referencia de pedido: <b>{{ transferSuccess.reference }}</b></p><label class="receipt-picker"><span>Comprobante de transferencia</span><input type="file" accept="image/jpeg,image/png,image/webp" @change="selectTransferReceipt"><b>{{ selectedTransferReceipt ? selectedTransferReceipt.name : 'Seleccionar imagen' }}</b><small>JPG, PNG o WEBP · Maximo 5 MB</small></label><figure v-if="selectedTransferReceipt" class="receipt-preview"><img :src="selectedTransferReceipt.dataUrl" alt="Previsualizacion del comprobante de transferencia"><figcaption>Previsualizacion: revisa que el comprobante sea legible antes de confirmarlo.</figcaption></figure><label class="amount-confirmation"><input v-model="hasConfirmedTransferAmount" type="checkbox"><span>Confirmo que el comprobante muestra claramente el monto transferido de <b>{{ formatPrice(transferSuccess.totalCents) }}</b>.</span></label><button class="button button-dark receipt-confirm" type="button" :disabled="isUploadingReceipt || !selectedTransferReceipt || !hasConfirmedTransferAmount" @click="uploadTransferReceipt">{{ isUploadingReceipt ? 'Enviando comprobante...' : 'Confirmar y enviar comprobante' }} <span>→</span></button><button class="transfer-later" type="button" @click="isTransferReceiptOpen = false">Lo enviare mas tarde</button></section></div></Transition>
    <Transition name="overlay"><div v-if="isCheckoutWizardOpen" class="overlay checkout-wizard-overlay" @click.self="isCheckoutWizardOpen = false"><section class="checkout-wizard" role="dialog" aria-modal="true" aria-labelledby="wizard-title"><button class="close" type="button" aria-label="Cerrar checkout" @click="isCheckoutWizardOpen = false">×</button><header><p class="eyebrow"><span></span> CHECKOUT SEGURO</p><ol aria-label="Progreso de compra"><li :class="{ active: checkoutStep >= 1 }">1. Contacto</li><li :class="{ active: checkoutStep >= 2 }">2. Entrega</li><li :class="{ active: checkoutStep >= 3 }">3. Pago</li></ol></header><template v-if="checkoutStep === 1"><h2 id="wizard-title">Primero,<br><em>te conocemos.</em></h2><p class="wizard-copy">Usaremos estos datos para confirmar tu pedido y mantenerte al tanto.</p><form @submit.prevent="checkoutStep = 2"><div class="field-grid"><label>Nombres<input v-model.trim="buyer.firstName" required autocomplete="given-name"></label><label>Apellidos<input v-model.trim="buyer.lastName" required autocomplete="family-name"></label></div><label>Correo electronico<input v-model.trim="buyer.email" required type="email" autocomplete="email"></label><label>WhatsApp<input v-model.trim="buyer.phone" required type="tel" inputmode="tel" autocomplete="tel" placeholder="Ej. 0995254965" pattern="(?:0?9\d{8}|(?:\+?593)9\d{8})"></label><p class="phone-help">Escribe tu WhatsApp como lo usas en Ecuador. <span v-if="normalizedWhatsApp">Lo confirmaremos como <b>{{ normalizedWhatsApp }}</b>.</span><span v-else>Ejemplo: 0995254965.</span></p><button class="button button-dark wizard-next" type="submit">Continuar a entrega <span>→</span></button></form></template><template v-else-if="checkoutStep === 2"><h2 id="wizard-title">¿A donde<br><em>lo enviamos?</em></h2><p class="wizard-copy">Elige provincia y luego tu ciudad o canton. Puedes volver si necesitas revisar tus datos.</p><form @submit.prevent="checkoutStep = 3"><fieldset class="delivery-section"><legend>Datos de entrega</legend><label>Pais<select v-model="delivery.country" required><option value="Ecuador">Ecuador</option></select></label><div class="field-grid"><label>Provincia<select v-model="delivery.province" required><option disabled value="">Selecciona tu provincia</option><option v-for="province in provinces" :key="province" :value="province">{{ province }}</option></select></label><label>Ciudad o canton<select v-model="delivery.city" required :disabled="!delivery.province"><option disabled value="">{{ delivery.province ? 'Selecciona tu ciudad o canton' : 'Primero selecciona provincia' }}</option><option v-for="city in cities" :key="city" :value="city">{{ city }}</option></select></label></div><label>Direccion completa<input v-model.trim="delivery.address" required autocomplete="street-address" placeholder="Calle, numero, sector o urbanizacion"></label><label>Referencia para entrega<input v-model.trim="delivery.reference" required placeholder="Ej. junto a la farmacia"></label><label>Enlace de Google Maps<input v-model.trim="delivery.mapsUrl" required type="url" placeholder="https://maps.app.goo.gl/..." inputmode="url"></label><p class="maps-help">Comparte tu ubicacion para encontrar tu direccion facilmente.</p></fieldset><div class="wizard-actions"><button class="wizard-back" type="button" @click="checkoutStep = 1">← Volver a contacto</button><button class="button button-dark" type="submit">Continuar al pago <span>→</span></button></div></form></template><template v-else><h2 id="wizard-title">Revisa y<br><em>finaliza.</em></h2><div class="wizard-total"><span>Total a pagar</span><b>{{ formatPrice(totalCents) }}</b><small>{{ shippingCents ? 'Incluye envio estandar de $11' : 'Envio gratis aplicado' }}</small></div><fieldset class="wizard-payment"><legend>Elige tu metodo de pago</legend><label :class="{ selected: paymentMethod === 'payphone' }"><input v-model="paymentMethod" type="radio" value="payphone"> <b>PayPhone</b><small>Pago inmediato y seguro con tarjeta o saldo PayPhone.</small></label><label :class="{ selected: paymentMethod === 'transfer' }"><input v-model="paymentMethod" type="radio" value="transfer"> <b>Transferencia bancaria</b><small>Sube tu comprobante despues de crear el pedido.</small></label></fieldset><div id="payphone-button" v-show="paymentMethod === 'payphone'"></div><p v-if="checkoutError" class="wizard-error" role="status">{{ checkoutError }}</p><div class="wizard-actions"><button class="wizard-back" type="button" @click="checkoutStep = 2">← Volver a entrega</button><button class="button button-dark" type="button" :disabled="isSubmitting" @click="submitOrder">{{ isSubmitting ? 'Preparando pago...' : paymentMethod === 'payphone' ? 'Continuar a PayPhone' : 'Continuar con transferencia' }} <span>→</span></button></div></template></section></div></Transition>
    <Transition name="overlay"><div v-if="isPayphoneGatewayOpen" class="overlay payphone-gateway-overlay"><section class="payphone-gateway" role="dialog" aria-modal="true" aria-labelledby="payphone-gateway-title"><p class="eyebrow"><span></span> PASO FINAL · PAGO SEGURO</p><h2 id="payphone-gateway-title">Completa tu<br><em>pago seguro.</em></h2><div class="payphone-gateway-total"><span>Total a pagar</span><b>{{ formatPrice(totalCents) }}</b></div><p class="payphone-gateway-copy">Ingresa los datos directamente en la Cajita de PayPhone. Tu pedido se confirmara al aprobar el pago.</p><div id="payphone-gateway-button"></div><button class="payphone-cancel" type="button" @click="isPayphoneGatewayOpen = false">Cancelar pago</button></section></div></Transition>
    <Transition name="overlay"><div v-if="isLocationPickerOpen" class="overlay location-picker-overlay"><section class="location-picker" role="dialog" aria-modal="true" aria-labelledby="location-picker-title"><button v-if="locationPickerTarget === 'city'" class="location-picker-back" type="button" @click="openLocationPicker('province')">← Cambiar provincia</button><p class="eyebrow"><span></span> UBICACION DE ENTREGA</p><h2 id="location-picker-title">{{ locationPickerTarget === 'province' ? 'Elige tu provincia.' : 'Elige tu canton.' }}</h2><p class="location-picker-copy">{{ locationPickerTarget === 'province' ? 'Escribe para buscar entre las 24 provincias del Ecuador.' : `Provincia: ${delivery.province}. Escribe para encontrar tu canton.` }}</p><label class="location-search"><span>Buscar {{ locationPickerTarget === 'province' ? 'provincia' : 'canton' }}</span><input v-model.trim="locationSearch" type="search" :placeholder="locationPickerTarget === 'province' ? 'Ej. Guayas' : 'Ej. Guayaquil'" autofocus></label><div class="location-options" role="listbox"><button v-for="option in locationOptions" :key="option" type="button" role="option" @click="chooseLocation(option)">{{ option }} <span>→</span></button><p v-if="!locationOptions.length">No encontramos resultados. Prueba con otro nombre.</p></div><button v-if="delivery.province && delivery.city" class="location-picker-close" type="button" @click="isLocationPickerOpen = false">Usar {{ delivery.province }}, {{ delivery.city }}</button></section></div></Transition>
    <button v-if="isCheckoutWizardOpen && checkoutStep === 2 && !isLocationPickerOpen" class="location-reopen" type="button" style="bottom:28px" @click="openLocationPicker()">Cambiar provincia o canton</button>
  </main>
</template>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&display=swap');
.home-view { --ink:#211e1d;--pink:#f4d9d5;--blush:#df9d9d;--cream:#fbf7f2;--copper:#b86f54;--line:rgba(33,30,29,.18);background:var(--cream);color:var(--ink);overflow:hidden } * { box-sizing:border-box } button,input { font:inherit } button { color:inherit;cursor:pointer } button:disabled { cursor:not-allowed;opacity:.5 } a { color:inherit;text-decoration:none } h1,h2,h3,p { margin:0 }.announcement { background:var(--ink);color:#fffaf5;font:500 10px/1.2 'DM Mono',monospace;letter-spacing:.15em;padding:12px 20px;text-align:center }.announcement span { color:var(--blush);margin:0 12px }.site-header { align-items:center;display:flex;justify-content:space-between;max-width:1380px;margin:auto;padding:24px 5vw }.logo { font:500 19px 'DM Mono',monospace;letter-spacing:-.12em }.logo span { font-weight:400;letter-spacing:-.1em }nav { display:flex;gap:30px;font:500 11px 'DM Mono',monospace;letter-spacing:.08em;text-transform:uppercase }.cart-trigger,.header-cta { background:none;border:0;border-bottom:1px solid var(--ink);font:500 11px 'DM Mono',monospace;padding:6px 0;text-transform:uppercase }.cart-trigger b { background:var(--ink);border-radius:50%;color:var(--cream);display:inline-grid;height:18px;margin-left:8px;place-items:center;width:18px }.hero { display:grid;grid-template-columns:1fr 1fr;min-height:650px;max-width:1380px;margin:auto;padding:45px 5vw 95px }.hero-copy { align-self:center;max-width:620px;position:relative;z-index:1 }.eyebrow { align-items:center;display:flex;font:500 10px 'DM Mono',monospace;gap:10px;letter-spacing:.13em;text-transform:uppercase }.eyebrow span { background:var(--copper);border-radius:50%;height:7px;width:7px }h1,h2 { font:600 clamp(52px,6.3vw,96px)/.94 'Playfair Display',serif;letter-spacing:-.065em }h1 em,h2 em { color:var(--copper);font-weight:500 }.hero h1 { margin:25px 0 24px }.hero-description { font-size:16px;line-height:1.6;max-width:410px }.hero-actions { align-items:center;display:flex;gap:28px;margin-top:34px }.button { align-items:center;border:0;display:inline-flex;font:500 11px 'DM Mono',monospace;gap:34px;letter-spacing:.1em;padding:16px 18px 16px 20px;text-transform:uppercase;transition:transform .2s,background .2s }.button:hover { transform:translateY(-3px) }.button-dark { background:var(--ink);color:var(--cream) }.button span { font-size:18px }.text-link { border-bottom:1px solid var(--ink);font:500 11px 'DM Mono',monospace;padding-bottom:5px }.hero-proof { align-items:center;display:flex;gap:11px;margin-top:55px }.hero-proof strong { color:var(--copper);font:600 44px/.8 'Playfair Display',serif }.hero-proof span { font:10px/1.35 'DM Mono',monospace }.hero-proof i { border-left:1px solid var(--line);height:28px;margin:0 11px }.hero-visual { min-height:535px;position:relative }.photo-frame { border-radius:48% 48% 0 0;height:100%;overflow:hidden;position:absolute;right:3%;top:0;width:76% }.photo-frame:after { background:linear-gradient(180deg,transparent 55%,rgba(33,30,29,.25));content:'';inset:0;position:absolute }.photo-frame img,.intro-visual img,.product-image img,.mask-image img,.mask-options>img { filter:blur(12px);height:100%;object-fit:cover;opacity:0;transition:filter .55s,opacity .55s;width:100% }.loaded img,img.loaded { filter:blur(0);opacity:1 }.sunburst { background:repeating-conic-gradient(from 22deg,var(--pink) 0deg 6deg,transparent 6deg 17deg);border-radius:50%;height:72%;position:absolute;right:-14%;top:13%;width:72% }.hero-note { font:500 10px/1.3 'DM Mono',monospace;letter-spacing:.1em;position:absolute;z-index:2 }.note-top { left:0;top:15%;transform:rotate(-90deg) }.note-bottom { bottom:9%;right:-1%;transform:rotate(90deg) }.circle-stamp { align-items:center;background:var(--blush);border-radius:50%;bottom:-30px;color:#fff;display:flex;font:10px/1.28 'DM Mono',monospace;height:116px;justify-content:center;left:1%;letter-spacing:.08em;position:absolute;text-align:center;transform:rotate(-13deg);width:116px;z-index:3 }.circle-stamp b { color:var(--ink);font-weight:500 }.marquee { background:var(--blush);display:flex;gap:27px;overflow:hidden;padding:17px 0;white-space:nowrap }.marquee span { font:500 12px 'DM Mono',monospace;letter-spacing:.12em }.marquee b { color:var(--cream) }.introduction { align-items:center;display:grid;gap:clamp(45px,9vw,150px);grid-template-columns:.8fr 1fr;max-width:1200px;margin:auto;padding:130px 5vw }.intro-visual { background:var(--pink);border-radius:50% 50% 0 0;height:490px;overflow:hidden;position:relative }.intro-visual img { mix-blend-mode:multiply }.intro-copy h2 { font-size:clamp(47px,5.2vw,76px);margin:21px 0 24px }.intro-copy>p:not(.eyebrow),.upsell-copy>p:last-child { line-height:1.7;max-width:470px }.ingredient-list { border-top:1px solid var(--line);display:grid;gap:12px;margin-top:34px;padding-top:18px }.ingredient-list span { font:10px 'DM Mono',monospace;letter-spacing:.05em }.ingredient-list b { font-size:11px;margin-left:12px }.products-section { background:var(--ink);color:var(--cream);padding:110px 5vw 120px }.section-heading,.product-grid,.combo-grid { max-width:1280px;margin:auto }.section-heading { display:grid;grid-template-columns:1fr auto }.section-heading .eyebrow { grid-column:span 2 }.section-heading h2 { font-size:clamp(48px,5.5vw,78px);margin-top:22px }.section-heading a { align-self:end;border-bottom:1px solid var(--blush);color:var(--blush);font:11px 'DM Mono',monospace;height:max-content;padding-bottom:6px }.product-grid { display:grid;gap:16px;grid-template-columns:repeat(3,1fr);margin-top:55px }.product-card { background:#f5e3de;color:var(--ink);min-height:480px;overflow:hidden;padding:20px;position:relative }.product-card-1 { background:#e6b0a7 }.product-card-2 { background:#d0a07a }.product-number { font:10px 'DM Mono',monospace }.product-image { height:250px;margin:10px auto 0;overflow:hidden;width:80% }.product-image.liner { width:100% }.product-image img { mix-blend-mode:multiply }.product-info { bottom:21px;left:20px;position:absolute;right:20px }.product-info>p { color:var(--copper);font:10px 'DM Mono',monospace;text-transform:uppercase }.product-info h3 { font:600 29px/.98 'Playfair Display',serif;letter-spacing:-.04em;margin:8px 0 }.product-info>span { font-size:12px }.product-info div { align-items:center;display:flex;justify-content:space-between;margin-top:17px }.product-info strong { font:500 18px 'DM Mono',monospace }.product-info button { align-items:center;background:var(--ink);border:0;border-radius:50%;color:var(--cream);display:flex;font-size:20px;height:38px;justify-content:center;width:38px }.combos-section { background:var(--pink);padding:120px 5vw }.combo-heading { margin:auto;max-width:1280px }.combo-heading h2 { font-size:clamp(50px,5.7vw,80px);margin:20px 0 }.combo-heading>p:last-child { max-width:330px;line-height:1.55 }.combo-grid { display:grid;gap:18px;grid-template-columns:repeat(2,1fr);margin-top:52px }.combo-card { background:var(--cream);padding:35px }.combo-card.featured { background:var(--ink);color:var(--cream) }.tag { color:var(--copper);font:500 10px 'DM Mono',monospace;letter-spacing:.12em }.featured .tag { color:var(--blush) }.combo-card h3 { font:600 clamp(36px,4vw,57px)/.92 'Playfair Display',serif;letter-spacing:-.055em;margin:35px 0 20px;white-space:pre-line }.combo-items { font-size:14px;line-height:1.5 }.combo-items span,.combo-price strong { color:var(--copper) }.combo-price { align-items:baseline;display:flex;gap:15px;margin:35px 0 28px }.combo-price s { font:12px 'DM Mono',monospace }.combo-price strong { font:500 38px 'DM Mono',monospace }.combo-card button { background:none;border:0;border-bottom:1px solid currentColor;font:11px 'DM Mono',monospace;padding:0 0 7px }.combo-card button span { margin-left:25px }.routine-section { background:#f7f0e8;display:grid;gap:70px;grid-template-columns:.8fr 1.2fr;padding:120px max(5vw,calc((100vw - 1200px)/2)) }.routine-title h2 { font-size:clamp(48px,5.3vw,73px);margin-top:22px }.steps { list-style:none;margin:0;padding:0 }.steps li { align-items:start;border-top:1px solid var(--line);display:grid;gap:30px;grid-template-columns:55px 1fr;padding:22px 0 }.steps li:last-child { border-bottom:1px solid var(--line) }.steps b { color:var(--copper);font:500 13px 'DM Mono',monospace }.steps h3 { font:500 27px 'Playfair Display',serif }.steps p { font-size:13px;line-height:1.5;margin-top:5px;max-width:350px }.upsell { align-items:center;background:var(--copper);color:var(--cream);display:grid;gap:70px;grid-template-columns:1fr .85fr;padding:100px max(5vw,calc((100vw - 1100px)/2)) }.upsell .eyebrow span { background:var(--cream) }.upsell h2 { font-size:clamp(44px,5vw,70px);margin:22px 0 }.upsell h2 em { color:var(--pink) }.mask-image { border-radius:100px 100px 0 0;height:180px;margin-bottom:28px;overflow:hidden;width:180px }.mask-options { border:1px solid rgba(255,255,255,.55);padding:28px;position:relative }.mask-options>img { height:150px;margin:-70px 0 14px 58%;mix-blend-mode:multiply;object-fit:contain;width:42% }.mask-options>p { font:10px 'DM Mono',monospace;letter-spacing:.1em }.mask-options>div { margin:24px 0 }.mask-options button { align-items:center;background:none;border:0;border-top:1px solid rgba(255,255,255,.35);color:inherit;display:grid;font-size:14px;grid-template-columns:1fr auto 30px;padding:12px 0;text-align:left;width:100% }.mask-options b { font:500 15px 'DM Mono',monospace }.mask-options i { font-style:normal;text-align:right }.testimonial { background:var(--ink);color:var(--cream);padding:110px 8vw;text-align:center }.quote-mark { color:var(--blush);font:90px/.6 'Playfair Display',serif }.testimonial blockquote { font:500 clamp(31px,4.4vw,65px)/1.08 'Playfair Display',serif;letter-spacing:-.045em;margin:25px auto 30px;max-width:1000px }.testimonial em { color:var(--blush) }.testimonial>p:last-child { font:10px 'DM Mono',monospace;letter-spacing:.12em }.retailers { padding:120px 5vw;text-align:center }.retailers .eyebrow { justify-content:center }.retailers h2 { font-size:clamp(47px,5.2vw,73px);margin:22px 0 55px }.retailers div { display:grid;grid-template-columns:repeat(4,1fr);margin:auto;max-width:1200px }.retailers span { border-left:1px solid var(--line);font:500 clamp(14px,1.6vw,21px) 'Playfair Display',serif;padding:20px }.retailers span:last-child { border-right:1px solid var(--line) }footer { background:var(--blush);display:grid;gap:25px;grid-template-columns:1fr 1fr;padding:45px 5vw 22px }footer .logo { font-size:25px }footer>p,footer>a { font:11px 'DM Mono',monospace }footer>a { justify-self:end;text-decoration:underline }footer small { border-top:1px solid rgba(33,30,29,.3);font:9px 'DM Mono',monospace;grid-column:span 2;padding-top:15px }.toast { background:var(--ink);bottom:24px;box-shadow:0 12px 35px rgba(33,30,29,.24);color:var(--cream);font:11px 'DM Mono',monospace;left:50%;letter-spacing:.03em;padding:15px 20px;position:fixed;transform:translateX(-50%);z-index:20 }.overlay { align-items:center;background:rgba(33,30,29,.5);display:flex;inset:0;justify-content:center;padding:20px;position:fixed;z-index:15 }.drawer,.checkout-modal,.status-modal { background:var(--cream);box-shadow:0 20px 70px rgba(33,30,29,.28);max-height:calc(100vh - 40px);overflow:auto;position:relative }.drawer { align-self:stretch;margin-left:auto;padding:42px 32px;width:min(470px,100%) }.checkout-modal,.status-modal { padding:45px;width:min(570px,100%) }.close { background:none;border:0;font:32px/1 Arial,sans-serif;position:absolute;right:18px;top:14px }.drawer h2,.checkout-modal h2,.status-modal h2 { font-size:52px;margin:16px 0 28px }.cart-items article { border-top:1px solid var(--line);display:flex;justify-content:space-between;padding:17px 0 }.cart-items h3 { font:500 20px 'Playfair Display',serif }.cart-items p,.quantity { font:10px 'DM Mono',monospace;margin-top:7px }.quantity { align-items:center;display:flex;flex-wrap:wrap;gap:9px;justify-content:end;width:130px }.quantity button { background:transparent;border:1px solid var(--line);height:24px;width:24px }.quantity .remove { border:0;height:auto;text-decoration:underline;width:auto }.empty { border-top:1px solid var(--line);font:16px/1.5 'Playfair Display',serif;padding:25px 0 }.shipping { background:var(--pink);font:10px/1.5 'DM Mono',monospace;margin-top:24px;padding:14px }.shipping i { background:rgba(33,30,29,.18);display:block;height:3px;margin-top:10px }.shipping i span { background:var(--copper);display:block;height:100%;transition:width .3s }.cart-total { display:flex;font:500 17px 'DM Mono',monospace;justify-content:space-between;margin:25px 0 }.checkout-button { justify-content:space-between;width:100% }.checkout-total,.reference { font:13px 'DM Mono',monospace;margin:-15px 0 25px }.checkout-modal form { display:grid;gap:15px }.checkout-modal label { display:grid;font:11px 'DM Mono',monospace;gap:8px }.checkout-modal input { background:#fffdfa;border:1px solid var(--line);border-radius:0;padding:12px }.checkout-modal fieldset { border:1px solid var(--line);display:grid;gap:10px;margin:8px 0;padding:14px }.checkout-modal legend { font:11px 'DM Mono',monospace;padding:0 4px }.checkout-modal .payment-option { align-items:center;display:flex;gap:10px }.payment-option span { display:grid;gap:4px }.payment-option small { color:#655d59;font:10px/1.3 'DM Mono',monospace }.form-error { color:#9b3026;font:11px/1.4 'DM Mono',monospace }.instruction,.status-modal>p:not(.eyebrow) { font-size:15px;line-height:1.6;margin:0 0 14px }.checkout-modal .button,.status-modal .button { margin-top:18px }.overlay-enter-active,.overlay-leave-active { transition:opacity .25s }.overlay-enter-active .drawer,.overlay-enter-active .checkout-modal,.overlay-enter-active .status-modal { transition:transform .3s ease,opacity .3s }.overlay-enter-from,.overlay-leave-to { opacity:0 }.overlay-enter-from .drawer { transform:translateX(40px);opacity:0 }.overlay-enter-from .checkout-modal,.overlay-enter-from .status-modal { opacity:0;transform:translateY(18px) scale(.98) }.toast-enter-active,.toast-leave-active { transition:opacity .2s,transform .2s }.toast-enter-from,.toast-leave-to { opacity:0;transform:translate(-50%,14px) }
.marquee { display:block; overflow:hidden; }.marquee-track { align-items:center; display:flex; width:max-content; animation:marquee-scroll 30s linear infinite; will-change:transform; }.marquee-group { align-items:center; display:flex; flex:0 0 100vw; justify-content:space-around; }.marquee-track span { font:500 12px 'DM Mono',monospace; letter-spacing:.12em; }.marquee-track b { color:var(--cream); }.photo-frame:not(.loaded),.intro-visual:not(.loaded),.product-image:not(.loaded),.mask-image:not(.loaded),.mask-options>img:not(.loaded) { background:linear-gradient(110deg,rgba(255,255,255,.08) 30%,rgba(255,255,255,.52) 45%,rgba(255,255,255,.08) 60%),var(--pink); background-size:240% 100%; animation:image-shimmer 1.5s ease-in-out infinite; }.photo-frame:not(.loaded) img,.intro-visual:not(.loaded) img,.product-image:not(.loaded) img,.mask-image:not(.loaded) img,.mask-options>img:not(.loaded) { opacity:0; }.photo-frame img,.intro-visual img,.product-image img,.mask-image img,.mask-options>img { transition:opacity .55s ease,transform .7s ease; }.loaded img,.mask-options>img.loaded { opacity:1; transform:scale(1); }@keyframes marquee-scroll { to { transform:translateX(-50%); } }@keyframes image-shimmer { to { background-position:-140% 0; } }@media (prefers-reduced-motion:reduce) { .marquee-track,.photo-frame:not(.loaded),.intro-visual:not(.loaded),.product-image:not(.loaded),.mask-image:not(.loaded),.mask-options>img:not(.loaded) { animation:none; } }.shipping::after { background:var(--cream); border-left:3px solid var(--copper); color:var(--ink); content:'EXTRA RECOMENDADO · MASCARILLA DE COLAGENO DESDE $2.50'; display:block; font:500 9px/1.45 'DM Mono',monospace; letter-spacing:.05em; margin-top:16px; padding:11px 12px; }
@media (max-width:750px) { .announcement { font-size:8px }.announcement span { margin:0 4px }.site-header { padding:18px 5vw }nav { display:none }.hero { display:block;min-height:0;padding-top:35px }.hero h1 { font-size:clamp(54px,16vw,78px) }.hero-visual { height:440px;margin:65px -2vw 0;min-height:0 }.photo-frame { right:8%;width:78% }.sunburst { right:-8% }.note-top { left:-4% }.note-bottom { right:-3% }.circle-stamp { height:95px;width:95px }.introduction,.routine-section,.upsell { display:block;padding:80px 6vw }.intro-visual { height:390px;margin-bottom:55px }.product-grid,.combo-grid { grid-template-columns:1fr }.product-card { min-height:440px }.products-section,.combos-section { padding:80px 6vw }.section-heading { display:block }.section-heading .eyebrow { margin-bottom:20px }.section-heading a { display:inline-block;margin-top:24px }.routine-title { margin-bottom:45px }.upsell-copy { margin-bottom:65px }.retailers { padding:80px 6vw }.retailers div { grid-template-columns:1fr 1fr }.retailers span:nth-child(3),.retailers span:nth-child(4) { border-top:1px solid var(--line) }.retailers span:nth-child(4) { border-right:1px solid var(--line) }.drawer { padding:38px 23px }.checkout-modal,.status-modal { padding:42px 25px }.drawer h2,.checkout-modal h2,.status-modal h2 { font-size:43px }.mask-options>img { margin-left:45% } }
:global(.cart-mask-quick-add) { align-items:center; background:var(--ink); border:0; color:var(--cream); display:flex; font:500 10px/1.35 'DM Mono',monospace; justify-content:space-between; letter-spacing:.03em; margin-top:14px; padding:13px 14px; text-align:left; transition:background .2s,transform .2s; width:100%; }:global(.cart-mask-quick-add:hover) { background:var(--copper); transform:translateY(-2px); }:global(.cart-mask-quick-add span) { max-width:145px; }:global(.cart-mask-quick-add strong) { color:var(--pink); font:500 10px/1.35 'DM Mono',monospace; text-align:right; }:global(.cart-mask-quick-add:hover strong) { color:var(--cream); }.shipping::after { content:none; }
.checkout-modal { width:min(680px,100%); }.checkout-modal form { gap:18px; }.checkout-modal label,.checkout-modal legend { font-size:12px; }.checkout-modal input,.checkout-modal select { font:14px 'DM Mono',monospace; min-height:46px; }.checkout-modal select { background:#fffdfa;border:1px solid var(--line);border-radius:0;color:var(--ink);padding:12px; }.field-grid { display:grid;gap:15px;grid-template-columns:1fr 1fr; }.delivery-section { background:rgba(244,217,213,.38);border-color:var(--blush)!important;gap:15px!important;padding:18px!important; }.delivery-section legend { color:var(--copper);font-weight:500;letter-spacing:.06em; }.maps-help { color:#655d59;font:10px/1.45 'DM Mono',monospace;margin-top:-7px; }.payment-option { border:1px solid transparent;padding:12px;transition:border-color .2s,background .2s; }.payment-option:has(input:checked) { background:rgba(244,217,213,.45);border-color:var(--blush); }.payment-option-recommended { background:rgba(244,217,213,.45);border-color:var(--blush);order:-1; }.payment-option b { align-items:center;display:flex;gap:8px; }.payment-option i { background:var(--copper);color:var(--cream);font:500 8px 'DM Mono',monospace;font-style:normal;letter-spacing:.08em;padding:4px 5px; }.payment-option small { font-size:11px;line-height:1.45; }.no-fees { background:var(--pink);font:500 11px/1.45 'DM Mono',monospace;padding:12px 14px;text-align:center; }.verification-note { color:var(--copper);font:500 13px/1.55 'DM Mono',monospace;margin:0 0 18px; }.checkout-modal #payphone-button { margin-top:18px; }
.transfer-confirmation-overlay { z-index:20; }.transfer-confirmation-modal { background:var(--cream);box-shadow:0 24px 80px rgba(33,30,29,.25);max-width:550px;padding:54px;position:relative;width:min(550px,100%); }.transfer-confirmation-modal h2 { font-size:clamp(44px,5vw,62px);margin:20px 0 22px; }.transfer-confirmation-modal > p:not(.eyebrow) { font-size:15px;line-height:1.65;max-width:455px; }.transfer-confirmation-modal strong { color:var(--copper);font-weight:500; }.transfer-no-fees { background:var(--pink);font:500 11px/1.5 'DM Mono',monospace;margin-top:20px!important;padding:13px 15px; }.transfer-confirmation-actions { display:grid;gap:14px;margin-top:28px; }.transfer-confirmation-actions .button { justify-content:space-between;width:100%; }.transfer-back { background:transparent;border:0;border-bottom:1px solid var(--ink);font:500 10px 'DM Mono',monospace;justify-self:center;letter-spacing:.08em;padding:5px 0;text-transform:uppercase; }
.transfer-receipt-overlay { z-index:30; }.transfer-receipt-modal { background:var(--cream);box-shadow:0 24px 80px rgba(33,30,29,.25);max-height:calc(100vh - 36px);max-width:600px;overflow:auto;padding:46px;position:relative;width:min(600px,100%); }.transfer-receipt-modal h2 { font-size:clamp(38px,5vw,58px);margin:18px 0; }.transfer-intro { font-size:14px;line-height:1.6;margin-bottom:22px; }.bank-details { background:var(--ink);color:var(--cream);display:grid;gap:5px;grid-template-columns:1fr 1.4fr;padding:19px; }.bank-details span { color:var(--pink);font:500 9px 'DM Mono',monospace;letter-spacing:.08em; }.bank-details b { font:500 13px 'DM Mono',monospace; }.transfer-reference { font:500 11px/1.5 'DM Mono',monospace;margin:16px 0; }.receipt-picker { border:1px dashed var(--copper);cursor:pointer;display:grid;gap:7px;margin-top:18px;padding:17px; }.receipt-picker span,.receipt-picker small { font:500 10px 'DM Mono',monospace;letter-spacing:.04em; }.receipt-picker input { display:none; }.receipt-picker b { color:var(--copper);font:500 14px 'DM Mono',monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }.receipt-confirm { justify-content:space-between;margin-top:17px;width:100%; }.transfer-later { background:transparent;border:0;border-bottom:1px solid var(--ink);display:block;font:500 10px 'DM Mono',monospace;letter-spacing:.08em;margin:16px auto 0;padding:5px;text-transform:uppercase; }
.receipt-preview { margin:16px 0 0; }.receipt-preview img { border:1px solid var(--line);display:block;max-height:220px;object-fit:contain;width:100%; }.receipt-preview figcaption { color:#655d59;font:10px/1.45 'DM Mono',monospace;margin-top:7px; }
@media (max-width:750px) { .field-grid { grid-template-columns:1fr; }.checkout-modal { width:min(680px,100%); }.checkout-modal form { gap:16px; } }
@media (max-width:750px) { .transfer-confirmation-modal { margin:18px;padding:42px 25px; }.transfer-confirmation-modal h2 { font-size:43px; }.transfer-confirmation-modal > p:not(.eyebrow) { font-size:14px; } }
@media (max-width:750px) { .transfer-receipt-modal { margin:18px;padding:38px 24px; }.bank-details { grid-template-columns:1fr;gap:4px; }.bank-details b { margin-bottom:8px; } }
.logo-image { display:block;line-height:0;width:clamp(175px,19vw,255px) }.logo-image img { display:block;height:auto;width:100% }
@media (max-width:750px) { .logo-image { width:185px } }
.home-view { padding-top:152px }.announcement { border:0;cursor:pointer;left:0;position:fixed;right:0;top:0;width:100%;z-index:50 }.announcement b { border-bottom:1px solid currentColor;font:600 10px 'DM Mono',monospace;margin-left:18px;padding-bottom:2px }.announcement:hover { background:var(--copper) }.site-header { background:var(--cream);left:50%;position:fixed;top:40px;transform:translateX(-50%);width:min(1380px,100%);z-index:49 }.overlay { z-index:100 }.checkout-modal { max-height:min(760px,calc(100dvh - 110px));overflow-y:auto;overscroll-behavior:contain;scrollbar-color:var(--copper) rgba(33,30,29,.08);scrollbar-width:thin }.checkout-modal::-webkit-scrollbar { width:8px }.checkout-modal::-webkit-scrollbar-track { background:rgba(33,30,29,.08) }.checkout-modal::-webkit-scrollbar-thumb { background:var(--copper);border:2px solid var(--cream);border-radius:999px }.checkout-modal::-webkit-scrollbar-thumb:hover { background:var(--ink) }.shipping::before { color:var(--copper);content:'ENVÍO ESTÁNDAR: $11 · GRATIS DESDE $49';display:block;font:600 10px 'DM Mono',monospace;letter-spacing:.05em;margin-bottom:12px }.cart-total::before { color:#655d59;content:'El total incluye el delivery cuando aplica';display:block;font:500 9px 'DM Mono',monospace;letter-spacing:.04em;margin-bottom:7px;text-transform:uppercase }@media (max-width:750px) { .home-view { padding-top:143px }.announcement { font-size:10px;padding:13px 14px }.announcement b { display:block;margin:7px auto 0;width:max-content }.site-header { top:61px }.checkout-modal { max-height:calc(100dvh - 36px) } }
.checkout-wizard-overlay { z-index:110 }.checkout-wizard { background:var(--cream);box-shadow:0 24px 80px rgba(33,30,29,.3);max-height:min(760px,calc(100dvh - 70px));max-width:670px;overflow-y:auto;padding:48px 52px;position:relative;scrollbar-color:var(--copper) rgba(33,30,29,.08);scrollbar-width:thin;width:min(670px,100%) }.checkout-wizard::-webkit-scrollbar { width:8px }.checkout-wizard::-webkit-scrollbar-track { background:rgba(33,30,29,.08) }.checkout-wizard::-webkit-scrollbar-thumb { background:var(--copper);border:2px solid var(--cream);border-radius:999px }.checkout-wizard header { display:flex;gap:22px;justify-content:space-between;margin-right:35px }.checkout-wizard header ol { display:flex;gap:13px;list-style:none;margin:0;padding:0 }.checkout-wizard header li { color:#a79b96;font:500 9px 'DM Mono',monospace;letter-spacing:.04em }.checkout-wizard header li.active { color:var(--copper) }.checkout-wizard h2 { font-size:clamp(43px,5vw,66px);margin:25px 0 15px }.wizard-copy { font-size:14px;line-height:1.55;margin-bottom:25px;max-width:460px }.checkout-wizard form { display:grid;gap:17px }.checkout-wizard label { display:grid;font:500 11px 'DM Mono',monospace;gap:8px;letter-spacing:.03em }.checkout-wizard input,.checkout-wizard select { background:#fffdfa;border:1px solid var(--line);border-radius:0;color:var(--ink);font:14px 'DM Mono',monospace;min-height:47px;padding:12px;width:100% }.checkout-wizard select:disabled { background:#eee8e3;color:#8d827c }.phone-help { background:var(--pink);font:500 10px/1.55 'DM Mono',monospace;margin:-2px 0 2px;padding:11px 13px }.phone-help b { color:var(--copper) }.wizard-next { justify-content:space-between;margin-top:5px;width:100% }.checkout-wizard .delivery-section { display:grid;gap:16px;margin:0;padding:18px }.checkout-wizard .delivery-section legend { font:500 11px 'DM Mono',monospace }.wizard-actions { align-items:center;display:flex;gap:16px;justify-content:space-between;margin-top:6px }.wizard-actions .button { justify-content:space-between;min-width:250px }.wizard-back { background:transparent;border:0;border-bottom:1px solid var(--ink);font:500 10px 'DM Mono',monospace;letter-spacing:.06em;padding:6px 0;text-transform:uppercase }.wizard-total { background:var(--ink);color:var(--cream);display:grid;gap:5px;margin:23px 0;padding:18px }.wizard-total span,.wizard-total small { color:var(--pink);font:500 10px 'DM Mono',monospace;letter-spacing:.05em;text-transform:uppercase }.wizard-total b { font:500 29px 'DM Mono',monospace }.wizard-payment { border:1px solid var(--line);display:grid;gap:10px;margin:0;padding:16px }.wizard-payment legend { font:500 10px 'DM Mono',monospace;letter-spacing:.05em;text-transform:uppercase }.wizard-payment label { border:1px solid transparent;cursor:pointer;display:grid;grid-template-columns:auto 1fr;gap:5px 10px;padding:12px }.wizard-payment label.selected { background:var(--pink);border-color:var(--blush) }.wizard-payment input { align-self:center;min-height:auto;padding:0;width:auto }.wizard-payment b { font-size:13px }.wizard-payment small { font:11px/1.4 'DM Mono',monospace;grid-column:2 }.wizard-error { color:#a83030;font:12px 'DM Mono',monospace;margin:14px 0 0 }.checkout-wizard #payphone-button { margin-top:14px }@media (max-width:750px) { .checkout-wizard { margin:18px;max-height:calc(100dvh - 36px);padding:38px 24px }.checkout-wizard header { align-items:flex-start;display:grid;gap:13px }.checkout-wizard h2 { font-size:45px }.checkout-wizard .field-grid { grid-template-columns:1fr }.wizard-actions { align-items:stretch;flex-direction:column-reverse }.wizard-actions .button { min-width:0;width:100% }.wizard-back { align-self:center } }
.checkout-wizard.is-changing-step > :not(header):not(.close) { animation:wizard-step-in .34s cubic-bezier(.22,1,.36,1) both }@keyframes wizard-step-in { from { opacity:0;transform:translateY(14px) scale(.985) } to { opacity:1;transform:translateY(0) scale(1) } }.phone-help { font-size:0 }.phone-help::before { content:'Usa tu WhatsApp con código de país (ej. +1, +34, +52). En Ecuador también puedes escribir 09 seguido de ocho dígitos.';font:500 10px/1.55 "DM Mono",monospace;letter-spacing:0 }@media (prefers-reduced-motion:reduce) { .checkout-wizard.is-changing-step > :not(header):not(.close) { animation:none } }
.payphone-gateway-overlay { z-index:120 }.payphone-gateway { background:var(--cream);box-shadow:0 24px 80px rgba(33,30,29,.3);max-height:min(820px,calc(100dvh - 50px));max-width:620px;overflow-y:auto;padding:48px 52px;scrollbar-color:var(--copper) rgba(33,30,29,.08);scrollbar-width:thin;width:min(620px,100%) }.payphone-gateway::-webkit-scrollbar { width:8px }.payphone-gateway::-webkit-scrollbar-track { background:rgba(33,30,29,.08) }.payphone-gateway::-webkit-scrollbar-thumb { background:var(--copper);border:2px solid var(--cream);border-radius:999px }.payphone-gateway h2 { font-size:clamp(43px,5vw,64px);margin:22px 0 }.payphone-gateway-total { background:var(--ink);color:var(--cream);display:flex;justify-content:space-between;margin:0 0 18px;padding:16px }.payphone-gateway-total span { align-self:center;color:var(--pink);font:500 10px 'DM Mono',monospace;letter-spacing:.05em;text-transform:uppercase }.payphone-gateway-total b { font:500 26px 'DM Mono',monospace }.payphone-gateway-copy { font-size:14px;line-height:1.55;margin-bottom:20px }.payphone-gateway #payphone-gateway-button { min-height:110px }.payphone-cancel { background:transparent;border:0;border-bottom:1px solid var(--ink);display:block;font:500 10px 'DM Mono',monospace;letter-spacing:.06em;margin:24px auto 0;padding:6px 0;text-transform:uppercase }@media (max-width:750px) { .payphone-gateway { margin:18px;max-height:calc(100dvh - 36px);padding:38px 24px }.payphone-gateway h2 { font-size:45px } }
.checkout-wizard .delivery-section > label:first-of-type,.checkout-wizard .delivery-section > .field-grid { display:none }.checkout-wizard .delivery-section::before { background:var(--pink);color:var(--copper);content:'PROVINCIA Y CANTÓN SELECCIONADOS CON EL BUSCADOR';display:block;font:600 9px "DM Mono",monospace;letter-spacing:.05em;margin:-2px -2px 3px;padding:10px;text-align:center }.location-picker-overlay { z-index:130 }.location-picker { background:var(--cream);box-shadow:0 24px 80px rgba(33,30,29,.32);display:flex;flex-direction:column;max-height:min(720px,calc(100dvh - 32px));max-width:590px;padding:34px 28px;width:min(590px,100%) }.location-picker h2 { font-size:clamp(42px,9vw,62px);margin:18px 0 12px }.location-picker-copy { font-size:14px;line-height:1.55;margin-bottom:18px }.location-picker-back,.location-picker-close { background:transparent;border:0;border-bottom:1px solid var(--ink);font:500 10px "DM Mono",monospace;letter-spacing:.06em;padding:6px 0;text-transform:uppercase;width:max-content }.location-picker-close { color:var(--copper);margin:18px auto 0 }.location-search { display:grid;gap:7px;margin-bottom:14px }.location-search span { font:500 10px "DM Mono",monospace;letter-spacing:.06em;text-transform:uppercase }.location-search input { background:#fffdfa;border:1px solid var(--copper);border-radius:0;font:15px "DM Mono",monospace;min-height:52px;padding:13px;width:100% }.location-options { display:grid;gap:7px;overflow-y:auto;overscroll-behavior:contain;padding-right:4px;scrollbar-color:var(--copper) transparent;scrollbar-width:thin }.location-options button { align-items:center;background:#fffdfa;border:1px solid var(--line);display:flex;font:500 13px "DM Mono",monospace;justify-content:space-between;padding:14px;text-align:left;transition:background .18s,color .18s,transform .18s }.location-options button:hover { background:var(--ink);color:var(--cream);transform:translateX(3px) }.location-options button span { color:var(--copper) }.location-options p { color:#756d69;font:12px "DM Mono",monospace;margin:22px 0;text-align:center }@media (max-width:750px) { .location-picker { align-self:end;max-height:calc(100dvh - 18px);max-width:none;min-height:72dvh;padding:31px 22px;width:100% }.location-options { flex:1 }.location-options button { min-height:50px } }
.location-reopen { background:var(--ink);border:0;color:var(--cream);cursor:pointer;font:500 10px "DM Mono",monospace;left:50%;letter-spacing:.06em;padding:13px 17px;position:fixed;transform:translateX(-50%);z-index:111 }.checkout-wizard .delivery-section > label:first-of-type,.checkout-wizard .delivery-section > .field-grid { display:none }.checkout-wizard .delivery-section::before { background:var(--pink);color:var(--copper);content:'PROVINCIA Y CANTÓN SELECCIONADOS CON EL BUSCADOR';display:block;font:600 9px "DM Mono",monospace;letter-spacing:.05em;margin:-2px -2px 3px;padding:10px;text-align:center }.location-picker-overlay { z-index:130 }.location-picker { background:var(--cream);box-shadow:0 24px 80px rgba(33,30,29,.32);display:flex;flex-direction:column;max-height:min(720px,calc(100dvh - 32px));max-width:590px;padding:34px 28px;width:min(590px,100%) }.location-picker h2 { font-size:clamp(42px,9vw,62px);margin:18px 0 12px }.location-picker-copy { font-size:14px;line-height:1.55;margin-bottom:18px }.location-picker-back,.location-picker-close { background:transparent;border:0;border-bottom:1px solid var(--ink);font:500 10px "DM Mono",monospace;letter-spacing:.06em;padding:6px 0;text-transform:uppercase;width:max-content }.location-picker-close { color:var(--copper);margin:18px auto 0 }.location-search { display:grid;gap:7px;margin-bottom:14px }.location-search span { font:500 10px "DM Mono",monospace;letter-spacing:.06em;text-transform:uppercase }.location-search input { background:#fffdfa;border:1px solid var(--copper);border-radius:0;font:15px "DM Mono",monospace;min-height:52px;padding:13px;width:100% }.location-options { display:grid;gap:7px;overflow-y:auto;overscroll-behavior:contain;padding-right:4px;scrollbar-color:var(--copper) transparent;scrollbar-width:thin }.location-options button { align-items:center;background:#fffdfa;border:1px solid var(--line);display:flex;font:500 13px "DM Mono",monospace;justify-content:space-between;padding:14px;text-align:left;transition:background .18s,color .18s,transform .18s }.location-options button:hover { background:var(--ink);color:var(--cream);transform:translateX(3px) }.location-options button span { color:var(--copper) }.location-options p { color:#756d69;font:12px "DM Mono",monospace;margin:22px 0;text-align:center }@media (max-width:750px) { .location-reopen { bottom:22px }.location-picker { align-self:end;max-height:calc(100dvh - 18px);max-width:none;min-height:72dvh;padding:31px 22px;width:100% }.location-options { flex:1 }.location-options button { min-height:50px } }
</style>
<style lang="scss" scoped>
.checkout-wizard .delivery-section::before { content:attr(data-location); cursor:default; font-size:10px; line-height:1.45; }
.location-reopen { background:var(--copper); bottom:104px !important; box-shadow:0 8px 20px rgba(33,30,29,.2); }
.location-reopen:hover { background:var(--ink); }
@media (max-width:750px) { .location-reopen { bottom:84px !important; width:calc(100% - 48px); } }
</style>
<style lang="scss" scoped>
.track-order { border-bottom:1px solid var(--copper);color:var(--copper);font:600 10px 'DM Mono',monospace;letter-spacing:.05em;padding:6px 0;text-decoration:none;text-transform:uppercase }
@media (max-width:750px) { .track-order { font-size:0 }.track-order::before { content:'PEDIDO';font-size:9px }.site-header { gap:10px }.cart-trigger { font-size:9px } }
</style>
<style lang="scss" scoped>
.transfer-confirmation-overlay { z-index:140 !important; }
.transfer-confirmation-modal { position:relative; z-index:141; }
</style>
<style lang="scss" scoped>
.transfer-amount { background:var(--pink);display:grid;gap:5px;margin:18px 0;padding:16px;text-align:center; }
.transfer-amount span,.transfer-amount small { font:500 10px 'DM Mono',monospace;letter-spacing:.06em; }
.transfer-amount b { color:var(--copper);font:500 30px 'DM Mono',monospace; }
.amount-confirmation { align-items:flex-start;background:#fffdfa;border:1px solid var(--copper);cursor:pointer;display:flex;gap:11px;font:500 11px/1.5 'DM Mono',monospace;margin-top:16px;padding:14px; }
.amount-confirmation input { accent-color:var(--copper);height:17px;margin:0;min-height:0;width:17px; }
.amount-confirmation b { color:var(--copper); }
</style>
