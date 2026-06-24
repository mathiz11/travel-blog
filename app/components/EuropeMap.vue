<script setup lang="ts">
import { geoMercator, geoPath } from "d3-geo";
import europeRaw from "~/assets/geo/europe.geo.json";
import type { TripMapPoint } from "~/composables/useTrips";
import type { MapPalette } from "~/utils/mapPalettes";

interface GeoFeature {
  type: "Feature";
  properties: { iso: string; name: string; clat: number; clng: number };
  geometry: unknown;
}

const props = defineProps<{
  trips: TripMapPoint[];
  palette: MapPalette;
}>();

// --- Géométrie (calculée en setup → rendu SSR possible) ---
const W = 1000;
const H = 820;
const PAD = 24;
const europe = europeRaw as unknown as { features: GeoFeature[] };

// Cadre l'Europe (la projection est ajustée sur une bbox, pas sur les features,
// pour éviter que la Sibérie ne réduise l'Europe ; le reste est rogné par le viewBox).
const EUROPE_BBOX = {
  type: "Feature" as const,
  properties: {},
  geometry: {
    type: "Polygon" as const,
    coordinates: [[[-25, 34], [45, 34], [45, 72], [-25, 72], [-25, 34]]],
  },
};

const projection = geoMercator().fitExtent(
  [
    [PAD, PAD],
    [W - PAD, H - PAD],
  ],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  EUROPE_BBOX as any,
);
const pathGen = geoPath(projection);

interface FeatureDatum {
  iso: string;
  name: string;
  d: string;
  bounds: [[number, number], [number, number]];
}
const featureData: FeatureDatum[] = europe.features
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .map((f): FeatureDatum | null => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = pathGen(f as any);
    if (!d) return null;
    return {
      iso: f.properties.iso,
      name: f.properties.name,
      d,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      bounds: pathGen.bounds(f as any) as [[number, number], [number, number]],
    };
  })
  .filter((x): x is FeatureDatum => x !== null);

// --- Voyages par pays (ISO) ---
const tripsByIso = computed(() => {
  const map = new Map<string, TripMapPoint[]>();
  for (const t of props.trips) {
    const iso = countryToIso(t.country);
    if (!iso) continue;
    if (!map.has(iso)) map.set(iso, []);
    map.get(iso)!.push(t);
  }
  return map;
});
const activeIsoSet = computed(() => new Set(tripsByIso.value.keys()));
function isActive(iso: string) {
  return activeIsoSet.value.has(iso);
}

// --- État interaction ---
const selectedIso = ref<string | null>(null);
const selectedName = ref<string | null>(null);
const hoveredIso = ref<string | null>(null);
const hoveredName = ref<string | null>(null);
const hoverPos = ref({ x: 0, y: 0 });
const rootEl = ref<HTMLElement | null>(null);
// Pins affichés seulement à la fin de l'animation de recentrage
const pinsVisible = ref(false);
// Lien pin ↔ carte du volet (survol de l'un met l'autre en surbrillance)
const hoveredTripSlug = ref<string | null>(null);

function updateHoverPos(e: MouseEvent) {
  if (!rootEl.value) return;
  const r = rootEl.value.getBoundingClientRect();
  hoverPos.value = { x: e.clientX - r.left, y: e.clientY - r.top };
}

function onCountryEnter(fd: FeatureDatum, e: MouseEvent) {
  hoveredIso.value = fd.iso;
  hoveredName.value = fd.name;
  updateHoverPos(e);
}
function onCountryLeave() {
  hoveredIso.value = null;
  hoveredName.value = null;
}

const selectedTrips = computed(() =>
  selectedIso.value ? (tripsByIso.value.get(selectedIso.value) ?? []) : [],
);

function fillFor(iso: string) {
  const p = props.palette;
  if (iso === selectedIso.value) return p.selected;
  if (iso === hoveredIso.value && isActive(iso)) return p.hover;
  return isActive(iso) ? p.active : p.land;
}
function strokeFor(iso: string) {
  return isActive(iso) ? props.palette.activeStroke : props.palette.landStroke;
}
// Pays colorés translucides (effet Liquid Glass) ; pays sans voyage opaques
function fillOpacityFor(iso: string) {
  if (iso === selectedIso.value) return 0.85;
  if (iso === hoveredIso.value && isActive(iso)) return 0.8;
  return isActive(iso) ? 0.62 : 1;
}

