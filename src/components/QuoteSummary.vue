<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { ArrowDownLeft, Banknote, ChevronDown, ReceiptText, Send, Timer } from 'lucide-vue-next'
import { formatMoney } from '../utils/format'

const props = defineProps({
  sendAmount: { type: Number, required: true },
  fees: { type: Number, required: true },
  rate: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  targetCurrency: { type: String, default: 'GHS' },
  expiresAt: { type: Number, required: true },
  recipientName: { type: String, default: 'Recipient' },
  platformFee: { type: Number, default: undefined },
  networkFee: { type: Number, default: undefined },
})

const emit = defineEmits(['pay'])

const now = ref(Date.now())
const showFees = ref(false)
let timer

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now()
  }, 250)
})
onUnmounted(() => clearInterval(timer))

const totalPayable = computed(() => props.sendAmount + props.fees)
const recipientGets = computed(() => (props.sendAmount * props.rate).toFixed(2))
const itemized = computed(
  () => props.platformFee !== undefined && props.networkFee !== undefined,
)
const secondsLeft = computed(() => Math.max(0, Math.floor((props.expiresAt - now.value) / 1000)))
const mmss = computed(() => {
  const m = Math.floor(secondsLeft.value / 60)
  const s = secondsLeft.value % 60
  return `${m}:${String(s).padStart(2, '0')}`
})
const expired = computed(() => secondsLeft.value === 0)
const ringR = 8
const ringC = 2 * Math.PI * ringR
</script>

<template>
  <aside class="rounded-panel border border-line bg-canvas shadow-overlay">
    <header class="flex items-center justify-between border-b border-line px-5 py-4">
      <span class="font-display text-lg font-semibold text-ink">Review</span>
      <span class="flex items-center gap-2 text-xs text-slate tabular">
        <Timer :size="14" class="text-gold" :stroke-width="1.5" />
        {{ expired ? 'Rate expired' : mmss }}
      </span>
    </header>

    <dl class="space-y-4 px-5 py-5 text-sm">
      <div class="flex items-center gap-3">
        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-volta-tint text-volta">
          <Send :size="14" :stroke-width="1.5" />
        </span>
        <dt class="flex-1 text-slate">You send</dt>
        <dd class="font-medium text-ink tabular">{{ formatMoney(sendAmount, currency) }}</dd>
      </div>

      <div class="flex items-center gap-3">
        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-mist text-ink">
          <ReceiptText :size="14" :stroke-width="1.5" />
        </span>
        <button
          type="button"
          class="flex flex-1 items-center gap-1 text-left text-slate"
          :aria-expanded="showFees"
          @click="showFees = !showFees"
        >
          Fees
          <ChevronDown
            v-if="itemized"
            :size="14"
            :stroke-width="1.5"
            class="transition-transform"
            :class="showFees ? 'rotate-180' : ''"
          />
        </button>
        <dd class="font-medium text-ink tabular">{{ formatMoney(fees, currency) }}</dd>
      </div>

      <div v-if="itemized && showFees" class="space-y-2 pl-11">
        <div class="flex items-center justify-between text-xs text-slate">
          <span>Platform fee</span>
          <span class="tabular">{{ formatMoney(platformFee, currency) }}</span>
        </div>
        <div class="flex items-center justify-between text-xs text-slate">
          <span>Network fee</span>
          <span class="tabular">{{ formatMoney(networkFee, currency) }}</span>
        </div>
      </div>

      <div class="flex items-center gap-3 border-t border-line pt-4">
        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-volta text-white">
          <Banknote :size="14" :stroke-width="1.5" />
        </span>
        <dt class="flex-1 font-medium text-ink">Total you pay</dt>
        <dd class="font-semibold text-ink tabular">{{ formatMoney(totalPayable, currency) }}</dd>
      </div>
    </dl>

    <div class="border-t border-line px-5 pb-5 pt-4">
      <div class="flex items-center gap-2 text-xs font-medium text-slate">
        <ArrowDownLeft :size="14" :stroke-width="1.5" class="text-volta" />
        {{ recipientName }} gets
      </div>
      <p class="mt-1.5 font-ui text-[40px] font-semibold leading-[44px] text-ink tabular">
        {{ formatMoney(recipientGets, targetCurrency) }}
      </p>
      <p class="mt-1 text-xs text-slate tabular">1 {{ currency }} = {{ rate.toFixed(2) }} {{ targetCurrency }}</p>
    </div>

    <div class="px-5 pb-5">
      <div
        class="mb-3 flex items-center justify-between rounded-control px-3 py-2"
        :class="expired ? 'bg-notice-bg' : 'bg-mist'"
      >
        <span class="text-xs font-medium" :class="expired ? 'text-notice-text' : 'text-ink'">
          {{ expired ? 'Rate expired' : 'Rate locked for 5:00' }}
        </span>
        <svg viewBox="0 0 20 20" class="h-5 w-5 -rotate-90" role="img" :aria-label="`Rate locked for ${mmss}`">
          <circle cx="10" cy="10" r="8" fill="none" stroke="var(--color-line)" stroke-width="2" />
          <circle
            cx="10"
            cy="10"
            r="8"
            fill="none"
            stroke="var(--color-gold)"
            stroke-width="2"
            stroke-linecap="round"
            :stroke-dasharray="ringC"
            :stroke-dashoffset="ringC * (1 - secondsLeft / 300)"
          />
        </svg>
      </div>

      <button
        type="button"
        class="h-12 w-full rounded-control bg-volta font-medium text-white transition-colors duration-150 hover:bg-volta-deep disabled:cursor-not-allowed disabled:bg-mist disabled:text-slate"
        :disabled="expired"
        @click="emit('pay')"
      >
        {{ expired ? 'Get new quote' : `Pay ${formatMoney(totalPayable, currency)}` }}
      </button>
    </div>
  </aside>
</template>