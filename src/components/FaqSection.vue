<script setup>
import { ChevronDown } from 'lucide-vue-next'

const faqs = [
  {
    q: 'How is Kryptamo free?',
    a: 'There are no transfer fees. We settle every payment through stablecoins and earn on the wholesale FX spread, so the rate you see is the rate the recipient gets — nothing is added at checkout.',
  },
  {
    q: 'Which countries can I send between?',
    a: 'Any supported African country to any other. Both sides move through Mobile Money, and you can even send to a wallet in the same country. Twenty countries are live today, with more rolling out.',
  },
  {
    q: 'How long does a transfer take?',
    a: 'Seconds. Once your Mobile Money payment clears, the payout usually lands in the recipient’s wallet in under a minute, and you can follow every step live.',
  },
  {
    q: 'Why does my quote expire in five minutes?',
    a: 'We lock the exchange rate and fees for five minutes so the amount the recipient receives cannot move while you confirm. Refresh the quote if it lapses.',
  },
  {
    q: 'Does Kryptamo hold my money?',
    a: 'No. Kryptamo is pass-through — we never hold funds or run internal wallets. Money travels straight from your payment method into the recipient’s Mobile Money account.',
  },
  {
    q: 'What happens if a transfer fails?',
    a: 'If a payout cannot complete, the transfer is marked failed and the amount is refunded or re-routed automatically. The status stays visible in your transfer history.',
  },
]
</script>

<template>
  <section class="border-t border-line bg-canvas">
    <div
      class="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:px-10 md:grid-cols-[0.85fr_1.15fr] md:gap-16 md:px-12 md:py-20"
    >
      <div>
        <p class="text-xs font-semibold tracking-[0.16em] text-volta">FAQ</p>
        <h2 class="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl">Questions, answered.</h2>
        <p class="mt-4 max-w-sm text-base leading-7 text-slate">
          Fees, corridors, timing and safety — the short version. Anything else, our team is a message
          away.
        </p>
        <RouterLink
          to="/signup"
          class="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-volta transition-colors hover:text-volta-deep"
        >
          Contact support
        </RouterLink>
      </div>

      <div class="border-t border-line">
        <details
          v-for="item in faqs"
          :key="item.q"
          class="group border-b border-line"
        >
          <summary
            class="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-display text-lg font-semibold text-ink transition-colors marker:hidden hover:text-volta focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volta [&::-webkit-details-marker]:hidden"
          >
            {{ item.q }}
            <ChevronDown
              :size="18"
              :stroke-width="2"
              class="shrink-0 text-slate transition-transform duration-200 group-open:rotate-180"
            />
          </summary>
          <p class="max-w-2xl pb-5 text-base leading-7 text-slate">{{ item.a }}</p>
        </details>
      </div>
    </div>
  </section>
</template>
