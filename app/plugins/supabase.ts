import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const url = String(config.public.supabaseUrl || '')
  const key = String(config.public.supabasePublishableKey || '')
  const configured = /^https:\/\//.test(url) && key.length > 20
  const supabase = createClient(
    configured ? url : 'https://placeholder.supabase.co',
    configured ? key : 'placeholder-publishable-key-value',
    {
      auth: {
        persistSession: import.meta.client,
        autoRefreshToken: import.meta.client,
        detectSessionInUrl: import.meta.client,
      },
    },
  )
  return {
    provide: {
      supabase,
      supabaseConfigured: configured,
    },
  }
})
