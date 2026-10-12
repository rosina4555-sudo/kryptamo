<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff, Lock, Mail } from 'lucide-vue-next'
import MapCorridor from '../components/MapCorridor.vue'
import { auth } from '../api'

const router = useRouter()

const identifier = ref('')
const password = ref('')
const showPassword = ref(false)
const showErrors = ref(false)
const submitting = ref(false)
const googleLoading = ref(false)
const notice = ref('')

const identifierError = computed(() => {
  const value = identifier.value.trim()
  if (!value) return 'Enter your email, phone number, or username.'
  if (value.includes('@')) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'That email address doesn’t look right.'
  }
  const digits = value.replace(/[\s()-]/g, '')
  if (/^\+?[1-9]\d{7,14}$/.test(digits)) return ''
  if (/^[a-zA-Z0-9]{3,}$/.test(value)) return ''
  return 'Enter a valid email, phone number, or username.'
})
const passwordError = computed(() => {
  if (!password.value) return 'Enter your password.'
  return password.value.length < 8 ? 'Passwords are at least 8 characters.' : ''
})

const valid = computed(() => !identifierError.value && !passwordError.value)

const signIn = async () => {
  showErrors.value = true
  notice.value = ''
  if (!valid.value) return
  submitting.value = true
  try {
    await auth.signIn({ email_or_username: identifier.value.trim(), password: password.value })
    router.push('/send')
  } catch (error) {
    notice.value = error?.message ?? 'We couldn’t sign you in.'
  } finally {
    submitting.value = false
  }
}

const signInWithGoogle = async () => {
  notice.value = ''
  googleLoading.value = true
  await new Promise((resolve) => setTimeout(resolve, 800))
  googleLoading.value = false
  router.push('/send')
}

const requestReset = () => {
  notice.value = 'If that account exists, we’ll email a reset link.'
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
        <h2 class="font-display text-4xl font-semibold leading-tight text-white">Welcome back.</h2>
        <p class="mt-4 text-base leading-7 text-white/70">
          Sign in to pick up your transfers, lock today’s rate, and keep sending straight to Mobile
          Money in Ghana.
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

        <p class="flex items-center gap-2.5">
          <span class="h-1.5 w-1.5 rounded-[2px] bg-volta" aria-hidden="true"></span>
          <span class="text-xs font-medium tracking-[0.16em] text-slate">WELCOME BACK</span>
        </p>
        <h1 class="mt-3 font-display text-3xl font-semibold text-ink">Sign in to Kryptamo</h1>
        <p class="mt-2 text-sm text-slate">Use your email, username or phone number to continue.</p>

        <form class="mt-8 space-y-5" novalidate @submit.prevent="signIn">
          <div>
            <label for="identifier" class="mb-2 block text-sm font-medium text-ink">Email, username or phone</label>
            <div
              class="flex items-center rounded-control border bg-canvas transition-colors focus-within:border-volta"
              :class="showErrors && identifierError ? 'border-alert' : 'border-line'"
            >
              <Mail :size="18" :stroke-width="1.5" class="ml-3.5 shrink-0 text-slate" />
              <input
                id="identifier"
                v-model="identifier"
                type="text"
                autocapitalize="none"
                spellcheck="false"
                autocomplete="username"
                class="h-12 w-full bg-transparent px-3 text-ink outline-none placeholder:text-slate"
                placeholder="you@example.com"
                :aria-invalid="showErrors && !!identifierError"
                aria-describedby="identifier-error"
              />
            </div>
            <p v-if="showErrors && identifierError" id="identifier-error" class="mt-2 text-sm text-alert">
              {{ identifierError }}
            </p>
          </div>

          <div>
            <div class="mb-2 flex items-center justify-between">
              <label for="password" class="text-sm font-medium text-ink">Password</label>
              <button
                type="button"
                class="text-sm font-medium text-volta transition-colors hover:text-volta-deep"
                @click="requestReset"
              >
                Forgot password?
              </button>
            </div>
            <div
              class="flex items-center rounded-control border bg-canvas transition-colors focus-within:border-volta"
              :class="showErrors && passwordError ? 'border-alert' : 'border-line'"
            >
              <Lock :size="18" :stroke-width="1.5" class="ml-3.5 shrink-0 text-slate" />
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                class="h-12 w-full bg-transparent px-3 text-ink outline-none placeholder:text-slate"
                placeholder="Your password"
                :aria-invalid="showErrors && !!passwordError"
                aria-describedby="password-error"
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
            <p v-if="showErrors && passwordError" id="password-error" class="mt-2 text-sm text-alert">
              {{ passwordError }}
            </p>
          </div>

          <p v-if="notice" class="rounded-control border border-line bg-notice-bg px-4 py-3 text-sm text-notice-text">
            {{ notice }}
          </p>

          <button
            type="submit"
            class="inline-flex h-12 w-full items-center justify-center rounded-control bg-volta text-sm font-semibold text-white transition-all duration-150 hover:bg-volta-deep active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100"
            :disabled="submitting"
          >
            {{ submitting ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>

        <div class="my-6 flex items-center gap-4">
          <span class="h-px flex-1 bg-line"></span>
          <span class="text-xs text-slate">or</span>
          <span class="h-px flex-1 bg-line"></span>
        </div>

        <button
          type="button"
          class="inline-flex h-12 w-full items-center justify-center gap-3 rounded-control border border-line bg-canvas text-sm font-medium text-ink transition-colors hover:bg-mist disabled:cursor-not-allowed disabled:opacity-70"
          :disabled="googleLoading"
          @click="signInWithGoogle"
        >
          <svg viewBox="0 0 48 48" class="h-5 w-5" aria-hidden="true">
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
          </svg>
          {{ googleLoading ? 'Connecting…' : 'Continue with Google' }}
        </button>

        <p class="mt-8 text-center text-sm text-slate">
          New to Kryptamo?
          <RouterLink to="/signup" class="font-medium text-volta transition-colors hover:text-volta-deep">
            Create an account
          </RouterLink>
        </p>
      </div>
    </main>
  </div>
</template>