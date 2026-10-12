<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { ArrowRight, ArrowUpRight, BadgeCheck, Banknote, ChevronDown, ReceiptText, Timer } from 'lucide-vue-next'
import { formatMoney } from '../utils/format'

const props = defineProps({
  sendAmount: { type: Number, required: true },
  fees: { type: Number, required: true },
  rate: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  targetCurrency: { type: String, default: 'GHS' },
  expiresAt: { type: Number, required: true },
  recipientName: { type: String, default: 'Recipient' },
  network: { type: String, default: 'Mobile Money' },
  senderName: { type: String, default: 'Your card' },
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
</script>

<template>
  <aside class="overflow-hidden rounded-control border-2 border-ink bg-canvas">
    <header class="flex items-center justify-between bg-volta px-5 py-5">
      <span class="flex items-center gap-2 font-display text-xl font-semibold text-white">Review</span>
      <span class="flex items-center gap-2 text-sm font-medium text-white tabular">
        <Timer :size="16" :stroke-width="1.5" class="text-gold" />
        {{ expired ? 'Rate expired' : `Rate locked for ${mmss}` }}
      </span>
    </header>

    <div class="flex items-stretch overflow-hidden border-b-2 border-ink">
      <div class="flex-1 bg-ink px-4 py-4">
        <p class="text-xs font-medium text-white/60">{{ currency }}</p>
        <p class="mt-0.5 font-display text-lg font-semibold text-white">{{ senderName }}</p>
      </div>
      <div class="flex items-center justify-center bg-volta px-4 text-white">
        <ArrowRight :size="20" :stroke-width="2" />
      </div>
      <div class="flex-1 bg-volta px-4 py-4 text-right">
        <p class="text-xs font-medium text-white/70">{{ targetCurrency }}</p>
        <p class="mt-0.5 font-display text-lg font-semibold text-white">{{ recipientName }}</p>
      </div>
    </div>

    <div class="px-5 py-6">
      <div class="flex items-center gap-1.5 text-sm font-semibold text-volta">
        <BadgeCheck :size="16" :stroke-width="1.5" class="text-delivered" />
        {{ recipientName }} gets
      </div>
      <p class="mt-2 font-display text-[56px] font-semibold leading-[1.05] text-ink tabular sm:text-[64px]">
        {{ formatMoney(recipientGets, targetCurrency) }}
      </p>
      <p class="mt-2 text-sm font-medium text-slate tabular">
        1 {{ currency }} = {{ rate.toFixed(2) }} {{ targetCurrency }}
      </p>
    </div>

    <div class="border-t border-line">
      <div class="flex items-center gap-4 px-5 py-3.5">
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-mist text-ink">
          <ArrowUpRight :size="18" :stroke-width="1.5" />
        </span>
        <p class="flex-1 text-base text-ink">You send</p>
        <p class="text-base font-semibold text-ink tabular">{{ formatMoney(sendAmount, currency) }}</p>
      </div>

      <div class="border-t border-line">
        <button
          type="button"
          class="group flex w-full items-center gap-4 px-5 py-3.5 text-left"
          :aria-expanded="showFees"
          @click="showFees = !showFees"
        >
          <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-mist text-ink">
            <ReceiptText :size="18" :stroke-width="1.5" />
          </span>
          <span class="flex-1 text-base text-ink transition-colors group-hover:text-volta">Fees</span>
          <span class="text-base font-semibold text-ink tabular">{{ formatMoney(fees, currency) }}</span>
          <ChevronDown
            :size="18"
            :stroke-width="1.5"
            class="text-slate transition-transform duration-150"
            :class="showFees ? 'rotate-180' : ''"
          />
        </button>

        <Transition name="expand">
          <div v-if="itemized && showFees" class="space-y-2.5 pb-3.5 pl-[68px] pr-5 text-sm text-slate">
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-2">
                <span class="h-2 w-2 rounded-[2px] bg-volta" aria-hidden="true"></span>
                Platform fee
              </span>
              <span class="font-medium text-ink tabular">{{ formatMoney(platformFee, currency) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-2">
                <span class="h-2 w-2 rounded-[2px] bg-slate" aria-hidden="true"></span>
                Network fee
              </span>
              <span class="font-medium text-ink tabular">{{ formatMoney(networkFee, currency) }}</span>
            </div>
          </div>
        </Transition>
      </div>

      <div class="flex items-center gap-4 border-t border-ink bg-ink px-5 py-4">
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-volta text-white">
          <Banknote :size="18" :stroke-width="1.5" />
        </span>
        <p class="flex-1 text-base font-semibold text-white">You pay</p>
        <p class="text-xl font-bold text-white tabular">{{ formatMoney(totalPayable, currency) }}</p>
      </div>
    </div>

    <div class="px-5 py-5">
      <button
        type="button"
        class="h-13 w-full rounded-control bg-volta text-base font-semibold text-white transition-all duration-150 hover:bg-volta-deep active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-mist disabled:text-slate disabled:active:scale-100"
        :disabled="expired"
        @click="emit('pay')"
      >
        {{ expired ? 'Get new quote' : `Pay ${formatMoney(totalPayable, currency)}` }}
      </button>
    </div>
  </aside>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition:
    opacity 150ms ease-out,
    transform 150ms ease-out;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>