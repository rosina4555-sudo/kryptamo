<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Banknote, Building2, Radio } from 'lucide-vue-next'
import MapCorridor from '../components/MapCorridor.vue'
import TransferTracker from '../components/TransferTracker.vue'
import RateChart from '../components/RateChart.vue'
import RateSelector from '../components/RateSelector.vue'
import { formatMoney, formatRate } from '../utils/format'
import { corridorRate } from '../data/countries'

const fees = 0
const platformFee = 0
const networkFee = 0

const corridors = [
  { from: 'NGN', to: 'GHS' },
  { from: 'KES', to: 'GHS' },
  { from: 'GHS', to: 'NGN' },
  { from: 'XOF', to: 'GHS' },
  { from: 'GHS', to: 'KES' },
]

const liveRates = corridors.map(({ from, to }) => ({
  code: from,
  target: to,
  rate: corridorRate(from, to),
}))

const footerWave =
  'M-120 380 C0 380 0 440 120 440 C240 440 240 380 360 380 C480 380 480 320 600 320 C720 320 720 380 840 380 C960 380 960 440 1080 440 C1200 440 1200 380 1320 380 C1440 380 1440 320 1560 320'

const rings = Array.from({ length: 12 }, (_, i) => 90 + i * 74)

const liveIndex = ref(0)
const liveRate = computed(() => liveRates[liveIndex.value])
let tickerTimer

const trackerSteps = [
  { label: 'Payment approved', time: '2:35 pm', icon: 'wallet' },
  { label: 'Buying stablecoins', time: '2:36 pm', icon: 'convert' },
  { label: 'Sending to Mobile Money', time: 'now', icon: 'route' },
  { label: 'Delivered', time: '', icon: 'delivered' },
]
const trackerIndex = ref(1)
let trackerTimer

onMounted(() => {
  tickerTimer = setInterval(() => {
    liveIndex.value = (liveIndex.value + 1) % liveRates.length
  }, 4000)
  trackerTimer = setInterval(() => {
    trackerIndex.value = trackerIndex.value < trackerSteps.length - 1 ? trackerIndex.value + 1 : 0
  }, 4000)
})
onUnmounted(() => {
  clearInterval(tickerTimer)
  clearInterval(trackerTimer)
})
</script>

