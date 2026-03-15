<script setup lang="ts">
import type { Trip, TripUpdate } from '~/types/database.types'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const { fetchTrip, updateTrip } = useTrips()
const toast = useToast()

const trip = ref<Trip | null>(null)
const saving = ref(false)

onMounted(async () => {
  try {
    trip.value = await fetchTrip(route.params.id as string)
  }
  catch {
    toast.add({ title: 'Voyage introuvable', color: 'error' })
    await navigateTo('/admin/trips')
  }
})

async function onSubmit(data: TripUpdate) {
  saving.value = true
  try {
    const updated = await updateTrip(route.params.id as string, data)
    trip.value = updated
    toast.add({ title: 'Voyage mis à jour', color: 'success' })
  }
  catch {
    toast.add({ title: 'Erreur lors de la mise à jour', color: 'error' })
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Modifier le voyage</h1>
      <UButton to="/admin" variant="ghost" icon="i-lucide-arrow-left">Retour</UButton>
    </div>

    <div v-if="!trip" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-circle" class="h-6 w-6 animate-spin text-gray-400" />
    </div>

    <TripForm
      v-else
      :model-value="trip"
      :trip-id="trip.id"
      :loading="saving"
      @submit="onSubmit"
    />
  </div>
</template>
