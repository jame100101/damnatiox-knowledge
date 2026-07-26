<script setup lang="ts">
import { Edit3, Eye, FilePlus2, Search, Trash2 } from 'lucide-vue-next'
import { documentPublicPath, findFolderPath } from '~/utils/folders'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: '文档管理' })
const { folders, documents, load, deleteDocument, saveDocument } = useKnowledge()
await load(false, true)
const query = ref('')
const status = ref('')
const folderId = ref<string | null>(null)
const error = ref('')
const filtered = computed(() =>
  documents.value.filter(
    (doc) =>
      (!query.value ||
        `${doc.title} ${doc.description || ''} ${doc.tags.join(' ')}`
          .toLowerCase()
          .includes(query.value.toLowerCase())) &&
      (!status.value || doc.status === status.value) &&
      (!folderId.value || doc.folder_id === folderId.value),
  ),
)
async function toggleStatus(document: (typeof documents.value)[number]) {
  try {
    await saveDocument({
      id: document.id,
      folder_id: document.folder_id,
      title: document.title,
      slug: document.slug,
      description: document.description || '',
      tags: document.tags,
      content: document.content,
      status: document.status === 'published' ? 'draft' : 'published',
      sort_order: document.sort_order,
    })
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '状态更新失败'
  }
}
async function remove(id: string, title: string) {
  if (!confirm(`永久删除文档“${title}”？`)) return
  try {
    await deleteDocument(id)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '删除失败'
  }
}
</script>

<template>
  <div>
    <AdminPageHeader eyebrow="CONTENT" title="文档管理" description="筛选、移动、编辑和控制发布状态。">
      <NuxtLink class="button primary" to="/admin/documents/new"><FilePlus2 :size="15" /> 新建文档</NuxtLink>
    </AdminPageHeader>
    <div class="documents-content">
      <div class="filters">
        <label class="search-box"><Search :size="15" /><input v-model="query" placeholder="搜索标题或标签" /></label>
        <FolderSelect v-model="folderId" :folders="folders" />
        <select v-model="status" class="select"><option value="">全部状态</option><option value="published">已发布</option><option value="draft">草稿</option></select>
      </div>
      <p v-if="error" class="error-text">{{ error }}</p>
      <div class="surface documents-table">
        <div class="table-head"><span>文档</span><span>文件夹</span><span>标签</span><span>状态</span><span>更新时间</span><span /></div>
        <div v-for="document in filtered" :key="document.id" class="doc-row">
          <span><strong>{{ document.title }}</strong><small>{{ document.description }}</small></span>
          <span class="folder-path">{{ findFolderPath(document.folder_id, folders).map((item) => item.name).join(' / ') || '未分类' }}</span>
          <span class="tags"><i v-for="tag in document.tags.slice(0, 2)" :key="tag">#{{ tag }}</i></span>
          <button type="button" class="status-button" :class="document.status" @click="toggleStatus(document)"><i />{{ document.status === 'published' ? '已发布' : '草稿' }}</button>
          <time>{{ new Date(document.updated_at).toLocaleDateString('zh-CN') }}</time>
          <span class="actions">
            <NuxtLink v-if="document.status === 'published'" :to="documentPublicPath(document, folders)" title="预览"><Eye :size="14" /></NuxtLink>
            <NuxtLink :to="`/admin/documents/${document.id}`" title="编辑"><Edit3 :size="14" /></NuxtLink>
            <button type="button" title="删除" @click="remove(document.id, document.title)"><Trash2 :size="14" /></button>
          </span>
        </div>
        <div v-if="!filtered.length" class="empty-state">没有符合筛选条件的文档。</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.documents-content { padding: 25px 34px 60px; }
.filters { display: grid; grid-template-columns: minmax(230px, 1fr) 240px 140px; gap: 9px; margin-bottom: 14px; }
.search-box { min-height: 41px; display: flex; align-items: center; gap: 8px; padding: 0 11px; border: 1px solid var(--kb-border); border-radius: var(--kb-radius-sm); background: var(--kb-bg); color: var(--kb-text-subtle); }
.search-box:focus-within { border-color: var(--kb-accent); }
.search-box input { min-width: 0; flex: 1; border: 0; outline: 0; background: transparent; color: var(--kb-text); }
.documents-table { padding: 5px; overflow-x: auto; }
.table-head, .doc-row { min-width: 850px; display: grid; grid-template-columns: 1.5fr 1.1fr 1fr 80px 90px 100px; align-items: center; gap: 12px; }
.table-head { height: 36px; padding: 0 11px; color: var(--kb-text-subtle); font: 9px monospace; letter-spacing: .08em; text-transform: uppercase; }
.doc-row { min-height: 66px; padding: 8px 11px; border-top: 1px solid var(--kb-border); }
.doc-row:hover { background: var(--kb-surface-hover); }
.doc-row > span:first-child { min-width: 0; display: grid; gap: 4px; }
.doc-row strong, .doc-row small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.doc-row strong { font-size: 12px; }
.doc-row small, .folder-path, time { color: var(--kb-text-subtle); font-size: 10px; }
.tags { display: flex; gap: 4px; min-width: 0; overflow: hidden; }
.tags i { padding: 2px 5px; border: 1px solid var(--kb-border); border-radius: 99px; color: var(--kb-text-muted); font-size: 9px; font-style: normal; white-space: nowrap; }
.status-button { display: flex; align-items: center; gap: 6px; border: 0; background: transparent; color: #c4a262; font-size: 10px; cursor: pointer; }
.status-button i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.status-button.published { color: var(--kb-success); }
.actions { display: flex; justify-content: flex-end; gap: 3px; }
.actions a, .actions button { width: 29px; height: 29px; display: grid; place-items: center; border: 1px solid transparent; border-radius: 5px; background: transparent; color: var(--kb-text-subtle); cursor: pointer; }
.actions a:hover, .actions button:hover { border-color: var(--kb-border); background: var(--kb-surface-secondary); color: var(--kb-text); }
@media (max-width: 760px) {
  .documents-content { padding: 18px 14px; }
  .filters { grid-template-columns: 1fr; }
}
</style>
