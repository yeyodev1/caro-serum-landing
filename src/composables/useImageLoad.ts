import { ref } from 'vue'

// Compartido por todas las secciones para el desenfoque de entrada de las fotos.
const loaded = ref<string[]>([])

export function useImageLoad() {
  function markImageLoaded(url: string) {
    if (!loaded.value.includes(url)) loaded.value.push(url)
  }
  function imageLoaded(url: string) { return loaded.value.includes(url) }
  return { markImageLoaded, imageLoaded }
}
