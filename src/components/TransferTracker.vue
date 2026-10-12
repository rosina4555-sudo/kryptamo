<script setup>
import { computed } from 'vue'
import { BadgeCheck, Check, CreditCard, RefreshCw, Send } from 'lucide-vue-next'

const props = defineProps({
  steps: {
    type: Array,
    required: true,
  },
  currentIndex: {
    type: Number,
    required: true,
  },
  tone: {
    type: String,
    default: 'light',
  },
})

const dark = computed(() => props.tone === 'dark')

const HEX = '28,2 52,16 52,40 28,54 4,40 4,16'

const ICONS = {
  card: CreditCard,
  convert: RefreshCw,
  route: Send,
  delivered: BadgeCheck,
}

const iconFor = (step) => ICONS[step.icon] ?? null

const nodeColors = (i) => {
  if (dark.value) {
    if (i < props.currentIndex) return { fill: '#D6E6E9', stroke: '#D6E6E9', icon: '#0B3A43' }
    if (i === props.currentIndex)
      return { fill: 'rgba(214,230,233,0.16)', stroke: '#D6E6E9', icon: '#D6E6E9' }
    return { fill: 'rgba(255,255,255,0.05)', stroke: 'rgba(255,255,255,0.16)', icon: 'rgba(255,255,255,0.45)' }
  }
  if (i < props.currentIndex) return { fill: '#0F4C57', stroke: '#0F4C57', icon: '#FFFFFF' }
  if (i === props.currentIndex) return { fill: '#D6E6E9', stroke: '#0F4C57', icon: '#0F4C57' }
  return { fill: '#EEF3F4', stroke: '#D5DEE0', icon: '#5A6E72' }
}

const pingColor = computed(() => (dark.value ? 'rgba(214,230,233,0.28)' : 'rgba(15,76,87,0.22)'))
const ringColor = computed(() => (dark.value ? 'rgba(214,230,233,0.5)' : 'rgba(15,76,87,0.4)'))
</script>

<template>
  <div>
    <ol class="grid grid-cols-2 gap-y-10 sm:grid-cols-4">
      <li
        v-for="(step, i) in steps"
        :key="step.label"
        class="step-in relative flex flex-col items-center px-2 text-center"
        :style="{ animationDelay: `${i * 90}ms` }"
      >
        <span
          v-if="i < steps.length - 1"
          class="pointer-events-none absolute top-7 hidden h-px overflow-hidden sm:block"
          :class="dark ? 'bg-white/12' : 'bg-line'"
          style="left: calc(50% + 30px); right: calc(-50% + 30px)"
          aria-hidden="true"
        >
          <span
            class="track-fill block h-full transition-[width] duration-700 ease-out"
            :class="dark ? 'bg-volta-tint' : 'bg-volta'"
            :style="{ width: i < currentIndex ? '100%' : '0%' }"
          ></span>
          <span
            v-if="i < currentIndex"
            class="track-shine absolute inset-y-0 w-10"
            :class="dark ? 'track-shine-dark' : ''"
          ></span>
        </span>

        <span class="relative flex h-14 w-14 items-center justify-center">
          <svg
            v-if="i === currentIndex"
            class="absolute inset-0 animate-ping motion-reduce:animate-none"
            viewBox="0 0 56 56"
            :fill="pingColor"
          >
            <polygon :points="HEX" />
          </svg>

          <svg
            v-if="i === currentIndex"
            class="spin-slow absolute -inset-1.5 motion-reduce:animate-none"
            viewBox="0 0 56 56"
            fill="none"
          >
            <polygon :points="HEX" :stroke="ringColor" stroke-width="1" stroke-dasharray="3 5" />
          </svg>

          <svg class="absolute inset-0" viewBox="0 0 56 56">
            <polygon
              :points="HEX"
              :fill="nodeColors(i).fill"
              :stroke="nodeColors(i).stroke"
              stroke-width="1.5"
              stroke-linejoin="round"
            />
          </svg>

          <component
            :is="iconFor(step)"
            v-if="iconFor(step)"
            :size="22"
            :stroke-width="1.5"
            class="relative"
            :style="{ color: nodeColors(i).icon }"
          />
          <span v-else class="relative font-ui text-sm tabular" :style="{ color: nodeColors(i).icon }">
            {{ String(i + 1).padStart(2, '0') }}
          </span>

          <span
            v-if="i < currentIndex"
            class="step-check absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-[3px] bg-delivered text-white ring-2"
            :class="dark ? 'ring-ink' : 'ring-mist'"
          >
            <Check :size="12" :stroke-width="3" />
          </span>
        </span>

        <p
          class="mt-4 text-sm font-medium"
          :class="i <= currentIndex ? (dark ? 'text-white' : 'text-ink') : dark ? 'text-white/50' : 'text-slate'"
        >
          {{ step.label }}
        </p>
        <p class="mt-1 text-xs tabular" :class="dark ? 'text-white/40' : 'text-slate'">
          {{ step.time || '—' }}
        </p>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.step-in {
  opacity: 0;
  animation: step-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes step-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.track-shine {
  left: -20%;
  background: linear-gradient(90deg, transparent, rgba(15, 76, 87, 0.5), transparent);
  animation: track-shine 3.2s ease-in-out infinite;
}

.track-shine-dark {
  background: linear-gradient(90deg, transparent, rgba(214, 230, 233, 0.55), transparent);
}

@keyframes track-shine {
  0% {
    left: -20%;
  }
  60%,
  100% {
    left: 110%;
  }
}

.spin-slow {
  animation: spin-slow 16s linear infinite;
}

@keyframes spin-slow {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .step-in {
    opacity: 1;
    animation: none;
  }
  .track-shine,
  .spin-slow {
    animation: none;
  }
}
</style>
