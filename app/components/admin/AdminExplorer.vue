<script setup lang="ts">
import {
  FilePlus2,
  FileText,
  FileUp,
  Folder,
  FolderPlus,
  Search,
  X,
} from 'lucide-vue-next'
import type { Folder as KnowledgeFolder } from '~/types/knowledge'
import { buildFolderTree, findFolderPath } from '~/utils/folders'
import { parseFrontmatter } from '~/utils/markdown'
import { isSafeMarkdownFilename, slugify } from '~/utils/slug'

type ExplorerAction =
  | 'new-folder'
  | 'new-document'
  | 'upload'
  | 'rename'
  | 'move-up'
  | 'move-down'
  | 'delete'
  | 'edit'

const {
  folders,
  documents,
  loading,
  load,
  saveFolder,
  deleteFolderTree,
  moveFolder,
  saveDocument,
  deleteDocument,
  moveDocument,
} = useKnowledge()
const {
  selectedFolderId,
  expandedFolderIds,
  selectFolder,
  toggleFolder,
  expandFolder,
} = useAdminWorkspace()

await load(false, true)

const query = ref('')
const searchInput = ref<HTMLInputElement>()
const openMenuId = ref<string | null>(null)
const fileInput = ref<HTMLInputElement>()
const uploadFolderId = ref<string | null>(null)
const notice = ref('')
const error = ref('')
const busy = ref(false)
const folderDialogOpen = ref(false)
const folderEditingId = ref<string | null>(null)
const folderParentId = ref<string | null>(null)
const folderName = ref('')

const tree = computed(() => buildFolderTree(folders.value, documents.value))
const selectedFolder = computed(
  () => folders.value.find((item) => item.id === selectedFolderId.value) || null,
)
const searchResults = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  if (!keyword) return []
  return [
    ...folders.value
      .filter((folder) =>
        `${folder.name} ${folder.description || ''}`.toLowerCase().includes(keyword),
      )
      .map((folder) => ({ type: 'folder' as const, item: folder })),
    ...documents.value
      .filter((document) =>
        `${document.title} ${document.description || ''} ${document.tags.join(' ')}`
          .toLowerCase()
          .includes(keyword),
      )
      .map((document) => ({ type: 'document' as const, item: document })),
  ].slice(0, 30)
})

function closeMenus() {
  openMenuId.value = null
}

function onKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    searchInput.value?.focus()
  }
}

onMounted(() => {
  document.addEventListener('click', closeMenus)
  window.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  document.removeEventListener('click', closeMenus)
  window.removeEventListener('keydown', onKeydown)
})

function chooseFolder(id: string) {
  selectFolder(id)
  expandFolder(id)
}

function openFolderDialog(parentId: string | null) {
  folderEditingId.value = null
  folderParentId.value = parentId
  folderName.value = ''
  error.value = ''
  folderDialogOpen.value = true
}

function openRenameDialog(folder: KnowledgeFolder) {
  folderEditingId.value = folder.id
  folderParentId.value = folder.parent_id
  folderName.value = folder.name
  error.value = ''
  folderDialogOpen.value = true
}

async function createFolder() {
  const name = folderName.value.trim()
  const slug = slugify(name)
  const editingFolder = folders.value.find((item) => item.id === folderEditingId.value)
  if (!name || !slug) {
    error.value = '请输入有效的文件夹名称'
    return
  }
  if (
    folders.value.some(
      (item) =>
        item.id !== folderEditingId.value &&
        item.parent_id === folderParentId.value &&
        item.slug === slug,
    )
  ) {
    error.value = '同一层级已存在同名文件夹'
    return
  }
  const siblings = folders.value.filter(
    (item) => item.parent_id === folderParentId.value,
  )
  busy.value = true
  try {
    const folder = await saveFolder({
      id: folderEditingId.value || undefined,
      name,
      slug,
      parent_id: folderParentId.value,
      description: editingFolder?.description || null,
      icon: editingFolder?.icon || 'Folder',
      sort_order:
        editingFolder?.sort_order ||
        Math.max(0, ...siblings.map((item) => item.sort_order)) + 10,
      is_visible: editingFolder?.is_visible ?? true,
    })
    if (folderParentId.value) expandFolder(folderParentId.value)
    selectFolder(folder.id)
    folderDialogOpen.value = false
    notice.value = folderEditingId.value
      ? `已重命名为“${folder.name}”`
      : `已创建文件夹“${folder.name}”`
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '创建文件夹失败'
  } finally {
    busy.value = false
  }
}

