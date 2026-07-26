<script setup lang="ts">
import { Edit3, Eye, EyeOff, FolderPlus, Save, Trash2, X } from 'lucide-vue-next'
import type { Folder } from '~/types/knowledge'
import { buildFolderTree, findFolderPath, wouldCreateCycle } from '~/utils/folders'
import { slugify } from '~/utils/slug'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: '文件夹管理' })
const { folders, documents, load, saveFolder, deleteFolder } = useKnowledge()
await load(false, true)
const dialogOpen = ref(false)
const editingId = ref<string>()
const form = reactive({
  name: '',
  slug: '',
  parent_id: null as string | null,
  description: '',
  icon: 'Folder',
  sort_order: 0,
  is_visible: true,
})
const error = ref('')
const busy = ref(false)
const flat = computed(() =>
  [...folders.value].sort((a, b) =>
    findFolderPath(a.id, folders.value)
      .map((item) => item.name)
      .join('/')
      .localeCompare(
        findFolderPath(b.id, folders.value)
          .map((item) => item.name)
          .join('/'),
        'zh-CN',
      ),
  ),
)
const tree = computed(() => buildFolderTree(folders.value, documents.value))
const totalDocuments = (id: string) =>
  tree.value
    .flatMap(function flatten(node): any[] {
      return [node, ...node.children.flatMap(flatten)]
    })
    .find((node) => node.id === id)?.documentCount || 0

function openCreate(parentId: string | null = null) {
  editingId.value = undefined
  Object.assign(form, { name: '', slug: '', parent_id: parentId, description: '', icon: 'Folder', sort_order: 0, is_visible: true })
  error.value = ''
  dialogOpen.value = true
}
function openEdit(folder: Folder) {
  editingId.value = folder.id
  Object.assign(form, {
    name: folder.name,
    slug: folder.slug,
    parent_id: folder.parent_id,
    description: folder.description || '',
    icon: folder.icon || 'Folder',
    sort_order: folder.sort_order,
    is_visible: folder.is_visible,
  })
  error.value = ''
  dialogOpen.value = true
}
watch(
  () => form.name,
  (name) => {
    if (!editingId.value) form.slug = slugify(name)
  },
)
async function submit() {
  error.value = ''
  if (!form.name.trim() || !form.slug.trim()) return (error.value = '名称和 Slug 均为必填项')
  if (editingId.value && wouldCreateCycle(editingId.value, form.parent_id, folders.value))
    return (error.value = '此移动会形成循环父子关系')
  if (
    folders.value.some(
      (folder) =>
        folder.id !== editingId.value &&
        folder.parent_id === form.parent_id &&
        folder.slug === form.slug,
    )
  )
    return (error.value = '同一父目录下已存在相同 Slug')
  busy.value = true
  try {
    await saveFolder({ id: editingId.value, ...form })
    dialogOpen.value = false
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '保存失败'
  } finally {
    busy.value = false
  }
}
async function remove(folder: Folder) {
  const childCount = folders.value.filter((item) => item.parent_id === folder.id).length
  const docCount = documents.value.filter((item) => item.folder_id === folder.id).length
  if (childCount || docCount) {
    error.value = `“${folder.name}”包含 ${childCount} 个直属子文件夹和 ${docCount} 篇直属文档，请先移动内容。`
    return
  }
  if (!confirm(`删除空文件夹“${folder.name}”？`)) return
  try {
    await deleteFolder(folder.id)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '删除失败'
  }
}
</script>

