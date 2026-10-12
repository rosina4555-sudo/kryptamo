<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { Lock, ShieldCheck, Smartphone, X } from 'lucide-vue-next'
import { formatMoney } from '../utils/format'

const props = defineProps({
  open: { type: Boolean, default: false },
  gatewayUrl: { type: String, default: '' },
  amount: { type: Number, default: 0 },
  currency: { type: String, default: 'NGN' },
  recipientName: { type: String, default: '' },
  network: { type: String, default: 'Mobile Money' },
})

const emit = defineEmits(['close', 'paid'])

const paying = ref(false)
const payButton = ref(null)

const host = computed(() => {
  try {
    return new URL(props.gatewayUrl).host
  } catch {
    return 'checkout.honeycoin.app'
  }
})

watch(
  () => props.open,
  async (open) => {
    if (!open) {
      paying.value = false
      return
    }
    await nextTick()
    payButton.value?.focus()
  },
)

const pay = async () => {
  paying.value = true
  await new Promise((resolve) => setTimeout(resolve, 900))
  paying.value = false
  emit('paid')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Secure checkout"
        @keydown.esc="emit('close')"
      >
        <div class="w-full max-w-sm overflow-hidden rounded-panel border border-line bg-canvas">
          <div class="flex items-center justify-between gap-3 border-b border-line bg-mist px-4 py-3">
            <span class="flex items-center gap-2 text-sm font-medium text-ink">
              <Lock :size="15" :stroke-width="1.75" class="text-delivered" />
              {{ host }}
            </span>
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-control text-slate transition-colors hover:text-ink"
              aria-label="Cancel payment"
              @click="emit('close')"
            >
              <X :size="18" :stroke-width="1.75" />
            </button>
          </div>

          <div class="px-6 py-7">
            <p class="text-xs font-medium tracking-[0.16em] text-slate">PAYING</p>
            <p class="mt-3 font-display text-[40px] font-semibold leading-none text-ink tabular">
              {{ formatMoney(amount, currency) }}
            </p>
            <p class="mt-3 text-sm text-slate">
              To <span class="font-medium text-ink">{{ recipientName }}</span> via Kryptamo
            </p>

            <div class="mt-6 flex items-center gap-3 rounded-control border border-line bg-mist/60 px-4 py-3">
              <Smartphone :size="20" :stroke-width="1.5" class="text-slate" />
              <span class="text-sm font-medium text-ink">{{ network }}</span>
              <span class="ml-auto text-sm text-slate tabular">•••• 567</span>
            </div>

            <button
              ref="payButton"
              type="button"
              class="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-control bg-volta text-sm font-semibold text-white transition-all duration-150 hover:bg-volta-deep active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100"
              :disabled="paying"
              @click="pay"
            >
              {{ paying ? 'Confirming payment…' : `Pay ${formatMoney(amount, currency)}` }}
            </button>

            <button
              type="button"
              class="mt-3 h-11 w-full rounded-control text-sm font-medium text-slate transition-colors hover:text-ink"
              @click="emit('close')"
            >
              Cancel and return
            </button>
          </div>

          <p class="flex items-center justify-center gap-2 border-t border-line px-6 py-4 text-xs text-slate">
            <ShieldCheck :size="14" :stroke-width="1.5" class="text-delivered" />
            Payments are processed securely by HoneyCoin
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 160ms ease-out;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
