<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, Printer } from 'lucide-vue-next'
import AppHeader from '../components/AppHeader.vue'
import PageMasthead from '../components/PageMasthead.vue'
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

    <PageMasthead
      class="print:hidden"
      eyebrow="RECEIPT"
      title="Transfer receipt"
      subtitle="A permanent record of this transfer — the rate, the fees, and the local Mobile Money amount delivered."
    >
      <template #aside>
        <aside v-if="transfer" class="space-y-5 border-l-2 border-volta-tint/40 pl-5 md:w-64">
          <StatusChip :status="transfer.status" />
          <div>
            <p class="text-xs font-medium tracking-[0.16em] text-white/45">REFERENCE</p>
            <p class="mt-1.5 font-mono text-xs text-white/80">{{ transfer.transfer_id }}</p>
          </div>
          <p class="text-sm text-white/60 tabular">{{ formatDateTime(transfer.created_at) }}</p>
        </aside>
      </template>
    </PageMasthead>

    <main class="mx-auto max-w-3xl px-4">
      <RouterLink
        :to="`/transfers/${route.params.id}`"
        class="mt-6 inline-flex items-center gap-2 text-sm font-medium text-slate transition-colors hover:text-ink print:hidden"
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
        class="mt-8 rounded-panel border border-alert/25 bg-alert/10 px-4 py-3 text-sm text-alert"
      >
        {{ error }}
      </p>

      <article v-else-if="transfer" class="mt-6 overflow-hidden rounded-sheet border-2 border-ink bg-canvas">
        <header class="flex items-start justify-between gap-4 border-b-2 border-ink px-6 py-5">
          <span class="flex items-center gap-2.5">
            <img src="/kryptamo.png" alt="Kryptamo logo" class="h-8 w-auto" />
            <span class="font-display text-lg font-semibold text-ink">Kryptamo</span>
          </span>
          <div class="text-right">
            <p class="text-xs font-medium tracking-[0.16em] text-slate">RECEIPT</p>
            <p class="mt-1 font-mono text-xs text-ink">{{ transfer.transfer_id }}</p>
          </div>
        </header>

        <div class="border-b-2 border-ink bg-ink px-6 py-7 text-white">
          <div class="flex items-center gap-2.5">
            <span
              class="h-1.5 w-1.5 rounded-[2px]"
              :class="failed ? 'bg-alert' : 'bg-delivered'"
              aria-hidden="true"
            ></span>
            <span class="text-xs font-medium tracking-[0.16em] text-white/55">
              {{ failed ? 'AMOUNT NOT DELIVERED' : 'DELIVERED TO MOBILE MONEY' }}
            </span>
          </div>
          <p class="mt-4 font-display text-5xl font-semibold leading-none text-white tabular">
            {{ formatMoney(transfer.recipient_gets, transfer.target_currency) }}
          </p>
          <p class="mt-4 text-sm text-white/65">
            {{ transfer.counterparty_name }} · {{ transfer.network }} Mobile Money
          </p>
        </div>

        <div class="px-6 py-6">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <StatusChip :status="transfer.status" />
            <span class="text-xs text-slate tabular">{{ formatDateTime(transfer.created_at) }}</span>
          </div>

          <dl class="divide-y divide-line text-sm">
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
          </dl>

          <div class="mt-2 flex items-center justify-between border-t-2 border-ink pt-4">
            <dt class="text-sm font-medium text-ink">Total paid</dt>
            <dd class="font-display text-2xl font-semibold text-ink tabular">
              {{ formatMoney(transfer.total_payable, transfer.source_currency) }}
            </dd>
          </div>

          <p
            v-if="failed"
            class="mt-6 rounded-control border border-alert/25 bg-alert/10 px-4 py-3 text-sm text-alert"
          >
            This transfer didn’t complete. Any amount collected is returned to your wallet automatically.
          </p>
          <p v-else class="mt-6 text-xs leading-6 text-slate">
            Kryptamo is a pass-through remittance service. Your local currency leaves your Mobile Money
            wallet, settles on-chain in stablecoins you never see, and lands as local Mobile Money in the
            recipient’s wallet — at the rate quoted. No wallet to top up, no balance held.
          </p>
        </div>
      </article>

      <div v-if="transfer" class="mt-6 flex flex-wrap gap-3 print:hidden">
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
