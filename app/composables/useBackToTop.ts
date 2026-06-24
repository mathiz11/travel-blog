export function useBackToTop(threshold = 400) {
  const isVisible = ref(false)

  function onScroll() {
    isVisible.value = window.scrollY > threshold
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (import.meta.client) {
    onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
    onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
  }

  return { isVisible, scrollToTop }
}
