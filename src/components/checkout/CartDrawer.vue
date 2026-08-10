<script setup lang="ts">
import { formatPrice } from '@/config/catalog'
import { useCart } from '@/composables/useCart'
import { useCheckout } from '@/composables/useCheckout'

const {
  cart, isCartOpen, hasCombo, hasMask, shippingCents,
  totalCents, changeQuantity, removeItem, addMaskPack,
} = useCart()
const { openCheckout } = useCheckout()
</script>

<template>
  <Transition name="overlay">
    <div v-if="isCartOpen" class="overlay" @click.self="isCartOpen = false">
      <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <button class="close" type="button" aria-label="Cerrar carrito" @click="isCartOpen = false">×</button>
        <p class="eyebrow"><span></span> TU SELECCIÓN</p>
        <h2 id="cart-title">Tu bolsa.</h2>

        <div v-if="cart.length" class="cart-items">
          <article v-for="item in cart" :key="item.productId">
            <div>
              <h3>{{ item.name }}</h3>
              <p>{{ formatPrice(item.price) }}</p>
            </div>
            <div class="quantity">
              <button type="button" :aria-label="`Reducir ${item.name}`" @click="changeQuantity(item.productId, -1)">−</button>
              <span>{{ item.qty }}</span>
              <button type="button" :aria-label="`Aumentar ${item.name}`" @click="changeQuantity(item.productId, 1)">+</button>
              <button class="remove" type="button" :aria-label="`Quitar ${item.name}`" @click="removeItem(item.productId)">Quitar</button>
            </div>
          </article>
        </div>
        <p v-else class="empty">Tu bolsa está esperando su primer ritual.</p>

        <div class="shipping">
          <p v-if="hasCombo"><b>Tu envío es gratis.</b></p>
          <p v-else>
            Envío estándar <b>{{ formatPrice(shippingCents || 600) }}</b>.
            <a href="#combos" @click="isCartOpen = false">Suma un combo</a> y tu envío es gratis.
          </p>
          <button v-if="cart.length && !hasMask" class="cart-mask-quick-add" type="button" @click="addMaskPack">
            <span>Completa tu glow: 5 mascarillas</span>
            <strong>Ahorra $2.60 · Agregar $9.90</strong>
          </button>
        </div>

        <div class="cart-total"><span>Total</span><strong>{{ formatPrice(totalCents) }}</strong></div>
        <button class="button button-dark checkout-button" type="button" :disabled="!cart.length" @click="openCheckout">
          Continuar al pago <span>→</span>
        </button>
      </aside>
    </div>
  </Transition>
</template>
