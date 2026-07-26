<script setup lang="ts">
const { theme } = useTheme()

watch(
  theme,
  (value) => {
    if (!import.meta.client) return
    document.documentElement.dataset.theme = value
    document.documentElement.style.colorScheme = value
  },
  { immediate: true },
)

useHead(() => ({
  htmlAttrs: { 'data-theme': theme.value },
  meta: [
    {
      name: 'theme-color',
      content: theme.value === 'dark' ? '#0b0d0f' : '#f5f7f2',
    },
  ],
}))
</script>

<template>
  <NuxtLoadingIndicator color="#d8ff64" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
