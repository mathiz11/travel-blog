<script setup lang="ts">
const route = useRoute();
const slug = route.params.slug as string;

const { data: trip } = await useAsyncData(`trip-${slug}`, () =>
  useTrips().fetchTripBySlug(slug),
);

if (!trip.value) {
  throw createError({ statusCode: 404, fatal: true });
}

useSeoMeta({
  title: () =>
    trip.value?.title ? `${trip.value.title} · Chloé Voyage` : "Chloé Voyage",
  description: () => trip.value?.summary ?? "",
  ogTitle: () =>
    trip.value?.title ? `${trip.value.title} · Chloé Voyage` : "Chloé Voyage",
  ogDescription: () => trip.value?.summary ?? "",
  ogImage: () => trip.value?.cover_image_url ?? undefined,
});

function formatDate(date: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
</script>

<template>
  <div v-if="trip" class="max-w-3xl mx-auto">
    <!-- Retour -->
    <div class="mb-8">
      <UButton
        to="/"
        variant="ghost"
        icon="i-lucide-arrow-left"
        color="neutral"
      >
        Retour
      </UButton>
    </div>

    <!-- En-tête -->
    <header class="mb-8 space-y-4">
      <div
        class="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
      >
        <UIcon name="i-lucide-map-pin" class="size-4 shrink-0" />
        <span
          >{{ trip.destination
          }}{{ trip.country ? `, ${trip.country}` : "" }}</span
        >
        <template v-if="formatDate(trip.trip_date)">
          <span>·</span>
          <span>{{ formatDate(trip.trip_date) }}</span>
        </template>
      </div>

      <h1 class="text-3xl md:text-4xl font-bold leading-tight">
        {{ trip.title }}
      </h1>

      <p v-if="trip.summary" class="text-lg text-gray-600 dark:text-gray-400">
        {{ trip.summary }}
      </p>

      <div
        v-if="trip.tags && trip.tags.length > 0"
        class="flex flex-wrap gap-2"
      >
        <UBadge
          v-for="tag in trip.tags"
          :key="tag"
          color="neutral"
          variant="subtle"
        >
          {{ tag }}
        </UBadge>
      </div>
    </header>

    <!-- Image de couverture -->
    <div v-if="trip.cover_image_url" class="mb-10">
      <img
        :src="trip.cover_image_url"
        :alt="trip.title"
        class="w-full aspect-video object-cover rounded-xl shadow-sm"
      />
    </div>

    <!-- Contenu -->
    <div v-if="trip.content" class="trip-content" v-html="trip.content" />
  </div>
</template>

<style scoped>
@reference "~/assets/css/main.css";
.trip-content :deep(h2) {
  @apply text-2xl font-bold mt-10 mb-4;
}
.trip-content :deep(h3) {
  @apply text-xl font-semibold mt-8 mb-3;
}
.trip-content :deep(p) {
  @apply mb-5 leading-relaxed;
}
.trip-content :deep(ul) {
  @apply list-disc pl-6 mb-5 space-y-1.5;
}
.trip-content :deep(ol) {
  @apply list-decimal pl-6 mb-5 space-y-1.5;
}
.trip-content :deep(li) {
  @apply leading-relaxed;
}
.trip-content :deep(blockquote) {
  @apply border-l-4 border-primary pl-5 italic text-gray-600 dark:text-gray-400 my-6;
}
.trip-content :deep(a) {
  @apply underline underline-offset-2 text-(--ui-primary) hover:opacity-80;
}
.trip-content :deep(strong) {
  @apply font-semibold;
}
.trip-content :deep(em) {
  @apply italic;
}
.trip-content :deep(code) {
  @apply font-mono text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded;
}
.trip-content :deep(hr) {
  @apply my-10 border-gray-200 dark:border-gray-700;
}
</style>
