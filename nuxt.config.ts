export default defineNuxtConfig({
  srcDir: 'app/',
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxt/eslint'],
  components: [{ path: '~/components', pathPrefix: false }],
  css: [
    '~/assets/css/theme.css',
    'highlight.js/styles/github-dark-dimmed.css',
    'katex/dist/katex.min.css',
  ],
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      supabasePublishableKey: process.env.NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
    },
  },
  app: {
    head: {
      titleTemplate: '%s · Damnatiox Knowledge',
      meta: [
        {
          name: 'description',
          content: 'Damnatiox 的个人 Markdown 知识工作台',
        },
      ],
    },
  },
  typescript: { strict: true, typeCheck: true },
  nitro: { preset: 'vercel' },
})
