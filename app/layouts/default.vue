<script setup lang="ts">
const { isAuthenticated } = useAuthStore();
const route = useRoute();
const isHomePage = computed(() => route.path === "/");
const headerVisible = ref(!isHomePage.value);

function onScroll() {
  if (isHomePage.value) {
    headerVisible.value = window.scrollY > window.innerHeight * 0.5;
  }
}

watch(isHomePage, (home) => {
  headerVisible.value = !home;
});

onMounted(() => {
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
});
</script>

<template>
  <div
    class="transition-transform duration-300 ease-out"
    :class="{
      'fixed inset-x-0 top-0 z-50': isHomePage,
      '-translate-y-full': isHomePage && !headerVisible,
    }"
  >
    <UHeader to="/" :toggle="false">
      <template #title>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-compass" class="size-5 text-(--ui-primary)" />
          <span>Chloé explore</span>
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
  </div>

  <UMain>
    <UContainer class="py-8">
      <slot />
    </UContainer>
  </UMain>

  <UFooter>
    <template #left>
      <p class="text-sm text-gray-500">
        © {{ new Date().getFullYear() }} Chloé explore
      </p>
    </template>
    <template #right>
      <UButton
        to="https://www.instagram.com/_chloexplore_"
        target="_blank"
        rel="noopener noreferrer"
        icon="i-lucide-instagram"
        variant="ghost"
        class="!text-[#E1306C] hover:!text-[#C13584]"
        aria-label="Instagram @_chloexplore_"
      />
    </template>
  </UFooter>
</template>
