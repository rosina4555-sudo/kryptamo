<script setup>
import { Check } from 'lucide-vue-next'

defineProps({
  steps: {
    type: Array,
    required: true,
  },
  currentIndex: {
    type: Number,
    required: true,
  },
})
</script>

<template>
  <ol class="relative">
    <li
      v-for="(step, i) in steps"
      :key="step.label"
      class="flex gap-4"
      :class="i < steps.length - 1 ? 'pb-6' : ''"
    >
      <div class="flex flex-col items-center">
        <span
          class="flex h-5 w-5 items-center justify-center rounded-full"
          :class="[
            i < currentIndex
              ? 'bg-volta text-white'
              : i === currentIndex
                ? 'bg-volta-tint'
                : 'border border-line bg-canvas',
            i === currentIndex && 'animate-pulse motion-reduce:animate-none',
          ]"
        >
          <Check v-if="i < currentIndex" :size="12" :stroke-width="2.5" />
        </span>
        <span
          v-if="i < steps.length - 1"
          class="mt-1 w-px flex-1"
          :class="i < currentIndex ? 'bg-volta-tint' : 'bg-line'"
        ></span>
      </div>
      <div>
        <p
          class="text-sm font-medium"
          :class="i === currentIndex ? 'text-ink' : i < currentIndex ? 'text-slate' : 'text-slate'"
        >
          {{ step.label }}
        </p>
        <p v-if="step.time" class="mt-0.5 text-xs text-slate tabular">{{ step.time }}</p>
      </div>
    </li>
  </ol>
</template>