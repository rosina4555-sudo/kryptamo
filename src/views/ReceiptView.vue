<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, Printer } from 'lucide-vue-next'
import AppHeader from '../components/AppHeader.vue'
import StatusChip from '../components/StatusChip.vue'
import { transfers } from '../api'
import { formatDateTime, formatMoney } from '../utils/format'

const route = useRoute()

const transfer = ref(null)
const loading = ref(true)
const error = ref('')
const failed = ref(false)

const printReceipt = () => {
  globalThis.print?.()
}

const load = async () => {
  try {
    transfer.value = await transfers.get(route.params.id)
    failed.value = transfer.value.status === 'FAILED'
  } catch (err) {
    error.value = err?.message ?? 'We couldn’t load this receipt.'
  } finally {
    loading.value = false
  }
}

load()
</script>

<template>
  <div class="min-h-screen pb-16">
    <AppHeader />

    <main class="mx-auto max-w-2xl px-4 py-8">
      <RouterLink
        :to="`/transfers/${route.params.id}`"
        class="inline-flex items-center gap-2 text-sm font-medium text-slate transition-colors hover:text-ink print:hidden"
      >
        <ArrowLeft :size="16" :stroke-width="1.75" />
        Back to transfer
      </RouterLink>

      <div v-if="loading" class="mt-8 flex items-center gap-3 text-sm text-slate">
        <span class="h-4 w-4 animate-spin rounded-full border border-slate border-t-transparent" aria-hidden="true"></span>
        Loading receipt…
      </div>

      <p
        v-else-if="error"
        class="mt-8 rounded-control border border-alert/25 bg-alert/10 px-4 py-3 text-sm text-alert"
      >
        {{ error }}
      </p>

      <article v-else-if="transfer" class="mt-6 rounded-panel border-2 border-ink bg-canvas">
        <header class="flex items-start justify-between gap-4 border-b-2 border-ink px-6 py-5">
          <span class="flex items-center gap-2.5">
            <img src="/kryptamo.png" alt="Kryptamo logo" class="h-8 w-auto" />
            <span class="font-display text-lg font-semibold text-ink">Kryptamo</span>
          </span>
          <span class="text-right">
            <p class="text-xs font-medium tracking-[0.16em] text-slate">RECEIPT</p>
            <p class="mt-1 font-mono text-xs text-slate">{{ transfer.transfer_id }}</p>
          </span>
        </header>

        <div class="px-6 py-6">
          <div class="flex items-center justify-between">
            <StatusChip :status="transfer.status" />
            <span class="text-sm text-slate tabular">{{ formatDateTime(transfer.created_at) }}</span>
          </div>

          <p class="mt-6 text-xs font-medium tracking-[0.16em] text-slate">THEY RECEIVED</p>
          <p class="mt-2 font-display text-[44px] font-semibold leading-none text-ink tabular">
            {{ formatMoney(transfer.recipient_gets, transfer.target_currency) }}
          </p>

          <dl class="mt-8 divide-y divide-line border-y border-line text-sm">
            <div class="flex items-center justify-between py-3">
              <dt class="text-slate">Recipient</dt>
              <dd class="font-medium text-ink">{{ transfer.counterparty_name }}</dd>
            </div>
            <div class="flex items-center justify-between py-3">
              <dt class="text-slate">Username</dt>
              <dd class="font-medium text-ink">{{ transfer.counterparty_handle }}</dd>
            </div>
            <div class="flex items-center justify-between py-3">
              <dt class="text-slate">Mobile Money</dt>
              <dd class="font-medium text-ink">{{ transfer.network }} · {{ transfer.target_currency }}</dd>
            </div>
            <div class="flex items-center justify-between py-3">
              <dt class="text-slate">Amount sent</dt>
              <dd class="font-medium text-ink tabular">{{ formatMoney(transfer.send_amount, transfer.source_currency) }} {{ transfer.source_currency }}</dd>
            </div>
            <div class="flex items-center justify-between py-3">
              <dt class="text-slate">Platform fee</dt>
              <dd class="font-medium text-ink tabular">{{ formatMoney(transfer.platform_fee, transfer.source_currency) }}</dd>
            </div>
            <div class="flex items-center justify-between py-3">
              <dt class="text-slate">Network fee</dt>
              <dd class="font-medium text-ink tabular">{{ formatMoney(transfer.network_fee, transfer.source_currency) }}</dd>
            </div>
            <div class="flex items-center justify-between py-3">
              <dt class="text-slate">Exchange rate</dt>
              <dd class="font-medium text-ink tabular">1 {{ transfer.source_currency }} = {{ transfer.fx_rate }} {{ transfer.target_currency }}</dd>
            </div>
            <div class="flex items-center justify-between py-3">
              <dt class="font-medium text-ink">Total paid</dt>
              <dd class="text-lg font-semibold text-ink tabular">{{ formatMoney(transfer.total_payable, transfer.source_currency) }}</dd>
            </div>
          </dl>

          <p v-if="failed" class="mt-6 rounded-control border border-alert/25 bg-alert/10 px-4 py-3 text-sm text-alert">
            This transfer didn’t complete. If you were charged, the amount is refunded automatically.
          </p>
          <p v-else class="mt-6 text-xs leading-5 text-slate">
            Kryptamo is a pass-through remittance service. Funds settle on-chain and are paid directly to
            the recipient’s Mobile Money wallet — no balance is held on your behalf.
          </p>
        </div>
      </article>

      <div class="mt-6 flex flex-wrap gap-3 print:hidden">
        <button
          type="button"
          class="inline-flex h-12 items-center gap-2 rounded-control bg-volta px-5 text-sm font-medium text-white transition-colors hover:bg-volta-deep"
          @click="printReceipt"
        >
          <Printer :size="16" :stroke-width="1.75" />
          Print receipt
        </button>
        <RouterLink
          to="/send"
          class="inline-flex h-12 items-center rounded-control border border-line bg-canvas px-5 text-sm font-medium text-ink transition-colors hover:bg-mist"
        >
          Send again
        </RouterLink>
      </div>
    </main>
  </div>
</template>
