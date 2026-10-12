<script setup>
const values = [
  15.52, 15.54, 15.53, 15.57, 15.55, 15.6, 15.58, 15.62, 15.66, 15.64, 15.68, 15.65,
  15.63, 15.67, 15.7, 15.68, 15.66, 15.71, 15.69, 15.72, 15.7, 15.72, 15.7, 15.68,
]

const min = 15.45
const max = 15.75
const width = 720
const height = 200

const points = values
  .map((v, i) => {
    const x = (width / (values.length - 1)) * i
    const y = height - ((v - min) / (max - min)) * (height - 24) - 12
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  .join(' ')

const last = values[values.length - 1]
const lastDot = {
  x: width,
  y: height - ((last - min) / (max - min)) * (height - 24) - 12,
}
</script>

<template>
  <svg viewBox="0 0 720 200" preserveAspectRatio="none" class="h-full w-full" aria-hidden="true">
    <g stroke="var(--color-volta-tint)" stroke-opacity="0.12" stroke-width="1">
      <line x1="0" y1="50" x2="720" y2="50" />
      <line x1="0" y1="100" x2="720" y2="100" />
      <line x1="0" y1="150" x2="720" y2="150" />
    </g>
    <polyline
      :points="points"
      fill="none"
      stroke="var(--color-volta-tint)"
      stroke-width="2"
      class="opacity-50"
    />
    <circle
      :cx="lastDot.x"
      :cy="lastDot.y"
      r="3"
      fill="var(--color-volta-tint)"
      class="opacity-90"
    />
  </svg>
</template>