import { ref } from 'vue'

const message = ref('')
let timer: ReturnType<typeof setTimeout> | undefined

export function useToast() {
  function notify(text: string) {
    message.value = text
    clearTimeout(timer)
    timer = setTimeout(() => { message.value = '' }, 3200)
  }
  function clearToastTimer() { clearTimeout(timer) }
  return { message, notify, clearToastTimer }
}
