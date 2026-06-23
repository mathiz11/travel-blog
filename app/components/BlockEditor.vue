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
const collapsedBlocks = ref<Set<string>>(new Set());

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

function toggleCollapse(blockId: string) {
  if (collapsedBlocks.value.has(blockId)) {
    collapsedBlocks.value.delete(blockId);
  } else {
    collapsedBlocks.value.add(blockId);
  }
}

function collapseAll() {
  for (const block of blocks.value) {
    collapsedBlocks.value.add(block.id);
  }
}

function expandAll() {
  collapsedBlocks.value.clear();
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

function moveToTop(index: number) {
  if (index === 0) return;
  const arr = [...blocks.value];
  const [item] = arr.splice(index, 1);
  arr.unshift(item!);
  blocks.value = arr;
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

function moveToBottom(index: number) {
  if (index === blocks.value.length - 1) return;
  const arr = [...blocks.value];
  const [item] = arr.splice(index, 1);
  arr.push(item!);
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

function blockLabel(block: Block): string {
  if (block.layout === 'single') {
    const types = { wysiwyg: 'Texte', image: 'Image', gpx: 'GPX' };
    return `Bloc simple — ${types[block.content.type]}`;
  }
  const types = { wysiwyg: 'Texte', image: 'Image', gpx: 'GPX' };
  return `Bloc double — ${types[block.left.type]} / ${types[block.right.type]}`;
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

    <!-- Collapse/Expand all -->
    <div v-if="blocks.length > 1" class="flex gap-2 justify-end">
      <UButton size="xs" variant="ghost" color="neutral" icon="i-lucide-chevrons-down-up" @click="collapseAll">
        Tout plier
      </UButton>
      <UButton size="xs" variant="ghost" color="neutral" icon="i-lucide-chevrons-up-down" @click="expandAll">
        Tout déplier
      </UButton>
    </div>

    <!-- Block list -->
    <div
      v-for="(block, i) in blocks"
      :key="block.id"
      class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
    >
      <!-- Block header -->
      <div
        class="flex items-center justify-between p-4 cursor-pointer select-none"
        @click="toggleCollapse(block.id)"
      >
        <div class="flex items-center gap-2">
          <UIcon
            :name="collapsedBlocks.has(block.id) ? 'i-lucide-chevron-right' : 'i-lucide-chevron-down'"
            class="size-4 text-gray-400 transition-transform"
          />
          <UIcon
            :name="block.layout === 'single' ? 'i-lucide-square' : 'i-lucide-columns-2'"
            class="size-4 text-gray-400"
          />
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
            {{ blockLabel(block) }}
          </span>
          <UBadge size="xs" variant="subtle" color="neutral">{{ i + 1 }}</UBadge>
        </div>
        <div class="flex gap-1" @click.stop>
          <UButton
            size="xs"
            variant="ghost"
            color="neutral"
            icon="i-lucide-chevrons-up"
            :disabled="i === 0"
            title="Déplacer tout en haut"
            @click="moveToTop(i)"
          />
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
            color="neutral"
            icon="i-lucide-chevrons-down"
            :disabled="i === blocks.length - 1"
            title="Déplacer tout en bas"
            @click="moveToBottom(i)"
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

      <!-- Block content (collapsible) -->
      <div v-show="!collapsedBlocks.has(block.id)" class="px-4 pb-4 space-y-4">
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
                :allow-gpx="true"
                :trip-id="tripId"
                @update:model-value="updateDoubleLeft(i, $event as DoubleSlotContent)"
              />
            </div>
            <div class="space-y-1">
              <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">Droite</p>
              <ContentEditor
                :model-value="(block as DoubleBlock).right"
                :allow-gpx="true"
                :trip-id="tripId"
                @update:model-value="updateDoubleRight(i, $event as DoubleSlotContent)"
              />
            </div>
          </div>
        </template>
      </div>
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
