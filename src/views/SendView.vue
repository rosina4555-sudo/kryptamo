<script setup>
import { computed, ref, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { RefreshCw, Route, Search, Send, Smartphone } from 'lucide-vue-next'
import AppHeader from '../components/AppHeader.vue'
import PageMasthead from '../components/PageMasthead.vue'
import RecipientCard from '../components/RecipientCard.vue'
import QuoteSummary from '../components/QuoteSummary.vue'
import CheckoutModal from '../components/CheckoutModal.vue'
import FlagIcon from '../components/FlagIcon.vue'
import { formatMoney, currencySymbol } from '../utils/format'
import { countryByCode, sendCountries } from '../data/countries'
import { quotes, transfers, users } from '../api'

const router = useRouter()

const senderOptions = sendCountries()

const nextSteps = [
  { icon: Smartphone, title: 'You pay from your wallet', body: 'Approve the transfer from your own Mobile Money wallet — no card, no bank.' },
  { icon: RefreshCw, title: 'We buy stablecoins', body: 'Your local currency converts on a settlement rail you never see.' },
  { icon: Route, title: 'Routed across borders', body: 'Settlement lands in seconds, at the rate we locked for you.' },
  { icon: Send, title: 'Lands as Mobile Money', body: 'Their local currency arrives in their Mobile Money wallet, tracked step by step.' },
]

const handle = ref('')
const amount = ref('50000')
const senderCode = ref('NG')

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

const sender = computed(() => countryByCode(senderCode.value))
const currency = computed(() => sender.value?.currency ?? 'NGN')
const currencySymbolText = computed(() => currencySymbol(currency.value))
const targetCurrency = computed(() => recipient.value?.currency ?? 'GHS')

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
  if (!recipient.value) {
    quote.value = null
    return
  }
  quoteTimer = setTimeout(createQuote, 300)
}

const createQuote = async () => {
  if (!recipient.value) return
  const value = Number(amount.value)
  if (!Number.isFinite(value) || value <= 0) {
    quote.value = null
    return
  }
  try {
    quote.value = await quotes.create({
      recipient_username: recipient.value.username,
      amount: value,
      source_currency: currency.value,
      source_country: senderCode.value,
    })
    notice.value = ''
    scheduleExpiry()
  } catch (error) {
    quote.value = null
    notice.value = error?.error_code === 'LIMIT_EXCEEDED'
      ? 'That amount is above your daily limit. Try a smaller transfer.'
      : error?.message ?? ''
  }
}

const scheduleExpiry = () => {
  clearTimeout(expiryTimer)
  if (!quote.value) return
  const ms = new Date(quote.value.expires_at).getTime() - Date.now()
  expiryTimer = setTimeout(() => {
    quote.value = null
    notice.value = 'Your rate expired. We’ll refresh it — enter the amount again.'
  }, Math.max(0, ms))
}

const reconfirm = () => {
  notice.value = ''
  createQuote()
}

const onPay = async () => {
  if (!quote.value) return
  try {
    const result = await transfers.create({
      quote_id: quote.value.quote_id,
      payment_method: { type: 'mobile_money', network: sender.value?.networks?.[0] ?? 'Mobile Money' },
      idempotency_key: quote.value.quote_id,
    })
    createdTransfer.value = result
    checkoutOpen.value = true
  } catch (error) {
    if (error?.error_code === 'QUOTE_EXPIRED') {
      quote.value = null
      notice.value = error.message
    } else {
      notice.value = error?.message ?? 'We couldn’t start that transfer.'
    }
  }
}

const onCheckoutPaid = () => {
  checkoutOpen.value = false
  if (createdTransfer.value) router.push(`/transfers/${createdTransfer.value.transfer_id}`)
}

const selectSender = (code) => {
  senderCode.value = code
  if (recipient.value) scheduleQuote()
}

onUnmounted(() => {
  clearTimeout(lookupTimer)
  clearTimeout(quoteTimer)
  clearTimeout(expiryTimer)
})

const watchHandle = () => {
  clearTimeout(lookupTimer)
  const username = handle.value.trim()
  if (username.length < 3) {
    resetRecipient()
    return
  }
  lookupTimer = setTimeout(lookup, 300)
}

