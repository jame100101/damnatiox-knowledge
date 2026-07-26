<script setup lang="ts">
import {
  CheckCircle2,
  FileUp,
  ImagePlus,
  Save,
  Send,
  UploadCloud,
} from 'lucide-vue-next'
import type { DocumentDraft, KnowledgeDocument } from '~/types/knowledge'
import { parseFrontmatter } from '~/utils/markdown'
import { isSafeMarkdownFilename, slugify } from '~/utils/slug'

const props = defineProps<{ document?: KnowledgeDocument }>()
const route = useRoute()
const { folders, documents, load, saveDocument } = useKnowledge()
await load(false, true)
const requestedFolderId =
  typeof route.query.folder === 'string' &&
  folders.value.some((item) => item.id === route.query.folder)
    ? route.query.folder
    : null
const defaultFolderId = props.document?.folder_id || requestedFolderId
const nextSortOrder =
  Math.max(
    0,
    ...documents.value
      .filter((item) => item.folder_id === defaultFolderId)
      .map((item) => item.sort_order),
  ) + 10
const initial = (): DocumentDraft => ({
  id: props.document?.id,
  folder_id: defaultFolderId,
  title: props.document?.title || '',
  slug: props.document?.slug || '',
  description: props.document?.description || '',
  tags: props.document?.tags || [],
  content: props.document?.content || '# 新文档\n\n开始记录你的知识…',
  status: props.document?.status || 'draft',
  sort_order: props.document?.sort_order || nextSortOrder,
  original_filename: props.document?.original_filename || undefined,
  file_size_bytes: props.document?.file_size_bytes || undefined,
})
const draft = reactive<DocumentDraft>(initial())
const tagsInput = ref(draft.tags.join(', '))
const originalFile = shallowRef<File>()
const busy = ref(false)
const error = ref('')
const success = ref('')
const parseNotice = ref('')
const dirty = ref(false)
const fileInput = ref<HTMLInputElement>()
const dragging = ref(false)

watch(
  draft,
  () => {
    dirty.value = true
  },
  { deep: true },
)
watch(tagsInput, (value) => {
  draft.tags = value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
})
watch(
  () => draft.title,
  (value) => {
    if (!draft.id && (!draft.slug || !dirty.value)) draft.slug = slugify(value)
  },
)
function beforeUnload(event: BeforeUnloadEvent) {
  if (dirty.value) event.preventDefault()
}
onMounted(() => window.addEventListener('beforeunload', beforeUnload))
onUnmounted(() => window.removeEventListener('beforeunload', beforeUnload))

async function readFile(file: File) {
  error.value = ''
  parseNotice.value = ''
  if (!isSafeMarkdownFilename(file.name))
    throw new Error('请选择安全的 .md 或 .markdown 文件名')
  if (file.size > 2 * 1024 * 1024) throw new Error('Markdown 文件不能超过 2 MB')
  const buffer = await file.arrayBuffer()
  const source = new TextDecoder('utf-8', { fatal: true }).decode(buffer)
  const parsed = parseFrontmatter(source, file.name)
  Object.assign(draft, {
    title: parsed.title,
    slug: parsed.slug,
    description: parsed.description,
    tags: parsed.tags,
    content: parsed.content,
    sort_order: parsed.order,
    original_filename: file.name,
    file_size_bytes: file.size,
  })
  tagsInput.value = parsed.tags.join(', ')
  originalFile.value = file
  parseNotice.value = parsed.folderSuggestion
    ? `Frontmatter 建议文件夹：${parsed.folderSuggestion}。请在上方手动确认。`
    : 'Markdown 已读取，可在发布前继续编辑。'
}

async function handleFiles(files: FileList | null) {
  if (!files?.length) return
  try {
    await readFile(files[0]!)
    if (files.length > 1)
      parseNotice.value += ` 当前编辑器已载入首个文件，其余 ${files.length - 1} 个可逐一处理。`
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '文件读取失败'
  }
}

function handleDrop(event: DragEvent) {
  dragging.value = false
  void handleFiles(event.dataTransfer?.files || null)
}

