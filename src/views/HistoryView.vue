<script setup>
import { computed, ref } from 'vue'
import { ArrowRight, Receipt } from 'lucide-vue-next'
import AppHeader from '../components/AppHeader.vue'
import StatusChip from '../components/StatusChip.vue'
import { transfers } from '../api'
import { formatDateTime, formatMoney } from '../utils/format'

const networkLogos = {
  MTN: '/momo/mtn.png',
  Telecel: '/momo/telecel.png',
  AirtelTigo: '/momo/airteltigo.png',
}

const items = ref([])
const page = ref(1)
const totalPages = ref(1)
const loading = ref(true)
const loadingMore = ref(false)
const error = ref('')

const hasMore = computed(() => page.value < totalPages.value)

const load = async (target = 1) => {
  if (target === 1) loading.value = true
  else loadingMore.value = true
  error.value = ''
  try {
    const data = await transfers.list({ page: target, limit: 10 })
    items.value = target === 1 ? data.transfers : [...items.value, ...data.transfers]
    page.value = data.page
    totalPages.value = data.total_pages
  } catch (err) {
    error.value = err?.message ?? 'We couldn’t load your transfers.'
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

load()
</script>

<template>
  <div class="min-h-screen pb-16">
    <AppHeader />

    <main class="mx-auto max-w-3xl px-4 py-8">
      <p class="text-xs font-medium tracking-[0.16em] text-slate">ACTIVITY</p>
      <h1 class="mt-3 font-display text-3xl font-semibold text-ink">Your transfers</h1>
      <p class="mt-2 text-sm text-slate">Everything you have sent to Ghana, newest first.</p>

      <div v-if="loading" class="mt-10 flex items-center gap-3 text-sm text-slate">
        <span class="h-4 w-4 animate-spin rounded-full border border-slate border-t-transparent" aria-hidden="true"></span>
        Loading your transfers…
      </div>

      <p
        v-else-if="error"
        class="mt-8 rounded-control border border-alert/25 bg-alert/10 px-4 py-3 text-sm text-alert"
      >
        {{ error }}
      </p>

      <div
        v-else-if="items.length === 0"
        class="mt-10 rounded-panel border border-line bg-canvas px-6 py-14 text-center"
      >
        <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-control bg-mist text-slate">
          <Receipt :size="22" :stroke-width="1.5" />
        </span>
        <p class="mt-4 font-display text-xl font-semibold text-ink">No transfers yet</p>
        <p class="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate">
          When you send money to a Mobile Money account in Ghana, it shows up here.
        </p>
        <RouterLink
          to="/send"
          class="mt-6 inline-flex h-11 items-center rounded-control bg-volta px-5 text-sm font-medium text-white transition-colors hover:bg-volta-deep"
        >
          Send money
        </RouterLink>
      </div>

      <ul v-else class="mt-8 divide-y divide-line border-y border-line">
        <li v-for="item in items" :key="item.transfer_id">
          <RouterLink
            :to="`/transfers/${item.transfer_id}`"
            class="flex items-center gap-4 py-4 transition-colors hover:bg-mist/60"
          >
            <img
              v-if="networkLogos[item.network]"
              :src="networkLogos[item.network]"
              :alt="item.network"
              class="h-6 w-14 shrink-0 object-contain"
            />
            <div class="min-w-0 flex-1">
              <p class="truncate font-medium text-ink">{{ item.counterparty_name }}</p>
              <p class="mt-0.5 text-xs text-slate tabular">
                {{ item.counterparty_handle }} · {{ formatDateTime(item.created_at) }}
              </p>
            </div>
            <div class="shrink-0 text-right">
              <p class="font-semibold text-ink tabular">
                {{ formatMoney(item.recipient_gets, item.target_currency) }}
              </p>
              <p class="mt-1 text-xs text-slate tabular">
                {{ formatMoney(item.send_amount, item.source_currency) }} {{ item.source_currency }}
              </p>
            </div>
            <div class="hidden w-32 shrink-0 justify-end sm:flex">
              <StatusChip :status="item.status" />
            </div>
            <ArrowRight :size="16" :stroke-width="1.75" class="hidden shrink-0 text-slate sm:block" />
          </RouterLink>
        </li>
      </ul>

      <div v-if="!loading && hasMore" class="mt-6 text-center">
        <button
          type="button"
          class="inline-flex h-11 items-center rounded-control border border-line bg-canvas px-5 text-sm font-medium text-ink transition-colors hover:bg-mist disabled:opacity-70"
          :disabled="loadingMore"
          @click="load(page + 1)"
        >
          {{ loadingMore ? 'Loading…' : 'Load more' }}
        </button>
      </div>
    </main>
  </div>
</template>
