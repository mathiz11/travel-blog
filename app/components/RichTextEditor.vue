<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'

const props = defineProps<{ modelValue?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const editor = useEditor({
  content: props.modelValue ?? '',
  extensions: [
    StarterKit,
    Underline,
    Link.configure({ openOnClick: false }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
  ],
  onUpdate: ({ editor }) => emit('update:modelValue', editor.getHTML()),
})

const linkPopoverOpen = ref(false)
const linkUrl = ref('')

function openLinkPopover() {
  if (!editor.value) return
  const existing = editor.value.getAttributes('link').href as string | undefined
  linkUrl.value = existing ?? ''
  linkPopoverOpen.value = true
}

function applyLink() {
  if (!editor.value) return
  if (linkUrl.value) {
    editor.value.chain().focus().extendMarkRange('link').setLink({ href: linkUrl.value }).run()
  }
  linkPopoverOpen.value = false
  linkUrl.value = ''
}

function removeLink() {
  if (!editor.value) return
  editor.value.chain().focus().unsetLink().run()
  linkPopoverOpen.value = false
  linkUrl.value = ''
}

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
      <UButton
        size="xs"
        variant="ghost"
        icon="i-lucide-underline"
        :color="editor?.isActive('underline') ? 'primary' : 'neutral'"
        @click="editor?.chain().focus().toggleUnderline().run()"
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
      <UPopover v-model:open="linkPopoverOpen">
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-link"
          :color="editor?.isActive('link') ? 'primary' : 'neutral'"
          @click="openLinkPopover"
        />
        <template #content>
          <div class="flex items-center gap-1.5 p-2">
            <UInput
              v-model="linkUrl"
              placeholder="https://..."
              size="xs"
              autofocus
              class="w-56"
              @keydown.enter="applyLink"
            />
            <UButton size="xs" icon="i-lucide-check" color="primary" @click="applyLink" />
            <UButton
              v-if="editor?.isActive('link')"
              size="xs"
              icon="i-lucide-unlink"
              color="error"
              variant="ghost"
              @click="removeLink"
            />
          </div>
        </template>
      </UPopover>
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
        icon="i-lucide-align-left"
        :color="editor?.isActive({ textAlign: 'left' }) ? 'primary' : 'neutral'"
        @click="editor?.chain().focus().setTextAlign('left').run()"
      />
      <UButton
        size="xs"
        variant="ghost"
        icon="i-lucide-align-center"
        :color="editor?.isActive({ textAlign: 'center' }) ? 'primary' : 'neutral'"
        @click="editor?.chain().focus().setTextAlign('center').run()"
      />
      <UButton
        size="xs"
        variant="ghost"
        icon="i-lucide-align-right"
        :color="editor?.isActive({ textAlign: 'right' }) ? 'primary' : 'neutral'"
        @click="editor?.chain().focus().setTextAlign('right').run()"
      />
      <UButton
        size="xs"
        variant="ghost"
        icon="i-lucide-align-justify"
        :color="editor?.isActive({ textAlign: 'justify' }) ? 'primary' : 'neutral'"
        @click="editor?.chain().focus().setTextAlign('justify').run()"
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
.tiptap a {
  color: #2563eb;
  text-decoration: underline;
  cursor: pointer;
}
.tiptap code {
  background-color: #f3f4f6;
  border-radius: 0.25rem;
  padding: 0.125rem 0.25rem;
  font-family: monospace;
  font-size: 0.875em;
}
</style>
