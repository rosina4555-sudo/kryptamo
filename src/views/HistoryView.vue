<script setup>
import { computed, ref } from 'vue'
import { ArrowRight, Receipt } from 'lucide-vue-next'
import AppHeader from '../components/AppHeader.vue'
import PageMasthead from '../components/PageMasthead.vue'
import StatusChip from '../components/StatusChip.vue'
import FlagIcon from '../components/FlagIcon.vue'
import { transfers } from '../api'
import { formatDateTime, formatMoney } from '../utils/format'

const networkLogos = {
  MTN: '/momo/mtn.png',
  Telecel: '/momo/telecel.png',
  AirtelTigo: '/momo/airteltigo.png',
}

const sourceFlags = { USD: 'US', CAD: 'CA', GBP: 'GB' }

const items = ref([])
const page = ref(1)
const totalPages = ref(1)
const total = ref(null)
const loading = ref(true)
const loadingMore = ref(false)
const error = ref('')

const hasMore = computed(() => page.value < totalPages.value)
const count = computed(() => total.value ?? items.value.length)

const load = async (target = 1) => {
  if (target === 1) loading.value = true
  else loadingMore.value = true
  error.value = ''
  try {
    const data = await transfers.list({ page: target, limit: 10 })
    items.value = target === 1 ? data.transfers : [...items.value, ...data.transfers]
    page.value = data.page
    totalPages.value = data.total_pages
    if (data.total !== undefined) total.value = data.total
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

    <PageMasthead
      eyebrow="ACTIVITY"
      title="Your transfers"
      subtitle="Everything you have sent to Ghana, newest first. Open any transfer to see its live progress and receipt."
    >
      <template #aside>
        <aside class="border-l-2 border-volta-tint/40 pl-5 md:w-64">
          <p class="text-xs font-medium tracking-[0.16em] text-white/45">THIS LEDGER</p>
          <p class="mt-3 font-display text-4xl font-semibold leading-none text-white tabular">
            {{ loading ? '—' : count }}
          </p>
          <p class="mt-2 text-sm text-white/60">transfers to Ghana</p>
          <p class="mt-4 flex items-center gap-2 text-sm text-white/60 tabular">
            <span class="h-1.5 w-1.5 rounded-[2px] bg-volta-tint" aria-hidden="true"></span>
            US · Canada · UK → GHS
          </p>
        </aside>
      </template>
    </PageMasthead>

    <main class="mx-auto max-w-5xl px-4">
      <div v-if="loading" class="mt-10 space-y-3" aria-busy="true">
        <div class="h-16 w-full animate-pulse rounded-control bg-canvas" aria-hidden="true"></div>
        <div class="h-16 w-full animate-pulse rounded-control bg-canvas" aria-hidden="true"></div>
        <div class="h-16 w-full animate-pulse rounded-control bg-canvas" aria-hidden="true"></div>
        <p class="sr-only">Loading your transfers…</p>
      </div>

      <p
        v-else-if="error"
        class="mt-8 rounded-panel border border-alert/25 bg-alert/10 px-4 py-3 text-sm text-alert"
      >
        {{ error }}
      </p>

      <div
        v-else-if="items.length === 0"
        class="mt-10 rounded-sheet border-2 border-ink bg-canvas px-6 py-16 text-center"
      >
        <span class="mx-auto flex h-14 w-14 items-center justify-center rounded-control bg-mist text-slate">
          <Receipt :size="24" :stroke-width="1.5" />
        </span>
        <p class="mt-5 font-display text-2xl font-semibold text-ink">No transfers yet</p>
        <p class="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate">
          Enter a verified username on the send screen and your first transfer will appear here, tracked
          from the first payment to the last cedi.
        </p>
        <RouterLink
          to="/send"
          class="mt-6 inline-flex h-12 items-center rounded-control bg-volta px-5 text-sm font-medium text-white transition-colors hover:bg-volta-deep"
        >
          Send your first transfer
        </RouterLink>
      </div>

      <template v-else>
        <div class="mt-10 flex items-center justify-between border-b-2 border-ink pb-3">
          <span class="text-xs font-medium tracking-[0.16em] text-slate">RECENT ACTIVITY</span>
          <span class="text-xs text-slate tabular">{{ count }} total</span>
        </div>

        <ul class="divide-y divide-line">
          <li v-for="item in items" :key="item.transfer_id">
            <RouterLink
              :to="`/transfers/${item.transfer_id}`"
              class="group flex items-center gap-4 px-1 py-5 transition-colors hover:bg-canvas sm:px-3"
            >
              <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-control border border-line bg-canvas">
                <img
                  v-if="networkLogos[item.network]"
                  :src="networkLogos[item.network]"
                  :alt="item.network"
                  class="h-6 w-auto"
                />
                <span v-else class="text-xs font-semibold text-slate">{{ item.network?.slice(0, 2) }}</span>
              </span>

              <div class="min-w-0 flex-1">
                <p class="truncate font-display text-lg font-semibold text-ink">
                  {{ item.counterparty_name }}
                </p>
                <p class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate">
                  <span class="inline-flex items-center gap-1.5">
                    <FlagIcon :code="sourceFlags[item.source_currency] ?? 'US'" class="h-3 w-[18px] rounded-[2px]" />
                    {{ item.source_currency }}
                  </span>
                  <ArrowRight :size="12" :stroke-width="1.5" />
                  <span class="inline-flex items-center gap-1.5">
                    <FlagIcon code="GH" class="h-3 w-[18px] rounded-[2px]" />
                    {{ item.target_currency }}
                  </span>
                  <span class="hidden h-1 w-1 rounded-[1px] bg-slate sm:block" aria-hidden="true"></span>
                  <span class="hidden tabular sm:inline">{{ formatDateTime(item.created_at) }}</span>
                </p>
              </div>

              <div class="shrink-0 text-right">
                <p class="font-display text-lg font-semibold text-ink tabular">
                  {{ formatMoney(item.recipient_gets, item.target_currency) }}
                </p>
                <p class="mt-0.5 text-xs text-slate tabular">
                  {{ formatMoney(item.send_amount, item.source_currency) }}
                </p>
              </div>

              <div class="hidden w-32 shrink-0 justify-end sm:flex">
                <StatusChip :status="item.status" />
              </div>
              <ArrowRight
                :size="16"
                :stroke-width="1.75"
                class="hidden shrink-0 text-slate transition-transform group-hover:translate-x-0.5 group-hover:text-volta sm:block"
              />
            </RouterLink>
          </li>
        </ul>

        <div v-if="hasMore" class="mt-8 text-center">
          <button
            type="button"
            class="inline-flex h-12 items-center rounded-control border border-line bg-canvas px-6 text-sm font-medium text-ink transition-colors hover:bg-mist disabled:opacity-70"
            :disabled="loadingMore"
            @click="load(page + 1)"
          >
            {{ loadingMore ? 'Loading…' : 'Load more' }}
          </button>
        </div>
      </template>
    </main>
  </div>
</template>
