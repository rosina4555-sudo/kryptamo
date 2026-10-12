<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Banknote, Building2, Lock, Radio, TrendingUp } from 'lucide-vue-next'
import RecipientCard from '../components/RecipientCard.vue'
import QuoteSummary from '../components/QuoteSummary.vue'
import TransferTracker from '../components/TransferTracker.vue'
import RateChart from '../components/RateChart.vue'
import { formatMoney } from '../utils/format'

const router = useRouter()

const recipient = {
  username: 'kwame',
  account_name: 'KWAME A. MENSAH',
  phone_number_masked: '+233 24 **** 567',
  momo_details: { network: 'MTN' },
}

const fees = 2.0
const platformFee = 1.5
const networkFee = 0.5
const rate = 15.6
const expiresAt = Date.now() + 5 * 60_000

const ticker = ref(rate)
let tickerTimer

const trackerSteps = [
  { label: 'Payment received', time: '2:35 pm' },
  { label: 'Preparing your transfer', time: '2:36 pm' },
  { label: 'Sending to MTN Mobile Money', time: 'now' },
  { label: 'Delivered', time: '' },
]
const trackerIndex = ref(1)
let trackerTimer

onMounted(() => {
  tickerTimer = setInterval(() => {
    const drift = (Math.random() - 0.5) * 0.002
    ticker.value = Math.min(15.7, Math.max(15.5, ticker.value + drift))
  }, 4000)
  trackerTimer = setInterval(() => {
    if (trackerIndex.value < trackerSteps.length - 1) trackerIndex.value += 1
  }, 4000)
})
onUnmounted(() => {
  clearInterval(tickerTimer)
  clearInterval(trackerTimer)
})

const goToSend = () => router.push('/send')
</script>

