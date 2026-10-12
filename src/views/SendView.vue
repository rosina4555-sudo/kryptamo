<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { CreditCard, RefreshCw, Route, Search, Smartphone } from 'lucide-vue-next'
import AppHeader from '../components/AppHeader.vue'
import PageMasthead from '../components/PageMasthead.vue'
import RecipientCard from '../components/RecipientCard.vue'
import QuoteSummary from '../components/QuoteSummary.vue'
import CheckoutModal from '../components/CheckoutModal.vue'
import { formatMoney } from '../utils/format'
import { quotes, transfers, users } from '../api'

const router = useRouter()

const corridors = [
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'CAD', label: 'Canadian dollar', symbol: 'C$' },
  { code: 'GBP', label: 'British pound', symbol: '£' },
]

const nextSteps = [
  { icon: CreditCard, title: 'You pay your card', body: 'The total, fees included, is shown before you confirm — nothing appears later.' },
  { icon: RefreshCw, title: 'We buy stablecoins', body: 'Your fiat converts on a settlement rail you never see.' },
  { icon: Route, title: 'Routed on-chain', body: 'Settlement lands in seconds, at the rate we locked for you.' },
  { icon: Smartphone, title: 'Lands as cedis', body: 'GHS arrives in their Mobile Money wallet. You watch every step.' },
]

const handle = ref('')
const amount = ref('50')
const currency = ref('USD')

const lookupState = ref('idle')
const lookupError = ref('')
const recipient = ref(null)

const quote = ref(null)
const notice = ref('')

const checkoutOpen = ref(false)
const createdTransfer = ref(null)

let lookupTimer
let quoteTimer
let expiryTimer

const currencySymbol = computed(() => corridors.find((c) => c.code === currency.value)?.symbol ?? '$')

