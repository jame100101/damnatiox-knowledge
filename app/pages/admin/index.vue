<script setup lang="ts">
import { ArrowRight, FileCheck2, FileClock, Files, FolderTree } from 'lucide-vue-next'
import { documentPublicPath } from '~/utils/folders'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: '管理仪表盘' })
const { folders, documents, load } = useKnowledge()
await load(false, true)
const published = computed(() => documents.value.filter((doc) => doc.status === 'published'))
const drafts = computed(() => documents.value.filter((doc) => doc.status === 'draft'))
const recent = computed(() => [...documents.value].sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at)).slice(0, 6))
</script>

<template>
  <div>
    <AdminPageHeader eyebrow="OVERVIEW" title="知识库仪表盘" description="管理目录结构、草稿与已发布文档。">
      <NuxtLink class="button primary" to="/admin/documents/new">新建文档 <ArrowRight :size="15" /></NuxtLink>
    </AdminPageHeader>
    <div class="dashboard">
      <section class="stats">
        <div><FolderTree :size="18" /><span><small>文件夹总数</small><strong>{{ folders.length }}</strong></span></div>
        <div><Files :size="18" /><span><small>文档总数</small><strong>{{ documents.length }}</strong></span></div>
        <div><FileCheck2 :size="18" /><span><small>已发布</small><strong>{{ published.length }}</strong></span></div>
        <div><FileClock :size="18" /><span><small>草稿</small><strong>{{ drafts.length }}</strong></span></div>
      </section>
      <section class="recent">
        <div class="panel-heading"><div><span class="eyebrow">ACTIVITY</span><h2>最近修改</h2></div><NuxtLink to="/admin/documents">查看全部</NuxtLink></div>
        <div class="surface table">
          <div v-for="document in recent" :key="document.id" class="table-row">
            <span class="doc-status" :class="document.status" />
            <span><strong>{{ document.title }}</strong><small>{{ document.description }}</small></span>
            <span class="badge">{{ document.status === 'published' ? '已发布' : '草稿' }}</span>
            <time>{{ new Date(document.updated_at).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }}</time>
            <NuxtLink :to="document.status === 'published' ? documentPublicPath(document, folders) : `/admin/documents/${document.id}`">打开</NuxtLink>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.dashboard { padding: 28px 34px 60px; }
.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.stats > div { min-height: 104px; display: flex; align-items: flex-start; justify-content: space-between; padding: 18px; border: 1px solid var(--kb-border); border-radius: var(--kb-radius-md); background: var(--kb-surface); color: var(--kb-text-subtle); }
.stats span { display: grid; justify-items: end; gap: 13px; }
.stats small { color: var(--kb-text-subtle); font: 10px monospace; text-transform: uppercase; }
.stats strong { color: var(--kb-text); font-size: 28px; line-height: 1; }
.recent { margin-top: 42px; }
.panel-heading { display: flex; align-items: end; justify-content: space-between; margin-bottom: 12px; }
.panel-heading h2 { margin: 5px 0 0; font-size: 17px; }
.panel-heading > a { color: var(--kb-text-subtle); font-size: 11px; }
.table { padding: 5px; overflow: hidden; }
.table-row { min-height: 63px; display: grid; grid-template-columns: 10px 1fr 70px 120px 38px; align-items: center; gap: 12px; padding: 8px 11px; border-radius: 7px; color: var(--kb-text-muted); font-size: 11px; }
.table-row:hover { background: var(--kb-surface-hover); }
.doc-status { width: 6px; height: 6px; border-radius: 50%; background: #bc944c; }
.doc-status.published { background: var(--kb-success); }
.table-row > span:nth-child(2) { min-width: 0; display: grid; gap: 3px; }
.table-row strong, .table-row small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.table-row strong { color: var(--kb-text); font-size: 12px; }
.table-row small { color: var(--kb-text-subtle); }
.table-row time { color: var(--kb-text-subtle); font: 10px monospace; }
.table-row > a { color: var(--kb-accent); }
@media (max-width: 850px) {
  .dashboard { padding: 20px 16px; }
  .stats { grid-template-columns: repeat(2, 1fr); }
  .table-row { grid-template-columns: 10px 1fr 38px; }
  .table-row > .badge, .table-row > time { display: none; }
}
</style>