async function openNewDocument(folderId: string | null) {
  if (!folderId) {
    error.value = '请先选择目标文件夹'
    return
  }
  selectFolder(folderId)
  await navigateTo({
    path: '/admin/documents/new',
    query: { folder: folderId },
  })
}

function requestUpload(folderId: string | null) {
  if (!folderId) {
    error.value = '请先选择目标文件夹'
    return
  }
  uploadFolderId.value = folderId
  selectFolder(folderId)
  fileInput.value?.click()
}

async function uploadMarkdown(files: FileList | null) {
  if (!files?.length || !uploadFolderId.value) return
  error.value = ''
  notice.value = ''
  busy.value = true
  let imported = 0
  try {
    const current = documents.value.filter(
      (item) => item.folder_id === uploadFolderId.value,
    )
    let nextOrder = Math.max(0, ...current.map((item) => item.sort_order)) + 10
    for (const file of Array.from(files)) {
      if (!isSafeMarkdownFilename(file.name))
        throw new Error(`“${file.name}”不是有效的 Markdown 文件`)
      if (file.size > 2 * 1024 * 1024) throw new Error(`“${file.name}”超过 2 MB`)
      const source = new TextDecoder('utf-8', { fatal: true }).decode(
        await file.arrayBuffer(),
      )
      const parsed = parseFrontmatter(source, file.name)
      await saveDocument(
        {
          folder_id: uploadFolderId.value,
          title: parsed.title,
          slug: parsed.slug,
          description: parsed.description,
          tags: parsed.tags,
          content: parsed.content,
          status: 'draft',
          sort_order: parsed.order || nextOrder,
          original_filename: file.name,
          file_size_bytes: file.size,
        },
        file,
      )
      nextOrder += 10
      imported += 1
    }
    expandFolder(uploadFolderId.value)
    notice.value = `已导入 ${imported} 个 Markdown 文件，状态为草稿`
  } catch (cause) {
    error.value =
      cause instanceof Error ? cause.message : `导入在第 ${imported + 1} 个文件停止`
  } finally {
    busy.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

async function removeFolder(folder: KnowledgeFolder) {
  const folderIds = new Set<string>([folder.id])
  let changed = true
  while (changed) {
    changed = false
    for (const item of folders.value) {
      if (item.parent_id && folderIds.has(item.parent_id) && !folderIds.has(item.id)) {
        folderIds.add(item.id)
        changed = true
      }
    }
  }
  const nestedFolders = folderIds.size - 1
  const nestedDocuments = documents.value.filter(
    (item) => item.folder_id && folderIds.has(item.folder_id),
  ).length
  if (
    !confirm(
      `删除文件夹“${folder.name}”及其中 ${nestedFolders} 个子文件夹、${nestedDocuments} 个文件？`,
    )
  )
    return
  busy.value = true
  try {
    await deleteFolderTree(folder.id)
    if (selectedFolderId.value && folderIds.has(selectedFolderId.value)) {
      selectFolder(folder.parent_id)
    }
    notice.value = `已删除“${folder.name}”`
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '删除文件夹失败'
  } finally {
    busy.value = false
  }
}

async function runAction(payload: {
  type: 'folder' | 'document'
  action: ExplorerAction
  id: string
}) {
  error.value = ''
  notice.value = ''
  try {
    if (payload.type === 'folder') {
      const folder = folders.value.find((item) => item.id === payload.id)
      if (!folder) return
      if (payload.action === 'new-folder') openFolderDialog(folder.id)
      if (payload.action === 'new-document') await openNewDocument(folder.id)
      if (payload.action === 'upload') requestUpload(folder.id)
      if (payload.action === 'rename') openRenameDialog(folder)
      if (payload.action === 'delete') await removeFolder(folder)
      if (payload.action === 'move-up') {
        busy.value = true
        await moveFolder(folder.id, -1)
      }
      if (payload.action === 'move-down') {
        busy.value = true
        await moveFolder(folder.id, 1)
      }
      return
    }
    const document = documents.value.find((item) => item.id === payload.id)
    if (!document) return
    if (payload.action === 'edit') {
      await navigateTo(`/admin/documents/${document.id}`)
    }
    if (payload.action === 'move-up') {
      busy.value = true
      await moveDocument(document.id, -1)
    }
    if (payload.action === 'move-down') {
      busy.value = true
      await moveDocument(document.id, 1)
    }
    if (
      payload.action === 'delete' &&
      confirm(`删除 Markdown 文件“${document.title}”？`)
    ) {
      busy.value = true
      await deleteDocument(document.id)
      notice.value = `已删除“${document.title}”`
    }
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '文件操作失败'
  } finally {
    busy.value = false
  }
}

function openSearchResult(result: (typeof searchResults.value)[number]) {
  query.value = ''
  if (result.type === 'folder') {
    chooseFolder(result.item.id)
    return
  }
  void navigateTo(`/admin/documents/${result.item.id}`)
}
</script>

<template>
  <section class="admin-explorer" :class="{ busy }">
    <label class="explorer-search">
      <Search :size="16" />
      <input ref="searchInput" v-model="query" type="search" placeholder="搜索知识库" />
      <kbd>⌘ K</kbd>
    </label>

    <div class="quick-actions">
      <button type="button" title="新建根文件夹" @click="openFolderDialog(null)">
        <FolderPlus :size="16" /><span>文件夹</span>
      </button>
      <button
        type="button"
        title="在当前文件夹中新建 Markdown"
        @click="openNewDocument(selectedFolderId)"
      >
        <FilePlus2 :size="16" /><span>新建 .md</span>
      </button>
      <button
        type="button"
        title="向当前文件夹导入 Markdown"
        @click="requestUpload(selectedFolderId)"
      >
        <FileUp :size="16" /><span>导入 .md</span>
      </button>
      <input
        ref="fileInput"
        hidden
        type="file"
        multiple
        accept=".md,.markdown,text/markdown,text/plain"
        @change="uploadMarkdown(($event.target as HTMLInputElement).files)"
      />
    </div>

    <p v-if="error" class="explorer-message error">
      <span>{{ error }}</span
      ><button type="button" aria-label="关闭错误" @click="error = ''">
        <X :size="13" />
      </button>
    </p>
    <p v-else-if="notice" class="explorer-message success">
      <span>{{ notice }}</span
      ><button type="button" aria-label="关闭提示" @click="notice = ''">
        <X :size="13" />
      </button>
    </p>

    <div class="library-heading">
      <span>LIBRARY</span>
      <span>{{ documents.length }}</span>
    </div>

    <div class="explorer-scroll">
      <div v-if="loading" class="loading-state">正在读取知识库…</div>
      <div v-else-if="query" class="search-results">
        <button
          v-for="result in searchResults"
          :key="`${result.type}:${result.item.id}`"
          type="button"
          @click="openSearchResult(result)"
        >
          <Folder v-if="result.type === 'folder'" :size="15" />
          <FileText v-else :size="15" />
          <span
            ><strong>{{
              result.type === 'folder' ? result.item.name : result.item.title
            }}</strong
            ><small v-if="result.type === 'folder'">{{
              findFolderPath(result.item.parent_id, folders)
                .map((item) => item.name)
                .join(' / ') || '根目录'
            }}</small
            ><small v-else>{{
              findFolderPath(result.item.folder_id, folders)
                .map((item) => item.name)
                .join(' / ') || '根目录'
            }}</small></span
          >
        </button>
        <p v-if="!searchResults.length">没有匹配的文件或文件夹</p>
      </div>
      <ul v-else class="explorer-tree">
        <AdminExplorerItem
          v-for="node in tree"
          :key="node.id"
          :node="node"
          :selected-folder-id="selectedFolderId"
          :expanded-folder-ids="expandedFolderIds"
          :open-menu-id="openMenuId"
          @select="chooseFolder"
          @toggle="toggleFolder"
          @menu="openMenuId = $event"
          @action="runAction"
        />
        <li v-if="!tree.length" class="empty-tree">
          暂无文件夹，点击上方“文件夹”开始创建。
        </li>
      </ul>
    </div>

    <footer class="selection-status">
      <Folder :size="13" />
      <span>{{ selectedFolder?.name || '尚未选择文件夹' }}</span>
    </footer>

    <Teleport to="body">
      <div
        v-if="folderDialogOpen"
        class="explorer-modal"
        @mousedown.self="folderDialogOpen = false"
      >
        <form class="folder-form" @submit.prevent="createFolder">
          <header>
            <div>
              <span>{{ folderEditingId ? 'RENAME FOLDER' : 'NEW FOLDER' }}</span>
              <h2>
                {{
                  folderEditingId
                    ? '重命名文件夹'
                    : folderParentId
                      ? '新建子文件夹'
                      : '新建根文件夹'
                }}
              </h2>
            </div>
            <button type="button" aria-label="关闭" @click="folderDialogOpen = false">
              <X :size="17" />
            </button>
          </header>
          <label>
            文件夹名称
            <input
              v-model="folderName"
              class="input"
              autofocus
              required
              placeholder="例如：Agent 基础"
            />
          </label>
          <p v-if="folderParentId">
            创建位置：{{
              findFolderPath(folderParentId, folders)
                .map((item) => item.name)
                .join(' / ')
            }}
          </p>
          <p v-if="error" class="error-text">{{ error }}</p>
          <footer>
            <button class="button" type="button" @click="folderDialogOpen = false">
              取消
            </button>
            <button class="button primary" type="submit" :disabled="busy">
              {{ folderEditingId ? '保存' : '创建' }}
            </button>
          </footer>
        </form>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.admin-explorer {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.admin-explorer.busy {
  cursor: progress;
}
.explorer-search {
  min-height: 37px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 4px 8px;
  padding: 0 9px;
  border: 1px solid var(--kb-border);
  border-radius: 7px;
  background: var(--kb-bg);
  color: var(--kb-text-subtle);
}
.explorer-search:focus-within {
  border-color: var(--kb-border-strong);
  color: var(--kb-text-muted);
}
.explorer-search input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--kb-text);
  font-size: 12px;
}
.explorer-search kbd {
  padding: 2px 4px;
  border: 1px solid var(--kb-border);
  border-radius: 4px;
  font: 9px monospace;
}
.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  margin: 0 4px 10px;
}
.quick-actions button {
  min-width: 0;
  min-height: 42px;
  display: grid;
  place-items: center;
  gap: 3px;
  padding: 5px 3px;
  border: 1px solid var(--kb-border);
  border-radius: 7px;
  background: transparent;
  color: var(--kb-text-muted);
  font-size: 9px;
  cursor: pointer;
}
.quick-actions button:hover {
  border-color: var(--kb-border-strong);
  background: var(--kb-surface-hover);
  color: var(--kb-text);
}
.quick-actions button:first-child svg {
  color: var(--kb-accent);
}
.explorer-message {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 6px;
  margin: 0 4px 9px;
  padding: 7px 8px;
  border: 1px solid var(--kb-border);
  border-radius: 6px;
  font-size: 10px;
  line-height: 1.4;
}
.explorer-message.error {
  color: var(--kb-danger);
}
.explorer-message.success {
  color: var(--kb-success);
}
.explorer-message button {
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}
.library-heading {
  min-height: 27px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  color: var(--kb-text-subtle);
  font: 8px monospace;
  letter-spacing: 0.14em;
}
.explorer-scroll {
  min-height: 0;
  flex: 1;
  padding: 0 1px 12px;
  overflow: auto;
}
.explorer-tree {
  display: grid;
  gap: 1px;
  margin: 0;
  padding: 0;
}
.loading-state,
.empty-tree,
.search-results > p {
  padding: 18px 10px;
  color: var(--kb-text-subtle);
  font-size: 11px;
  line-height: 1.5;
}
.empty-tree {
  list-style: none;
}
.search-results {
  display: grid;
  gap: 2px;
}
.search-results > button {
  min-height: 42px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--kb-text-muted);
  text-align: left;
  cursor: pointer;
}
.search-results > button:hover {
  border-color: var(--kb-border);
  background: var(--kb-surface-hover);
}
.search-results > button > span {
  min-width: 0;
  display: grid;
  gap: 2px;
}
.search-results strong,
.search-results small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.search-results strong {
  color: var(--kb-text);
  font-size: 11px;
}
.search-results small {
  color: var(--kb-text-subtle);
  font-size: 9px;
}
.selection-status {
  min-height: 34px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 7px;
  border-top: 1px solid var(--kb-border);
  color: var(--kb-text-subtle);
  font-size: 10px;
}
.selection-status span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.explorer-modal {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgb(0 0 0 / 70%);
}
.folder-form {
  width: min(430px, 100%);
  padding: 22px;
  border: 1px solid var(--kb-border-strong);
  border-radius: var(--kb-radius-lg);
  background: var(--kb-surface);
  box-shadow: var(--kb-shadow);
}
.folder-form header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}
.folder-form header span {
  color: var(--kb-accent);
  font: 9px monospace;
  letter-spacing: 0.13em;
}
.folder-form h2 {
  margin: 5px 0 0;
  font-size: 19px;
}
.folder-form header button {
  border: 0;
  background: transparent;
  color: var(--kb-text-muted);
  cursor: pointer;
}
.folder-form > label {
  display: grid;
  gap: 7px;
  color: var(--kb-text-muted);
  font-size: 11px;
}
.folder-form > p {
  color: var(--kb-text-subtle);
  font-size: 10px;
}
.folder-form > footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid var(--kb-border);
}
</style>
