<script setup>
const rings = Array.from({ length: 7 }, (_, i) => 70 + i * 78)

defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <section class="relative overflow-hidden bg-ink text-white">
    <svg
      class="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1440 420"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="masthead-glow" cx="88%" cy="6%" r="62%">
          <stop offset="0%" stop-color="#2E7C8A" stop-opacity="0.45" />
          <stop offset="100%" stop-color="#0B3A43" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="masthead-beam" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0F4C57" stop-opacity="0" />
          <stop offset="60%" stop-color="#2E7C8A" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#E3A21A" stop-opacity="0.14" />
        </linearGradient>
      </defs>
      <rect width="1440" height="420" fill="url(#masthead-glow)" />
      <g fill="none" stroke="rgba(214,230,233,0.06)" stroke-width="1">
        <circle v-for="r in rings" :key="r" cx="1290" cy="14" :r="r" />
      </g>
      <path
        d="M-60 330 C120 330 120 388 300 388 C480 388 480 330 660 330 C840 330 840 272 1020 272 C1200 272 1200 330 1380 330 C1560 330 1560 272 1740 272"
        fill="none"
        stroke="url(#masthead-beam)"
        stroke-width="1.25"
      />
    </svg>

    <div class="relative mx-auto max-w-5xl px-4 pb-16 pt-12 sm:px-6 md:pb-20 md:pt-16">
      <div class="flex flex-col gap-10 md:flex-row md:items-end md:justify-between md:gap-16">
        <div class="max-w-2xl">
          <p v-if="eyebrow" class="flex items-center gap-2.5">
            <span class="h-1.5 w-1.5 rounded-[2px] bg-volta-tint" aria-hidden="true"></span>
            <span class="text-xs font-medium tracking-[0.16em] text-white/50">{{ eyebrow }}</span>
          </p>
          <h1 class="mt-5 font-display text-[38px] font-semibold leading-[1.02] text-white sm:text-[52px]">
            {{ title }}
          </h1>
          <p v-if="subtitle" class="mt-5 max-w-xl text-base leading-7 text-white/70">{{ subtitle }}</p>
        </div>
        <div v-if="$slots.aside" class="md:shrink-0">
          <slot name="aside" />
        </div>
      </div>
    </div>

    <div
      class="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-mist to-transparent"
      aria-hidden="true"
    ></div>
  </section>
</template>
