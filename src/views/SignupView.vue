<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { AtSign, Eye, EyeOff, Lock, Mail, Phone } from 'lucide-vue-next'
import MapCorridor from '../components/MapCorridor.vue'
import { ApiError, auth } from '../api'

const router = useRouter()

const form = reactive({ username: '', email: '', phone_number: '', password: '' })
const showPassword = ref(false)
const showErrors = ref(false)
const submitting = ref(false)
const notice = ref('')
const serverErrors = ref({})

const errors = computed(() => {
  const list = {}
  const username = form.username.trim()
  if (!username) list.username = 'Choose a username.'
  else if (username.length < 3) list.username = 'Usernames are at least 3 characters.'
  else if (!/^[a-zA-Z0-9]+$/.test(username)) list.username = 'Usernames are letters and numbers only.'

  const email = form.email.trim()
  if (!email) list.email = 'Enter your email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) list.email = 'That email address doesn’t look right.'

  const digits = form.phone_number.replace(/[\s()-]/g, '')
  if (!digits) list.phone_number = 'Enter your phone number.'
  else if (!/^\+?[1-9]\d{7,14}$/.test(digits)) list.phone_number = 'Use international format, e.g. +1 555 000 1234.'

  if (!form.password) list.password = 'Choose a password.'
  else if (form.password.length < 8) list.password = 'Passwords are at least 8 characters.'

  return list
})

const valid = computed(() => Object.keys(errors.value).length === 0)
const fieldError = (field) => (showErrors.value && (errors.value[field] || serverErrors.value[field])) || ''

const normalisePhone = () => {
  const digits = form.phone_number.replace(/[\s()-]/g, '')
  return digits && !digits.startsWith('+') ? `+${digits}` : digits
}

