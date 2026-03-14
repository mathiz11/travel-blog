export const useAuthStore = defineStore('auth', () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const isAuthenticated = computed(() => !!user.value)

  async function logout() {
    await supabase.auth.signOut()
    await navigateTo('/admin/login')
  }

  return { user, isAuthenticated, logout }
})
