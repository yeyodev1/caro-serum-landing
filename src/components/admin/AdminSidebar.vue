<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

type Section = 'transfers' | 'pending' | 'paid' | 'all' | 'users'
const props = defineProps<{ active: Section; counts?: { transfers: number; pending: number; paid: number } }>()
const emit = defineEmits<{ (event: 'select', section: Section): void }>()
const router = useRouter()
const isOpen = ref(false)

function go(section: Section) {
  isOpen.value = false
  if (section === 'users') { void router.push('/admin/users'); return }
  if (router.currentRoute.value.path !== '/admin') { void router.push({ path: '/admin', query: { section } }); return }
  emit('select', section)
}

function logout() { localStorage.removeItem('access_token'); localStorage.removeItem('user_id'); void router.replace('/login') }

defineExpose({ isOpen })
</script>

<template>
  <button class="menu-toggle" type="button" :aria-expanded="isOpen" aria-controls="admin-sidebar" @click="isOpen = !isOpen">
    <i class="fa-solid" :class="isOpen ? 'fa-xmark' : 'fa-bars'"></i><span>{{ isOpen ? 'Cerrar menú' : 'Menú' }}</span>
  </button>
  <Transition name="backdrop">
    <button v-if="isOpen" class="menu-backdrop" type="button" aria-label="Cerrar menú" @click="isOpen = false"></button>
  </Transition>
  <aside id="admin-sidebar" :class="{ open: isOpen }">
    <a class="brand" href="/">OMG <span>LASHES</span></a>
    <p>PORTAL DE PEDIDOS</p>
    <nav>
      <button :class="{ active: props.active === 'transfers' }" @click="go('transfers')">
        <span><i class="fa-solid fa-building-columns"></i> Transferencias</span><b v-if="props.counts">{{ props.counts.transfers }}</b>
      </button>
      <button :class="{ active: props.active === 'pending' }" @click="go('pending')">
        <span><i class="fa-solid fa-clock"></i> PayPhone pendientes</span><b v-if="props.counts">{{ props.counts.pending }}</b>
      </button>
      <button :class="{ active: props.active === 'paid' }" @click="go('paid')">
        <span><i class="fa-solid fa-circle-check"></i> Pagados</span><b v-if="props.counts">{{ props.counts.paid }}</b>
      </button>
      <button :class="{ active: props.active === 'all' }" @click="go('all')">
        <span><i class="fa-solid fa-list"></i> Todos los pedidos</span>
      </button>
      <button :class="{ active: props.active === 'users' }" @click="go('users')">
        <span><i class="fa-solid fa-user-plus"></i> Usuarios</span>
      </button>
    </nav>
    <button class="logout" @click="logout"><i class="fa-solid fa-arrow-right-from-bracket"></i> Cerrar sesión</button>
  </aside>
</template>

<style scoped lang="scss">
@use '@/styles/admin/sidebar';
</style>
