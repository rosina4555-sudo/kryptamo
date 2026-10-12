<script setup>
import { computed } from 'vue'
import { emojiFlag } from '../data/countries'

const props = defineProps({
  code: { type: String, required: true },
})

const flag = computed(() => emojiFlag(props.code))
</script>

<template>
  <svg viewBox="0 0 30 20" aria-hidden="true">
    <text
      x="15"
      y="10"
      text-anchor="middle"
      dominant-baseline="central"
      font-size="20"
    >
      {{ flag }}
    </text>
  </svg>
</template>