<template>
  <div class="min-h-screen">
    <header class="sticky top-0 z-20 border-b border-line bg-mist/95">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <span class="flex items-center gap-2.5">
          <img src="/kryptamo.png" alt="Kryptamo logo" class="h-9 w-auto" />
          <span class="font-display text-xl font-semibold text-ink">Kryptamo</span>
        </span>
        <nav class="flex items-center gap-6" aria-label="Primary">
          <RouterLink to="/send" class="text-sm font-medium text-ink transition-colors hover:text-volta">
            Send money
          </RouterLink>
          <a href="#rates" class="hidden text-sm font-medium text-ink transition-colors hover:text-volta sm:block">
            Today's rate
          </a>
          <RouterLink
            to="/send"
            class="inline-flex h-10 items-center rounded-control bg-volta px-4 text-sm font-medium text-white transition-colors hover:bg-volta-deep"
          >
            Sign in
          </RouterLink>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4">
      <section class="relative overflow-hidden rounded-sheet bg-ink px-6 py-10 sm:px-10 md:px-12 md:py-16">
        <div class="absolute bottom-0 left-0 right-0 h-40 opacity-80" aria-hidden="true">
          <RateChart />
        </div>

        <div class="relative grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <p class="flex items-center gap-2 text-sm text-white/70 tabular">
              <span class="relative flex h-2 w-2">
                <span
                  class="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-40 motion-reduce:animate-none"
                ></span>
                <span class="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
              </span>
              Live · 1 USD = <span class="font-semibold text-white">{{ ticker.toFixed(4) }}</span> GHS
            </p>

            <h1 class="mt-6 font-display text-[40px] font-semibold leading-[1.05] text-white sm:text-[56px]">
              Send money to a person in Ghana.
            </h1>
            <p class="mt-6 max-w-md text-lg leading-7 text-white/70">
              Type a @username. We verify the name behind it against Mobile Money, lock the rate for five
              minutes, and pay the GHS straight to their account.
            </p>

            <div class="mt-8 flex flex-wrap items-center gap-4">
              <RouterLink
                to="/send"
                class="inline-flex h-12 items-center rounded-control bg-volta px-6 text-sm font-medium text-white transition-colors hover:bg-volta-deep"
              >
                Send money
              </RouterLink>
              <a
                href="#rates"
                class="inline-flex h-12 items-center rounded-control border border-white/25 px-6 text-sm font-medium text-white transition-colors hover:border-white/50"
              >
                Today's rate
              </a>
            </div>
          </div>

          <div class="relative">
            <div class="absolute right-4 top-4 hidden h-[calc(100%-1rem)] w-full rounded-panel bg-white/10 md:block" aria-hidden="true"></div>
            <div class="relative space-y-4">
              <RecipientCard :recipient="recipient" />
              <QuoteSummary
                :send-amount="50"
                :fees="fees"
                :rate="rate"
                :expires-at="expiresAt"
                :recipient-name="recipient.account_name"
                :platform-fee="platformFee"
                :network-fee="networkFee"
                @pay="goToSend"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="rates" class="grid border-b border-line md:grid-cols-2">
        <div class="border-b border-line py-10 md:border-b-0 md:py-14">
          <p class="flex items-center gap-2 text-sm text-slate">
            <TrendingUp :size="16" :stroke-width="1.5" class="text-volta" />
            Live rate
          </p>
          <p class="mt-3 font-ui text-5xl font-semibold leading-none text-ink tabular">
            {{ ticker.toFixed(4) }}
          </p>
          <p class="mt-3 text-sm text-slate tabular">USD → GHS · moves by the minute, shown before you pay</p>
        </div>
        <div class="py-10 md:border-l md:border-line md:px-12 md:py-14">
          <p class="flex items-center gap-2 text-sm text-slate">
            <Lock :size="16" :stroke-width="1.5" class="text-volta" />
            Locked at quote
          </p>
          <p class="mt-3 font-ui text-5xl font-semibold leading-none text-volta tabular">
            {{ rate.toFixed(4) }}
          </p>
          <p class="mt-3 text-sm text-slate">Quoted rates hold for five minutes. Refresh only if it expires.</p>
        </div>
      </section>

      <section class="grid gap-10 border-b border-line py-16 md:grid-cols-[1fr_360px] md:gap-16">
        <div>
          <h2 class="font-display text-3xl font-semibold text-ink">Every transfer follows the same track.</h2>
          <p class="mt-3 max-w-md text-sm leading-6 text-slate">
            You see four human steps. The system behind them keeps the buttons honest.
          </p>
          <div class="mt-8 rounded-panel border border-line bg-canvas p-6">
            <TransferTracker :steps="trackerSteps" :current-index="trackerIndex" />
          </div>
        </div>

        <div aria-label="Cost breakdown">
          <h2 class="font-display text-3xl font-semibold text-ink">What it costs.</h2>
          <dl class="mt-6 border-t border-line text-sm">
            <div class="flex items-center gap-3 border-b border-line py-3">
              <Building2 :size="16" :stroke-width="1.5" class="text-slate" />
              <dt class="flex-1 text-slate">Platform fee</dt>
              <dd class="font-medium text-ink tabular">{{ formatMoney(platformFee, 'USD') }}</dd>
            </div>
            <div class="flex items-center gap-3 border-b border-line py-3">
              <Radio :size="16" :stroke-width="1.5" class="text-slate" />
              <dt class="flex-1 text-slate">Network fee</dt>
              <dd class="font-medium text-ink tabular">{{ formatMoney(networkFee, 'USD') }}</dd>
            </div>
            <div class="flex items-center gap-3 py-3">
              <Banknote :size="16" :stroke-width="1.5" class="text-volta" />
              <dt class="flex-1 font-medium text-ink">Total to pay</dt>
              <dd class="font-semibold text-ink tabular">{{ formatMoney(fees, 'USD') }}</dd>
            </div>
          </dl>
          <p class="mt-4 text-xs leading-5 text-slate">
            Both fees sit in the summary from the start. Nothing appears at the last step.
          </p>
        </div>
      </section>

      <section class="py-16 text-center md:py-20">
        <p class="font-display text-3xl font-semibold text-ink">A name in Ghana, a rate you keep, on one screen.</p>
        <div class="mt-8">
          <RouterLink
            to="/send"
            class="inline-flex h-12 items-center rounded-control bg-volta px-6 text-sm font-medium text-white transition-colors hover:bg-volta-deep"
          >
            Send your first transfer
          </RouterLink>
        </div>
      </section>
    </main>

    <footer class="border-t border-line">
      <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6">
        <span class="flex items-center gap-2.5">
          <img src="/kryptamo.png" alt="Kryptamo logo" class="h-8 w-auto" />
          <span class="font-display text-sm font-semibold text-ink">Kryptamo</span>
        </span>
        <p class="text-xs text-slate tabular">USD → GHS · Remittances to Ghana</p>
      </div>
    </footer>
  </div>
</template>