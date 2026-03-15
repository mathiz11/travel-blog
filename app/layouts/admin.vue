<script setup lang="ts">
const { logout } = useAuthStore();
</script>

<template>
  <UApp>
    <UHeader to="/admin">
      <template #title>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-image" class="size-5 text-(--ui-primary)" />
          <span>Blog - Administration</span>
        </div>
      </template>
      <template #right>
        <UButton
          variant="ghost"
          color="neutral"
          icon="i-lucide-log-out"
          @click="logout"
        />
      </template>
    </UHeader>
    <UMain>
      <UContainer class="py-8">
        <slot />
      </UContainer>
    </UMain>
  </UApp>
</template>
