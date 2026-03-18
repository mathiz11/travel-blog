<script setup lang="ts">
import type { Map, LatLng } from "leaflet";

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
      handler: (e: {
        target: {
          getBounds: () => ReturnType<Map["getBounds"]>;
          get_start_pt: () => LatLng;
          get_end_pt: () => LatLng;
        };
      }) => void
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

  const makeIcon = (color: string, shape: string) =>
    L.divIcon({
      html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
        <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2"/>
        ${shape}
      </svg>`,
      className: "",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

  const startDivIcon = makeIcon(
    "#22c55e",
    '<polygon points="13,10 23,16 13,22" fill="white"/>'
  );
  const endDivIcon = makeIcon(
    "#ef4444",
    '<polyline points="10,16 14,20 22,12" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
  );

  new GPX(props.gpxUrl, {
    async: true,
    marker_options: { startIconUrl: "", endIconUrl: "", shadowUrl: "" },
  })
    .on("loaded", (e) => {
      map!.invalidateSize();
      map!.fitBounds(e.target.getBounds(), { padding: [30, 30] });
      L.marker(e.target.get_start_pt(), { icon: startDivIcon }).addTo(map!);
      L.marker(e.target.get_end_pt(), { icon: endDivIcon }).addTo(map!);
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
