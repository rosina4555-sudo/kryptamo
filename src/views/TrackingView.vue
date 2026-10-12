<script setup>
import { computed, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, ArrowRight, RefreshCw } from 'lucide-vue-next'
import AppHeader from '../components/AppHeader.vue'
import PageMasthead from '../components/PageMasthead.vue'
import StatusChip from '../components/StatusChip.vue'
import VerticalTracker from '../components/VerticalTracker.vue'
import { isTerminal, stateLabel, transfers } from '../api'
import { formatDateTime, formatMoney } from '../utils/format'

const route = useRoute()

const transfer = ref(null)
const liveState = ref('FUNDING_PENDING')
const message = ref('')
const loading = ref(true)
const error = ref('')

let unsubscribe = null

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await transfers.get(route.params.id)
    transfer.value = data
    liveState.value = data.status
    subscribe()
  } catch (err) {
    error.value = err?.message ?? 'We couldn’t find that transfer.'
  } finally {
    loading.value = false
  }
}

const subscribe = () => {
  unsubscribe?.()
  unsubscribe = transfers.subscribe(route.params.id, (payload) => {
    liveState.value = payload.current_state
    message.value = payload.message
    if (transfer.value) transfer.value.status = payload.current_state
  })
}

const terminal = computed(() => isTerminal(liveState.value))
const delivered = computed(() => liveState.value === 'PAID_OUT')
const failed = computed(() => liveState.value === 'FAILED')

const eyebrow = computed(() => (transfer.value ? `TRANSFER ${transfer.value.transfer_id}` : 'TRANSFER'))
const title = computed(() => {
  if (error.value) return 'We couldn’t open that transfer'
  if (!transfer.value) return 'Tracking your transfer'
  return stateLabel(liveState.value)
})
const subtitle = computed(() => {
  if (error.value) return error.value
  if (!transfer.value) return 'Fetching the latest status from the network…'
  return message.value || (terminal.value ? 'This transfer is complete.' : 'We’ll update this page as your money moves.')
})

load()

onUnmounted(() => unsubscribe?.())
</script>

