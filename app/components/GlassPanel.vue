<script setup lang="ts">
// Panneau "Liquid Glass" réutilisable : flou d'arrière-plan, dégradé translucide,
// liseré de surbrillance (sheen) en haut + halo doux.
withDefaults(
  defineProps<{
    /** Intensité du flou */
    blur?: "md" | "lg" | "xl";
    /** Teinte de fond claire (sur fond clair) ou sombre */
    tone?: "light" | "dark";
  }>(),
  { blur: "xl", tone: "light" },
);
</script>

<template>
  <div
    class="rounded-2xl border"
    :class="[
      blur === 'md'
        ? 'backdrop-blur-md'
        : blur === 'lg'
          ? 'backdrop-blur-lg'
          : 'backdrop-blur-2xl',
      tone === 'light'
        ? 'border-white/60 bg-gradient-to-br from-white/45 to-white/20 text-gray-900 shadow-[0_12px_45px_-8px_rgba(0,0,0,0.28),inset_0_1px_0_0_rgba(255,255,255,0.7)]'
        : 'border-white/15 bg-gradient-to-br from-white/15 to-white/5 text-white shadow-[0_12px_45px_-8px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.25)]',
    ]"
  >
    <slot />
  </div>
</template>
