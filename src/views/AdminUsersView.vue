<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getApiBaseUrl } from '@/config/api'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminModal from '@/components/admin/AdminModal.vue'

type AdminUser = { id: string; email: string; createdAt: string }
const api = getApiBaseUrl()
const users = ref<AdminUser[]>([])
const form = ref({ id: '', email: '', password: '' })
const message = ref('')
const isSaving = ref(false)
const deleteTarget = ref<AdminUser | null>(null)
const isDeleting = ref(false)
const currentUserId = localStorage.getItem('user_id')

function headers() { return { Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`, 'Content-Type': 'application/json' } }

async function loadUsers() {
  const response = await fetch(`${api}/auth/users`, { headers: headers() })
  const data = await response.json() as { users?: AdminUser[]; message?: string }
  if (!response.ok) throw new Error(data.message || 'No pudimos cargar los usuarios.')
  users.value = data.users || []
}

async function saveUser() {
  isSaving.value = true
  try {
    const isEdit = Boolean(form.value.id)
    const response = await fetch(`${api}/auth/users${isEdit ? `/${form.value.id}` : ''}`, { method: isEdit ? 'PATCH' : 'POST', headers: headers(), body: JSON.stringify({ email: form.value.email, password: form.value.password || undefined }) })
    const data = await response.json() as { message?: string }
    if (!response.ok) throw new Error(data.message || 'No pudimos guardar el usuario.')
    form.value = { id: '', email: '', password: '' }
    message.value = 'Usuario guardado correctamente.'
    await loadUsers()
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'No pudimos guardar el usuario.'
  } finally {
    isSaving.value = false
  }
}

function editUser(user: AdminUser) { form.value = { id: user.id, email: user.email, password: '' }; message.value = '' }

function askDelete(user: AdminUser) {
  if (user.id === currentUserId) { message.value = 'No puedes eliminar tu propio usuario.'; return }
  deleteTarget.value = user
}

async function confirmDelete() {
  const user = deleteTarget.value
  if (!user) return
  isDeleting.value = true
  try {
    const response = await fetch(`${api}/auth/users/${user.id}`, { method: 'DELETE', headers: headers() })
    if (!response.ok) {
      const data = await response.json() as { message?: string }
      throw new Error(data.message || 'No pudimos eliminar el usuario.')
    }
    deleteTarget.value = null
    message.value = 'Usuario eliminado.'
    await loadUsers()
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'No pudimos eliminar el usuario.'
  } finally {
    isDeleting.value = false
  }
}

onMounted(() => { void loadUsers().catch((error) => { message.value = error instanceof Error ? error.message : 'No pudimos cargar los usuarios.' }) })
</script>

<template>
  <main class="users">
    <AdminSidebar active="users" />
    <header>
      <RouterLink to="/admin"><i class="fa-solid fa-arrow-left"></i> Volver al portal</RouterLink>
      <h1>Usuarios del portal</h1>
    </header>

    <section class="user-form">
      <Transition name="swap" mode="out-in">
        <p :key="form.id ? 'edit' : 'create'">{{ form.id ? 'EDITAR USUARIO' : 'CREAR USUARIO' }}</p>
      </Transition>
      <form @submit.prevent="saveUser">
        <label>Correo administrador<input v-model.trim="form.email" required type="email" placeholder="admin@empresa.com"></label>
        <label>Contraseña {{ form.id ? '(dejar vacía para no cambiar)' : '' }}<input v-model="form.password" :required="!form.id" type="password" minlength="8" placeholder="Mínimo 8 caracteres"></label>
        <div class="form-actions">
          <button :disabled="isSaving">
            <i v-if="isSaving" class="fa-solid fa-circle-notch spinning"></i>
            {{ isSaving ? 'Guardando...' : form.id ? 'Guardar cambios' : 'Crear usuario' }}
          </button>
          <Transition name="swap">
            <button v-if="form.id" class="cancel" type="button" @click="form = { id: '', email: '', password: '' }">Cancelar</button>
          </Transition>
        </div>
      </form>
      <Transition name="swap"><small v-if="message" role="status">{{ message }}</small></Transition>
    </section>

    <section class="users-list">
      <h2>Administradores</h2>
      <TransitionGroup name="row" tag="div" class="rows">
        <article v-for="(user, index) in users" :key="user.id" :style="{ '--i': Math.min(index, 7) }">
          <div>
            <b>{{ user.email }}</b>
            <span>{{ user.id === currentUserId ? 'Tu usuario actual' : `Creado ${new Date(user.createdAt).toLocaleDateString('es-EC')}` }}</span>
          </div>
          <div class="user-actions">
            <button @click="editUser(user)"><i class="fa-solid fa-pen"></i> Editar</button>
            <button class="delete" :disabled="user.id === currentUserId" @click="askDelete(user)"><i class="fa-solid fa-trash"></i> Eliminar</button>
          </div>
        </article>
      </TransitionGroup>
    </section>

    <AdminModal
      :open="Boolean(deleteTarget)"
      tone="danger"
      eyebrow="Acción irreversible"
      title="Eliminar este usuario."
      @close="isDeleting ? null : (deleteTarget = null)"
    >
      <p>El acceso de <b>{{ deleteTarget?.email }}</b> al portal se eliminará de inmediato y no se puede deshacer.</p>
      <template #actions>
        <button class="modal-ghost" :disabled="isDeleting" @click="deleteTarget = null">Cancelar</button>
        <button class="modal-danger" :disabled="isDeleting" @click="confirmDelete">
          <i class="fa-solid" :class="isDeleting ? 'fa-circle-notch spinning' : 'fa-trash'"></i>
          {{ isDeleting ? 'Eliminando...' : 'Sí, eliminar' }}
        </button>
      </template>
    </AdminModal>
  </main>
</template>

<style scoped lang="scss">
.users { --ink:#1D1D1B;--cream:#fbf7f2;--pink:#F1B9A9;--pink-soft:#F9E3DC;--gray:#55565A;--copper:#b86f54;background:var(--cream);color:var(--ink);font-family:Arial,sans-serif;min-height:100vh;padding:45px 7vw }@media (min-width:1025px) { .users { padding:44px 48px 60px 328px }.users>header { align-items:baseline;gap:26px;justify-content:flex-start }.users>header,.user-form,.users-list { margin-left:0;margin-right:0;max-width:none } }.users>header { align-items:end;display:flex;justify-content:space-between;margin:auto;max-width:1000px }.users>header a { color:var(--ink);font:600 11px Arial,sans-serif;letter-spacing:.06em;text-decoration:none;text-transform:uppercase }.users h1 { font:600 52px/.9 Georgia,serif;letter-spacing:-.07em;margin:0 }.user-form,.users-list { background:#fffdfa;margin:36px auto 0;max-width:1000px;padding:30px }.user-form>p { color:var(--copper);font:600 10px Arial,sans-serif;letter-spacing:.1em }.user-form form { display:flex;flex-direction:column;gap:16px;margin-top:20px;max-width:560px }.user-form label { display:flex;flex-direction:column;font-size:12px;gap:7px }.user-form input { border:1px solid #bcaeaa;font:14px Arial,sans-serif;padding:13px }.form-actions,.user-actions { display:flex;gap:10px }.user-form button,.users-list button { align-items:center;background:var(--ink);border:0;color:var(--cream);cursor:pointer;display:flex;font:600 11px Arial,sans-serif;gap:8px;justify-content:center;letter-spacing:.05em;padding:13px 15px;text-transform:uppercase }.user-form .cancel,.users-list .delete { background:transparent;border:1px solid #a33d34;color:#a33d34 }.users-list h2 { font:600 28px Georgia,serif;margin:0 0 20px }.rows { display:flex;flex-direction:column;position:relative }.users-list article { align-items:center;border-top:1px solid #e3d7d1;display:flex;justify-content:space-between;padding:16px 0 }.users-list article>div:first-child { display:flex;flex-direction:column;gap:5px }.users-list article span { color:#77787B;font-size:11px }.users-list button:disabled { cursor:not-allowed;opacity:.35 }.user-form small { color:#a33d34;display:block;margin-top:14px }

/* --- Movimiento --- */
.users>header,.user-form,.users-list { animation:admin-rise-in var(--admin-enter) var(--admin-ease) both }
.user-form { animation-delay:70ms }.users-list { animation-delay:130ms }
.users>header a,.user-form button,.users-list button { transition:box-shadow var(--admin-micro) var(--admin-ease),opacity var(--admin-micro) var(--admin-ease),transform var(--admin-micro) var(--admin-ease) }
.users>header a:hover { transform:translateX(-3px) }
.user-form button:not(:disabled):hover,.users-list button:not(:disabled):hover { box-shadow:0 6px 16px rgba(33,30,29,.18);transform:translateY(-1px) }
.user-form button:not(:disabled):active,.users-list button:not(:disabled):active { box-shadow:none;transform:translateY(0) scale(.985) }
.user-form input { transition:border-color var(--admin-micro) var(--admin-ease),box-shadow var(--admin-micro) var(--admin-ease) }
.user-form input:focus { border-color:var(--copper);box-shadow:0 0 0 3px rgba(184,111,84,.16);outline:0 }
.user-form small { animation:admin-nudge 420ms var(--admin-ease) both }
.spinning { animation:admin-spin .9s linear infinite }
.row-enter-active { animation:admin-rise-in var(--admin-enter) var(--admin-ease) both;animation-delay:calc(var(--i, 0) * var(--admin-stagger)) }
.row-leave-active { left:0;position:absolute;right:0;transition:opacity 200ms var(--admin-ease-in),transform 200ms var(--admin-ease-in) }
.row-leave-to { opacity:0;transform:translateX(26px) }
.row-move { transition:transform var(--admin-enter) var(--admin-ease) }
.swap-enter-active { transition:opacity var(--admin-state) var(--admin-ease),transform var(--admin-state) var(--admin-ease) }
.swap-leave-active { transition:opacity 120ms var(--admin-ease-in) }
.swap-enter-from { opacity:0;transform:translateY(8px) }
.swap-leave-to { opacity:0 }
.modal-primary,.modal-ghost,.modal-danger { align-items:center;border:1px solid var(--admin-ink);cursor:pointer;display:flex;font:600 11px Arial,sans-serif;gap:8px;letter-spacing:.05em;padding:13px 16px;text-transform:uppercase;transition:box-shadow var(--admin-micro) var(--admin-ease),opacity var(--admin-micro) var(--admin-ease),transform var(--admin-micro) var(--admin-ease) }
.modal-ghost { background:transparent;color:var(--admin-ink) }.modal-danger { background:#a33d34;border-color:#a33d34;color:#fff }
.modal-danger:hover:not(:disabled),.modal-ghost:hover:not(:disabled) { box-shadow:0 6px 16px rgba(33,30,29,.18);transform:translateY(-1px) }
.modal-danger:active:not(:disabled),.modal-ghost:active:not(:disabled) { box-shadow:none;transform:translateY(0) scale(.985) }
.modal-danger:disabled,.modal-ghost:disabled { cursor:not-allowed;opacity:.55;transform:none }
@media (max-width:650px) { .users { padding:28px 18px }.users>header { align-items:start;flex-direction:column;gap:20px }.users h1 { font-size:42px }.user-form,.users-list { padding:22px }.users-list article { align-items:stretch;flex-direction:column;gap:14px }.form-actions,.user-actions { flex-direction:column }.form-actions button,.user-actions button { width:100% }.modal-danger,.modal-ghost { justify-content:center;width:100% } }
@media (prefers-reduced-motion:reduce) { .users>header,.user-form,.users-list,.row-enter-active,.user-form small { animation:none }.spinning { animation-duration:2.4s } }
</style>
