<script setup lang="ts">
defineProps<{ eyebrow: string; title: string; description?: string }>()
</script>

<template>
  <header class="admin-page-header">
    <div>
      <span class="eyebrow">{{ eyebrow }}</span>
      <h1>{{ title }}</h1>
      <p v-if="description">{{ description }}</p>
    </div>
    <div class="header-actions"><slot /></div>
  </header>
</template>

<style scoped>
.admin-page-header { min-height: 120px; display: flex; align-items: center; justify-content: space-between; gap: 30px; padding: 28px 34px; border-bottom: 1px solid var(--kb-border); }
h1 { margin: 6px 0 0; font-size: 25px; letter-spacing: -.035em; }
p { margin: 7px 0 0; color: var(--kb-text-muted); font-size: 13px; }
.header-actions { display: flex; gap: 8px; }
@media (max-width: 650px) {
  .admin-page-header { min-height: 105px; padding: 22px 16px; align-items: flex-start; }
  .header-actions { flex-wrap: wrap; justify-content: flex-end; }
}
</style>