async function submit(status: 'draft' | 'published') {
  error.value = ''
  success.value = ''
  if (!draft.title.trim()) return (error.value = '请填写标题')
  if (!draft.slug.trim()) return (error.value = 'Slug 不能为空')
  if (!draft.folder_id) return (error.value = '请确认目标文件夹')
  busy.value = true
  try {
    draft.status = status
    const saved = await saveDocument(draft, originalFile.value)
    dirty.value = false
    success.value = status === 'published' ? '文档已发布' : '草稿已保存'
    if (status === 'published') {
      await navigateTo(documentPublicPath(saved, folders.value))
    } else if (!draft.id) {
      await navigateTo(`/admin/documents/${saved.id}`)
    }
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '保存失败'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="editor-shell">
    <section class="editor-meta">
      <div class="field field-wide">
        <label>标题</label
        ><input v-model="draft.title" class="input" placeholder="文档标题" />
      </div>
      <div class="field">
        <label>Slug</label
        ><input v-model="draft.slug" class="input mono" placeholder="document-slug" />
      </div>
      <div class="field">
        <label>目标文件夹</label
        ><FolderSelect v-model="draft.folder_id" :folders="folders" required />
      </div>
      <div class="field field-wide">
        <label>描述</label
        ><input
          v-model="draft.description"
          class="input"
          placeholder="一句话描述文档内容"
        />
      </div>
      <div class="field">
        <label>标签（逗号分隔）</label
        ><input v-model="tagsInput" class="input" placeholder="java, spring" />
      </div>
      <div class="field">
        <label>排序</label
        ><input v-model.number="draft.sort_order" class="input" type="number" />
      </div>
    </section>

    <section
      class="drop-zone"
      :class="{ dragging }"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="handleDrop"
    >
      <UploadCloud :size="20" />
      <span
        ><strong>拖入 Markdown</strong><small>.md / .markdown，最大 2 MB</small></span
      >
      <button class="button small" type="button" @click="fileInput?.click()">
        <FileUp :size="14" /> 选择文件
      </button>
      <input
        ref="fileInput"
        hidden
        type="file"
        accept=".md,.markdown,text/markdown,text/plain"
        multiple
        @change="handleFiles(($event.target as HTMLInputElement).files)"
      />
    </section>
    <p v-if="parseNotice" class="notice">
      <CheckCircle2 :size="14" /> {{ parseNotice }}
    </p>
    <p v-if="error" class="error-text">{{ error }}</p>
    <p v-if="success" class="success-text">{{ success }}</p>

    <section class="split-editor">
      <div class="editor-pane">
        <header>
          <span>MARKDOWN</span><span>{{ draft.content.length }} CHARS</span>
        </header>
        <textarea
          v-model="draft.content"
          class="source-editor mono"
          spellcheck="false"
          aria-label="Markdown 原文"
        />
      </div>
      <div class="preview-pane">
        <header>
          <span>PREVIEW</span
          ><button type="button" title="上传图片功能需要 Supabase Storage">
            <ImagePlus :size="14" /> 图片
          </button>
        </header>
        <div class="preview-scroll"><MarkdownRenderer :source="draft.content" /></div>
      </div>
    </section>

    <footer class="editor-actions">
      <span>{{ dirty ? '有尚未保存的修改' : '全部修改已保存' }}</span>
      <div>
        <button class="button" type="button" :disabled="busy" @click="submit('draft')">
          <Save :size="15" /> 保存草稿
        </button>
        <button
          class="button primary"
          type="button"
          :disabled="busy"
          @click="submit('published')"
        >
          <Send :size="15" /> 发布文档
        </button>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.editor-shell {
  padding: 22px 28px 90px;
}
.editor-meta {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 13px;
  margin-bottom: 15px;
}
.field-wide {
  grid-column: span 2;
}
.drop-zone {
  min-height: 61px;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 13px;
  border: 1px dashed var(--kb-border-strong);
  border-radius: var(--kb-radius-md);
  color: var(--kb-text-subtle);
  background: var(--kb-surface);
  transition:
    border 150ms,
    background 150ms;
}
.drop-zone.dragging {
  border-color: var(--kb-accent);
  background: rgb(216 255 100 / 4%);
}
.drop-zone > span {
  flex: 1;
  display: grid;
  gap: 2px;
}
.drop-zone strong {
  color: var(--kb-text-muted);
  font-size: 12px;
}
.drop-zone small {
  font-size: 10px;
}
.notice {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--kb-success);
  font-size: 12px;
}
.split-editor {
  height: max(560px, calc(100vh - 350px));
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-top: 16px;
  border: 1px solid var(--kb-border);
  border-radius: var(--kb-radius-md);
  background: var(--kb-surface);
  overflow: hidden;
}
.editor-pane,
.preview-pane {
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.editor-pane {
  border-right: 1px solid var(--kb-border);
}
.split-editor header {
  min-height: 38px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border-bottom: 1px solid var(--kb-border);
  color: var(--kb-text-subtle);
  font: 10px monospace;
  letter-spacing: 0.08em;
}
.split-editor header button {
  display: flex;
  align-items: center;
  gap: 5px;
  border: 0;
  background: transparent;
  color: var(--kb-text-subtle);
  cursor: pointer;
}
.source-editor {
  width: 100%;
  min-height: 0;
  flex: 1;
  resize: none;
  border: 0;
  outline: 0;
  padding: 19px;
  background: var(--kb-code-bg);
  color: var(--kb-code-text);
  font-size: 13px;
  line-height: 1.65;
  tab-size: 2;
}
.preview-scroll {
  min-height: 0;
  flex: 1;
  padding: 26px 28px;
  overflow: auto;
}
.editor-actions {
  position: fixed;
  inset: auto 0 0 294px;
  z-index: 20;
  min-height: 62px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 28px;
  border-top: 1px solid var(--kb-border);
  background: var(--kb-panel-bg);
  backdrop-filter: blur(5px);
}
.editor-actions > span {
  color: var(--kb-text-subtle);
  font-size: 11px;
}
.editor-actions > div {
  display: flex;
  gap: 8px;
}
@media (max-width: 980px) {
  .editor-meta {
    grid-template-columns: 1fr 1fr;
  }
  .field-wide {
    grid-column: span 2;
  }
  .split-editor {
    height: auto;
    grid-template-columns: 1fr;
  }
  .editor-pane {
    border-right: 0;
    border-bottom: 1px solid var(--kb-border);
  }
  .source-editor,
  .preview-scroll {
    min-height: 480px;
  }
}
@media (max-width: 760px) {
  .editor-shell {
    padding: 15px 14px 90px;
  }
  .editor-meta {
    grid-template-columns: 1fr;
  }
  .field-wide {
    grid-column: auto;
  }
  .drop-zone {
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .drop-zone > span {
    min-width: 180px;
  }
  .editor-actions {
    left: 0;
    bottom: 0;
    padding: 8px 12px;
  }
  .editor-actions > span {
    display: none;
  }
  .editor-actions > div {
    width: 100%;
  }
  .editor-actions .button {
    flex: 1;
  }
  .preview-scroll {
    padding: 20px 16px;
  }
}
</style>