<template>
  <div class="min-h-screen">
    <header class="sticky top-0 z-20 border-b border-line bg-mist/95">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10 md:px-12">
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
            to="/signin"
            class="inline-flex h-10 items-center rounded-control bg-volta px-4 text-sm font-medium text-white transition-colors hover:bg-volta-deep"
          >
            Sign in
          </RouterLink>
        </nav>
      </div>
    </header>

    <main>
      <section class="relative overflow-hidden bg-ink">
        <div
          class="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 md:inset-y-0 md:left-auto md:right-0 md:h-full md:w-[58%]"
          aria-hidden="true"
        >
          <img src="/hero-city.webp" alt="" class="h-full w-full object-cover" />
          <div
            class="absolute inset-0 bg-gradient-to-b from-ink via-ink/35 to-ink/75 md:bg-gradient-to-r md:from-ink md:via-ink/50 md:to-transparent"
          ></div>
        </div>

        <div class="absolute bottom-0 left-0 right-0 h-40 opacity-70" aria-hidden="true">
          <RateChart />
        </div>

        <div
          class="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-mist to-transparent md:h-28"
          aria-hidden="true"
        ></div>

        <div class="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pt-10 pb-24 sm:px-10 md:grid-cols-2 md:gap-16 md:px-12 md:pt-16 md:pb-28">
          <div>
            <p class="flex items-center gap-2.5 text-sm text-white/70 tabular">
              <span class="h-1.5 w-1.5 rounded-[2px] bg-white"></span>
              <span class="text-xs font-medium tracking-[0.16em] text-white/50">LIVE</span>
              <span class="h-3.5 w-px bg-white/20"></span>
              1 {{ liveRate.code }} =
              <span class="font-semibold text-white">{{ formatRate(liveRate.rate) }}</span> {{ liveRate.target }}
            </p>

            <h1 class="mt-6 font-display text-[40px] font-semibold leading-[1.05] text-white sm:text-[56px]">
              Send money across Africa.
            </h1>
            <p class="mt-6 max-w-md text-lg leading-7 text-white/70">
              Type a @username. We verify the name behind it against Mobile Money, lock the rate for five
              minutes, and pay straight into their wallet — with no transfer fees.
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
        </div>
      </section>

      <section id="rates" class="border-b border-line">
        <div
          class="mx-auto grid max-w-7xl gap-12 px-6 py-14 sm:px-10 md:grid-cols-2 md:items-center md:gap-16 md:px-12 md:py-20"
        >
        <div>
          <p class="flex items-center gap-2.5">
            <span class="h-1.5 w-1.5 rounded-[2px] bg-volta"></span>
            <span class="text-xs font-medium tracking-[0.16em] text-slate">CONVERT</span>
          </p>
          <h2 class="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl">
            See what they receive before you send.
          </h2>
          <p class="mt-4 max-w-md text-base leading-7 text-slate">
            Choose where you are sending from and how much. We show the rate and exactly what lands in their
            Mobile Money wallet — before you approve.
          </p>
          <ul class="mt-8 space-y-3.5 border-t border-line pt-6">
            <li class="flex items-center gap-3 text-sm font-medium text-ink">
              <span class="h-1.5 w-1.5 rounded-[2px] bg-volta"></span>
              No transfer fees, ever
            </li>
            <li class="flex items-center gap-3 text-sm font-medium text-ink">
              <span class="h-1.5 w-1.5 rounded-[2px] bg-volta"></span>
              Rate locked for five minutes
            </li>
            <li class="flex items-center gap-3 text-sm font-medium text-ink">
              <span class="h-1.5 w-1.5 rounded-[2px] bg-volta"></span>
              Mobile Money on both sides
            </li>
          </ul>
        </div>

        <RateSelector />
        </div>
      </section>

      <div class="relative overflow-hidden bg-ink text-white">
        <svg
          class="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="steps-glow" cx="84%" cy="6%" r="72%">
              <stop offset="0%" stop-color="#2E7C8A" stop-opacity="0.5" />
              <stop offset="100%" stop-color="#0B3A43" stop-opacity="0" />
            </radialGradient>
            <linearGradient id="steps-beam" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#0F4C57" stop-opacity="0" />
              <stop offset="55%" stop-color="#2E7C8A" stop-opacity="0.4" />
              <stop offset="100%" stop-color="#E3A21A" stop-opacity="0.16" />
            </linearGradient>
          </defs>
          <rect width="1440" height="900" fill="url(#steps-glow)" />
          <g fill="none" stroke="rgba(214,230,233,0.06)" stroke-width="1">
            <circle v-for="r in rings" :key="r" cx="1200" cy="40" :r="r" />
          </g>
          <g fill="none" stroke="url(#steps-beam)" stroke-width="1.25">
            <path :d="footerWave" transform="translate(0 500)" opacity="0.5" />
            <path :d="footerWave" transform="translate(0 560)" opacity="0.32" />
            <path :d="footerWave" transform="translate(0 620)" opacity="0.2" />
          </g>
        </svg>

        <section class="relative">
          <div class="mx-auto grid max-w-7xl gap-6 px-6 py-16 sm:px-10 md:grid-cols-[1.4fr_1fr] md:items-end md:gap-16 md:px-12 md:py-20">
            <div>
              <p class="flex items-center gap-2.5">
                <span class="h-1.5 w-1.5 rounded-[2px] bg-volta-tint"></span>
                <span class="text-xs font-medium tracking-[0.16em] text-white/60">HOW IT WORKS</span>
              </p>
              <h2 class="mt-4 font-display text-3xl font-semibold text-white sm:text-4xl">
                Every transfer follows the same track.
              </h2>
            </div>
            <p class="text-base font-medium leading-7 text-white/75">
              You see four honest steps — payment, conversion, routing and payout. The system behind
              them keeps the buttons honest, and your rate holds while you decide.
            </p>
          </div>

          <div class="mt-14">
            <TransferTracker :steps="trackerSteps" :current-index="trackerIndex" tone="dark" />
          </div>
        </section>

        <section id="costs" class="relative border-t border-white/10">
          <div class="mx-auto max-w-7xl px-6 py-16 sm:px-10 md:px-12 md:py-20">
          <div class="max-w-2xl">
            <p class="flex items-center gap-2.5">
              <span class="h-1.5 w-1.5 rounded-[2px] bg-volta-tint"></span>
              <span class="text-xs font-medium tracking-[0.16em] text-white/60">COSTS</span>
            </p>
            <h2 class="mt-4 font-display text-3xl font-semibold text-white sm:text-4xl">
              Sending is free.
            </h2>
            <p class="mt-4 text-base font-medium leading-7 text-white/75">
              There are no transfer fees. You pay only the amount you see, at the rate we locked — no
              surprises at the last step.
            </p>

            <dl class="mt-8 border-t-2 border-white/20 text-sm">
              <div class="flex items-center gap-3 border-b border-white/10 py-4">
                <Building2 :size="18" :stroke-width="1.5" class="text-white/50" />
                <dt class="flex-1 text-white/75">Platform fee</dt>
                <dd class="text-base font-semibold text-white tabular">{{ formatMoney(platformFee, liveRate.code) }}</dd>
              </div>
              <div class="flex items-center gap-3 border-b border-white/10 py-4">
                <Radio :size="18" :stroke-width="1.5" class="text-white/50" />
                <dt class="flex-1 text-white/75">Network fee</dt>
                <dd class="text-base font-semibold text-white tabular">{{ formatMoney(networkFee, liveRate.code) }}</dd>
              </div>
              <div class="flex items-center gap-3 py-4">
                <Banknote :size="18" :stroke-width="1.5" class="text-volta-tint" />
                <dt class="flex flex-1 items-center gap-2 font-semibold text-white">
                  Total fees
                  <span class="rounded-control bg-delivered/15 px-2 py-0.5 text-xs font-semibold text-volta-tint">Free</span>
                </dt>
                <dd class="font-display text-2xl font-semibold text-white tabular">{{ formatMoney(fees, liveRate.code) }}</dd>
              </div>
            </dl>
          </div>
          </div>
        </section>
      </div>

      <section class="relative overflow-hidden border-t border-white/10 bg-ink">
        <div class="relative mx-auto grid max-w-7xl items-center gap-10 px-6 py-14 sm:px-10 md:grid-cols-2 md:gap-16 md:px-12 md:py-20">
          <div class="order-2 md:order-1">
            <MapCorridor />
          </div>
          <div class="order-1 md:order-2">
            <p class="text-sm text-white/60 tabular">20 African countries · Mobile Money to Mobile Money</p>
            <h2 class="mt-4 font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
              Any African country to any African country.
            </h2>
            <p class="mt-5 max-w-md text-base leading-7 text-white/70">
              Send from your Mobile Money wallet in any supported country and land local Mobile Money in
              any other — including your own. We settle across borders in seconds at the rate you were quoted.
            </p>
            <div class="mt-8 grid grid-cols-3 gap-6 border-t border-white/12 pt-6">
              <div>
                <p class="font-display text-xl font-semibold text-white tabular">Any-to-any</p>
                <p class="mt-1 text-sm text-white/60">Across Africa</p>
              </div>
              <div>
                <p class="font-display text-2xl font-semibold text-white tabular">5 min</p>
                <p class="mt-1 text-sm text-white/60">Rate locked</p>
              </div>
              <div>
                <p class="font-display text-2xl font-semibold text-white">$0 fees</p>
                <p class="mt-1 text-sm text-white/60">Always free</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="px-6 py-16 text-center sm:px-10 md:px-12 md:py-20">
        <p class="font-display text-3xl font-semibold text-ink">A name you trust, a rate you keep, on one screen.</p>
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

    <footer class="relative mt-20 overflow-hidden bg-ink text-white">
      <svg
        class="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1440 620"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="footer-wave" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#0F4C57" stop-opacity="0" />
            <stop offset="42%" stop-color="#2E7C8A" stop-opacity="0.55" />
            <stop offset="100%" stop-color="#E3A21A" stop-opacity="0.35" />
          </linearGradient>
          <linearGradient id="footer-glow" x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0%" stop-color="#0F4C57" stop-opacity="0" />
            <stop offset="100%" stop-color="#0F4C57" stop-opacity="0.6" />
          </linearGradient>
        </defs>
        <rect width="1440" height="620" fill="url(#footer-glow)" />
        <g fill="none" stroke="url(#footer-wave)" stroke-width="1.25">
          <path :d="footerWave" />
          <path :d="footerWave" transform="translate(0 48)" opacity="0.65" />
          <path :d="footerWave" transform="translate(0 96)" opacity="0.4" />
          <path :d="footerWave" transform="translate(0 144)" opacity="0.24" />
        </g>
      </svg>

      <div class="relative mx-auto max-w-7xl px-6 pb-10 pt-20 sm:px-10 md:px-12">
        <div class="grid gap-12 lg:grid-cols-[1.1fr_1.4fr] lg:gap-20">
          <div>
            <span class="flex items-center gap-2.5">
              <img src="/kryptamo.png" alt="Kryptamo logo" class="h-9 w-auto" />
              <span class="font-display text-xl font-semibold text-white">Kryptamo</span>
            </span>
            <p class="mt-5 max-w-sm text-sm leading-6 text-white/60">
              Fee-free cross-border remittances across Africa. No wallets, no holding — straight to Mobile
              Money.
            </p>

            <dl class="mt-10 max-w-xs border-t border-white/12 pt-6">
              <dt class="text-xs font-medium tracking-[0.16em] text-white/40">REFERENCE RATE</dt>
              <dd class="mt-3 flex items-baseline gap-2">
                <span class="font-display text-3xl font-semibold text-white tabular">
                  {{ formatRate(liveRate.rate) }}
                </span>
                <span class="text-sm text-white/60">{{ liveRate.code }} → {{ liveRate.target }}</span>
              </dd>
            </dl>
          </div>

          <div class="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <p class="text-xs font-medium tracking-[0.16em] text-white/40">SEND</p>
              <ul class="mt-5 space-y-3.5 text-sm">
                <li>
                  <RouterLink to="/send" class="text-white/70 transition-colors hover:text-white">
                    Send money
                  </RouterLink>
                </li>
                <li>
                  <a href="#rates" class="text-white/70 transition-colors hover:text-white"
                    >Today's rate</a
                  >
                </li>
                <li>
                  <a href="#costs" class="text-white/70 transition-colors hover:text-white"
                    >What it costs</a
                  >
                </li>
              </ul>
            </div>

            <div>
              <p class="text-xs font-medium tracking-[0.16em] text-white/40">ACCOUNT</p>
              <ul class="mt-5 space-y-3.5 text-sm">
                <li>
                  <RouterLink to="/signin" class="text-white/70 transition-colors hover:text-white">
                    Sign in
                  </RouterLink>
                </li>
                <li>
                  <RouterLink to="/signup" class="text-white/70 transition-colors hover:text-white">
                    Create account
                  </RouterLink>
                </li>
                <li>
                  <a href="#rates" class="text-white/70 transition-colors hover:text-white"
                    >Track a transfer</a
                  >
                </li>
              </ul>
            </div>

            <div class="col-span-2 sm:col-span-1">
              <p class="text-xs font-medium tracking-[0.16em] text-white/40">CORRIDOR</p>
              <ul class="mt-5 space-y-3.5 text-sm text-white/70">
                <li class="flex items-center gap-2.5">
                  <span class="h-1.5 w-1.5 rounded-[2px] bg-volta-tint"></span>
                  Any African country · any direction
                </li>
                <li class="flex items-center gap-2.5">
                  <span class="h-1.5 w-1.5 rounded-[2px] bg-volta-tint"></span>
                  Mobile Money in · Mobile Money out
                </li>
                <li class="flex items-center gap-2.5">
                  <span class="h-1.5 w-1.5 rounded-[2px] bg-delivered"></span>
                  Paid out to Mobile Money
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div
          class="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/12 pt-6"
        >
          <p class="text-xs text-white/50">© 2026 Kryptamo. Across Africa.</p>
          <p class="text-xs tracking-[0.16em] text-white/40 tabular">{{ liveRate.code }} → {{ liveRate.target }}</p>
        </div>
      </div>
    </footer>
  </div>
</template>