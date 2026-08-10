<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { message } = useToast()
</script>

<template>
  <Transition name="toast">
    <p v-if="message" class="toast" role="status">{{ message }}</p>
  </Transition>
</template>
