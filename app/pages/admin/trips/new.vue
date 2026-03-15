<script setup lang="ts">
import type { TripInsert } from '~/types/database.types'

definePageMeta({ middleware: 'auth', layout: 'admin' })

const { createTrip } = useTrips()
const toast = useToast()
const saving = ref(false)

async function onSubmit(data: TripInsert) {
  saving.value = true
  try {
    const trip = await createTrip(data)
    toast.add({ title: 'Voyage créé', color: 'success' })
    await navigateTo(`/admin/trips/${trip.id}/edit`)
  }
  catch {
    toast.add({ title: 'Erreur lors de la création', color: 'error' })
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Nouveau voyage</h1>
      <UButton to="/admin/trips" variant="ghost" icon="i-lucide-arrow-left">Retour</UButton>
    </div>

    <TripForm
      :model-value="{ title: '', slug: '', published: false }"
      :loading="saving"
      @submit="onSubmit"
    />
  </div>
</template>
