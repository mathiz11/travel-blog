<script setup lang="ts">
import type {
  BlockList,
  SingleBlock,
  DoubleBlock,
  WysiwygContent,
  ImageContent,
  GpxContent,
} from "~/types/blocks";

function asWysiwyg(c: unknown) { return c as WysiwygContent }
function asImage(c: unknown) { return c as ImageContent }
function asGpx(c: unknown) { return c as GpxContent }

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
  ogImage: () => trip.value?.thumbnail_url ?? undefined,
});

function formatDate(date: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const blocks = computed(() => (trip.value?.blocks as BlockList | null) ?? null);
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

    <!-- Vignette -->
    <div v-if="trip.thumbnail_url" class="mb-10">
      <img
        :src="trip.thumbnail_url"
        :alt="trip.title"
        class="w-full aspect-video object-cover rounded-xl shadow-sm"
      />
    </div>

    <!-- Contenu : blocs (nouveau système) -->
    <template v-if="blocks && blocks.length > 0">
      <div class="space-y-10">
        <template v-for="block in blocks" :key="block.id">
          <!-- Bloc simple -->
          <template v-if="block.layout === 'single'">
            <div
              v-if="(block as SingleBlock).content.type === 'wysiwyg'"
              class="trip-content"
              v-html="asWysiwyg((block as SingleBlock).content).html"
            />
            <img
              v-else-if="(block as SingleBlock).content.type === 'image'"
              :src="asImage((block as SingleBlock).content).url"
              :alt="asImage((block as SingleBlock).content).alt ?? ''"
              class="w-full rounded-xl"
            />
            <ClientOnly v-else-if="(block as SingleBlock).content.type === 'gpx'">
              <GpxMap
                :gpx-url="asGpx((block as SingleBlock).content).url"
                :label="asGpx((block as SingleBlock).content).label"
              />
              <template #fallback>
                <div class="h-80 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <UIcon name="i-lucide-map" class="size-12 text-gray-400" />
                </div>
              </template>
            </ClientOnly>
          </template>

          <!-- Bloc double -->
          <template v-else-if="block.layout === 'double'">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Slot gauche -->
              <div
                v-if="(block as DoubleBlock).left.type === 'wysiwyg'"
                class="trip-content"
                v-html="asWysiwyg((block as DoubleBlock).left).html"
              />
              <img
                v-else-if="(block as DoubleBlock).left.type === 'image'"
                :src="asImage((block as DoubleBlock).left).url"
                :alt="asImage((block as DoubleBlock).left).alt ?? ''"
                class="w-full rounded-xl"
              />
              <ClientOnly v-else-if="(block as DoubleBlock).left.type === 'gpx'">
                <GpxMap
                  :gpx-url="asGpx((block as DoubleBlock).left).url"
                  :label="asGpx((block as DoubleBlock).left).label"
                />
                <template #fallback>
                  <div class="h-80 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <UIcon name="i-lucide-map" class="size-12 text-gray-400" />
                  </div>
                </template>
              </ClientOnly>
              <!-- Slot droite -->
              <div
                v-if="(block as DoubleBlock).right.type === 'wysiwyg'"
                class="trip-content"
                v-html="asWysiwyg((block as DoubleBlock).right).html"
              />
              <img
                v-else-if="(block as DoubleBlock).right.type === 'image'"
                :src="asImage((block as DoubleBlock).right).url"
                :alt="asImage((block as DoubleBlock).right).alt ?? ''"
                class="w-full rounded-xl"
              />
              <ClientOnly v-else-if="(block as DoubleBlock).right.type === 'gpx'">
                <GpxMap
                  :gpx-url="asGpx((block as DoubleBlock).right).url"
                  :label="asGpx((block as DoubleBlock).right).label"
                />
                <template #fallback>
                  <div class="h-80 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <UIcon name="i-lucide-map" class="size-12 text-gray-400" />
                  </div>
                </template>
              </ClientOnly>
            </div>
          </template>
        </template>
      </div>
    </template>

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
