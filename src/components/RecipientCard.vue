<script setup>
import { BadgeCheck, Smartphone } from 'lucide-vue-next'
import { initials, maskPhone } from '../utils/format'

defineProps({
  recipient: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="flex items-start gap-4 rounded-panel border border-line bg-canvas p-4 shadow-overlay">
    <div
      class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-volta-tint font-display text-lg font-semibold text-volta"
    >
      {{ initials(recipient.account_name) }}
    </div>
    <div class="min-w-0">
      <p class="font-display text-[22px] font-semibold leading-7 text-ink">
        {{ recipient.account_name }}
      </p>
      <div class="mt-1 flex items-center gap-2">
        <span class="text-sm text-slate">@{{ recipient.username }}</span>
        <span class="flex items-center gap-1 rounded-full bg-mist px-2 py-0.5 text-xs text-slate">
          <Smartphone :size="12" :stroke-width="1.5" />
          {{ recipient.momo_details.network }} Mobile Money
        </span>
      </div>
      <p class="mt-1 text-xs text-slate tabular">{{ maskPhone(recipient.phone_number_masked) }}</p>
      <p class="mt-2 flex items-center gap-1 text-xs text-delivered">
        <BadgeCheck :size="14" :stroke-width="1.5" />
        Name checked with Mobile Money
      </p>
    </div>
  </div>
</template>