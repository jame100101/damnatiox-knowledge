export function useAuth() {
  const { $supabase, $supabaseConfigured } = useNuxtApp()
  const user = useState<any | null>('auth-user', () => null)
  const profile = useState<any | null>('auth-profile', () => null)
  const loading = useState('auth-loading', () => false)
  const isAdmin = computed(
    () => (!$supabaseConfigured && import.meta.dev) || profile.value?.role === 'admin',
  )

  async function refresh() {
    if (!$supabaseConfigured) return
    loading.value = true
    try {
      const { data } = await $supabase.auth.getUser()
      user.value = data.user
      if (data.user) {
        const result = await $supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
        profile.value = result.data
      } else {
        profile.value = null
      }
    } finally {
      loading.value = false
    }
  }

  async function signIn(email: string, password: string) {
    const { error } = await $supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    await refresh()
  }

  async function signOut() {
    await $supabase.auth.signOut()
    user.value = null
    profile.value = null
    await navigateTo('/')
  }

  return { user, profile, loading, isAdmin, refresh, signIn, signOut }
}