<template>
  <div>
    <AdminPageHeader eyebrow="STRUCTURE" title="知识文件夹" description="管理嵌套、排序、可见性和公开路径。">
      <button class="button primary" type="button" @click="openCreate()"><FolderPlus :size="15" /> 新建文件夹</button>
    </AdminPageHeader>
    <div class="folders-content">
      <p v-if="error" class="error-banner">{{ error }} <button type="button" @click="error = ''"><X :size="14" /></button></p>
      <div class="surface folder-table">
        <div class="table-head"><span>文件夹</span><span>Slug / 父级</span><span>内容</span><span>排序</span><span>状态</span><span /></div>
        <div v-for="folder in flat" :key="folder.id" class="folder-row">
          <span><strong>{{ folder.name }}</strong><small>{{ folder.description || '暂无描述' }}</small></span>
          <span><code>{{ folder.slug }}</code><small>{{ findFolderPath(folder.parent_id, folders).map((item) => item.name).join(' / ') || '根目录' }}</small></span>
          <span class="count">{{ totalDocuments(folder.id) }} 文档</span>
          <span class="count">{{ folder.sort_order }}</span>
          <span :class="folder.is_visible ? 'visible' : 'hidden'"><component :is="folder.is_visible ? Eye : EyeOff" :size="14" />{{ folder.is_visible ? '公开' : '隐藏' }}</span>
          <span class="row-actions">
            <button type="button" title="在其中新建子目录" @click="openCreate(folder.id)"><FolderPlus :size="14" /></button>
            <button type="button" title="编辑" @click="openEdit(folder)"><Edit3 :size="14" /></button>
            <button type="button" class="danger" title="删除" @click="remove(folder)"><Trash2 :size="14" /></button>
          </span>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="dialogOpen" class="modal-backdrop" @mousedown.self="dialogOpen = false">
        <form class="folder-dialog" @submit.prevent="submit">
          <header><div><span class="eyebrow">{{ editingId ? 'EDIT FOLDER' : 'NEW FOLDER' }}</span><h2>{{ editingId ? '编辑文件夹' : '创建知识文件夹' }}</h2></div><button type="button" @click="dialogOpen = false"><X :size="17" /></button></header>
          <div class="dialog-fields">
            <div class="field"><label>名称</label><input v-model="form.name" class="input" required placeholder="例如：Spring Boot" /></div>
            <div class="field"><label>Slug</label><input v-model="form.slug" class="input mono" required placeholder="spring-boot" /><small>修改后公开 URL 会发生变化。</small></div>
            <div class="field"><label>父文件夹</label><FolderSelect v-model="form.parent_id" :folders="folders" :exclude-id="editingId" /></div>
            <div class="field"><label>排序值</label><input v-model.number="form.sort_order" class="input" type="number" /></div>
            <div class="field full"><label>描述</label><textarea v-model="form.description" class="textarea" placeholder="这个知识领域包含什么？" /></div>
            <label class="check"><input v-model="form.is_visible" type="checkbox" /> 在公开知识库中显示</label>
          </div>
          <p v-if="error" class="error-text">{{ error }}</p>
          <footer><button class="button" type="button" @click="dialogOpen = false">取消</button><button class="button primary" type="submit" :disabled="busy"><Save :size="15" /> 保存</button></footer>
        </form>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.folders-content { padding: 25px 34px 60px; }
.error-banner { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border: 1px solid #5a2e32; border-radius: var(--kb-radius-sm); background: #211214; color: #ff9da5; font-size: 12px; }
.error-banner button { border: 0; background: transparent; color: inherit; cursor: pointer; }
.folder-table { padding: 5px; overflow-x: auto; }
.table-head, .folder-row { min-width: 770px; display: grid; grid-template-columns: 1.3fr 1.1fr 80px 55px 75px 105px; align-items: center; gap: 13px; }
.table-head { height: 35px; padding: 0 11px; color: var(--kb-text-subtle); font: 9px monospace; letter-spacing: .08em; text-transform: uppercase; }
.folder-row { min-height: 66px; padding: 7px 11px; border-top: 1px solid var(--kb-border); color: var(--kb-text-muted); font-size: 11px; }
.folder-row:hover { background: var(--kb-surface-hover); }
.folder-row > span:first-child, .folder-row > span:nth-child(2) { min-width: 0; display: grid; gap: 4px; }
.folder-row strong, .folder-row small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.folder-row strong { color: var(--kb-text); font-size: 12px; }
.folder-row small { color: var(--kb-text-subtle); }
.folder-row code { color: #cbd99b; }
.count { color: var(--kb-text-subtle); font: 10px monospace; }
.visible, .hidden { display: flex; align-items: center; gap: 6px; color: var(--kb-success); }
.hidden { color: var(--kb-text-subtle); }
.row-actions { display: flex; justify-content: flex-end; gap: 3px; }
.row-actions button { width: 29px; height: 29px; display: grid; place-items: center; border: 1px solid transparent; border-radius: 5px; background: transparent; color: var(--kb-text-subtle); cursor: pointer; }
.row-actions button:hover { border-color: var(--kb-border); background: var(--kb-surface-secondary); color: var(--kb-text); }
.row-actions button.danger:hover { color: var(--kb-danger); }
.modal-backdrop { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; padding: 18px; background: rgb(0 0 0 / 70%); }
.folder-dialog { width: min(620px, 100%); padding: 23px; border: 1px solid var(--kb-border-strong); border-radius: var(--kb-radius-lg); background: var(--kb-surface); box-shadow: var(--kb-shadow); }
.folder-dialog header { display: flex; justify-content: space-between; margin-bottom: 22px; }
.folder-dialog h2 { margin: 5px 0 0; font-size: 21px; }
.folder-dialog header button { border: 0; background: transparent; color: var(--kb-text-muted); cursor: pointer; }
.dialog-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.dialog-fields .full, .dialog-fields .check { grid-column: span 2; }
.field small { color: var(--kb-text-subtle); font-size: 10px; }
.check { display: flex; align-items: center; gap: 8px; color: var(--kb-text-muted); font-size: 12px; }
.check input { accent-color: var(--kb-accent); }
.folder-dialog footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 22px; padding-top: 16px; border-top: 1px solid var(--kb-border); }
@media (max-width: 720px) {
  .folders-content { padding: 18px 14px; }
  .dialog-fields { grid-template-columns: 1fr; }
  .dialog-fields .full, .dialog-fields .check { grid-column: auto; }
}
</style>