// --- Transform (zoom / pan) ---
const MIN_SCALE = 1;
const MAX_SCALE = 10;
const svgEl = ref<SVGSVGElement | null>(null);
const scale = ref(1);
const tx = ref(0);
const ty = ref(0);
let rafId: number | null = null;

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function setTransform(ns: number, ntx: number, nty: number) {
  if (rafId) cancelAnimationFrame(rafId);
  scale.value = ns;
  tx.value = ntx;
  ty.value = nty;
  if (ns <= MIN_SCALE + 0.02 && selectedIso.value) {
    selectedIso.value = null;
    selectedName.value = null;
  }
}

function animateTo(
  ts: number,
  tX: number,
  tY: number,
  duration = 750,
  onDone?: () => void,
) {
  if (rafId) cancelAnimationFrame(rafId);
  const s0 = scale.value;
  const x0 = tx.value;
  const y0 = ty.value;
  const start = performance.now();
  const stepFn = (now: number) => {
    const k = Math.min(1, (now - start) / duration);
    const e = easeInOutCubic(k);
    scale.value = s0 + (ts - s0) * e;
    tx.value = x0 + (tX - x0) * e;
    ty.value = y0 + (tY - y0) * e;
    if (k < 1) rafId = requestAnimationFrame(stepFn);
    else onDone?.();
  };
  rafId = requestAnimationFrame(stepFn);
}

// Zoom centré sur le milieu de la vue (boutons + molette)
function zoomToCenter(ns: number, animate = false) {
  const clamped = clamp(ns, MIN_SCALE, MAX_SCALE);
  const cx = W / 2;
  const cy = H / 2;
  const baseX = (cx - tx.value) / scale.value;
  const baseY = (cy - ty.value) / scale.value;
  const ntx = cx - baseX * clamped;
  const nty = cy - baseY * clamped;
  if (animate) animateTo(clamped, ntx, nty);
  else setTransform(clamped, ntx, nty);
}
function zoomIn() {
  zoomToCenter(scale.value * 1.6, true);
}
function zoomOut() {
  zoomToCenter(scale.value / 1.6, true);
}

// Cadre englobant tous les pays colorés (vue d'arrivée + dézoom)
function computeActiveFit(fillFactor = 0.72, focusXFactor = 0.5, maxFit = 6) {
  const active = featureData.filter((fd) => activeIsoSet.value.has(fd.iso));
  if (!active.length) return { s: 1, x: 0, y: 0 };
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const fd of active) {
    const [[ax0, ay0], [ax1, ay1]] = fd.bounds;
    x0 = Math.min(x0, ax0);
    y0 = Math.min(y0, ay0);
    x1 = Math.max(x1, ax1);
    y1 = Math.max(y1, ay1);
  }
  const bw = Math.max(1, x1 - x0);
  const bh = Math.max(1, y1 - y0);
  const s = clamp(Math.min(W / bw, H / bh) * fillFactor, 1, maxFit);
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  return { s, x: W * focusXFactor - cx * s, y: H / 2 - cy * s };
}

// Vue d'arrivée : centrée sur les pays colorés (calculée en setup → SSR cohérent)
const initFit = computeActiveFit();
scale.value = initFit.s;
tx.value = initFit.x;
ty.value = initFit.y;
const restingScale = ref(initFit.s);

onMounted(() => {
  if (window.innerWidth < 768) {
    const mobileFit = computeActiveFit(0.92);
    scale.value = mobileFit.s;
    tx.value = mobileFit.x;
    ty.value = mobileFit.y;
    restingScale.value = mobileFit.s;
  }
});

