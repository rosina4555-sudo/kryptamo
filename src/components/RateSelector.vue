<script setup>
import { computed, ref } from 'vue'
import { ArrowRight } from 'lucide-vue-next'
import FlagIcon from './FlagIcon.vue'
import { formatMoney, formatRate, currencySymbol } from '../utils/format'
import { COUNTRIES, countryByCode, corridorRate, emojiFlag } from '../data/countries'

const amount = ref(50000)
const fromCode = ref('NG')
const toCode = ref('GH')

const from = computed(() => countryByCode(fromCode.value))
const to = computed(() => countryByCode(toCode.value))

const sent = computed(() => {
  const value = Number(amount.value)
  return Number.isFinite(value) && value > 0 ? value : 0
})
const rate = computed(() => corridorRate(from.value.currency, to.value.currency))
const recipientGets = computed(() => sent.value * rate.value)
const fees = 0
const amountWidth = computed(() => `calc(${Math.max(3, String(amount.value ?? '').length)}ch + 0.2em)`)
const swap = () => {
  const next = fromCode.value
  fromCode.value = toCode.value
  toCode.value = next
}
</script>

<template>
  <div class="overflow-hidden rounded-panel border-2 border-volta bg-canvas">
    <div class="grid grid-cols-2 gap-2 bg-mist p-2">
      <label class="rounded-control bg-canvas px-3 py-2">
        <span class="block text-xs font-semibold tracking-[0.16em] text-slate">FROM</span>
        <select
          v-model="fromCode"
          class="mt-1 w-full appearance-none bg-transparent font-display text-sm font-semibold text-ink outline-none"
          aria-label="Sending country"
        >
          <option v-for="c in COUNTRIES" :key="c.code" :value="c.code">
            {{ emojiFlag(c.code) }} {{ c.name }}
          </option>
        </select>
      </label>
      <label class="rounded-control bg-canvas px-3 py-2">
        <span class="block text-xs font-semibold tracking-[0.16em] text-slate">TO</span>
        <select
          v-model="toCode"
          class="mt-1 w-full appearance-none bg-transparent font-display text-sm font-semibold text-ink outline-none"
          aria-label="Receiving country"
        >
          <option v-for="c in COUNTRIES" :key="c.code" :value="c.code">
            {{ emojiFlag(c.code) }} {{ c.name }}
          </option>
        </select>
      </label>
    </div>

    <div class="px-5 py-6 sm:px-6">
      <p class="text-xs font-semibold tracking-[0.16em] text-slate">YOU SEND</p>
      <div class="mt-3 flex items-center justify-between gap-4">
        <span class="flex items-center gap-3">
          <FlagIcon :code="from.code" class="h-6 w-9 rounded-[3px] ring-1 ring-line" />
          <span>
            <span class="block font-display text-lg font-semibold leading-tight text-ink">
              {{ from.name }}
            </span>
            <span class="block text-xs font-medium text-slate">{{ from.currency }} · Mobile Money</span>
          </span>
        </span>
        <label class="flex items-baseline gap-1.5">
          <span class="font-display text-2xl font-semibold text-slate">{{ currencySymbol(from.currency) }}</span>
          <input
            v-model.number="amount"
            type="number"
            min="0"
            inputmode="decimal"
            aria-label="Amount to send"
            :style="{ width: amountWidth }"
            class="bg-transparent text-right font-display text-3xl font-semibold text-ink tabular outline-none [appearance:textfield] placeholder:text-slate/40 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            placeholder="100"
          />
        </label>
      </div>
    </div>

    <div class="bg-gradient-to-br from-volta to-volta-deep px-5 py-6 text-white sm:px-6">
      <p class="text-xs font-semibold tracking-[0.16em] text-white/75">THEY RECEIVE</p>
      <div class="mt-3 flex items-center justify-between gap-4">
        <span class="flex items-center gap-3">
          <FlagIcon :code="to.code" class="h-6 w-9 rounded-[3px] ring-1 ring-white/25" />
          <span>
            <span class="block font-display text-lg font-semibold leading-tight text-white">{{ to.name }}</span>
            <span class="block text-xs font-medium text-white/75">{{ to.currency }} · Mobile Money</span>
          </span>
        </span>
        <span class="font-display text-3xl font-semibold tabular">
          {{ formatMoney(recipientGets, to.currency) }}
        </span>
      </div>
      <p class="mt-4 flex items-center gap-2 text-sm font-medium text-white/80">
        <span class="h-1.5 w-1.5 rounded-[2px] bg-volta-tint"></span>
        1 {{ from.currency }} =
        <span class="font-semibold text-white tabular">{{ formatRate(rate) }}</span> {{ to.currency }}
      </p>
    </div>

    <div class="space-y-3 px-5 py-5 sm:px-6">
      <div class="flex items-baseline justify-between gap-4">
        <span class="flex items-center gap-2 text-sm font-semibold text-ink">
          Fees
          <span class="rounded-control bg-delivered/10 px-2 py-0.5 text-xs font-semibold text-delivered">Free</span>
        </span>
        <span class="font-display text-lg font-semibold text-ink tabular">
          {{ formatMoney(fees, from.currency) }}
        </span>
      </div>
      <div class="flex items-baseline justify-between gap-4">
        <span class="text-sm font-semibold text-ink">Arrival</span>
        <span class="font-display text-lg font-semibold text-ink">Seconds</span>
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
      <div class="flex items-center justify-between gap-3">
        <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate">Pays out to {{ to.name }}</p>
        <button
          type="button"
          class="text-xs font-semibold text-volta transition-colors hover:text-volta-deep"
          @click="swap"
        >
          Swap
        </button>
      </div>
      <div class="mt-3 flex flex-wrap gap-2">
        <span
          v-for="network in to.networks"
          :key="network"
          class="rounded-control border border-line bg-mist px-2.5 py-1 text-xs font-medium text-ink"
        >
          {{ network }}
        </span>
      </div>
    </div>
  </div>
</template>
