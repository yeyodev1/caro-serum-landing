<script setup lang="ts">
import { useCart } from '@/composables/useCart'

const { isCartOpen, itemCount } = useCart()
</script>

<template>
  <header class="site-header">
    <a class="logo logo-image" href="#inicio" aria-label="OMG Lashes, inicio">
      <img src="/omg-lashes-logo.png" alt="OMG Lashes, Lashes N Brows Serum">
    </a>
    <nav aria-label="Navegación principal">
      <a href="#inicio">Inicio</a>
      <a href="#resultados">Resultados</a>
      <a href="#combos">Kits y Ahorro</a>
      <a href="#aplicacion">Cómo se usa</a>
      <a href="#constancia">Tu Progreso</a>
      <a href="#comunidad">Reseñas</a>
      <a href="#faq">FAQ</a>
    </nav>
    <a class="track-order" href="/order-status"><i class="fa-solid fa-box" aria-hidden="true"></i> Ya tengo mi pedido</a>
    <button class="cart-trigger" type="button" @click="isCartOpen = true">
      <i class="fa-solid fa-bag-shopping" aria-hidden="true"></i> Carrito <b>{{ itemCount }}</b>
    </button>
  </header>
</template>
