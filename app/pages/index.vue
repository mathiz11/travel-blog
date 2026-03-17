<script setup lang="ts">
const { data: trips } = await useAsyncData("published-trips", () =>
  useTrips().fetchPublishedTrips(6),
);

useSeoMeta({
  title: "Chloé voyage",
  description:
    "Voyages, photos, gastronomie et cultures du monde. Des aventures bas carbone partagées avec passion.",
  ogTitle: "Chloé voyage",
  ogDescription: "Aventures bas carbone, photos et saveurs du monde.",
});

function formatDate(date: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
  });
}
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="py-16 md:py-24">
      <div class="flex flex-col md:flex-row items-center gap-10">
        <div class="shrink-0">
          <div
            class="w-36 h-36 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg"
          >
            <UIcon name="i-lucide-compass" class="size-16 text-white" />
          </div>
        </div>
        <div>
          <h1 class="text-4xl md:text-5xl font-bold mb-4">
            Salut, moi c'est Chloé&nbsp;! 👋
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-2xl">
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
                v-if="trip.cover_image_url"
                :src="trip.cover_image_url"
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
