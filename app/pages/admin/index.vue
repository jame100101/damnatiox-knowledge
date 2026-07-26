<script setup lang="ts">
import {
  ArrowRight,
  FilePlus2,
  FileText,
  Folder,
  FolderOpen,
  Home,
} from 'lucide-vue-next'
import { findFolderPath, sortDocuments, sortFolders } from '~/utils/folders'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: '知识文件' })

const { folders, documents, load } = useKnowledge()
const { selectedFolderId, selectFolder, expandFolder } = useAdminWorkspace()
await load(false, true)

const selectedFolder = computed(
  () => folders.value.find((item) => item.id === selectedFolderId.value) || null,
)
const path = computed(() => findFolderPath(selectedFolderId.value, folders.value))
const childFolders = computed(() =>
  folders.value
    .filter((item) => item.parent_id === selectedFolderId.value)
    .sort(sortFolders),
)
const childDocuments = computed(() =>
  documents.value
    .filter((item) => item.folder_id === selectedFolderId.value)
    .sort(sortDocuments),
)

function openFolder(id: string | null) {
  selectFolder(id)
  if (id) expandFolder(id)
}
</script>

<template>
  <div class="workspace-page">
    <header class="workspace-header">
      <div>
        <span class="eyebrow">KNOWLEDGE FILES</span>
        <h1>{{ selectedFolder?.name || '全部知识文件' }}</h1>
        <p>在左侧目录直接新建文件夹、子文件夹，导入或创建 Markdown 文件。</p>
      </div>
      <NuxtLink
        v-if="selectedFolderId"
        class="button primary"
        :to="{
          path: '/admin/documents/new',
          query: { folder: selectedFolderId },
        }"
      >
        <FilePlus2 :size="15" /> 新建 .md
      </NuxtLink>
    </header>

    <nav class="workspace-breadcrumbs" aria-label="当前位置">
      <button type="button" @click="openFolder(null)">
        <Home :size="13" /> 根目录
      </button>
      <template v-for="folder in path" :key="folder.id">
        <ArrowRight :size="12" />
        <button type="button" @click="openFolder(folder.id)">
          {{ folder.name }}
        </button>
      </template>
    </nav>

    <section class="workspace-content">
      <div class="section-heading">
        <div>
          <span>文件夹</span>
          <small>{{ childFolders.length }}</small>
        </div>
        <span>点击文件夹进入，顺序操作位于左侧项目菜单</span>
      </div>
      <div v-if="childFolders.length" class="folder-grid">
        <button
          v-for="folder in childFolders"
          :key="folder.id"
          type="button"
          @dblclick="openFolder(folder.id)"
          @click="openFolder(folder.id)"
        >
          <span class="folder-icon"><Folder :size="20" /></span>
          <span
            ><strong>{{ folder.name }}</strong
            ><small>{{ folder.description || '知识文件夹' }}</small></span
          >
          <ArrowRight :size="15" />
        </button>
      </div>
      <div v-else class="empty-block">
        <FolderOpen :size="24" />
        <span>这里还没有子文件夹</span>
      </div>

      <div class="section-heading files-heading">
        <div>
          <span>Markdown 文件</span>
          <small>{{ childDocuments.length }}</small>
        </div>
        <span>点击文件直接编辑</span>
      </div>
      <div v-if="childDocuments.length" class="file-list">
        <NuxtLink
          v-for="document in childDocuments"
          :key="document.id"
          :to="`/admin/documents/${document.id}`"
        >
          <span class="file-icon"><FileText :size="17" /></span>
          <span class="file-main"
            ><strong>{{ document.title }}</strong
            ><small>{{
              document.description ||
              document.original_filename ||
              `${document.slug}.md`
            }}</small></span
          >
          <span class="file-status" :class="document.status">{{
            document.status === 'published' ? '已发布' : '草稿'
          }}</span>
          <time>{{ new Date(document.updated_at).toLocaleDateString('zh-CN') }}</time>
          <ArrowRight :size="15" />
        </NuxtLink>
      </div>
      <div v-else class="empty-block">
        <FileText :size="24" />
        <span>这里还没有 Markdown 文件</span>
      </div>
    </section>
  </div>
</template>