const signUp = async () => {
  showErrors.value = true
  notice.value = ''
  serverErrors.value = {}
  if (!valid.value) return
  submitting.value = true
  try {
    await auth.signUp({
      username: form.username.trim().toLowerCase(),
      email: form.email.trim().toLowerCase(),
      phone_number: normalisePhone(),
      password: form.password,
    })
    router.push('/send')
  } catch (error) {
    if (error instanceof ApiError && error.details && typeof error.details === 'object') {
      serverErrors.value = error.details
    }
    notice.value = error?.message ?? 'We couldn’t create your account. Try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="grid min-h-screen md:grid-cols-2">
    <aside class="relative hidden overflow-hidden bg-ink p-12 md:flex md:flex-col md:justify-between">
      <span
        aria-hidden="true"
        class="pointer-events-none absolute -bottom-32 -right-6 select-none font-display text-[24rem] font-semibold leading-none text-white/[0.04]"
      >
        ₵
      </span>

      <RouterLink to="/" class="relative flex items-center gap-2.5">
        <img src="/kryptamo.png" alt="Kryptamo logo" class="h-9 w-auto" />
        <span class="font-display text-xl font-semibold text-white">Kryptamo</span>
      </RouterLink>

      <div class="relative w-full max-w-md">
        <h2 class="font-display text-4xl font-semibold leading-tight text-white">Create your account.</h2>
        <p class="mt-4 text-base leading-7 text-white/70">
          A username is all your sender needs. No wallet to top up, no balance to hold — just money
          moving to a Mobile Money account in Ghana.
        </p>

        <div class="mt-9 rounded-panel border border-white/10 bg-white/[0.02] p-4">
          <MapCorridor :animated="false" />
        </div>
      </div>

      <p class="relative text-sm text-white/50 tabular">
        1 USD = 15.60 · 1 CAD = 11.40 · 1 GBP = 19.80 GHS
      </p>
    </aside>

    <main class="flex items-center justify-center bg-canvas px-6 py-12">
      <div class="w-full max-w-sm">
        <RouterLink to="/" class="mb-10 flex items-center gap-2.5 md:hidden">
          <img src="/kryptamo.png" alt="Kryptamo logo" class="h-9 w-auto" />
          <span class="font-display text-xl font-semibold text-ink">Kryptamo</span>
        </RouterLink>

        <h1 class="font-display text-3xl font-semibold text-ink">Create your account</h1>
        <p class="mt-2 text-sm text-slate">Takes a minute. Then you can send in seconds.</p>

        <form class="mt-8 space-y-5" novalidate @submit.prevent="signUp">
          <div>
            <label for="username" class="mb-2 block text-sm font-medium text-ink">Username</label>
            <div
              class="flex items-center rounded-control border bg-canvas transition-colors focus-within:border-volta"
              :class="fieldError('username') ? 'border-alert' : 'border-line'"
            >
              <AtSign :size="18" :stroke-width="1.5" class="ml-3.5 shrink-0 text-slate" />
              <input
                id="username"
                v-model="form.username"
                type="text"
                autocapitalize="none"
                spellcheck="false"
                autocomplete="username"
                class="h-12 w-full bg-transparent px-2 text-ink outline-none placeholder:text-slate"
                placeholder="yourname"
                :aria-invalid="!!fieldError('username')"
              />
            </div>
            <p v-if="fieldError('username')" class="mt-2 text-sm text-alert">{{ fieldError('username') }}</p>
          </div>

          <div>
            <label for="email" class="mb-2 block text-sm font-medium text-ink">Email</label>
            <div
              class="flex items-center rounded-control border bg-canvas transition-colors focus-within:border-volta"
              :class="fieldError('email') ? 'border-alert' : 'border-line'"
            >
              <Mail :size="18" :stroke-width="1.5" class="ml-3.5 shrink-0 text-slate" />
              <input
                id="email"
                v-model="form.email"
                type="email"
                autocapitalize="none"
                spellcheck="false"
                autocomplete="email"
                class="h-12 w-full bg-transparent px-3 text-ink outline-none placeholder:text-slate"
                placeholder="you@example.com"
                :aria-invalid="!!fieldError('email')"
              />
            </div>
            <p v-if="fieldError('email')" class="mt-2 text-sm text-alert">{{ fieldError('email') }}</p>
          </div>

          <div>
            <label for="phone_number" class="mb-2 block text-sm font-medium text-ink">Phone number</label>
            <div
              class="flex items-center rounded-control border bg-canvas transition-colors focus-within:border-volta"
              :class="fieldError('phone_number') ? 'border-alert' : 'border-line'"
            >
              <Phone :size="18" :stroke-width="1.5" class="ml-3.5 shrink-0 text-slate" />
              <input
                id="phone_number"
                v-model="form.phone_number"
                type="tel"
                autocomplete="tel"
                class="h-12 w-full bg-transparent px-3 text-ink outline-none placeholder:text-slate"
                placeholder="+1 555 000 1234"
                :aria-invalid="!!fieldError('phone_number')"
              />
            </div>
            <p v-if="fieldError('phone_number')" class="mt-2 text-sm text-alert">
              {{ fieldError('phone_number') }}
            </p>
          </div>

          <div>
            <label for="password" class="mb-2 block text-sm font-medium text-ink">Password</label>
            <div
              class="flex items-center rounded-control border bg-canvas transition-colors focus-within:border-volta"
              :class="fieldError('password') ? 'border-alert' : 'border-line'"
            >
              <Lock :size="18" :stroke-width="1.5" class="ml-3.5 shrink-0 text-slate" />
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                class="h-12 w-full bg-transparent px-3 text-ink outline-none placeholder:text-slate"
                placeholder="At least 8 characters"
                :aria-invalid="!!fieldError('password')"
              />
              <button
                type="button"
                class="mr-2 flex h-8 w-8 items-center justify-center rounded-control text-slate transition-colors hover:text-ink"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                @click="showPassword = !showPassword"
              >
                <component :is="showPassword ? EyeOff : Eye" :size="18" :stroke-width="1.5" />
              </button>
            </div>
            <p v-if="fieldError('password')" class="mt-2 text-sm text-alert">{{ fieldError('password') }}</p>
          </div>

          <p v-if="notice" class="rounded-control border border-alert/25 bg-alert/10 px-4 py-3 text-sm text-alert">
            {{ notice }}
          </p>

          <button
            type="submit"
            class="inline-flex h-12 w-full items-center justify-center rounded-control bg-volta text-sm font-semibold text-white transition-all duration-150 hover:bg-volta-deep active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100"
            :disabled="submitting"
          >
            {{ submitting ? 'Creating account…' : 'Create account' }}
          </button>
        </form>

        <p class="mt-8 text-center text-sm text-slate">
          Already have an account?
          <RouterLink to="/signin" class="font-medium text-volta transition-colors hover:text-volta-deep">
            Sign in
          </RouterLink>
        </p>
      </div>
    </main>
  </div>
</template>
