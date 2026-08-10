<script setup lang="ts">
import { instagramUrl } from '@/config/catalog'
</script>

<template>
  <footer>
    <a class="logo" href="#inicio">OMG <span>LASHES</span></a>
    <p>Tu rutina. Tu mirada. Tu poder.</p>
    <div class="footer-links">
      <a :href="instagramUrl" target="_blank" rel="noreferrer">@omglashes.ec ↗</a>
      <a href="/order-status">Estado de mi pedido</a>
    </div>
    <small>© 2026 OMG Lashes. Todos los derechos reservados.</small>
  </footer>
</template>
