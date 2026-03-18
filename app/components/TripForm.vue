<script setup lang="ts">
import * as z from "zod";
import type { TripInsert, TripUpdate } from "~/types/database.types";

const props = defineProps<{
  modelValue: TripInsert | TripUpdate;
  loading: boolean;
  tripId?: string;
}>();

const emit = defineEmits<{
  submit: [data: TripInsert | TripUpdate];
}>();

const schema = z.object({
  title: z.string().min(1, "Titre requis"),
  slug: z
    .string()
    .min(1, "Slug requis")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug invalide (lettres minuscules, chiffres, tirets)",
    ),
  summary: z.string().optional(),
  destination: z.string().optional(),
  country: z.string().optional(),
  trip_date: z.string().nullable().optional(),
  thumbnail_url: z.string().optional(),
  content: z.string().optional(),
  published: z.boolean().optional(),
});

const state = reactive<TripInsert | TripUpdate>({ ...props.modelValue });
const tagsInput = ref((props.modelValue.tags ?? []).join(", "));
const slugManuallyEdited = ref(!!props.modelValue.slug);

watch(
  () => props.modelValue,
  (val) => {
    Object.assign(state, val);
    tagsInput.value = (val.tags ?? []).join(", ");
  },
  { deep: true },
);

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function onTitleInput(val: string) {
  state.title = val;
  if (!slugManuallyEdited.value) {
    state.slug = slugify(val);
  }
}

function onSlugInput(val: string) {
  slugManuallyEdited.value = true;
  state.slug = val;
}

// Cover image upload (only available when tripId is provided)
const { upload: uploadImage, loading: uploadLoading } = useStorageUpload();
const coverFileInput = ref<HTMLInputElement | null>(null);

async function onCoverFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file || !props.tripId) return;
  const path = `covers/${props.tripId}`;
  const result = await uploadImage(file, path);
  state.thumbnail_url = result.url;
}

function onSubmit() {
  state.tags = tagsInput.value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  emit("submit", { ...state });
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <UFormField label="Titre" name="title" required>
        <UInput
          :model-value="state.title ?? ''"
          class="w-full"
          @update:model-value="onTitleInput"
        />
      </UFormField>

      <UFormField label="Slug" name="slug" required>
        <UInput
          :model-value="state.slug ?? ''"
          class="w-full"
          @update:model-value="onSlugInput"
        />
      </UFormField>

      <UFormField label="Destination" name="destination">
        <UInput v-model="state.destination" class="w-full" />
      </UFormField>

      <UFormField label="Pays" name="country">
        <UInput v-model="state.country" class="w-full" />
      </UFormField>

      <UFormField label="Date du voyage" name="trip_date">
        <UInput
          :model-value="state.trip_date ?? undefined"
          type="date"
          class="w-full"
          @update:model-value="state.trip_date = $event || null"
        />
      </UFormField>

      <UFormField label="Tags" name="tags" hint="Séparés par des virgules">
        <UInput
          v-model="tagsInput"
          placeholder="france, montagne, randonnée"
          class="w-full"
        />
      </UFormField>
    </div>

    <UFormField label="Résumé" name="summary">
      <UTextarea v-model="state.summary" :rows="3" class="w-full" />
    </UFormField>

    <!-- Thumbnail — only available on edit (tripId required) -->
    <UFormField
      v-if="tripId"
      label="Vignette"
      name="thumbnail_url"
    >
      <div class="flex flex-col gap-3">
        <img
          v-if="state.thumbnail_url"
          :src="state.thumbnail_url"
          alt="Vignette"
          class="h-36 w-56 rounded-lg object-cover"
        />
        <div class="flex items-center gap-3">
          <UButton
            type="button"
            variant="outline"
            icon="i-lucide-upload"
            :loading="uploadLoading"
            @click="coverFileInput?.click()"
          >
            {{
              state.thumbnail_url ? "Changer la vignette" : "Choisir une vignette"
            }}
          </UButton>
          <UButton
            v-if="state.thumbnail_url"
            type="button"
            variant="ghost"
            color="error"
            icon="i-lucide-x"
            @click="state.thumbnail_url = ''"
          />
        </div>
        <input
          ref="coverFileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="onCoverFileChange"
        />
      </div>
    </UFormField>

    <UFormField label="Contenu" name="content">
      <RichTextEditor v-model="state.content" />
    </UFormField>

    <div class="flex items-center justify-between">
      <UFormField label="Publié" name="published">
        <USwitch :model-value="state.published ?? false" @update:model-value="state.published = $event" />
      </UFormField>

      <UButton type="submit" :loading="loading || uploadLoading">
        Enregistrer
      </UButton>
    </div>
  </UForm>
</template>
