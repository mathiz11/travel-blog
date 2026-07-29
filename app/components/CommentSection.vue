<script setup lang="ts">
import * as z from "zod";
import type { Comment } from "~/types/database.types";

const props = defineProps<{ tripId: string }>();

const { fetchComments, postComment } = useComments();
const toast = useToast();

const { data: comments } = useAsyncData(
  `comments-${props.tripId}`,
  () => fetchComments(props.tripId),
  { server: false, default: () => [] as Comment[] },
);

const schema = z.object({
  authorName: z.string().trim().min(1, "Ton nom est requis").max(60),
  body: z.string().trim().min(1, "Écris un message").max(2000),
});
type Schema = z.output<typeof schema>;

const state = reactive<Schema>({ authorName: "", body: "" });
const token = ref("");
const submitting = ref(false);

async function onSubmit() {
  if (!token.value) {
    toast.add({ title: "Merci de valider l'anti-spam", color: "warning" });
    return;
  }
  submitting.value = true;
  try {
    const created = await postComment({
      tripId: props.tripId,
      authorName: state.authorName,
      body: state.body,
      token: token.value,
    });
    comments.value = [created, ...(comments.value ?? [])];
    state.authorName = "";
    state.body = "";
    token.value = "";
    toast.add({ title: "Commentaire publié !", color: "success" });
  } catch {
    toast.add({ title: "Erreur lors de l'envoi", color: "error" });
  } finally {
    submitting.value = false;
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
</script>

<template>
  <section class="border-t border-gray-200 dark:border-gray-700 pt-10 space-y-8">
    <h2 class="text-2xl font-bold flex items-center gap-2">
      <UIcon name="i-lucide-message-circle" class="size-6" />
      Commentaires
      <span class="text-base font-normal text-gray-500">
        ({{ comments?.length ?? 0 }})
      </span>
    </h2>

    <!-- Liste -->
    <ul v-if="comments && comments.length > 0" class="space-y-6">
      <li
        v-for="comment in comments"
        :key="comment.id"
        class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-1"
      >
        <div class="flex items-baseline justify-between gap-3">
          <span class="font-semibold">{{ comment.author_name }}</span>
          <span class="text-xs text-gray-500 shrink-0">
            {{ formatDate(comment.created_at) }}
          </span>
        </div>
        <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {{ comment.body }}
        </p>
      </li>
    </ul>
    <p v-else class="text-gray-500">Sois le premier à laisser un commentaire.</p>

    <!-- Formulaire -->
    <UForm
      :schema="schema"
      :state="state"
      class="space-y-4"
      @submit="onSubmit"
    >
      <h3 class="text-lg font-semibold">Laisser un commentaire</h3>

      <UFormField label="Nom" name="authorName">
        <UInput v-model="state.authorName" placeholder="Ton prénom" class="w-full" />
      </UFormField>

      <UFormField label="Message" name="body">
        <UTextarea
          v-model="state.body"
          :rows="4"
          placeholder="Partage ton avis…"
          class="w-full"
        />
      </UFormField>

      <NuxtTurnstile v-model="token" />

      <UButton type="submit" icon="i-lucide-send" :loading="submitting">
        Publier
      </UButton>
    </UForm>
  </section>
</template>
