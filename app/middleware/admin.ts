export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return
  const { $supabaseConfigured } = useNuxtApp()
  if (!$supabaseConfigured && import.meta.dev) return
  const auth = useAuth()
  await auth.refresh()
  if (!auth.isAdmin.value) return navigateTo('/admin/login')
})
