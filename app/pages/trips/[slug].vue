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
    trip.value?.title ? `${trip.value.title} · Chloé explore` : "Chloé explore",
  description: () => trip.value?.summary ?? "",
  ogTitle: () =>
    trip.value?.title ? `${trip.value.title} · Chloé explore` : "Chloé explore",
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

const { toc, getProcessedHtml, readingTimeMinutes } = useArticleContent(blocks);
const headingIds = computed(() => toc.value.map(e => e.id));
const { activeId } = useScrollSpy(headingIds);
const { isVisible: isBackToTopVisible, scrollToTop } = useBackToTop();

function scrollToHeading(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
</script>

<template>
  <div v-if="trip">
    <!-- Retour -->
    <div class="max-w-3xl mx-auto mb-8">
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
    <header class="max-w-3xl mx-auto mb-8 space-y-4">
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
        <template v-if="readingTimeMinutes > 0">
          <span>·</span>
          <UIcon name="i-lucide-clock" class="size-4 shrink-0" />
          <span>{{ readingTimeMinutes }} min de lecture</span>
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
    <div v-if="trip.thumbnail_url" class="max-w-3xl mx-auto mb-10">
      <img
        :src="trip.thumbnail_url"
        :alt="trip.title"
        class="w-full aspect-video object-cover rounded-xl shadow-sm"
      />
    </div>

    <!-- Contenu : blocs (nouveau système) -->
    <template v-if="blocks && blocks.length > 0">
      <div class="max-w-5xl mx-auto relative lg:grid lg:grid-cols-[minmax(0,768px)_220px] lg:gap-10 lg:justify-center">
        <!-- Colonne principale -->
        <div class="max-w-3xl mx-auto lg:mx-0 space-y-10">
          <!-- Sommaire mobile -->
          <nav v-if="toc.length > 0" class="lg:hidden rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <details>
              <summary class="font-semibold text-sm cursor-pointer select-none">Sommaire</summary>
              <ul class="mt-3 space-y-2">
                <li v-for="entry in toc" :key="entry.id">
                  <a
                    :href="`#${entry.id}`"
                    :class="[
                      'text-sm text-gray-600 dark:text-gray-400 hover:text-(--ui-primary) transition-colors',
                      entry.level === 3 ? 'pl-4' : '',
                    ]"
                    @click.prevent="scrollToHeading(entry.id)"
                  >
                    {{ entry.label }}
                  </a>
                </li>
              </ul>
            </details>
          </nav>

          <template v-for="block in blocks" :key="block.id">
            <!-- Bloc simple -->
            <template v-if="block.layout === 'single'">
              <div
                v-if="(block as SingleBlock).content.type === 'wysiwyg'"
                class="trip-content"
                v-html="getProcessedHtml(asWysiwyg((block as SingleBlock).content).html)"
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
                  v-html="getProcessedHtml(asWysiwyg((block as DoubleBlock).left).html)"
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
                  v-html="getProcessedHtml(asWysiwyg((block as DoubleBlock).right).html)"
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

        <!-- Sommaire desktop -->
        <aside v-if="toc.length > 0" class="hidden lg:block">
          <nav class="sticky top-24">
            <h2 class="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">Sommaire</h2>
            <ul class="space-y-1 border-l border-gray-200 dark:border-gray-700">
              <li v-for="entry in toc" :key="entry.id">
                <a
                  :href="`#${entry.id}`"
                  :class="[
                    'block text-sm py-1 transition-colors',
                    entry.level === 2 ? 'pl-3' : 'pl-6',
                    activeId === entry.id
                      ? 'text-(--ui-primary) font-semibold border-l-2 border-(--ui-primary) -ml-px'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
                  ]"
                  @click.prevent="scrollToHeading(entry.id)"
                >
                  {{ entry.label }}
                </a>
              </li>
            </ul>
          </nav>
        </aside>
      </div>
    </template>

    <!-- Commentaires (page prérendue → chargement côté client) -->
    <ClientOnly>
      <div class="max-w-3xl mx-auto mt-16">
        <CommentSection :trip-id="trip.id" />
      </div>
    </ClientOnly>

    <!-- Bouton retour en haut -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <UButton
        v-show="isBackToTopVisible"
        icon="i-lucide-arrow-up"
        color="neutral"
        variant="solid"
        size="lg"
        class="fixed bottom-6 right-6 z-50 rounded-full shadow-lg"
        aria-label="Retour en haut"
        @click="scrollToTop"
      />
    </Transition>
  </div>
</template>

<style scoped>
@reference "~/assets/css/main.css";
.trip-content :deep(h2) {
  @apply text-2xl font-bold mt-10 mb-4;
  scroll-margin-top: 6rem;
}
.trip-content :deep(h3) {
  @apply text-xl font-semibold mt-8 mb-3;
  scroll-margin-top: 6rem;
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
