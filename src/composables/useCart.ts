import { computed, nextTick, ref } from 'vue'
import { cartStorageKey, masks } from '@/config/catalog'
import { useToast } from '@/composables/useToast'
import type { CartItem, Product } from '@/types/landing'

const SHIPPING_FEE_CENTS = 600
const INVOICE_THRESHOLD_CENTS = 5000

function loadCart(): CartItem[] {
  try {
    const saved = JSON.parse(localStorage.getItem(cartStorageKey) || '[]') as CartItem[]
    return Array.isArray(saved)
      ? saved.filter((item) => item && typeof item.productId === 'string' && Number.isFinite(item.price) && Number.isFinite(item.qty))
      : []
  } catch { return [] }
}

const cart = ref<CartItem[]>(loadCart())
const isCartOpen = ref(false)

export function useCart() {
  const { notify } = useToast()

  function saveCart() { localStorage.setItem(cartStorageKey, JSON.stringify(cart.value)) }

  const itemCount = computed(() => cart.value.reduce((count, item) => count + item.qty, 0))
  const subtotalCents = computed(() => cart.value.reduce((total, item) => total + item.price * item.qty, 0))
  // Espeja la regla del servidor en order.service.ts: $6 fijo, gratis si el carrito lleva un combo.
  const hasCombo = computed(() => cart.value.some((item) => item.productId.startsWith('combo-')))
  const shippingCents = computed(() => (cart.value.length && !hasCombo.value ? SHIPPING_FEE_CENTS : 0))
  const totalCents = computed(() => subtotalCents.value + shippingCents.value)
  const requiresInvoice = computed(() => totalCents.value > INVOICE_THRESHOLD_CENTS)
  const hasMask = computed(() => cart.value.some((item) => item.productId.startsWith('collagen-mask')))

  function addToCart(product: Product) {
    const item = cart.value.find((cartItem) => cartItem.productId === product.id)
    if (item) item.qty += 1
    else cart.value.push({ productId: product.id, name: product.name, price: product.price, qty: 1 })
    saveCart()
    isCartOpen.value = true
    void nextTick()
    notify(product.id.startsWith('collagen-mask')
      ? 'Mascarilla agregada. Tu ritual ya está completo.'
      : `${product.name} está en tu bolsa. Completa tu glow con una mascarilla de colágeno.`)
  }

  function addMaskPack() { addToCart(masks[1]!) }

  function changeQuantity(id: string, amount: number) {
    const item = cart.value.find((cartItem) => cartItem.productId === id)
    if (!item) return
    item.qty += amount
    if (item.qty < 1) cart.value = cart.value.filter((cartItem) => cartItem.productId !== id)
    saveCart()
  }

  function removeItem(id: string) {
    cart.value = cart.value.filter((item) => item.productId !== id)
    saveCart()
  }

  function emptyCart() { cart.value = []; saveCart() }

  return {
    cart, isCartOpen, itemCount, subtotalCents, hasCombo, hasMask,
    shippingCents, totalCents, requiresInvoice, SHIPPING_FEE_CENTS,
    addToCart, addMaskPack, changeQuantity, removeItem, emptyCart, saveCart,
  }
}
