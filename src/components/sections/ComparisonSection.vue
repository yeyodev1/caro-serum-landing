<script setup lang="ts">
import { omgBenefits, prostaglandinRisks } from '@/config/landing-content'
</script>

<template>
  <!-- SLIDE 3: No todos los sérums son iguales -->
  <section id="comparativa" class="comparison-section">
    <div class="section-heading centered">
      <p class="eyebrow"><span></span> LO QUE TE PONES CERCA DE LOS OJOS IMPORTA</p>
      <h2>No todos los sérums<br><em>son iguales.</em></h2>
    </div>
    <div class="comparison-grid">
      <article class="comparison-card is-others">
        <span class="comparison-tag">OTROS SÉRUMS</span>
        <h3>Pueden contener análogos de prostaglandinas</h3>
        <p class="comparison-note">Asociados a posibles efectos como:</p>
        <ul>
          <li v-for="risk in prostaglandinRisks" :key="risk"><i aria-hidden="true">!</i> {{ risk }}</li>
        </ul>
      </article>
      <article class="comparison-card is-omg">
        <span class="comparison-tag comparison-tag-best">✓ LA MEJOR ELECCIÓN</span>
        <h3>OMGLashes</h3>
        <p class="comparison-note">Fortalece sin comprometer el cuidado de tu mirada.</p>
        <ul>
          <li v-for="benefit in omgBenefits" :key="benefit"><i aria-hidden="true">✓</i> {{ benefit }}</li>
        </ul>
      </article>
    </div>
  </section>
</template>
