<script setup>
defineProps({
  code: { type: String, required: true },
})

const usStars = []
for (let row = 0; row < 5; row += 1) {
  for (let col = 0; col < 6; col += 1) {
    usStars.push({ x: 1.5 + col * 1.8, y: 1.3 + row * 2.0 })
  }
}
</script>

<template>
  <svg viewBox="0 0 30 20" preserveAspectRatio="none" aria-hidden="true">
    <template v-if="code === 'US'">
      <rect width="30" height="20" fill="#ffffff" />
      <g fill="#b22234">
        <rect width="30" height="1.54" y="0" />
        <rect width="30" height="1.54" y="3.08" />
        <rect width="30" height="1.54" y="6.15" />
        <rect width="30" height="1.54" y="9.23" />
        <rect width="30" height="1.54" y="12.31" />
        <rect width="30" height="1.54" y="15.38" />
        <rect width="30" height="1.54" y="18.46" />
      </g>
      <rect width="12" height="10.77" fill="#3c3b6e" />
      <g fill="#ffffff">
        <circle v-for="(s, i) in usStars" :key="i" :cx="s.x" :cy="s.y" r="0.42" />
      </g>
    </template>

    <template v-else-if="code === 'CA'">
      <rect width="30" height="20" fill="#ffffff" />
      <rect width="7.5" height="20" fill="#d52b1e" />
      <rect x="22.5" width="7.5" height="20" fill="#d52b1e" />
      <path
        fill="#d52b1e"
        d="M15 4.5 L16.1 6.6 L17.9 6.1 L17.5 8.1 L20 9 L19.5 10.1 L20.5 11.4 L17.2 11.1 L16.6 13 L15.6 13 L15.9 15.5 L14.1 15.5 L14.4 13 L13.4 13 L12.8 11.1 L9.5 11.4 L10.5 10.1 L10 9 L12.5 8.1 L12.1 6.1 L13.9 6.6 Z"
      />
    </template>

    <template v-else-if="code === 'GB'">
      <rect width="30" height="20" fill="#012169" />
      <path d="M0 0 L30 20 M30 0 L0 20" stroke="#ffffff" stroke-width="4" />
      <path d="M0 0 L30 20 M30 0 L0 20" stroke="#c8102e" stroke-width="1.8" />
      <path d="M15 0 V20 M0 10 H30" stroke="#ffffff" stroke-width="6" />
      <path d="M15 0 V20 M0 10 H30" stroke="#c8102e" stroke-width="3.4" />
    </template>

    <template v-else-if="code === 'GH'">
      <rect width="30" height="6.67" fill="#ce1126" />
      <rect width="30" height="6.67" y="6.67" fill="#fcd116" />
      <rect width="30" height="6.66" y="13.34" fill="#006b3f" />
      <path
        fill="#000000"
        d="M15 7.2 L15.71 9.03 L17.66 9.14 L16.14 10.37 L16.65 12.27 L15 11.2 L13.35 12.27 L13.86 10.37 L12.34 9.14 L14.29 9.03 Z"
      />
    </template>
  </svg>
</template>