<template>
  <div class="min-h-screen pb-16">
    <AppHeader />

    <PageMasthead :eyebrow="eyebrow" :title="title" :subtitle="subtitle">
      <template #aside>
        <aside v-if="transfer" class="space-y-5 border-l-2 border-volta-tint/40 pl-5 md:w-64">
          <StatusChip :status="liveState" />
          <div>
            <p class="text-xs font-medium tracking-[0.16em] text-white/45">REFERENCE</p>
            <p class="mt-1.5 font-mono text-xs text-white/80">{{ transfer.transfer_id }}</p>
          </div>
          <p v-if="!terminal" class="flex items-center gap-2 text-xs font-medium text-white/70">
            <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-volta-tint" aria-hidden="true"></span>
            Updating live
          </p>
        </aside>
      </template>
    </PageMasthead>

    <main class="mx-auto max-w-5xl px-4">
      <RouterLink
        to="/transfers"
        class="mt-6 inline-flex items-center gap-2 text-sm font-medium text-slate transition-colors hover:text-ink"
      >
        <ArrowLeft :size="16" :stroke-width="1.75" />
        All transfers
      </RouterLink>

      <div v-if="loading" class="mt-10 space-y-3" aria-busy="true">
        <div class="h-5 w-40 animate-pulse rounded-control bg-line" aria-hidden="true"></div>
        <div class="h-24 w-full animate-pulse rounded-panel bg-canvas" aria-hidden="true"></div>
        <p class="text-sm text-slate">Loading transfer…</p>
      </div>

      <template v-else-if="transfer">
        <section class="mt-8 grid overflow-hidden rounded-sheet border-2 border-ink sm:grid-cols-2">
          <div class="bg-canvas p-6 md:p-8">
            <div class="flex items-center gap-2.5">
              <span class="h-1.5 w-1.5 rounded-[2px] bg-delivered" aria-hidden="true"></span>
              <span class="text-xs font-medium tracking-[0.16em] text-slate">THEY RECEIVE</span>
            </div>
            <p class="mt-3 font-display text-4xl font-semibold leading-none text-ink tabular sm:text-5xl">
              {{ formatMoney(transfer.recipient_gets, transfer.target_currency) }}
            </p>
            <p class="mt-3 text-sm text-slate">{{ transfer.counterparty_name }}</p>
          </div>
          <div class="border-t-2 border-ink bg-ink p-6 text-white sm:border-l-2 sm:border-t-0 md:p-8">
            <div class="flex items-center gap-2.5">
              <span class="h-1.5 w-1.5 rounded-[2px] bg-volta-tint" aria-hidden="true"></span>
              <span class="text-xs font-medium tracking-[0.16em] text-white/55">YOU SENT</span>
            </div>
            <p class="mt-3 font-display text-4xl font-semibold leading-none text-white tabular sm:text-5xl">
              {{ formatMoney(transfer.send_amount, transfer.source_currency) }}
            </p>
            <p class="mt-3 text-sm text-white/60 tabular">
              1 {{ transfer.source_currency }} = {{ transfer.fx_rate }} {{ transfer.target_currency }}
            </p>
          </div>
        </section>

        <div class="mt-8 grid gap-8 md:grid-cols-2">
          <section class="rounded-panel border border-line bg-canvas p-6">
            <div class="flex items-center gap-2.5">
              <span class="h-1.5 w-1.5 rounded-[2px] bg-volta" aria-hidden="true"></span>
              <span class="text-xs font-medium tracking-[0.16em] text-slate">PROGRESS</span>
            </div>
            <div class="mt-6">
              <VerticalTracker :status="liveState" />
            </div>
          </section>

          <div class="space-y-6">
            <section class="rounded-panel border-2 border-ink bg-canvas p-6">
              <div class="flex items-center gap-2.5">
                <span class="h-1.5 w-1.5 rounded-[2px] bg-volta" aria-hidden="true"></span>
                <span class="text-xs font-medium tracking-[0.16em] text-slate">RECIPIENT</span>
              </div>
              <p class="mt-4 font-display text-xl font-semibold text-ink">{{ transfer.counterparty_name }}</p>
              <p class="mt-1 text-sm text-slate">{{ transfer.counterparty_handle }}</p>
              <p class="mt-3 text-sm text-slate">
                {{ transfer.network }} Mobile Money · {{ transfer.target_currency }}
              </p>
            </section>

            <dl class="rounded-panel border border-line bg-canvas p-6 text-sm">
              <div class="flex items-center justify-between py-1.5">
                <dt class="text-slate">Rate</dt>
                <dd class="font-medium text-ink tabular">
                  1 {{ transfer.source_currency }} = {{ transfer.fx_rate }} {{ transfer.target_currency }}
                </dd>
              </div>
              <div class="flex items-center justify-between py-1.5">
                <dt class="text-slate">Platform fee</dt>
                <dd class="font-medium text-ink tabular">{{ formatMoney(transfer.platform_fee, transfer.source_currency) }}</dd>
              </div>
              <div class="flex items-center justify-between py-1.5">
                <dt class="text-slate">Network fee</dt>
                <dd class="font-medium text-ink tabular">{{ formatMoney(transfer.network_fee, transfer.source_currency) }}</dd>
              </div>
              <div class="mt-2 flex items-center justify-between border-t-2 border-ink pt-3">
                <dt class="font-medium text-ink">Total paid</dt>
                <dd class="font-semibold text-ink tabular">{{ formatMoney(transfer.total_payable, transfer.source_currency) }}</dd>
              </div>
              <div class="mt-3 flex items-center justify-between border-t border-line pt-3">
                <dt class="text-slate">Reference</dt>
                <dd class="font-mono text-xs text-ink">{{ transfer.transfer_id }}</dd>
              </div>
              <div class="flex items-center justify-between py-1.5">
                <dt class="text-slate">Started</dt>
                <dd class="text-ink tabular">{{ formatDateTime(transfer.created_at) }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div class="mt-8 flex flex-wrap gap-3">
          <RouterLink
            v-if="delivered"
            :to="`/transfers/${transfer.transfer_id}/receipt`"
            class="inline-flex h-12 items-center rounded-control bg-volta px-5 text-sm font-medium text-white transition-colors hover:bg-volta-deep"
          >
            View receipt
          </RouterLink>
          <RouterLink
            to="/send"
            class="inline-flex h-12 items-center gap-2 rounded-control border border-line bg-canvas px-5 text-sm font-medium text-ink transition-colors hover:bg-mist"
          >
            <RefreshCw :size="16" :stroke-width="1.75" />
            Send another
          </RouterLink>
          <RouterLink
            v-if="failed"
            to="/transfers"
            class="inline-flex h-12 items-center gap-2 rounded-control border border-line bg-canvas px-5 text-sm font-medium text-ink transition-colors hover:bg-mist"
          >
            Contact support
            <ArrowRight :size="16" :stroke-width="1.75" />
          </RouterLink>
        </div>
      </template>

      <div v-else class="mt-8 rounded-panel border border-alert/25 bg-alert/10 p-6">
        <p class="text-sm text-alert">{{ error }}</p>
        <RouterLink
          to="/transfers"
          class="mt-4 inline-flex h-11 items-center gap-2 rounded-control border border-line bg-canvas px-4 text-sm font-medium text-ink transition-colors hover:bg-mist"
        >
          <ArrowLeft :size="16" :stroke-width="1.75" />
          Back to transfers
        </RouterLink>
      </div>
    </main>
  </div>
</template>
