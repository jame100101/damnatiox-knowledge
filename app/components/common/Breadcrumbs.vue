<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import type { Breadcrumb } from '~/types/knowledge'

defineProps<{ items: Breadcrumb[] }>()
</script>

<template>
  <nav class="breadcrumbs" aria-label="面包屑">
    <template v-for="(item, index) in items" :key="item.path">
      <ChevronRight v-if="index" :size="13" aria-hidden="true" />
      <NuxtLink :to="item.path" :aria-current="index === items.length - 1 ? 'page' : undefined">
        {{ item.label }}
      </NuxtLink>
    </template>
  </nav>
</template>

<style scoped>
.breadcrumbs { display: flex; align-items: center; gap: 5px; color: var(--kb-text-subtle); font-size: 12px; overflow: hidden; }
.breadcrumbs a { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color 150ms; }
.breadcrumbs a:hover, .breadcrumbs a[aria-current="page"] { color: var(--kb-text-muted); }
.breadcrumbs svg { flex: none; }
</style>
