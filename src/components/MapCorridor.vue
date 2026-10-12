<script setup>
import { ArrowRight } from 'lucide-vue-next'
import { MAP_BOUNDS, MAP_SIZE, MAP_COUNTRIES } from '../data/worldMap'

defineProps({
  animated: { type: Boolean, default: true },
})

const { width: viewW, height: viewH } = MAP_SIZE
const { lonMin, lonMax, latMin, latMax } = MAP_BOUNDS

const cropViewBox = '705 330 310 170'

const project = ([lon, lat]) => [
  ((lon - lonMin) / (lonMax - lonMin)) * viewW,
  ((latMax - lat) / (latMax - latMin)) * viewH,
]

const destination = { id: '288', label: 'Ghana', at: project([-1.2, 7.5]) }
const sources = [
  { id: '686', label: 'Senegal', at: project([-14.5, 14.5]), duration: '3.4s' },
  { id: '384', label: 'Ivory Coast', at: project([-5.5, 7.5]), duration: '3s' },
  { id: '566', label: 'Nigeria', at: project([8, 9]), duration: '2.6s' },
]

const destId = destination.id
const sourceIds = new Set(sources.map((s) => s.id))

const arcPath = (from, to, gap = 0) => {
  const [ax, ay] = from
  const [bx, by] = to
  const mx = (ax + bx) / 2
  const my = (ay + by) / 2
  const dist = Math.hypot(bx - ax, by - ay)
  const cx = mx
  const cy = my - dist * 0.24
  if (!gap) {
    return `M${ax.toFixed(1)} ${ay.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`
  }
  const dx = bx - cx
  const dy = by - cy
  const len = Math.hypot(dx, dy)
  const ex = bx - (dx / len) * gap
  const ey = by - (dy / len) * gap
  return `M${ax.toFixed(1)} ${ay.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`
}

const routes = sources.map((s) => ({
  ...s,
  d: arcPath(s.at, destination.at),
  base: arcPath(s.at, destination.at, 24),
}))

const graticuleLon = []
for (let lon = -20; lon <= 20; lon += 10) graticuleLon.push(project([lon, latMin])[0])
const graticuleLat = []
for (let lat = 0; lat <= 60; lat += 10) graticuleLat.push(project([0, lat])[1])
</script>

