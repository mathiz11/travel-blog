<script setup lang="ts">
import type { Map } from "leaflet";

const props = defineProps<{
  gpxUrl: string;
  label?: string;
}>();

const mapEl = ref<HTMLElement | null>(null);
let map: Map | null = null;

onMounted(async () => {
  await nextTick();

  const L = (await import("leaflet")).default;
  await import("leaflet-gpx"); // side-effect: attache L.GPX sur l'instance Leaflet
  type GPXInstance = {
    on(
      event: string,
      handler: (e: { target: { getBounds: () => ReturnType<Map["getBounds"]> } }) => void
    ): GPXInstance;
    addTo(map: Map): GPXInstance;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const GPX = (L as any).GPX as new (url: string, options?: Record<string, unknown>) => GPXInstance;

  map = L.map(mapEl.value!, { zoomSnap: 0.1 }).setView([0, 0], 2);

  const apiKey = useRuntimeConfig().public.thunderforestApiKey as string;
  L.tileLayer(
    `https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=${apiKey}`,
    {
      attribution:
        '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 22,
    }
  ).addTo(map);

  // Fix Leaflet default icon URLs (broken in Vite/bundler environments)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });

  new GPX(props.gpxUrl, { async: true })
    .on("loaded", (e) => {
      map!.invalidateSize();
      map!.fitBounds(e.target.getBounds(), { padding: [30, 30] });
    })
    .addTo(map);
});

onBeforeUnmount(() => {
  map?.remove();
  map = null;
});
</script>

<template>
  <div class="space-y-2">
    <div
      ref="mapEl"
      class="h-80 w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
    />
    <p
      v-if="label"
      class="text-sm text-center text-gray-500 dark:text-gray-400 italic"
    >
      {{ label }}
    </p>
  </div>
</template>
