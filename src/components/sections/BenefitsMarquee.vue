<script setup lang="ts">
// Cinta de beneficios: markup puro, sin estado.
</script>

<template>
  <!-- Marquee Banner -->
  <section class="marquee" aria-label="Beneficios del producto">
    <div class="marquee-track">
      <!-- Carolina cambió los cuatro beneficios por una sola promesa (deck de oct 2026).
           Se repite cuatro veces por grupo para que la cinta siga llenando el ancho. -->
      <div class="marquee-group">
        <span>ENVÍOS GRATIS SOLO POR HOY</span><b>✦</b><span>ENVÍOS GRATIS SOLO POR HOY</span><b>✦</b><span>ENVÍOS GRATIS SOLO POR HOY</span><b>✦</b><span>ENVÍOS GRATIS SOLO POR HOY</span><b>✦</b>
      </div>
      <div class="marquee-group" aria-hidden="true">
        <span>ENVÍOS GRATIS SOLO POR HOY</span><b>✦</b><span>ENVÍOS GRATIS SOLO POR HOY</span><b>✦</b><span>ENVÍOS GRATIS SOLO POR HOY</span><b>✦</b><span>ENVÍOS GRATIS SOLO POR HOY</span><b>✦</b>
      </div>
    </div>
  </section>
</template>
