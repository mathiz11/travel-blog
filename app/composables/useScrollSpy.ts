export function useScrollSpy(headingIds: Ref<string[]>) {
  const activeId = ref('')
  const visibleIds = new Set<string>()

  if (import.meta.client) {
    let observer: IntersectionObserver | null = null

    onMounted(() => {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              visibleIds.add(entry.target.id)
            } else {
              visibleIds.delete(entry.target.id)
            }
          }
          const ids = headingIds.value
          for (const id of ids) {
            if (visibleIds.has(id)) {
              activeId.value = id
              break
            }
          }
        },
        { rootMargin: '-80px 0px -70% 0px' },
      )

      watch(headingIds, (ids) => {
        observer!.disconnect()
        visibleIds.clear()
        for (const id of ids) {
          const el = document.getElementById(id)
          if (el) observer!.observe(el)
        }
      }, { immediate: true })
    })

    onBeforeUnmount(() => {
      observer?.disconnect()
    })
  }

  return { activeId }
}