<style scoped>
.workspace-page {
  min-height: 100vh;
}
.workspace-header {
  min-height: 151px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding: 33px 38px 26px;
  border-bottom: 1px solid var(--kb-border);
  background: var(--kb-surface);
}
.workspace-header h1 {
  margin: 7px 0;
  font-size: clamp(22px, 3vw, 31px);
}
.workspace-header p {
  margin: 0;
  color: var(--kb-text-subtle);
  font-size: 12px;
}
.workspace-breadcrumbs {
  min-height: 45px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 38px;
  border-bottom: 1px solid var(--kb-border);
  color: var(--kb-text-subtle);
  overflow-x: auto;
}
.workspace-breadcrumbs button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px;
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 10px;
  white-space: nowrap;
  cursor: pointer;
}
.workspace-breadcrumbs button:hover {
  color: var(--kb-text);
}
.workspace-content {
  padding: 27px 38px 60px;
}
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  color: var(--kb-text-subtle);
  font-size: 10px;
}
.section-heading > div {
  display: flex;
  align-items: center;
  gap: 7px;
}
.section-heading > div > span {
  color: var(--kb-text);
  font-size: 13px;
  font-weight: 650;
}
.section-heading small {
  min-width: 20px;
  padding: 2px 5px;
  border: 1px solid var(--kb-border);
  border-radius: 99px;
  text-align: center;
  font: 9px monospace;
}
.folder-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 8px;
}
.folder-grid > button {
  min-width: 0;
  min-height: 82px;
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) 18px;
  align-items: center;
  gap: 10px;
  padding: 13px;
  border: 1px solid var(--kb-border);
  border-radius: var(--kb-radius-md);
  background: var(--kb-surface);
  color: var(--kb-text-subtle);
  text-align: left;
  cursor: pointer;
}
.folder-grid > button:hover {
  border-color: var(--kb-border-strong);
  background: var(--kb-surface-hover);
  transform: translateY(-1px);
}
.folder-icon,
.file-icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border: 1px solid var(--kb-border);
  border-radius: 8px;
  background: var(--kb-bg);
  color: var(--kb-accent);
}
.folder-grid > button > span:nth-child(2) {
  min-width: 0;
  display: grid;
  gap: 5px;
}
.folder-grid strong,
.folder-grid small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.folder-grid strong {
  color: var(--kb-text);
  font-size: 12px;
}
.folder-grid small {
  color: var(--kb-text-subtle);
  font-size: 10px;
}
.files-heading {
  margin-top: 35px;
}
.file-list {
  overflow: hidden;
  border: 1px solid var(--kb-border);
  border-radius: var(--kb-radius-md);
  background: var(--kb-surface);
}
.file-list > a {
  min-height: 63px;
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) 66px 90px 18px;
  align-items: center;
  gap: 10px;
  padding: 8px 13px;
  border-bottom: 1px solid var(--kb-border);
}
.file-list > a:last-child {
  border-bottom: 0;
}
.file-list > a:hover {
  background: var(--kb-surface-hover);
}
.file-icon {
  width: 32px;
  height: 32px;
  color: var(--kb-text-muted);
}
.file-main {
  min-width: 0;
  display: grid;
  gap: 4px;
}
.file-main strong,
.file-main small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file-main strong {
  color: var(--kb-text);
  font-size: 12px;
}
.file-main small,
.file-list time {
  color: var(--kb-text-subtle);
  font-size: 9px;
}
.file-status {
  color: #bc944c;
  font-size: 10px;
}
.file-status.published {
  color: var(--kb-success);
}
.empty-block {
  min-height: 92px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 8px;
  border: 1px dashed var(--kb-border);
  border-radius: var(--kb-radius-md);
  color: var(--kb-text-subtle);
  font-size: 10px;
}
@media (max-width: 760px) {
  .workspace-header {
    min-height: 130px;
    align-items: flex-start;
    padding: 25px 16px 20px;
  }
  .workspace-header .button {
    flex: none;
    font-size: 0;
  }
  .workspace-header .button svg {
    margin: 0;
  }
  .workspace-breadcrumbs {
    padding: 0 13px;
  }
  .workspace-content {
    padding: 21px 14px 45px;
  }
  .section-heading > span {
    display: none;
  }
  .folder-grid {
    grid-template-columns: 1fr;
  }
  .file-list > a {
    grid-template-columns: 34px minmax(0, 1fr) 58px 15px;
  }
  .file-list time {
    display: none;
  }
}
</style>
