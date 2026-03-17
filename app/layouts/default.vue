<script setup lang="ts">
const { isAuthenticated } = useAuthStore()
</script>

<template>
  <UHeader to="/">
    <template #title>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-compass" class="size-5 text-(--ui-primary)" />
        <span>Chloé voyage</span>
      </div>
    </template>

    <template #right>
      <UButton
        v-if="isAuthenticated"
        to="/admin"
        icon="i-lucide-layout-dashboard"
        color="neutral"
        variant="ghost"
        aria-label="Espace admin"
      />
    </template>
  </UHeader>

  <UMain>
    <UContainer class="py-8">
      <slot />
    </UContainer>
  </UMain>
</template>
