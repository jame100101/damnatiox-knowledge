import { computed } from 'vue'

export type KnowledgeTheme = 'dark' | 'light'

function normalizeTheme(value: unknown): KnowledgeTheme {
  return value === 'light' ? 'light' : 'dark'
}

export function useTheme() {
  const cookie = useCookie<KnowledgeTheme>('kb-theme', {
    default: () => 'dark',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
  const theme = useState<KnowledgeTheme>('kb-theme', () => normalizeTheme(cookie.value))
  const isDark = computed(() => theme.value === 'dark')

  function setTheme(value: KnowledgeTheme) {
    theme.value = value
    cookie.value = value
  }

  function toggleTheme() {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  return { theme, isDark, setTheme, toggleTheme }
}
