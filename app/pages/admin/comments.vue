<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Comment } from "~/types/database.types";

definePageMeta({ layout: "admin" });

const { fetchAllComments, deleteComment } = useComments();
const toast = useToast();

const comments = ref<Comment[]>([]);
const loading = ref(true);
const deletingId = ref<string | null>(null);
const confirmModal = ref(false);
const commentToDelete = ref<Comment | null>(null);

onMounted(async () => {
  try {
    comments.value = await fetchAllComments();
  } finally {
    loading.value = false;
  }
});

function openDeleteModal(comment: Comment) {
  commentToDelete.value = comment;
  confirmModal.value = true;
}

async function onConfirmDelete() {
  if (!commentToDelete.value) return;
  deletingId.value = commentToDelete.value.id;
  confirmModal.value = false;
  try {
    await deleteComment(commentToDelete.value.id);
    comments.value = comments.value.filter(
      (c) => c.id !== commentToDelete.value!.id,
    );
    toast.add({ title: "Commentaire supprimé", color: "success" });
  } catch {
    toast.add({ title: "Erreur lors de la suppression", color: "error" });
  } finally {
    deletingId.value = null;
    commentToDelete.value = null;
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const columns: TableColumn<Comment>[] = [
  { accessorKey: "author_name", header: "Auteur" },
  { accessorKey: "body", header: "Message" },
  { accessorKey: "created_at", header: "Date" },
  { id: "actions", header: "" },
];
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-semibold">Commentaires</h1>

    <UTable v-if="!loading" :data="comments" :columns="columns">
      <template #body-cell="{ row }">
        <span class="line-clamp-2 max-w-md">{{ row.original.body }}</span>
      </template>
      <template #created_at-cell="{ row }">
        {{ formatDate(row.original.created_at) }}
      </template>
      <template #actions-cell="{ row }">
        <div class="flex justify-end">
          <UButton
            size="sm"
            variant="ghost"
            color="error"
            icon="i-lucide-trash-2"
            :loading="deletingId === row.original.id"
            @click="openDeleteModal(row.original)"
          />
        </div>
      </template>
    </UTable>

    <div v-else class="flex justify-center py-12">
      <UIcon
        name="i-lucide-loader-circle"
        class="h-6 w-6 animate-spin text-gray-400"
      />
    </div>

    <UModal v-model:open="confirmModal" title="Supprimer le commentaire">
      <template #body>
        <p>
          Supprimer le commentaire de
          <strong>{{ commentToDelete?.author_name }}</strong> ? Cette action est
          irréversible.
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton variant="ghost" @click="confirmModal = false">Annuler</UButton>
          <UButton color="error" @click="onConfirmDelete">Supprimer</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