watch(handle, watchHandle)
</script>

<template>
  <div class="min-h-screen pb-16">
    <AppHeader />

    <PageMasthead
      eyebrow="SEND MONEY"
      title="Send money across Africa."
      subtitle="Type the recipient’s @username. We verify the name, lock the rate for five minutes, and move your Mobile Money straight into theirs — with no transfer fees."
    >
      <template #aside>
        <aside class="border-l-2 border-volta-tint/40 pl-5 md:w-64">
          <p class="text-xs font-medium tracking-[0.16em] text-white/45">DELIVERY</p>
          <p class="mt-3 font-display text-2xl font-semibold leading-tight text-white">
            Africa · Mobile Money
          </p>
          <p class="mt-3 flex items-center gap-2 text-sm text-white/60 tabular">
            <span class="h-1.5 w-1.5 rounded-[2px] bg-volta-tint" aria-hidden="true"></span>
            Mobile Money → Mobile Money
          </p>
        </aside>
      </template>
    </PageMasthead>

    <main class="mx-auto max-w-5xl px-6 sm:px-8 md:px-4">
      <div class="grid gap-12 py-14 md:grid-cols-[1fr_380px] md:items-start md:gap-12">
        <div class="space-y-12">
          <section>
            <p class="text-xs font-semibold tracking-[0.16em] text-volta">RECIPIENT</p>
            <h2 class="mt-3 font-display text-2xl font-semibold text-ink">Who are you sending to?</h2>
            <label for="handle" class="mt-5 block text-sm font-medium text-ink">Recipient username</label>
            <div class="mt-2 flex items-center gap-2 border-b-2 border-line pb-2 transition-colors focus-within:border-volta">
              <Search :size="18" :stroke-width="1.5" class="text-slate" aria-hidden="true" />
              <span class="font-display text-lg font-semibold text-slate">@</span>
              <input
                id="handle"
                v-model="handle"
                type="text"
                autocapitalize="none"
                spellcheck="false"
                autocomplete="off"
                class="h-10 w-full bg-transparent font-display text-lg text-ink outline-none placeholder:text-slate/60"
                placeholder="username"
                :aria-invalid="lookupState === 'error' || lookupState === 'notfound'"
                aria-describedby="handle-status"
                @input="handleInput"
              />
            </div>

            <p
              id="handle-status"
              class="mt-3 text-sm"
              :class="lookupState === 'notfound' || lookupState === 'error' ? 'text-alert' : 'text-slate'"
              aria-live="polite"
            >
              <template v-if="lookupState === 'loading'">Checking @{{ handle }} with Mobile Money…</template>
              <template v-else-if="lookupState === 'notfound' || lookupState === 'error'">{{ lookupError }}</template>
              <template v-else-if="lookupState === 'found'">Verified Mobile Money account.</template>
            </p>

            <RecipientCard v-if="recipient" class="mt-5" :recipient="recipient" />
          </section>

          <section>
            <p class="text-xs font-semibold tracking-[0.16em] text-volta">AMOUNT</p>
            <h2 class="mt-3 font-display text-2xl font-semibold text-ink">How much are you sending?</h2>

            <fieldset class="mt-5">
              <legend class="text-sm font-medium text-ink">Send from</legend>
              <div class="mt-2 flex flex-wrap gap-2">
                <button
                  v-for="option in senderOptions"
                  :key="option.code"
                  type="button"
                  class="inline-flex items-center gap-2 rounded-control border-2 px-3 py-2 text-sm font-medium transition-colors"
                  :class="senderCode === option.code ? 'border-volta bg-volta-tint/50 text-ink' : 'border-line bg-canvas text-slate hover:border-slate'"
                  :aria-pressed="senderCode === option.code"
                  @click="selectSender(option.code)"
                >
                  <FlagIcon :code="option.code" class="h-4 w-6 rounded-[2px] ring-1 ring-black/5" />
                  {{ option.name }}
                </button>
              </div>
            </fieldset>

            <label for="amount" class="mt-6 block text-sm font-medium text-ink">Amount in {{ currency }}</label>
            <div class="mt-2 flex items-end gap-3 border-b-2 border-line pb-2 transition-colors focus-within:border-volta">
              <span class="font-display text-3xl font-semibold leading-none text-slate">{{ currencySymbolText }}</span>
              <input
                id="amount"
                v-model="amount"
                inputmode="decimal"
                class="h-12 w-full bg-transparent font-display text-4xl font-semibold leading-none text-ink outline-none tabular"
              />
            </div>

            <p v-if="quote" class="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-base text-ink">
              <span class="h-1.5 w-1.5 rounded-[2px] bg-delivered" aria-hidden="true"></span>
              {{ recipient.account_name }} receives
              <span class="font-display text-xl font-semibold text-ink tabular">
                {{ formatMoney(quote.recipient_gets, targetCurrency) }}
              </span>
            </p>
          </section>

          <section>
            <p class="text-xs font-semibold tracking-[0.16em] text-volta">PAY WITH</p>
            <h2 class="mt-3 font-display text-2xl font-semibold text-ink">Your Mobile Money wallet.</h2>

            <div class="mt-5 flex items-center gap-4 rounded-panel border border-line bg-canvas px-4 py-4">
              <FlagIcon :code="senderCode" class="h-7 w-10 rounded-[3px] ring-1 ring-line" />
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-ink">{{ sender.networks[0] }} · {{ sender.name }}</p>
                <p class="mt-0.5 text-xs text-slate tabular">+{{ sender.dial }} •• •••• ·····</p>
              </div>
              <span class="hidden text-xs font-medium tracking-[0.16em] text-slate sm:block">WALLET</span>
            </div>
          </section>

          <p v-if="notice" class="flex items-center justify-between gap-3 rounded-panel border border-notice-text/25 bg-notice-bg px-4 py-3 text-sm text-notice-text">
            {{ notice }}
            <button
              v-if="!quote && recipient"
              type="button"
              class="shrink-0 font-medium underline decoration-notice-text/50 underline-offset-2"
              @click="reconfirm"
            >
              Refresh
            </button>
          </p>
        </div>

        <div class="md:sticky md:top-24">
          <QuoteSummary
            v-if="quote"
            :send-amount="Number(quote.send_amount)"
            :fees="Number(quote.platform_fee) + Number(quote.network_fee)"
            :rate="Number(quote.fx_rate)"
            :currency="currency"
            :target-currency="targetCurrency"
            :expires-at="new Date(quote.expires_at).getTime()"
            :recipient-name="recipient.account_name"
            :network="recipient.momo_details.network"
            :sender-name="`${sender.networks[0]} wallet`"
            @pay="onPay"
          />

          <aside v-else class="rounded-panel border border-line bg-canvas p-6">
            <p class="flex items-center gap-2.5 text-xs font-semibold tracking-[0.16em] text-slate">
              <span class="h-1.5 w-1.5 rounded-[2px] bg-volta" aria-hidden="true"></span>
              NO TRANSFER FEES
            </p>
            <p class="mt-4 font-display text-xl font-semibold text-ink">Review appears here</p>
            <p class="mt-2 text-sm leading-6 text-slate">
              Enter a verified username and an amount. We lock the rate, keep it free, and show the exact
              amount that lands in their Mobile Money wallet.
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
              <stop offset="60%" stop-color="#2E7C8A" stop-opacity="0.4" />
              <stop offset="100%" stop-color="#E3A21A" stop-opacity="0.16" />
            </linearGradient>
          </defs>
          <rect width="1200" height="520" fill="url(#send-steps-glow)" />
          <g fill="none" stroke="rgba(214,230,233,0.06)" stroke-width="1">
            <circle v-for="r in [90, 164, 238, 312, 386]" :key="r" cx="1200" cy="40" :r="r" />
          </g>
        </svg>

        <div class="relative">
          <p class="flex items-center gap-2.5 text-xs font-medium tracking-[0.16em] text-white/55">
            <span class="h-1.5 w-1.5 rounded-[2px] bg-volta-tint" aria-hidden="true"></span>
            WHAT HAPPENS NEXT
          </p>
          <h2 class="mt-4 max-w-xl font-display text-3xl font-semibold text-white sm:text-4xl">
            Four steps from wallet to wallet.
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
      :network="sender.networks[0]"
      @close="checkoutOpen = false"
      @paid="onCheckoutPaid"
    />
  </div>
</template>