function selectCountry(fd: FeatureDatum) {
  if (!isActive(fd.iso)) return;
  selectedIso.value = fd.iso;
  selectedName.value = fd.name;
  pinsVisible.value = false; // masqués pendant le recentrage

  const [[x0, y0], [x1, y1]] = fd.bounds;
  const bw = Math.max(1, x1 - x0);
  const bh = Math.max(1, y1 - y0);
  // Zoom prononcé : on remplit ~90% de la vue
  const s = clamp(Math.min(W / bw, H / bh) * 0.9, 2, MAX_SCALE);
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  // Décalage à gauche pour laisser la place au panneau (desktop)
  const focusX = W * 0.4;
  // Pins révélés une fois l'animation terminée
  animateTo(s, focusX - cx * s, H / 2 - cy * s, 750, () => {
    pinsVisible.value = true;
  });
}

function resetView() {
  selectedIso.value = null;
  selectedName.value = null;
  pinsVisible.value = false;
  hoveredTripSlug.value = null;
  const fit = computeActiveFit();
  animateTo(fit.s, fit.x, fit.y);
}

// --- Pan (drag) + molette ---
const dragging = ref(false);
let dragMoved = false;
let startCX = 0;
let startCY = 0;
let startTx = 0;
let startTy = 0;
let userPerScreen = 1;

function screenToUserRatio() {
  const svg = svgEl.value;
  if (!svg) return 1;
  const r = svg.getBoundingClientRect();
  const f = Math.min(r.width / W, r.height / H);
  return f > 0 ? 1 / f : 1;
}

function onPointerDown(e: PointerEvent) {
  dragging.value = true;
  dragMoved = false;
  startCX = e.clientX;
  startCY = e.clientY;
  startTx = tx.value;
  startTy = ty.value;
  userPerScreen = screenToUserRatio();
}
function onPointerMove(e: PointerEvent) {
  if (!dragging.value) return;
  const dx = e.clientX - startCX;
  const dy = e.clientY - startCY;
  if (Math.abs(dx) + Math.abs(dy) > 4) dragMoved = true;
  if (rafId) cancelAnimationFrame(rafId);
  tx.value = startTx + dx * userPerScreen;
  ty.value = startTy + dy * userPerScreen;
}
function onPointerUp() {
  dragging.value = false;
}

// --- Pins de villes (overlay, taille constante) ---
interface Pin {
  x: number;
  y: number;
  slug: string;
  title: string;
}
const pins = computed<Pin[]>(() =>
  selectedTrips.value
    .filter((t) => typeof t.latitude === "number" && typeof t.longitude === "number")
    .map((t) => {
      const p = projection([t.longitude as number, t.latitude as number]) ?? [0, 0];
      return {
        x: p[0] * scale.value + tx.value,
        y: p[1] * scale.value + ty.value,
        slug: t.slug,
        title: t.title,
      };
    }),
);

function openTrip(slug: string) {
  navigateTo(`/trips/${slug}`);
}

// --- Étiquette de survol (nom du pays) ---
function onHoverMove(e: MouseEvent) {
  if (hoveredIso.value) updateHoverPos(e);
}

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId);
});
</script>

