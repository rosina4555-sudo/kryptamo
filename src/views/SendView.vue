<script setup>
import { ref } from 'vue'
import RecipientCard from '../components/RecipientCard.vue'
import QuoteSummary from '../components/QuoteSummary.vue'

const amount = ref('50.00')
const handle = ref('')

const recipient = {
  username: 'kwame',
  account_name: 'KWAME A. MENSAH',
  phone_number_masked: '+233 24 **** 567',
  momo_details: { network: 'MTN' },
}

const fees = 2.0
const rate = 15.6
const expiresAt = Date.now() + 5 * 60_000

const handleInput = () => {
  handle.value = handle.value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

const onPay = () => {}
</script>

<template>
  <div class="min-h-screen pb-12">
    <header class="mx-auto flex max-w-5xl items-center justify-between px-4 py-6">
      <RouterLink to="/" class="flex items-center gap-2.5">
        <img src="/kryptamo.png" alt="Kryptamo logo" class="h-9 w-auto" />
        <span class="font-display text-lg font-semibold text-ink">Kryptamo</span>
      </RouterLink>
      <nav class="flex items-center gap-6" aria-label="Account">
        <span class="text-sm text-slate">Oliver</span>
      </nav>
    </header>

    <div class="mx-auto grid max-w-5xl gap-8 px-4 md:grid-cols-[1fr_360px] md:items-start">
      <section aria-label="Send form" class="space-y-8">
        <div>
          <label for="handle" class="mb-2 block text-sm font-medium text-ink">Send to</label>
          <div class="flex items-center rounded-control border border-line bg-canvas px-4">
            <span class="mr-1 text-slate">@</span>
            <input
              id="handle"
              v-model="handle"
              type="text"
              autocapitalize="none"
              spellcheck="false"
              class="h-12 w-full bg-transparent text-ink outline-none placeholder:text-slate"
              placeholder="username"
              @input="handleInput"
            />
          </div>
        </div>

        <RecipientCard v-if="recipient" :recipient="recipient" />

        <div>
          <label for="amount" class="mb-2 block text-sm font-medium text-ink">Amount</label>
          <div
            class="flex h-14 items-center divide-x divide-line rounded-control border border-line bg-canvas"
          >
            <input
              id="amount"
              v-model="amount"
              inputmode="decimal"
              class="h-full w-full px-4 text-lg text-ink tabular outline-none"
            />
            <span class="flex h-full items-center bg-mist px-4 text-sm font-medium text-ink">USD</span>
          </div>
        </div>
      </section>

      <QuoteSummary
        :send-amount="Number(amount) || 0"
        :fees="fees"
        :rate="rate"
        :expires-at="expiresAt"
        :recipient-name="recipient.account_name"
        :platform-fee="1.5"
        :network-fee="0.5"
        @pay="onPay"
      />
    </div>
  </div>
</template>