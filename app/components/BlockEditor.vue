<script setup lang="ts">
import type {
  Block,
  BlockList,
  SingleBlock,
  DoubleBlock,
  SlotContent,
  DoubleSlotContent,
} from "~/types/blocks";

const props = defineProps<{
  modelValue: BlockList;
  tripId: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: BlockList];
}>();

const blocks = ref<BlockList>([...props.modelValue]);

watch(
  () => props.modelValue,
  (val) => {
    blocks.value = [...val];
  },
  { deep: true }
);

function emitUpdate() {
  emit("update:modelValue", [...blocks.value]);
}

function addSingleBlock() {
  const block: SingleBlock = {
    id: crypto.randomUUID(),
    layout: "single",
    content: { type: "wysiwyg", html: "" },
  };
  blocks.value.push(block);
  emitUpdate();
}

function addDoubleBlock() {
  const block: DoubleBlock = {
    id: crypto.randomUUID(),
    layout: "double",
    left: { type: "wysiwyg", html: "" },
    right: { type: "wysiwyg", html: "" },
  };
  blocks.value.push(block);
  emitUpdate();
}

function moveUp(index: number) {
  if (index === 0) return;
  const arr = [...blocks.value];
  [arr[index - 1], arr[index]] = [arr[index]!, arr[index - 1]!];
  blocks.value = arr;
  emitUpdate();
}

function moveDown(index: number) {
  if (index === blocks.value.length - 1) return;
  const arr = [...blocks.value];
  [arr[index], arr[index + 1]] = [arr[index + 1]!, arr[index]!];
  blocks.value = arr;
  emitUpdate();
}

function deleteBlock(index: number) {
  blocks.value.splice(index, 1);
  emitUpdate();
}

function updateSingleContent(index: number, content: SlotContent) {
  const block = blocks.value[index] as SingleBlock;
  blocks.value[index] = { ...block, content };
  emitUpdate();
}

function updateDoubleLeft(index: number, left: DoubleSlotContent) {
  const block = blocks.value[index] as DoubleBlock;
  blocks.value[index] = { ...block, left };
  emitUpdate();
}

function updateDoubleRight(index: number, right: DoubleSlotContent) {
  const block = blocks.value[index] as DoubleBlock;
  blocks.value[index] = { ...block, right };
  emitUpdate();
}
</script>

<template>
  <div class="space-y-4">
    <!-- Empty state -->
    <div
      v-if="blocks.length === 0"
      class="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-8 text-center text-gray-500 dark:text-gray-400"
    >
      <UIcon name="i-lucide-layout" class="size-8 mx-auto mb-2 opacity-50" />
      <p class="text-sm">Aucun bloc. Ajoutez votre premier bloc ci-dessous.</p>
    </div>

    <!-- Block list -->
    <div
      v-for="(block, i) in blocks"
      :key="block.id"
      class="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4 bg-white dark:bg-gray-900"
    >
      <!-- Block header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon
            :name="block.layout === 'single' ? 'i-lucide-square' : 'i-lucide-columns-2'"
            class="size-4 text-gray-400"
          />
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
            {{ block.layout === "single" ? "Bloc simple" : "Bloc double" }}
          </span>
          <UBadge size="xs" variant="subtle" color="neutral">{{ i + 1 }}</UBadge>
        </div>
        <div class="flex gap-1">
          <UButton
            size="xs"
            variant="ghost"
            color="neutral"
            icon="i-lucide-chevron-up"
            :disabled="i === 0"
            @click="moveUp(i)"
          />
          <UButton
            size="xs"
            variant="ghost"
            color="neutral"
            icon="i-lucide-chevron-down"
            :disabled="i === blocks.length - 1"
            @click="moveDown(i)"
          />
          <UButton
            size="xs"
            variant="ghost"
            color="error"
            icon="i-lucide-trash-2"
            @click="deleteBlock(i)"
          />
        </div>
      </div>

      <!-- Single block -->
      <template v-if="block.layout === 'single'">
        <ContentEditor
          :model-value="(block as SingleBlock).content"
          :allow-gpx="true"
          :trip-id="tripId"
          @update:model-value="updateSingleContent(i, $event)"
        />
      </template>

      <!-- Double block -->
      <template v-else-if="block.layout === 'double'">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1">
            <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">Gauche</p>
            <ContentEditor
              :model-value="(block as DoubleBlock).left"
              :allow-gpx="false"
              :trip-id="tripId"
              @update:model-value="updateDoubleLeft(i, $event as DoubleSlotContent)"
            />
          </div>
          <div class="space-y-1">
            <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">Droite</p>
            <ContentEditor
              :model-value="(block as DoubleBlock).right"
              :allow-gpx="false"
              :trip-id="tripId"
              @update:model-value="updateDoubleRight(i, $event as DoubleSlotContent)"
            />
          </div>
        </div>
      </template>
    </div>

    <!-- Add block buttons -->
    <div class="flex gap-3 pt-1">
      <UButton
        type="button"
        variant="outline"
        color="neutral"
        icon="i-lucide-plus"
        @click="addSingleBlock"
      >
        Bloc simple
      </UButton>
      <UButton
        type="button"
        variant="outline"
        color="neutral"
        icon="i-lucide-columns-2"
        @click="addDoubleBlock"
      >
        Bloc double
      </UButton>
    </div>
  </div>
</template>
