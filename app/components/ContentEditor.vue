<script setup lang="ts">
import type {
  SlotContent,
  DoubleSlotContent,
  WysiwygContent,
  ImageContent,
  GpxContent,
} from "~/types/blocks";

const props = defineProps<{
  modelValue: SlotContent | DoubleSlotContent;
  allowGpx: boolean;
  tripId: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: SlotContent | DoubleSlotContent];
}>();

type ContentType = "wysiwyg" | "image" | "gpx";

const typeOptions = computed<{ value: ContentType; label: string; icon: string }[]>(() => {
  const opts: { value: ContentType; label: string; icon: string }[] = [
    { value: "wysiwyg", label: "Texte", icon: "i-lucide-type" },
    { value: "image", label: "Image", icon: "i-lucide-image" },
  ];
  if (props.allowGpx) {
    opts.push({ value: "gpx", label: "Carte GPX", icon: "i-lucide-map" });
  }
  return opts;
});

function switchType(newType: ContentType) {
  if (newType === props.modelValue.type) return;
  const defaults: Record<ContentType, SlotContent> = {
    wysiwyg: { type: "wysiwyg", html: "" } satisfies WysiwygContent,
    image: { type: "image", url: "", storagePath: "", alt: "" } satisfies ImageContent,
    gpx: { type: "gpx", url: "", storagePath: "", label: "" } satisfies GpxContent,
  };
  emit("update:modelValue", defaults[newType]!);
}

// --- Image upload ---
const { upload: uploadImage, loading: uploadingImage } = useStorageUpload();
const imageInput = ref<HTMLInputElement | null>(null);

async function onImageChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const result = await uploadImage(file, `blocks/${props.tripId}`);
  emit("update:modelValue", {
    type: "image",
    url: result.url,
    storagePath: result.path,
    alt: (props.modelValue as ImageContent).alt ?? "",
  } satisfies ImageContent);
  if (imageInput.value) imageInput.value.value = "";
}

function clearImage() {
  emit("update:modelValue", { type: "image", url: "", storagePath: "", alt: "" } satisfies ImageContent);
}

function updateImageAlt(val: string) {
  emit("update:modelValue", { ...(props.modelValue as ImageContent), alt: val });
}

// --- GPX upload ---
const { upload: uploadGpx, loading: uploadingGpx } = useGpxUpload();
const gpxInput = ref<HTMLInputElement | null>(null);

async function onGpxChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const result = await uploadGpx(file, `gpx/${props.tripId}`);
  emit("update:modelValue", {
    type: "gpx",
    url: result.url,
    storagePath: result.path,
    label: (props.modelValue as GpxContent).label ?? "",
  } satisfies GpxContent);
  if (gpxInput.value) gpxInput.value.value = "";
}

function clearGpx() {
  emit("update:modelValue", { type: "gpx", url: "", storagePath: "", label: "" } satisfies GpxContent);
}

function updateGpxLabel(val: string) {
  emit("update:modelValue", { ...(props.modelValue as GpxContent), label: val });
}
</script>

<template>
  <div class="space-y-3">
    <!-- Type selector -->
    <div class="flex gap-1.5">
      <UButton
        v-for="opt in typeOptions"
        :key="opt.value"
        size="xs"
        :variant="modelValue.type === opt.value ? 'solid' : 'outline'"
        color="neutral"
        :icon="opt.icon"
        @click="switchType(opt.value)"
      >
        {{ opt.label }}
      </UButton>
    </div>

    <!-- Wysiwyg -->
    <RichTextEditor
      v-if="modelValue.type === 'wysiwyg'"
      :model-value="(modelValue as WysiwygContent).html"
      @update:model-value="emit('update:modelValue', { type: 'wysiwyg', html: $event ?? '' })"
    />

    <!-- Image -->
    <div v-else-if="modelValue.type === 'image'" class="space-y-3">
      <img
        v-if="(modelValue as ImageContent).url"
        :src="(modelValue as ImageContent).url"
        :alt="(modelValue as ImageContent).alt ?? ''"
        class="max-h-48 rounded-lg object-cover"
      />
      <div class="flex gap-2 items-center">
        <UButton
          type="button"
          variant="outline"
          color="neutral"
          icon="i-lucide-upload"
          :loading="uploadingImage"
          @click="imageInput?.click()"
        >
          {{ (modelValue as ImageContent).url ? "Changer" : "Choisir une image" }}
        </UButton>
        <UButton
          v-if="(modelValue as ImageContent).url"
          type="button"
          variant="ghost"
          color="error"
          icon="i-lucide-x"
          @click="clearImage"
        />
      </div>
      <UInput
        :model-value="(modelValue as ImageContent).alt ?? ''"
        placeholder="Texte alternatif (accessibilité)"
        @update:model-value="updateImageAlt($event ?? '')"
      />
      <input
        ref="imageInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="onImageChange"
      />
    </div>

    <!-- GPX -->
    <div v-else-if="modelValue.type === 'gpx'" class="space-y-3">
      <div
        v-if="(modelValue as GpxContent).url"
        class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
      >
        <UIcon name="i-lucide-map-pin" class="size-4 shrink-0 text-green-500" />
        <span>Fichier GPX chargé</span>
        <UButton
          size="xs"
          variant="ghost"
          color="error"
          icon="i-lucide-x"
          class="ml-auto"
          @click="clearGpx"
        />
      </div>
      <UButton
        type="button"
        variant="outline"
        color="neutral"
        icon="i-lucide-upload"
        :loading="uploadingGpx"
        @click="gpxInput?.click()"
      >
        {{ (modelValue as GpxContent).url ? "Remplacer le fichier GPX" : "Choisir un fichier GPX" }}
      </UButton>
      <UInput
        :model-value="(modelValue as GpxContent).label ?? ''"
        placeholder="Légende de la carte (optionnelle)"
        @update:model-value="updateGpxLabel($event ?? '')"
      />
      <input
        ref="gpxInput"
        type="file"
        accept=".gpx"
        class="hidden"
        @change="onGpxChange"
      />
    </div>
  </div>
</template>
