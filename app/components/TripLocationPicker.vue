<script setup lang="ts">
import type { Map, Marker } from "leaflet";

const latitude = defineModel<number | null | undefined>("latitude");
const longitude = defineModel<number | null | undefined>("longitude");

const mapEl = ref<HTMLElement | null>(null);
let map: Map | null = null;
let marker: Marker | null = null;
let resizeObserver: ResizeObserver | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let L: any = null;

// Vue de repli : Europe
const DEFAULT_CENTER: [number, number] = [50, 10];
const DEFAULT_ZOOM = 4;

function setMarker(lat: number, lng: number) {
  if (!map || !L) return;
  if (marker) {
    marker.setLatLng([lat, lng]);
  } else {
    marker = L.marker([lat, lng], { draggable: true }).addTo(map);
    marker!.on("dragend", () => {
      const pos = marker!.getLatLng();
      latitude.value = roundCoord(pos.lat);
      longitude.value = roundCoord(pos.lng);
    });
  }
}

function roundCoord(n: number) {
  return Math.round(n * 1e6) / 1e6;
}

function onCoordInput(axis: "lat" | "lng", v: string | number) {
  const n = v === "" || v == null ? null : Number(v);
  if (axis === "lat") latitude.value = n;
  else longitude.value = n;
}

function clearMarker() {
  latitude.value = null;
  longitude.value = null;
  if (marker) {
    marker.remove();
    marker = null;
  }
}

onMounted(async () => {
  await nextTick();

  L = (await import("leaflet")).default;

  // Fix des URLs d'icônes Leaflet (cassées par le bundler Vite)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });

  const hasCoords =
    typeof latitude.value === "number" && typeof longitude.value === "number";

  const m = L.map(mapEl.value!, { zoomSnap: 0.5 }).setView(
    hasCoords ? [latitude.value as number, longitude.value as number] : DEFAULT_CENTER,
    hasCoords ? 9 : DEFAULT_ZOOM,
  );
  map = m;

  const apiKey = useRuntimeConfig().public.thunderforestApiKey as string;
  L.tileLayer(
    `https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=${apiKey}`,
    {
      attribution:
        '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 22,
    },
  ).addTo(m);

  if (hasCoords) setMarker(latitude.value as number, longitude.value as number);

  m.on("click", (e: { latlng: { lat: number; lng: number } }) => {
    latitude.value = roundCoord(e.latlng.lat);
    longitude.value = roundCoord(e.latlng.lng);
  });

  // Recalcule l'origine pixel quand le conteneur prend sa taille finale
  // (sinon, dans un formulaire, la carte "dérive" / le marqueur est décalé).
  // On ne réagit qu'aux vrais changements de dimensions pour éviter une
  // boucle ResizeObserver (invalidateSize → reflow → observer → jitter).
  let lastW = 0;
  let lastH = 0;
  resizeObserver = new ResizeObserver((entries) => {
    const box = entries[0]?.contentRect;
    if (!box) return;
    const w = Math.round(box.width);
    const h = Math.round(box.height);
    if (w === lastW && h === lastH) return;
    lastW = w;
    lastH = h;
    m.invalidateSize({ animate: false });
  });
  resizeObserver.observe(mapEl.value!);
  requestAnimationFrame(() => m.invalidateSize({ animate: false }));

  // Synchronise le marqueur quand lat/lng changent (saisie manuelle incluse)
  watch([latitude, longitude], ([lat, lng]) => {
    if (typeof lat === "number" && typeof lng === "number") {
      setMarker(lat, lng);
    } else if (marker) {
      marker.remove();
      marker = null;
    }
  });
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
  map?.remove();
  map = null;
  marker = null;
});
</script>

<template>
  <div class="space-y-2">
    <div
      ref="mapEl"
      class="h-64 w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
    />
    <div class="flex flex-wrap items-end gap-3">
      <UFormField label="Latitude" class="flex-1 min-w-32">
        <UInput
          :model-value="latitude ?? undefined"
          type="number"
          step="any"
          placeholder="48.8566"
          class="w-full"
          @update:model-value="onCoordInput('lat', $event)"
        />
      </UFormField>
      <UFormField label="Longitude" class="flex-1 min-w-32">
        <UInput
          :model-value="longitude ?? undefined"
          type="number"
          step="any"
          placeholder="2.3522"
          class="w-full"
          @update:model-value="onCoordInput('lng', $event)"
        />
      </UFormField>
      <UButton
        v-if="latitude != null || longitude != null"
        type="button"
        variant="ghost"
        color="error"
        icon="i-lucide-x"
        @click="clearMarker"
      >
        Effacer
      </UButton>
    </div>
    <p class="text-xs text-gray-500 dark:text-gray-400">
      Cliquez sur la carte pour placer le point du voyage (ou glissez le
      marqueur).
    </p>
  </div>
</template>
