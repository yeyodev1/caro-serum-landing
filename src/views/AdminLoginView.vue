<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getApiBaseUrl } from '@/config/api'

const router = useRouter()
const apiBaseUrl = getApiBaseUrl()
const email = ref('')
const password = ref('')
const message = ref('')
const isSubmitting = ref(false)

async function login() {
  isSubmitting.value = true
  message.value = ''
  try {
    const response = await fetch(`${apiBaseUrl}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.value, password: password.value }) })
    const data = await response.json() as { accessToken?: string; userId?: string; message?: string }
    if (!response.ok || !data.accessToken) throw new Error(data.message || 'No pudimos iniciar sesión.')
    localStorage.setItem('access_token', data.accessToken)
    localStorage.setItem('user_id', data.userId || email.value)
    await router.replace('/admin')
  } catch (error) { message.value = error instanceof Error ? error.message : 'No pudimos iniciar sesión.' } finally { isSubmitting.value = false }
}
</script>

<template>
  <main class="admin-login"><form @submit.prevent="login"><p>OMG LASHES · ADMIN</p><h1>Todo bajo<br><em>control.</em></h1><label>Correo<input v-model.trim="email" required type="email" autocomplete="email"></label><label>Contrasena<input v-model="password" required type="password" autocomplete="current-password"></label><button :disabled="isSubmitting">{{ isSubmitting ? 'Ingresando...' : 'Ingresar al panel' }} <span><i v-if="isSubmitting" class="fa-solid fa-circle-notch spinning"></i><template v-else>→</template></span></button><small v-if="message" role="status">{{ message }}</small></form></main>
</template>

<style scoped lang="scss">
.admin-login { --ink:#1D1D1B;--cream:#fbf7f2;--pink:#F1B9A9;--pink-soft:#F9E3DC;--gray:#55565A;--copper:#b86f54;align-items:center;background:linear-gradient(125deg,var(--pink),var(--cream) 55%);display:grid;font-family:Georgia,serif;min-height:100vh;padding:24px;place-items:center }.admin-login form { background:var(--cream);box-shadow:18px 18px 0 var(--ink);display:grid;gap:18px;padding:46px;width:min(430px,100%) }.admin-login p,.admin-login label,.admin-login small { font:500 11px Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase }.admin-login h1 { font-size:55px;letter-spacing:-.07em;line-height:.9;margin:8px 0 12px }.admin-login h1 em { color:var(--copper);font-weight:normal }.admin-login label { display:grid;gap:7px }.admin-login input { background:#fffdfa;border:1px solid #bcaeaa;font:15px Arial,sans-serif;padding:13px }.admin-login button { background:var(--ink);border:0;color:var(--cream);cursor:pointer;display:flex;font:500 11px Arial,sans-serif;justify-content:space-between;letter-spacing:.08em;margin-top:10px;padding:15px;text-transform:uppercase }.admin-login button:disabled { opacity:.6 }.admin-login small { color:#b03b3b;letter-spacing:0;text-transform:none }

/* --- Movimiento --- */
.admin-login form { animation:admin-rise-in var(--admin-enter) var(--admin-ease) both }
.admin-login label,.admin-login button { animation:admin-rise-in var(--admin-enter) var(--admin-ease) both }
.admin-login label:nth-of-type(1) { animation-delay:90ms }.admin-login label:nth-of-type(2) { animation-delay:140ms }.admin-login button { animation-delay:190ms }
.admin-login input { transition:border-color var(--admin-micro) var(--admin-ease),box-shadow var(--admin-micro) var(--admin-ease) }
.admin-login input:focus { border-color:var(--copper);box-shadow:0 0 0 3px rgba(184,111,84,.16);outline:0 }
.admin-login button { transition:box-shadow var(--admin-micro) var(--admin-ease),opacity var(--admin-micro) var(--admin-ease),transform var(--admin-micro) var(--admin-ease) }
.admin-login button:not(:disabled):hover { box-shadow:0 8px 20px rgba(33,30,29,.24);transform:translateY(-1px) }
.admin-login button:not(:disabled):active { box-shadow:none;transform:translateY(0) scale(.985) }
.admin-login button:disabled { cursor:progress }
.admin-login button span { transition:transform var(--admin-state) var(--admin-ease) }
.admin-login button:not(:disabled):hover span { transform:translateX(4px) }
.admin-login small { animation:admin-nudge 420ms var(--admin-ease) both }
.spinning { animation:admin-spin .9s linear infinite;display:inline-block }
@media (prefers-reduced-motion:reduce) { .admin-login form,.admin-login label,.admin-login button,.admin-login small { animation:none }.spinning { animation-duration:2.4s } }
</style>
