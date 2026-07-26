export function useKnowledgeRealtime() {
  const { $supabase, $supabaseConfigured } = useNuxtApp()
  const { updateAvailable } = useKnowledge()
  let channel: ReturnType<typeof $supabase.channel> | null = null

  onMounted(() => {
    if (!$supabaseConfigured) return
    channel = $supabase
      .channel('knowledge-public-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'folders' },
        () => {
          updateAvailable.value = true
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'documents' },
        () => {
          updateAvailable.value = true
        },
      )
      .subscribe()
  })

  onUnmounted(() => {
    if (channel) $supabase.removeChannel(channel)
  })
}
