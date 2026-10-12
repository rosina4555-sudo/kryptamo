<script setup>
import { computed } from 'vue'
import { STATE_LABELS } from '../api'

const props = defineProps({
  status: { type: String, required: true },
})

const tones = {
  FUNDING_PENDING: 'border-notice-text/25 bg-notice-bg text-notice-text',
  PAID_OUT: 'border-delivered/25 bg-delivered/10 text-delivered',
  FAILED: 'border-alert/25 bg-alert/10 text-alert',
  default: 'border-volta/25 bg-volta-tint text-volta',
}

const dots = {
  FUNDING_PENDING: 'bg-notice-text',
  PAID_OUT: 'bg-delivered',
  FAILED: 'bg-alert',
  default: 'bg-volta',
}

const tone = computed(() => tones[props.status] ?? tones.default)
const dot = computed(() => dots[props.status] ?? dots.default)
const label = computed(() => STATE_LABELS[props.status] ?? 'In progress')
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-control border px-2 py-1 text-xs font-medium"
    :class="tone"
  >
    <span class="h-1.5 w-1.5 rounded-[2px]" :class="dot" aria-hidden="true"></span>
    {{ label }}
  </span>
</template>
