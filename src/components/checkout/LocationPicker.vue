<script setup lang="ts">
import {
  delivery, isLocationPickerOpen, locationPickerTarget, locationSearch, useCheckout,
} from '@/composables/useCheckout'

const { locationOptions, openLocationPicker, chooseLocation } = useCheckout()
</script>

<template>
  <Transition name="overlay">
    <div v-if="isLocationPickerOpen" class="overlay location-picker-overlay">
      <section class="location-picker" role="dialog" aria-modal="true" aria-labelledby="location-picker-title">
        <button
          v-if="locationPickerTarget === 'city'" class="location-picker-back"
          type="button" @click="openLocationPicker('province')">← Cambiar provincia</button>
        <p class="eyebrow"><span></span> UBICACIÓN DE ENTREGA</p>
        <h2 id="location-picker-title">
          {{ locationPickerTarget === 'province' ? 'Elige tu provincia.' : 'Elige tu cantón.' }}
        </h2>
        <p class="location-picker-copy">
          {{ locationPickerTarget === 'province'
            ? 'Escribe para buscar entre las 24 provincias del Ecuador.'
            : `Provincia: ${delivery.province}. Escribe para encontrar tu cantón.` }}
        </p>
        <label class="location-search">
          <span>Buscar {{ locationPickerTarget === 'province' ? 'provincia' : 'cantón' }}</span>
          <input
            v-model.trim="locationSearch" type="search" autofocus
            :placeholder="locationPickerTarget === 'province' ? 'Ej. Guayas' : 'Ej. Guayaquil'">
        </label>
        <div class="location-options" role="listbox">
          <button
            v-for="option in locationOptions" :key="option"
            type="button" role="option" @click="chooseLocation(option)">{{ option }} <span>→</span></button>
          <p v-if="!locationOptions.length">No encontramos resultados. Prueba con otro nombre.</p>
        </div>
        <button
          v-if="delivery.province && delivery.city" class="location-picker-close"
          type="button" @click="isLocationPickerOpen = false">Usar {{ delivery.province }}, {{ delivery.city }}</button>
      </section>
    </div>
  </Transition>
</template>
