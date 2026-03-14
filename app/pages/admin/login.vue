<script setup lang="ts">
import * as z from "zod";

definePageMeta({ auth: false, layout: false });

const supabase = useSupabaseClient();
const router = useRouter();

const schema = z.object({
  email: z.email("Adresse email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

type Schema = z.output<typeof schema>;

const state = reactive<Schema>({
  email: "",
  password: "",
});
const show = ref(false);

const error = ref<string | null>(null);

async function onSubmit() {
  error.value = null;
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: state.email,
    password: state.password,
  });
  if (authError) {
    error.value = authError.message;
    return;
  }
  router.push("/");
}
</script>

<template>
  <UContainer class="flex min-h-screen items-center justify-center">
    <div class="w-full max-w-sm space-y-8">
      <h1 class="text-2xl font-semibold text-center">Connexion</h1>

      <UForm :schema="schema" :state="state" class="space-y-5" @submit="onSubmit">
        <UFormField label="Email" name="email">
          <UInput v-model="state.email" type="email" size="xl" class="w-full" />
        </UFormField>

        <UFormField label="Mot de passe" name="password">
          <UInput
            v-model="state.password"
            :type="show ? 'text' : 'password'"
            size="xl"
            class="w-full"
            :ui="{ trailing: 'pe-1' }"
          >
            <template #trailing>
              <UButton
                color="neutral"
                variant="link"
                :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                :aria-label="show ? 'Hide password' : 'Show password'"
                :aria-pressed="show"
                aria-controls="password"
                @click="show = !show"
              />
            </template>
          </UInput>
        </UFormField>

        <UAlert
          v-if="error"
          color="error"
          variant="soft"
          :description="error"
          icon="i-lucide-circle-alert"
        />

        <UButton type="submit" block size="xl" loading-auto>
          Se connecter
        </UButton>
      </UForm>
    </div>
  </UContainer>
</template>
