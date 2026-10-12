<script setup>
import { computed, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, ArrowRight, RefreshCw } from 'lucide-vue-next'
import AppHeader from '../components/AppHeader.vue'
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

load()

onUnmounted(() => unsubscribe?.())
</script>

<template>
  <div class="min-h-screen pb-16">
    <AppHeader />

    <main class="mx-auto max-w-3xl px-4 py-8">
      <RouterLink
        to="/transfers"
        class="inline-flex items-center gap-2 text-sm font-medium text-slate transition-colors hover:text-ink"
      >
        <ArrowLeft :size="16" :stroke-width="1.75" />
        All transfers
      </RouterLink>

      <div v-if="loading" class="mt-8 flex items-center gap-3 text-sm text-slate">
        <span class="h-4 w-4 animate-spin rounded-full border border-slate border-t-transparent" aria-hidden="true"></span>
        Loading transfer…
      </div>

      <p
        v-else-if="error"
        class="mt-8 rounded-control border border-alert/25 bg-alert/10 px-4 py-3 text-sm text-alert"
      >
        {{ error }}
      </p>

      <template v-else-if="transfer">
        <div class="mt-6 flex flex-wrap items-center gap-3">
          <StatusChip :status="liveState" />
          <span
            v-if="!terminal"
            class="flex items-center gap-1.5 text-xs font-medium text-slate"
          >
            <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-volta" aria-hidden="true"></span>
            Live
          </span>
        </div>

        <h1 class="mt-4 font-display text-3xl font-semibold text-ink">
          {{ stateLabel(liveState) }}
        </h1>
        <p class="mt-2 text-sm text-slate">
          {{ message || (terminal ? 'This transfer is complete.' : 'We’ll update this page as your money moves.') }}
        </p>

        <section class="mt-8 grid gap-6 rounded-panel border-2 border-ink bg-canvas p-5 sm:grid-cols-2">
          <div>
            <p class="text-xs font-medium tracking-[0.16em] text-slate">THEY RECEIVE</p>
            <p class="mt-2 font-display text-3xl font-semibold text-ink tabular">
              {{ formatMoney(transfer.recipient_gets, transfer.target_currency) }}
            </p>
            <p class="mt-1 text-sm text-slate">{{ transfer.counterparty_name }}</p>
          </div>
          <div class="sm:text-right">
            <p class="text-xs font-medium tracking-[0.16em] text-slate">YOU SENT</p>
            <p class="mt-2 font-display text-3xl font-semibold text-ink tabular">
              {{ formatMoney(transfer.send_amount, transfer.source_currency) }}
            </p>
            <p class="mt-1 text-sm text-slate tabular">
              1 {{ transfer.source_currency }} = {{ transfer.fx_rate }} {{ transfer.target_currency }}
            </p>
          </div>
        </section>

        <div class="mt-8 grid gap-8 md:grid-cols-[1fr_1fr]">
          <section class="rounded-panel border border-line bg-canvas p-5">
            <p class="text-xs font-medium tracking-[0.16em] text-slate">PROGRESS</p>
            <div class="mt-5">
              <VerticalTracker :status="liveState" />
            </div>
          </section>

          <section class="space-y-6">
            <div class="rounded-panel border border-line bg-canvas p-5">
              <p class="text-xs font-medium tracking-[0.16em] text-slate">RECIPIENT</p>
              <p class="mt-3 font-display text-xl font-semibold text-ink">
                {{ transfer.counterparty_name }}
              </p>
              <p class="mt-1 text-sm text-slate">{{ transfer.counterparty_handle }}</p>
              <p class="mt-3 text-sm text-slate">
                {{ transfer.network }} Mobile Money · {{ transfer.target_currency }}
              </p>
            </div>

            <dl class="rounded-panel border border-line bg-canvas p-5 text-sm">
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
              <div class="mt-2 flex items-center justify-between border-t border-line pt-3">
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
          </section>
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
    </main>
  </div>
</template>
