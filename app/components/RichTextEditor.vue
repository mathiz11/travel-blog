<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

const props = defineProps<{ modelValue?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const editor = useEditor({
  content: props.modelValue ?? '',
  extensions: [StarterKit],
  onUpdate: ({ editor }) => emit('update:modelValue', editor.getHTML()),
})

watch(() => props.modelValue, (val) => {
  if (editor.value && editor.value.getHTML() !== (val ?? '')) {
    editor.value.commands.setContent(val ?? '')
  }
})

onBeforeUnmount(() => editor.value?.destroy())
</script>

<template>
  <div class="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 p-1.5 dark:border-gray-700 dark:bg-gray-800/50">
      <UButton
        size="xs"
        variant="ghost"
        icon="i-lucide-bold"
        :color="editor?.isActive('bold') ? 'primary' : 'neutral'"
        @click="editor?.chain().focus().toggleBold().run()"
      />
      <UButton
        size="xs"
        variant="ghost"
        icon="i-lucide-italic"
        :color="editor?.isActive('italic') ? 'primary' : 'neutral'"
        @click="editor?.chain().focus().toggleItalic().run()"
      />
      <UButton
        size="xs"
        variant="ghost"
        icon="i-lucide-strikethrough"
        :color="editor?.isActive('strike') ? 'primary' : 'neutral'"
        @click="editor?.chain().focus().toggleStrike().run()"
      />
      <div class="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-600" />
      <UButton
        size="xs"
        variant="ghost"
        icon="i-lucide-heading-2"
        :color="editor?.isActive('heading', { level: 2 }) ? 'primary' : 'neutral'"
        @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
      />
      <UButton
        size="xs"
        variant="ghost"
        icon="i-lucide-heading-3"
        :color="editor?.isActive('heading', { level: 3 }) ? 'primary' : 'neutral'"
        @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
      />
      <div class="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-600" />
      <UButton
        size="xs"
        variant="ghost"
        icon="i-lucide-list"
        :color="editor?.isActive('bulletList') ? 'primary' : 'neutral'"
        @click="editor?.chain().focus().toggleBulletList().run()"
      />
      <UButton
        size="xs"
        variant="ghost"
        icon="i-lucide-list-ordered"
        :color="editor?.isActive('orderedList') ? 'primary' : 'neutral'"
        @click="editor?.chain().focus().toggleOrderedList().run()"
      />
      <UButton
        size="xs"
        variant="ghost"
        icon="i-lucide-quote"
        :color="editor?.isActive('blockquote') ? 'primary' : 'neutral'"
        @click="editor?.chain().focus().toggleBlockquote().run()"
      />
      <UButton
        size="xs"
        variant="ghost"
        icon="i-lucide-code"
        :color="editor?.isActive('code') ? 'primary' : 'neutral'"
        @click="editor?.chain().focus().toggleCode().run()"
      />
      <UButton
        size="xs"
        variant="ghost"
        icon="i-lucide-minus"
        color="neutral"
        @click="editor?.chain().focus().setHorizontalRule().run()"
      />
      <div class="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-600" />
      <UButton
        size="xs"
        variant="ghost"
        icon="i-lucide-undo"
        color="neutral"
        :disabled="!editor?.can().undo()"
        @click="editor?.chain().focus().undo().run()"
      />
      <UButton
        size="xs"
        variant="ghost"
        icon="i-lucide-redo"
        color="neutral"
        :disabled="!editor?.can().redo()"
        @click="editor?.chain().focus().redo().run()"
      />
    </div>

    <!-- Editor area -->
    <EditorContent
      :editor="editor"
      class="prose prose-sm dark:prose-invert max-w-none min-h-64 p-4 focus:outline-none"
    />
  </div>
</template>

<style>
.tiptap:focus {
  outline: none;
}
.tiptap > * + * {
  margin-top: 0.5em;
}
.tiptap ul, .tiptap ol {
  padding-left: 1.25rem;
}
.tiptap blockquote {
  border-left: 3px solid #d1d5db;
  padding-left: 1rem;
  color: #6b7280;
}
.tiptap hr {
  border-color: #d1d5db;
  margin: 1rem 0;
}
.tiptap code {
  background-color: #f3f4f6;
  border-radius: 0.25rem;
  padding: 0.125rem 0.25rem;
  font-family: monospace;
  font-size: 0.875em;
}
</style>
