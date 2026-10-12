<script setup>
import { computed, ref } from 'vue'
import { ArrowRight } from 'lucide-vue-next'
import FlagIcon from './FlagIcon.vue'
import { formatMoney } from '../utils/format'

const corridors = [
  {
    code: 'USD',
    sym: '$',
    country: 'United States',
    label: 'US',
    flag: 'US',
    rate: 15.6,
    platform: 1.5,
    network: 0.5,
    eta: '10 min',
  },
  {
    code: 'CAD',
    sym: 'C$',
    country: 'Canada',
    label: 'Canada',
    flag: 'CA',
    rate: 11.4,
    platform: 2.0,
    network: 0.75,
    eta: '15 min',
  },
  {
    code: 'GBP',
    sym: '£',
    country: 'United Kingdom',
    label: 'UK',
    flag: 'GB',
    rate: 19.8,
    platform: 1.2,
    network: 0.4,
    eta: '10 min',
  },
]

const momo = [
  { name: 'MTN Mobile Money', src: '/momo/mtn.png' },
  { name: 'Telecel Cash', src: '/momo/telecel.png' },
  { name: 'AirtelTigo Money', src: '/momo/airteltigo.png' },
]

const amount = ref(100)
const selectedCode = ref('USD')

const active = computed(() => corridors.find((c) => c.code === selectedCode.value))
const sent = computed(() => {
  const value = Number(amount.value)
  return Number.isFinite(value) && value > 0 ? value : 0
})
const fees = computed(() => active.value.platform + active.value.network)
const recipientGets = computed(() => sent.value * active.value.rate)
const amountWidth = computed(() => `calc(${Math.max(3, String(amount.value ?? '').length)}ch + 0.2em)`)
</script>

<template>
  <div class="overflow-hidden rounded-panel border-2 border-volta bg-canvas">
    <div class="bg-mist p-2">
      <div class="flex gap-1.5" role="group" aria-label="Sending country">
        <button
          v-for="c in corridors"
          :key="c.code"
          type="button"
          class="flex flex-1 items-center justify-center gap-2 rounded-control px-3 py-2.5 text-sm font-semibold transition-colors"
          :class="
            c.code === selectedCode
              ? 'bg-canvas text-ink shadow-[0_1px_3px_rgba(23,42,46,0.12)]'
              : 'text-slate hover:text-ink'
          "
          :aria-pressed="c.code === selectedCode"
          @click="selectedCode = c.code"
        >
          <FlagIcon :code="c.flag" class="h-4 w-6 rounded-[2px] ring-1 ring-black/5" />
          {{ c.label }}
        </button>
      </div>
    </div>

    <div class="px-5 py-6 sm:px-6">
      <p class="text-xs font-semibold tracking-[0.16em] text-slate">YOU SEND</p>
      <div class="mt-3 flex items-center justify-between gap-4">
        <span class="flex items-center gap-3">
          <FlagIcon :code="active.flag" class="h-6 w-9 rounded-[3px] ring-1 ring-line" />
          <span>
            <span class="block font-display text-lg font-semibold leading-tight text-ink">
              {{ active.country }}
            </span>
            <span class="block text-xs font-medium text-slate">{{ active.code }}</span>
          </span>
        </span>
        <label class="flex items-baseline gap-1.5">
          <span class="font-display text-2xl font-semibold text-slate">{{ active.sym }}</span>
          <input
            v-model.number="amount"
            type="number"
            min="0"
            inputmode="decimal"
            aria-label="Amount to send"
            :style="{ width: amountWidth }"
            class="bg-transparent text-right font-display text-3xl font-semibold text-ink tabular outline-none placeholder:text-slate/40"
            placeholder="100"
          />
        </label>
      </div>
    </div>

    <div class="bg-gradient-to-br from-volta to-volta-deep px-5 py-6 text-white sm:px-6">
      <p class="text-xs font-semibold tracking-[0.16em] text-white/75">THEY RECEIVE</p>
      <div class="mt-3 flex items-center justify-between gap-4">
        <span class="flex items-center gap-3">
          <FlagIcon code="GH" class="h-6 w-9 rounded-[3px] ring-1 ring-white/25" />
          <span>
            <span class="block font-display text-lg font-semibold leading-tight text-white">Ghana</span>
            <span class="block text-xs font-medium text-white/75">Mobile Money</span>
          </span>
        </span>
        <span class="font-display text-3xl font-semibold tabular">
          {{ formatMoney(recipientGets, 'GHS') }}
        </span>
      </div>
      <p class="mt-4 flex items-center gap-2 text-sm font-medium text-white/80">
        <span class="h-1.5 w-1.5 rounded-[2px] bg-volta-tint"></span>
        1 {{ active.code }} =
        <span class="font-semibold text-white tabular">{{ active.rate.toFixed(2) }}</span> GHS
      </p>
    </div>

    <div class="space-y-3 px-5 py-5 sm:px-6">
      <div class="flex items-baseline justify-between gap-4">
        <span class="text-sm font-semibold text-ink">Fees</span>
        <span class="font-display text-lg font-semibold text-ink tabular">
          {{ formatMoney(fees, active.code) }}
        </span>
      </div>
      <div class="flex items-baseline justify-between gap-4">
        <span class="text-sm font-semibold text-ink">Arrival</span>
        <span class="font-display text-lg font-semibold text-ink">{{ active.eta }}</span>
      </div>
    </div>

    <div class="px-4 pb-4 sm:px-5">
      <RouterLink
        to="/send"
        class="flex h-12 items-center justify-center gap-2 rounded-control bg-volta text-sm font-medium text-white transition-colors hover:bg-volta-deep"
      >
        Send money
        <ArrowRight :size="16" :stroke-width="2" />
      </RouterLink>
    </div>

    <div class="px-5 pb-6 pt-1 sm:px-6">
      <p class="text-xs font-semibold tracking-[0.16em] text-slate">PAYS OUT TO</p>
      <div class="mt-3 flex flex-wrap items-center gap-x-5 gap-y-3">
        <img
          v-for="m in momo"
          :key="m.name"
          :src="m.src"
          :alt="m.name"
          class="h-11 w-auto object-contain"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>
