<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { auth, session } from '../api'

const router = useRouter()
const signedIn = computed(() => Boolean(session.token))

const signOut = () => {
  auth.signOut()
  router.push('/')
}
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-line bg-mist/95">
    <div class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
      <RouterLink to="/" class="flex items-center gap-2.5">
        <img src="/kryptamo.png" alt="Kryptamo logo" class="h-9 w-auto" />
        <span class="font-display text-lg font-semibold text-ink">Kryptamo</span>
      </RouterLink>
      <nav class="flex items-center gap-5" aria-label="Account">
        <RouterLink
          to="/send"
          class="hidden text-sm font-medium text-ink transition-colors hover:text-volta sm:block"
        >
          Send money
        </RouterLink>
        <RouterLink
          to="/transfers"
          class="hidden text-sm font-medium text-ink transition-colors hover:text-volta sm:block"
        >
          History
        </RouterLink>
        <template v-if="signedIn">
          <span class="flex items-center gap-2 text-sm text-slate">
            <span class="h-2 w-2 rounded-[2px] bg-delivered" aria-hidden="true"></span>
            {{ session.user?.username }}
          </span>
          <button
            type="button"
            class="text-sm font-medium text-slate transition-colors hover:text-ink"
            @click="signOut"
          >
            Sign out
          </button>
        </template>
        <RouterLink
          v-else
          to="/signin"
          class="inline-flex h-10 items-center rounded-control bg-volta px-4 text-sm font-medium text-white transition-colors hover:bg-volta-deep"
        >
          Sign in
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
