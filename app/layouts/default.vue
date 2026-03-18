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

  <UFooter>
    <template #left>
      <p class="text-sm text-gray-500">© {{ new Date().getFullYear() }} Chloé Voyage</p>
    </template>
    <template #right>
      <UButton
        to="https://www.instagram.com/chloexplore"
        target="_blank"
        rel="noopener noreferrer"
        icon="i-lucide-instagram"
        variant="ghost"
        class="!text-[#E1306C] hover:!text-[#C13584]"
        aria-label="Instagram @chloexplore"
      />
    </template>
  </UFooter>
</template>
