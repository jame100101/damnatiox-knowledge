<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'

defineProps<{ error: { statusCode?: number; message?: string } }>()
</script>

<template>
  <main class="error-page">
    <span class="eyebrow">KNOWLEDGE / ERROR</span>
    <h1>{{ error.statusCode || 500 }}</h1>
    <p>{{ error.message || '页面暂时不可用。' }}</p>
    <NuxtLink class="button primary" to="/">
      <ArrowLeft :size="16" /> 返回知识库
    </NuxtLink>
  </main>
</template>