const handleInput = () => {
  handle.value = handle.value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

const resetRecipient = () => {
  recipient.value = null
  quote.value = null
  lookupState.value = 'idle'
  lookupError.value = ''
  notice.value = ''
}

const lookup = async () => {
  const username = handle.value.trim()
  clearTimeout(quoteTimer)
  if (!username) {
    resetRecipient()
    return
  }
  lookupState.value = 'loading'
  lookupError.value = ''
  try {
    const found = await users.lookup(username)
    if (handle.value.trim() !== username) return
    recipient.value = { ...found, account_name: found.account_name ?? found.momo_details?.account_name }
    lookupState.value = 'found'
    scheduleQuote()
  } catch (error) {
    recipient.value = null
    quote.value = null
    lookupState.value = error?.error_code === 'USER_NOT_FOUND' ? 'notfound' : 'error'
    lookupError.value = error?.message ?? 'We couldn’t check that username.'
  }
}

const scheduleQuote = () => {
  clearTimeout(quoteTimer)
  if (!recipient.value || !(Number(amount.value) > 0)) {
    quote.value = null
    return
  }
  quoteTimer = setTimeout(fetchQuote, 500)
}

const fetchQuote = async () => {
  if (!recipient.value || !(Number(amount.value) > 0)) return
  notice.value = ''
  try {
    quote.value = await quotes.create({
      recipient_username: recipient.value.username,
      amount: Number(amount.value),
      source_currency: currency.value,
      target_currency: 'GHS',
    })
    scheduleExpiry()
  } catch (error) {
    quote.value = null
    if (error?.error_code !== 'QUOTE_EXPIRED') notice.value = error?.message ?? ''
  }
}

const scheduleExpiry = () => {
  clearTimeout(expiryTimer)
  if (!quote.value) return
  const remaining = new Date(quote.value.expires_at).getTime() - Date.now()
  if (remaining > 0) expiryTimer = setTimeout(fetchQuote, remaining + 250)
}

watch(handle, () => {
  clearTimeout(lookupTimer)
  const username = handle.value.trim()
  if (username.length < 3) {
    resetRecipient()
    return
  }
  lookupTimer = setTimeout(lookup, 450)
})

watch(amount, scheduleQuote)
watch(currency, scheduleQuote)

const sendAmount = computed(() => Number(quote.value?.send_amount ?? amount.value) || 0)
const fees = computed(() =>
  quote.value ? Number(quote.value.platform_fee) + Number(quote.value.network_fee) : 0,
)
const rate = computed(() => Number(quote.value?.fx_rate ?? 0))
const recipientGets = computed(() => (sendAmount.value * rate.value).toFixed(2))
const expiresAt = computed(() =>
  quote.value ? new Date(quote.value.expires_at).getTime() : Date.now(),
)

const onPay = async () => {
  if (!quote.value || !recipient.value) return
  notice.value = ''
  try {
    const idempotency_key = globalThis.crypto?.randomUUID?.() ?? `idem_${Date.now()}`
    const result = await transfers.create({
      quote_id: quote.value.quote_id,
      payment_method: { type: 'card', last4: '4242' },
      idempotency_key,
    })
    createdTransfer.value = result
    checkoutOpen.value = true
  } catch (error) {
    if (error?.error_code === 'QUOTE_EXPIRED') {
      notice.value = error.message
      fetchQuote()
    } else {
      notice.value = error?.message ?? 'We couldn’t start this transfer.'
    }
  }
}

const onCheckoutPaid = () => {
  checkoutOpen.value = false
  if (createdTransfer.value) router.push(`/transfers/${createdTransfer.value.transfer_id}`)
}

onUnmounted(() => {
  clearTimeout(lookupTimer)
  clearTimeout(quoteTimer)
  clearTimeout(expiryTimer)
})
</script>

<template>
  <div class="min-h-screen pb-16">
    <AppHeader />

    <PageMasthead
      eyebrow="SEND MONEY"
      title="Who are you sending to?"
      subtitle="Type a @username. We verify the name behind it against Mobile Money, lock your rate for five minutes, and pay the cedis straight to their wallet."
    >
      <template #aside>
        <aside class="border-l-2 border-volta-tint/40 pl-5 md:w-64">
          <p class="text-xs font-medium tracking-[0.16em] text-white/45">DELIVERY</p>
          <p class="mt-3 font-display text-2xl font-semibold leading-tight text-white">
            Ghana · Mobile Money
          </p>
          <p class="mt-3 flex items-center gap-2 text-sm text-white/60 tabular">
            <span class="h-1.5 w-1.5 rounded-[2px] bg-volta-tint" aria-hidden="true"></span>
            US · Canada · UK → GHS
          </p>
        </aside>
      </template>
    </PageMasthead>

    <main class="mx-auto max-w-5xl px-4">
      <div class="grid gap-10 py-12 md:grid-cols-[1fr_380px] md:items-start md:gap-12">
        <section aria-label="Send form" class="space-y-12">
          <section aria-labelledby="recipient-label">
            <div class="flex items-center gap-2.5">
              <span class="font-display text-sm font-semibold text-volta tabular">01</span>
              <span class="text-xs font-medium tracking-[0.16em] text-slate">RECIPIENT</span>
            </div>
            <h2 id="recipient-label" class="mt-3 font-display text-2xl font-semibold text-ink">
              Who are you sending to?
            </h2>

            <div
              class="mt-5 flex items-center border-b-2 bg-transparent pb-2 transition-colors focus-within:border-volta"
              :class="lookupState === 'notfound' || lookupState === 'error' ? 'border-alert' : lookupState === 'found' ? 'border-delivered' : 'border-line'"
            >
              <Search :size="20" :stroke-width="1.5" class="mr-3 shrink-0 text-slate" aria-hidden="true" />
              <span class="mr-0.5 font-display text-xl font-semibold text-slate">@</span>
              <input
                id="handle"
                v-model="handle"
                type="text"
                autocapitalize="none"
                spellcheck="false"
                class="h-11 w-full bg-transparent font-display text-xl text-ink outline-none placeholder:font-ui placeholder:text-base placeholder:font-normal placeholder:text-slate"
                placeholder="username"
                :aria-invalid="lookupState === 'notfound' || lookupState === 'error'"
                @input="handleInput"
              />
            </div>

            <p v-if="lookupState === 'loading'" class="mt-3 flex items-center gap-2 text-sm text-slate">
              <span class="h-3 w-3 animate-spin rounded-full border border-slate border-t-transparent" aria-hidden="true"></span>
              Checking @{{ handle }} with Mobile Money…
            </p>
            <p
              v-else-if="lookupState === 'notfound' || lookupState === 'error'"
              class="mt-3 text-sm text-alert"
            >
              {{ lookupError }}
            </p>

            <RecipientCard v-if="recipient" class="mt-5" :recipient="recipient" />
          </section>

          <section aria-labelledby="amount-label">
            <div class="flex items-center gap-2.5">
              <span class="font-display text-sm font-semibold text-volta tabular">02</span>
              <span class="text-xs font-medium tracking-[0.16em] text-slate">AMOUNT</span>
            </div>
            <h2 id="amount-label" class="mt-3 font-display text-2xl font-semibold text-ink">
              How much are you sending?
            </h2>


            <div class="mt-5 flex flex-wrap gap-2" role="group" aria-label="Send currency">
              <button
                v-for="c in corridors"
                :key="c.code"
                type="button"
                class="flex-1 rounded-control border-2 px-3 py-2.5 text-left transition-colors"
                :class="currency === c.code ? 'border-volta bg-volta-tint/50' : 'border-line bg-canvas hover:border-slate'"
                :aria-pressed="currency === c.code"
                @click="currency = c.code"
              >
                <span class="block font-display text-base font-semibold text-ink">{{ c.code }}</span>
                <span class="mt-0.5 block text-xs text-slate">{{ c.label }}</span>
              </button>
            </div>

            <div class="mt-5 flex items-end gap-3 border-b-2 border-line pb-2 transition-colors focus-within:border-volta">
              <span class="font-display text-3xl font-semibold leading-none text-slate">{{ currencySymbol }}</span>
              <input
                id="amount"
                v-model="amount"
                inputmode="decimal"
                class="h-12 w-full bg-transparent font-display text-4xl font-semibold leading-none text-ink outline-none tabular"
                aria-label="Amount to send"
              />
            </div>

            <p v-if="quote" class="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-base text-ink">
              <span class="h-1.5 w-1.5 rounded-[2px] bg-delivered" aria-hidden="true"></span>
              {{ recipient.account_name }} receives
              <span class="font-display text-xl font-semibold text-ink tabular">
                {{ formatMoney(recipientGets, 'GHS') }}
              </span>
            </p>
          </section>

          <section aria-labelledby="pay-label">
            <div class="flex items-center gap-2.5">
              <span class="font-display text-sm font-semibold text-volta tabular">03</span>
              <span class="text-xs font-medium tracking-[0.16em] text-slate">PAY WITH</span>
            </div>
            <h2 id="pay-label" class="mt-3 font-display text-2xl font-semibold text-ink">
              Pay with your card.
            </h2>

            <div class="mt-5 flex items-center gap-4 rounded-panel border border-line bg-canvas px-4 py-4">
              <span class="flex h-9 w-12 items-center justify-center rounded-control border border-line bg-mist text-xs font-semibold tracking-[0.08em] text-ink">
                VISA
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-ink tabular">•••• •••• •••• 4242</p>
                <p class="mt-0.5 text-xs text-slate">Expires 04/28</p>
              </div>
              <span class="hidden text-xs font-medium tracking-[0.16em] text-slate sm:block">SAVED CARD</span>
            </div>
          </section>

          <p v-if="notice" class="rounded-panel border border-notice-text/25 bg-notice-bg px-4 py-3 text-sm text-notice-text">
            {{ notice }}
          </p>
        </section>

        <div class="md:sticky md:top-24">
          <QuoteSummary
            v-if="quote"
            :send-amount="sendAmount"
            :fees="fees"
            :rate="rate"
            :currency="currency"
            :expires-at="expiresAt"
            :recipient-name="recipient.account_name"
            :network="recipient.momo_details.network"
            :platform-fee="Number(quote.platform_fee)"
            :network-fee="Number(quote.network_fee)"
            @pay="onPay"
          />

          <aside v-else class="rounded-panel border border-line bg-canvas p-6">
            <div class="flex items-center gap-2.5">
              <span class="h-1.5 w-1.5 rounded-[2px] bg-volta" aria-hidden="true"></span>
              <span class="text-xs font-medium tracking-[0.16em] text-slate">REVIEW</span>
            </div>
            <p class="mt-4 font-display text-xl font-semibold text-ink">Your review appears here</p>
            <p class="mt-2 text-sm leading-6 text-slate">
              Enter a verified username and an amount. We lock the rate, show both fees, and the exact
              cedis that land in Ghana.
            </p>
          </aside>
        </div>
      </div>

      <section class="relative mb-4 overflow-hidden rounded-sheet bg-ink px-6 py-14 text-white sm:px-10 md:px-12 md:py-16">
        <svg
          class="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 1200 520"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="send-steps-glow" cx="86%" cy="4%" r="68%">
              <stop offset="0%" stop-color="#2E7C8A" stop-opacity="0.45" />
              <stop offset="100%" stop-color="#0B3A43" stop-opacity="0" />
            </radialGradient>
            <linearGradient id="send-steps-beam" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#0F4C57" stop-opacity="0" />
              <stop offset="60%" stop-color="#2E7C8A" stop-opacity="0.35" />
              <stop offset="100%" stop-color="#E3A21A" stop-opacity="0.16" />
            </linearGradient>
          </defs>
          <rect width="1200" height="520" fill="url(#send-steps-glow)" />
          <path
            d="M-60 400 C120 400 120 456 300 456 C480 456 480 400 660 400 C840 400 840 344 1020 344 C1200 344 1200 400 1380 400 C1560 400 1560 344 1740 344"
            fill="none"
            stroke="url(#send-steps-beam)"
            stroke-width="1.25"
          />
        </svg>

        <div class="relative">
          <div class="flex items-center gap-2.5">
            <span class="h-1.5 w-1.5 rounded-[2px] bg-volta-tint" aria-hidden="true"></span>
            <span class="text-xs font-medium tracking-[0.16em] text-white/55">WHAT HAPPENS NEXT</span>
          </div>
          <h2 class="mt-4 max-w-xl font-display text-3xl font-semibold text-white sm:text-4xl">
            Four steps from your card to their wallet.
          </h2>

          <div class="mt-10 grid gap-8 border-t-2 border-white/15 pt-8 sm:grid-cols-2 md:grid-cols-4">
            <div v-for="(step, i) in nextSteps" :key="step.title" class="flex flex-col">
              <span class="font-display text-sm font-semibold text-volta-tint tabular">
                {{ String(i + 1).padStart(2, '0') }}
              </span>
              <span class="mt-4 flex h-10 w-10 items-center justify-center rounded-control bg-white/10 text-volta-tint">
                <component :is="step.icon" :size="20" :stroke-width="1.5" />
              </span>
              <p class="mt-4 font-display text-lg font-semibold text-white">{{ step.title }}</p>
              <p class="mt-2 text-sm leading-6 text-white/65">{{ step.body }}</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <CheckoutModal
      :open="checkoutOpen"
      :gateway-url="createdTransfer?.payment_gateway_url ?? ''"
      :amount="Number(quote?.total_payable ?? 0)"
      :currency="currency"
      :recipient-name="recipient?.account_name ?? ''"
      @close="checkoutOpen = false"
      @paid="onCheckoutPaid"
    />
  </div>
</template>