<template>
  <div class="relative" :class="animated ? '' : 'map-static'">
    <svg
      :viewBox="cropViewBox"
      class="w-full"
      role="img"
      aria-label="A map of West Africa showing transfers routing from Senegal, Ivory Coast and Nigeria into Ghana"
    >
      <defs>
        <filter id="map-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="map-ocean" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#123f49" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#0b3a43" stop-opacity="0.1" />
        </linearGradient>
        <marker
          id="map-arrow"
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto"
        >
          <path d="M0 0 L10 5 L0 10 z" fill="rgba(214,230,233,0.9)" />
        </marker>
      </defs>

      <rect :width="viewW" :height="viewH" fill="url(#map-ocean)" />

      <g class="graticule">
        <line v-for="(x, i) in graticuleLon" :key="`gl-${i}`" :x1="x" y1="0" :x2="x" :y2="viewH" />
        <line v-for="(y, i) in graticuleLat" :key="`ga-${i}`" x1="0" :y1="y" :x2="viewW" :y2="y" />
      </g>

      <g class="land">
        <path
          v-for="country in MAP_COUNTRIES"
          :key="country.id"
          :d="country.d"
          :class="
            country.id === destId ? 'land-dest' : sourceIds.has(country.id) ? 'land-source' : 'land-base'
          "
        />
      </g>

      <g class="routes">
        <g v-for="route in routes" :key="route.id">
          <path class="route-base" :d="route.base" marker-end="url(#map-arrow)" />
          <path
            v-if="animated"
            class="route-comet"
            :d="route.d"
            pathLength="100"
            :style="{ animationDuration: route.duration }"
          />
        </g>
      </g>

      <g class="markers">
        <g v-for="source in sources" :key="`m-${source.id}`">
          <circle :cx="source.at[0]" :cy="source.at[1]" r="6" class="marker-ring" />
          <circle :cx="source.at[0]" :cy="source.at[1]" r="3" class="marker-source" />
        </g>

        <circle
          :cx="destination.at[0]"
          :cy="destination.at[1]"
          r="4.5"
          class="marker-dest"
          filter="url(#map-glow)"
        />
        <circle
          v-if="animated"
          class="pulse"
          :cx="destination.at[0]"
          :cy="destination.at[1]"
          r="4.5"
          fill="none"
          stroke="var(--color-delivered)"
          stroke-width="1.5"
        />
        <circle
          v-else
          :cx="destination.at[0]"
          :cy="destination.at[1]"
          r="8"
          fill="none"
          stroke="rgba(27,127,75,0.5)"
          stroke-width="1"
        />

        <text :x="sources[0].at[0]" :y="sources[0].at[1] - 10" class="map-label" text-anchor="middle">
          Senegal
        </text>
        <text
          :x="sources[1].at[0] - 8"
          :y="sources[1].at[1] + 4"
          class="map-label"
          text-anchor="end"
        >
          Ivory Coast
        </text>
        <text :x="sources[2].at[0]" :y="sources[2].at[1] + 18" class="map-label" text-anchor="middle">
          Nigeria
        </text>
        <text
          :x="destination.at[0]"
          :y="destination.at[1] - 12"
          class="map-label map-label-dest"
          text-anchor="middle"
        >
          Ghana
        </text>
      </g>
    </svg>

    <div class="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/70">
      <span class="flex items-center gap-2.5">
        <span class="h-2 w-2 rounded-[2px] bg-white"></span>
        Senegal · Ivory Coast · Nigeria
      </span>
      <ArrowRight :size="16" :stroke-width="1.5" class="text-white/40" />
      <span class="flex items-center gap-2.5">
        <span class="h-2 w-2 rounded-[2px] bg-delivered"></span>
        Ghana · Mobile Money
      </span>
    </div>
  </div>
</template>

<style scoped>
.graticule line {
  stroke: rgba(214, 230, 233, 0.08);
  stroke-width: 1;
}

.land-base {
  fill: rgba(214, 230, 233, 0.1);
  stroke: rgba(214, 230, 233, 0.16);
  stroke-width: 0.5;
}

.land-source {
  fill: rgba(214, 230, 233, 0.26);
  stroke: rgba(214, 230, 233, 0.5);
  stroke-width: 0.75;
}

.land-dest {
  fill: rgba(27, 127, 75, 0.55);
  stroke: var(--color-delivered);
  stroke-width: 1;
}

.route-base {
  fill: none;
  stroke: rgba(214, 230, 233, 0.35);
  stroke-width: 1.5;
  stroke-dasharray: 3 5;
  stroke-linecap: round;
  animation: route-flow 1.1s linear infinite;
}

.map-static .route-base {
  animation: none;
  stroke-dasharray: 4 6;
}

.route-comet {
  fill: none;
  stroke: #ffffff;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-dasharray: 9 91;
  animation-name: route-travel;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

@keyframes route-flow {
  to {
    stroke-dashoffset: -16;
  }
}

@keyframes route-travel {
  to {
    stroke-dashoffset: -100;
  }
}

.marker-ring {
  fill: none;
  stroke: rgba(255, 255, 255, 0.35);
  stroke-width: 1;
}

.marker-source {
  fill: #ffffff;
}

.marker-dest {
  fill: var(--color-delivered);
}

.pulse {
  transform-box: fill-box;
  transform-origin: center;
  animation: map-pulse 2.6s ease-out infinite;
}

@keyframes map-pulse {
  0% {
    transform: scale(1);
    opacity: 0.85;
  }
  100% {
    transform: scale(3);
    opacity: 0;
  }
}

.map-label {
  font-family: var(--font-ui);
  font-size: 14px;
  font-weight: 500;
  fill: rgba(255, 255, 255, 0.75);
}

.map-label-dest {
  fill: #ffffff;
  font-weight: 600;
}

@media (prefers-reduced-motion: reduce) {
  .route-base,
  .route-comet,
  .pulse {
    animation: none;
  }
}
</style>