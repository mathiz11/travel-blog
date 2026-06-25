<script setup lang="ts">
import { MAP_PALETTES, DEFAULT_MAP_PALETTE } from "~/utils/mapPalettes";

const { data: trips } = await useAsyncData("published-trips", () =>
  useTrips().fetchPublishedTrips(6),
);

// Voyages géolocalisés pour la carte d'accueil
const { data: mapTrips } = await useAsyncData("map-trips", () =>
  useTrips().fetchPublishedTripsForMap(),
);

const mapPalette = MAP_PALETTES[DEFAULT_MAP_PALETTE]!;

useSeoMeta({
  title: "Chloé explore",
  description:
    "Voyages, photos, gastronomie et cultures du monde. Des aventures bas carbone partagées avec passion.",
  ogTitle: "Chloé explore",
  ogDescription: "Aventures bas carbone, photos et saveurs du monde.",
});

function formatDate(date: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
  });
}

function scrollToContent() {
  document.getElementById("content")?.scrollIntoView({ behavior: "smooth" });
}
</script>

<template>
  <div>
    <!-- Hero : carte d'Europe illustrée, plein écran -->
    <section
      class="relative mx-[calc(50%-50vw)] -mt-8 h-[100svh] w-screen overflow-hidden md:h-[100vh]"
      :style="{ backgroundColor: mapPalette.sea }"
    >
      <EuropeMap :trips="mapTrips ?? []" :palette="mapPalette" />

      <!-- Titre superposé -->
      <div
        class="pointer-events-none absolute left-1/2 top-6 z-10 -translate-x-1/2 px-4 text-center"
      >
        <h1
          class="whitespace-nowrap rounded-full bg-white/70 px-5 py-2 text-xl font-bold text-gray-800 shadow-sm backdrop-blur md:text-3xl"
        >
          Le monde de Chloé&nbsp;🚞​
        </h1>
      </div>

      <!-- Bouton pour descendre vers le contenu -->
      <UButton
        icon="i-lucide-chevron-down"
        color="neutral"
        variant="ghost"
        class="absolute bottom-6 left-1/2 z-30 size-14 -translate-x-1/2 animate-bounce justify-center rounded-full bg-white/70 p-0 shadow-sm backdrop-blur ring-1 ring-black/5 hover:bg-white md:bottom-14"
        :ui="{ leadingIcon: 'size-7' }"
        aria-label="Voir le contenu"
        @click="scrollToContent"
      />
    </section>

    <!-- Présentation -->
    <section id="content" class="py-12 md:py-16">
      <div class="flex flex-col items-center gap-10 md:flex-row">
        <div class="shrink-0">
          <div
            class="flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg"
          >
            <UIcon name="i-lucide-compass" class="size-16 text-white" />
          </div>
        </div>
        <div>
          <h2 class="mb-4 text-3xl font-bold md:text-4xl">
            Salut, moi c'est Chloé&nbsp;! 👋
          </h2>
          <p class="mb-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Je voyage léger — sur la planète aussi. Ici je partage mes aventures
            bas carbone : train, vélo, ferry, et beaucoup de curiosité pour les
            gens, les paysages et les assiettes.
          </p>
          <div class="flex flex-wrap gap-3">
            <UBadge
              color="success"
              variant="subtle"
              size="lg"
              icon="i-lucide-leaf"
              >Bas carbone</UBadge
            >
            <UBadge
              color="primary"
              variant="subtle"
              size="lg"
              icon="i-lucide-camera"
              >Photo</UBadge
            >
            <UBadge
              color="warning"
              variant="subtle"
              size="lg"
              icon="i-lucide-utensils"
              >Gastronomie</UBadge
            >
            <UBadge
              color="info"
              variant="subtle"
              size="lg"
              icon="i-lucide-landmark"
              >Culture</UBadge
            >
          </div>
        </div>
      </div>
    </section>

    <!-- Voyages récents -->
    <section id="voyages" class="py-8">
      <h2 class="text-2xl font-semibold mb-8">Derniers voyages</h2>

      <div
        v-if="trips && trips.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <NuxtLink
          v-for="trip in trips"
          :key="trip.id"
          :to="`/trips/${trip.slug}`"
          class="group"
        >
          <div
            class="h-full flex flex-col rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div class="aspect-video overflow-hidden shrink-0">
              <img
                v-if="trip.thumbnail_url"
                :src="trip.thumbnail_url"
                :alt="trip.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div
                v-else
                class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center"
              >
                <UIcon name="i-lucide-map" class="size-12 text-gray-400" />
              </div>
            </div>

            <div class="flex-1 p-4 space-y-2">
              <div
                class="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"
              >
                <UIcon name="i-lucide-map-pin" class="size-3.5 shrink-0" />
                <span
                  >{{ trip.destination
                  }}{{ trip.country ? `, ${trip.country}` : "" }}</span
                >
                <span v-if="formatDate(trip.trip_date)" class="ml-auto">{{
                  formatDate(trip.trip_date)
                }}</span>
              </div>
              <h3
                class="font-semibold text-lg leading-snug group-hover:text-primary transition-colors"
              >
                {{ trip.title }}
              </h3>
              <p
                v-if="trip.summary"
                class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3"
              >
                {{ trip.summary }}
              </p>
              <div
                v-if="trip.tags && trip.tags.length > 0"
                class="flex flex-wrap gap-1.5 pt-1"
              >
                <UBadge
                  v-for="tag in trip.tags.slice(0, 3)"
                  :key="tag"
                  color="neutral"
                  variant="subtle"
                  size="sm"
                >
                  {{ tag }}
                </UBadge>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>

      <UEmpty
        v-else
        icon="i-lucide-compass"
        title="Aucun voyage pour l'instant"
        description="Les aventures arrivent bientôt. Repassez vite !"
      />
    </section>
  </div>
</template>
