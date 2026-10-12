<script setup>
import { computed } from 'vue'
import { AlertTriangle, Check } from 'lucide-vue-next'
import { HUMAN_STEPS, stepStatus } from '../api'

const props = defineProps({
  status: { type: String, required: true },
})

const steps = computed(() =>
  HUMAN_STEPS.map((step, index) => ({ ...step, state: stepStatus(props.status, index) })),
)

const failed = computed(() => props.status === 'FAILED')

const nodeClass = (state) => {
  if (failed.value) return 'border-alert bg-alert/10 text-alert'
  if (state === 'done') return 'border-volta bg-volta text-white'
  if (state === 'now') return 'border-volta bg-volta-tint text-volta'
  return 'border-line bg-canvas text-slate'
}

const lineClass = (state) => (state === 'done' ? 'bg-volta' : 'bg-line')

const message = (state) => {
  if (state === 'done') return 'Done'
  if (state === 'now') return failed.value ? 'Stopped here' : 'In progress'
  return 'Waiting'
}
</script>

<template>
  <ol>
    <li
      v-for="(step, index) in steps"
      :key="step.label"
      class="relative flex gap-4 pb-8 last:pb-0"
    >
      <span
        v-if="index < steps.length - 1"
        class="absolute bottom-0 left-[15px] top-8 w-px"
        :class="lineClass(step.state)"
        aria-hidden="true"
      ></span>

      <span
        class="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-control border"
        :class="nodeClass(step.state)"
      >
        <AlertTriangle v-if="failed && step.state === 'now'" :size="16" :stroke-width="2" />
        <Check v-else-if="step.state === 'done'" :size="16" :stroke-width="2.5" />
        <span v-else class="h-2 w-2 rounded-[2px] bg-current" aria-hidden="true"></span>
      </span>

      <div class="min-w-0 pt-0.5">
        <p
          class="text-sm font-medium"
          :class="failed && step.state === 'now' ? 'text-alert' : step.state === 'waiting' ? 'text-slate' : 'text-ink'"
        >
          {{ step.label }}
        </p>
        <p class="mt-0.5 text-xs" :class="failed && step.state === 'now' ? 'text-alert' : 'text-slate'">
          {{ message(step.state) }}
        </p>
      </div>
    </li>
  </ol>
</template>
