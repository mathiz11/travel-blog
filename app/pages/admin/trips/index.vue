<script setup lang="ts">
import type { Trip } from '~/types/database.types'

definePageMeta({ layout: 'admin' })

const { fetchTrips, deleteTrip } = useTrips()
const toast = useToast()

const trips = ref<Trip[]>([])
const loading = ref(true)
const deletingId = ref<string | null>(null)
const confirmModal = ref(false)
const tripToDelete = ref<Trip | null>(null)

onMounted(async () => {
  try {
    trips.value = await fetchTrips()
  }
  finally {
    loading.value = false
  }
})

function openDeleteModal(trip: Trip) {
  tripToDelete.value = trip
  confirmModal.value = true
}

async function onConfirmDelete() {
  if (!tripToDelete.value) return
  deletingId.value = tripToDelete.value.id
  confirmModal.value = false
  try {
    await deleteTrip(tripToDelete.value.id)
    trips.value = trips.value.filter(t => t.id !== tripToDelete.value!.id)
    toast.add({ title: 'Voyage supprimé', color: 'success' })
  }
  catch {
    toast.add({ title: 'Erreur lors de la suppression', color: 'error' })
  }
  finally {
    deletingId.value = null
    tripToDelete.value = null
  }
}

function formatDate(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' })
}

const columns = [
  { key: 'title', label: 'Titre' },
  { key: 'destination', label: 'Destination' },
  { key: 'country', label: 'Pays' },
  { key: 'trip_date', label: 'Date' },
  { key: 'published', label: 'Statut' },
  { key: 'actions', label: '' },
]
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Voyages</h1>
      <UButton to="/admin/trips/new" icon="i-lucide-plus">Nouveau voyage</UButton>
    </div>

    <UTable
      v-if="!loading"
      :data="trips"
      :columns="columns"
    >
      <template #trip_date-cell="{ row }">
        {{ formatDate(row.original.trip_date) }}
      </template>
      <template #published-cell="{ row }">
        <UBadge
          :color="row.original.published ? 'success' : 'neutral'"
          variant="subtle"
        >
          {{ row.original.published ? 'Publié' : 'Brouillon' }}
        </UBadge>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex justify-end gap-2">
          <UButton
            :to="`/admin/trips/${row.original.id}/edit`"
            size="sm"
            variant="ghost"
            icon="i-lucide-pencil"
          />
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
      <UIcon name="i-lucide-loader-circle" class="h-6 w-6 animate-spin text-gray-400" />
    </div>

    <UModal v-model:open="confirmModal" title="Supprimer le voyage">
      <template #body>
        <p>Supprimer <strong>{{ tripToDelete?.title }}</strong> ? Cette action est irréversible.</p>
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
