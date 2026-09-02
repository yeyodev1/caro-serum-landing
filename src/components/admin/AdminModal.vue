<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{ open: boolean; title: string; eyebrow?: string; tone?: 'default' | 'danger'; wide?: boolean }>()
const emit = defineEmits<{ (event: 'close'): void }>()
const card = ref<HTMLElement | null>(null)

function onKeydown(event: KeyboardEvent) { if (event.key === 'Escape') emit('close') }

// El scroll del fondo se bloquea mientras el modal esta abierto para que el
// admin no pierda la posicion de la lista al cerrarlo.
watch(() => props.open, async (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (!open) { window.removeEventListener('keydown', onKeydown); return }
  window.addEventListener('keydown', onKeydown)
  await nextTick()
  card.value?.focus()
})

onBeforeUnmount(() => { window.removeEventListener('keydown', onKeydown); document.body.style.overflow = '' })
</script>

<template>
  <Teleport to="body">
    <Transition name="admin-modal">
      <div v-if="open" class="admin-modal-overlay" @click.self="emit('close')">
        <section ref="card" class="admin-modal-card" :class="[tone, { wide }]" role="dialog" aria-modal="true" tabindex="-1" :aria-label="title">
          <button class="admin-modal-close" type="button" aria-label="Cerrar" @click="emit('close')"><i class="fa-solid fa-xmark"></i></button>
          <p v-if="eyebrow" class="admin-modal-eyebrow">{{ eyebrow }}</p>
          <h2>{{ title }}</h2>
          <div class="admin-modal-body"><slot /></div>
          <footer v-if="$slots.actions" class="admin-modal-actions"><slot name="actions" /></footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.admin-modal-overlay { align-items:center;background:rgba(33,30,29,.52);display:flex;inset:0;justify-content:center;padding:20px;position:fixed;z-index:60 }
.admin-modal-card { background:var(--admin-cream);box-shadow:10px 10px 0 var(--admin-copper);color:var(--admin-ink);font-family:Arial,sans-serif;max-height:calc(100dvh - 40px);outline:0;overflow-y:auto;padding:34px;position:relative;width:min(560px,100%) }
.admin-modal-card.danger { box-shadow:10px 10px 0 #a33d34 }
.admin-modal-card.wide { width:min(760px,100%) }
.admin-modal-close { background:none;border:0;color:var(--admin-ink);cursor:pointer;font-size:18px;line-height:1;padding:6px;position:absolute;right:16px;top:16px;transition:opacity var(--admin-micro) var(--admin-ease),transform var(--admin-micro) var(--admin-ease) }
.admin-modal-close:hover { opacity:.6;transform:rotate(90deg) }
.admin-modal-eyebrow { color:var(--admin-copper);font:600 10px Arial,sans-serif;letter-spacing:.12em;margin:0 0 8px;padding-right:34px;text-transform:uppercase }
.admin-modal-card h2 { font:600 30px/1.05 Georgia,serif;letter-spacing:-.04em;margin:0;overflow-wrap:anywhere;padding-right:30px }
.admin-modal-body { font-size:14px;line-height:1.5;margin-top:18px }
.admin-modal-actions { display:flex;flex-wrap:wrap;gap:10px;justify-content:flex-end;margin-top:26px }
@media (max-width:600px) { .admin-modal-card { box-shadow:6px 6px 0 var(--admin-copper);padding:26px 20px }.admin-modal-card h2 { font-size:25px }.admin-modal-actions { flex-direction:column-reverse } }
</style>