<template>
  <div
    ref="rootEl"
    class="relative h-full w-full overflow-hidden"
    :style="{ backgroundColor: palette.sea }"
  >
    <svg
      ref="svgEl"
      @mousemove="onHoverMove"
      :viewBox="`0 0 ${W} ${H}`"
      preserveAspectRatio="xMidYMid meet"
      class="h-full w-full select-none"
      :class="dragging ? 'cursor-grabbing' : 'cursor-grab'"
      :style="{ touchAction: scale > restingScale + 0.1 ? 'none' : 'pan-y' }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointerleave="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <defs>
        <!-- Surbrillance lumineuse des pays colorés -->
        <filter id="eu-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation="6"
            :flood-color="palette.active"
            flood-opacity="0.55"
          />
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="3"
            flood-color="#000"
            flood-opacity="0.15"
          />
        </filter>
      </defs>

      <!-- Mer (clic = dézoom) -->
      <rect
        :width="W"
        :height="H"
        :fill="palette.sea"
        @click="!dragMoved && resetView()"
      />

      <!-- Pays -->
      <g :transform="`translate(${tx} ${ty}) scale(${scale})`">
        <path
          v-for="fd in featureData"
          :key="fd.iso"
          :d="fd.d"
          :fill="fillFor(fd.iso)"
          :fill-opacity="fillOpacityFor(fd.iso)"
          :stroke="strokeFor(fd.iso)"
          :stroke-width="fd.iso === hoveredIso || fd.iso === selectedIso ? 1.6 : 0.9"
          stroke-linejoin="round"
          vector-effect="non-scaling-stroke"
          :filter="isActive(fd.iso) ? 'url(#eu-glow)' : undefined"
          :class="['eu-country', { 'eu-country--active': isActive(fd.iso) }]"
          @mouseenter="onCountryEnter(fd, $event)"
          @mouseleave="onCountryLeave"
          @click="!dragMoved && selectCountry(fd)"
        />
      </g>

      <!-- Pins de localisation (révélés en fin d'animation, taille constante) -->
      <TransitionGroup tag="g" name="eu-pin">
        <g
          v-for="pin in pinsVisible ? pins : []"
          :key="pin.slug"
          class="eu-pin"
          :class="{ 'eu-pin--active': hoveredTripSlug === pin.slug }"
          :style="{ transform: `translate(${pin.x}px, ${pin.y}px)` }"
          @mouseenter="hoveredTripSlug = pin.slug"
          @mouseleave="hoveredTripSlug = null"
          @click="openTrip(pin.slug)"
        >
          <g class="eu-pin__marker">
            <path
              d="M0,0 C-7,-11 -16,-17 -16,-27 a16,16 0 1,1 32,0 C16,-17 7,-11 0,0 Z"
              :fill="palette.pin"
              stroke="#fff"
              stroke-width="2.5"
            />
            <circle cy="-27" r="6" fill="#fff" />
          </g>
          <!-- Nom du voyage : uniquement au survol du pin -->
          <text
            class="eu-pin__label"
            x="22"
            y="-22"
            :fill="palette.text"
            paint-order="stroke"
            stroke="#fff"
            stroke-width="4"
            stroke-linejoin="round"
          >
            {{ pin.title }}
          </text>
        </g>
      </TransitionGroup>
    </svg>

    <!-- Panneau latéral des voyages du pays -->
    <Transition name="eu-panel">
      <GlassPanel
        v-if="selectedIso"
        :tone="palette.panelTone"
        @wheel.stop
        class="absolute right-4 top-4 bottom-4 z-20 flex w-[min(90vw,22rem)] flex-col bg-white p-5 max-md:inset-x-0 max-md:bottom-0 max-md:top-auto max-md:max-h-[60vh] max-md:w-auto max-md:rounded-b-none max-md:p-4 max-md:pt-2"
      >
        <!-- Poignée (mobile) -->
        <div
          class="mx-auto mb-2 h-1.5 w-10 shrink-0 rounded-full bg-gray-300 md:hidden"
        />
        <div class="mb-3 flex items-center justify-between gap-3">
          <h3 class="flex items-center gap-2 text-lg font-semibold">
            <UIcon name="i-lucide-map-pin" class="size-5 shrink-0" />
            {{ selectedName }}
          </h3>
          <UButton
            size="xs"
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            class="text-current"
            @click="resetView"
          />
        </div>

        <ul class="-mr-2 min-h-0 flex-1 space-y-3 overflow-y-auto pr-2">
          <li v-for="t in selectedTrips" :key="t.slug">
            <NuxtLink
              :to="`/trips/${t.slug}`"
              class="group block overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-900 shadow-md transition-all duration-300 ease-out"
              :class="hoveredTripSlug === t.slug ? '-translate-y-1' : ''"
              :style="
                hoveredTripSlug === t.slug
                  ? {
                      borderColor: palette.pin,
                      boxShadow: `0 0 0 1.5px ${palette.pin}, 0 18px 38px -14px ${palette.pin}cc`,
                    }
                  : undefined
              "
              @mouseenter="hoveredTripSlug = t.slug"
              @mouseleave="hoveredTripSlug = null"
            >
              <div class="aspect-video w-full overflow-hidden bg-gray-100">
                <img
                  v-if="t.thumbnail_url"
                  :src="t.thumbnail_url"
                  :alt="t.title"
                  class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div v-else class="flex size-full items-center justify-center">
                  <UIcon name="i-lucide-image" class="size-8 opacity-40" />
                </div>
              </div>
              <div class="p-3">
                <p class="font-semibold leading-snug">{{ t.title }}</p>
                <p
                  v-if="t.destination"
                  class="mt-0.5 flex items-center gap-1 text-sm opacity-70"
                >
                  <UIcon name="i-lucide-map-pin" class="size-3.5 shrink-0" />
                  {{ t.destination }}
                </p>
                <p
                  v-if="t.summary"
                  class="mt-1.5 text-sm leading-relaxed opacity-80 line-clamp-3"
                >
                  {{ t.summary }}
                </p>
              </div>
            </NuxtLink>
          </li>
        </ul>
      </GlassPanel>
    </Transition>

    <!-- Contrôles de zoom (déplacés en haut sur mobile pour ne pas être
         masqués par le volet en bas de l'écran) -->
    <div
      class="absolute bottom-4 left-4 z-20 flex flex-col gap-1.5 max-md:bottom-auto max-md:top-4"
    >
      <UButton
        icon="i-lucide-plus"
        color="neutral"
        variant="solid"
        size="sm"
        class="bg-white/80 text-gray-800 ring-1 ring-black/10 hover:bg-white"
        aria-label="Zoomer"
        @click="zoomIn"
      />
      <UButton
        icon="i-lucide-minus"
        color="neutral"
        variant="solid"
        size="sm"
        class="bg-white/80 text-gray-800 ring-1 ring-black/10 hover:bg-white"
        aria-label="Dézoomer"
        @click="zoomOut"
      />
      <UButton
        v-if="selectedIso || scale > initFit.s + 0.1"
        icon="i-lucide-locate-fixed"
        color="neutral"
        variant="solid"
        size="sm"
        class="bg-white/80 text-gray-800 ring-1 ring-black/10 hover:bg-white"
        aria-label="Réinitialiser la vue"
        @click="resetView"
      />
    </div>

    <!-- Étiquette de survol : nom du pays -->
    <div
      v-if="hoveredName"
      class="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[140%] whitespace-nowrap rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-gray-800 shadow-md ring-1 ring-black/5"
      :style="{ left: `${hoverPos.x}px`, top: `${hoverPos.y}px` }"
    >
      {{ hoveredName }}
    </div>

    <!-- Aide -->
    <div
      v-if="!selectedIso"
      class="pointer-events-none absolute bottom-5 left-1/2 z-10 max-w-[90vw] -translate-x-1/2 rounded-full bg-white/70 px-4 py-1.5 text-center text-sm font-medium text-gray-700 shadow-sm backdrop-blur max-md:hidden"
    >
      Sélectionnez un pays coloré
    </div>
  </div>
</template>

<style scoped>
.eu-country {
  transition: fill 0.25s ease;
}
.eu-country--active {
  cursor: pointer;
}
.eu-pin {
  cursor: pointer;
}
/* Le marqueur grandit au survol (le pin lui-même suit le pan sans délai).
   transform-box: fill-box → l'origine est calculée dans la bbox du marqueur
   (et non dans le viewBox SVG, défaut qui ferait « sauter » le pin au scale). */
.eu-pin__marker {
  transition: transform 0.15s ease;
  transform-box: fill-box;
  transform-origin: center bottom;
}
.eu-pin--active .eu-pin__marker {
  transform: scale(1.25);
}
/* Nom du voyage masqué par défaut, révélé au survol du pin */
.eu-pin__label {
  font-size: 15px;
  font-weight: 700;
  paint-order: stroke;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s ease;
}
.eu-pin--active .eu-pin__label {
  opacity: 1;
}
/* Apparition en fondu des pins en fin de recentrage */
.eu-pin-enter-active {
  transition: opacity 0.4s ease;
}
.eu-pin-enter-from {
  opacity: 0;
}

.eu-panel-enter-active,
.eu-panel-leave-active {
  transition:
    opacity 0.35s ease,
    transform 0.35s ease;
}
.eu-panel-enter-from,
.eu-panel-leave-to {
  opacity: 0;
  transform: translateX(1rem);
}
/* Sur mobile, le volet est une feuille qui monte depuis le bas */
@media (max-width: 767px) {
  .eu-panel-enter-from,
  .eu-panel-leave-to {
    transform: translateY(100%);
  }
}
</style>
