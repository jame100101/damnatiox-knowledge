<script setup lang="ts">
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  FileText,
  Folder,
} from 'lucide-vue-next'
import {
  buildBreadcrumbs,
  documentPublicPath,
  folderPublicPath,
  resolveKnowledgePath,
  sortDocuments,
  sortFolders,
} from '~/utils/folders'

const route = useRoute()
const { folders, documents, load, loaded } = useKnowledge()
await load()
const segments = computed(() => {
  const value = route.params.path
  return (Array.isArray(value) ? value : [value]).filter(Boolean).map(String)
})
const resolved = computed(() =>
  resolveKnowledgePath(segments.value, folders.value, documents.value),
)
const folder = computed(() => resolved.value.folder)
const document = computed(() => resolved.value.document)
const breadcrumbs = computed(() =>
  buildBreadcrumbs(document.value, folder.value, folders.value),
)
const childFolders = computed(() =>
  folders.value
    .filter((item) => item.parent_id === folder.value?.id)
    .sort(sortFolders),
)
const folderDocuments = computed(() =>
  documents.value
    .filter((item) => item.folder_id === folder.value?.id)
    .sort(sortDocuments),
)
const siblings = computed(() =>
  documents.value
    .filter((item) => item.folder_id === document.value?.folder_id)
    .sort(sortDocuments),
)
const currentIndex = computed(() =>
  siblings.value.findIndex((item) => item.id === document.value?.id),
)
const previous = computed(() => siblings.value[currentIndex.value - 1])
const next = computed(() => siblings.value[currentIndex.value + 1])
const related = computed(() =>
  document.value
    ? documents.value
        .filter(
          (item) =>
            item.id !== document.value!.id &&
            item.tags.some((tag) => document.value!.tags.includes(tag)),
        )
        .slice(0, 3)
    : [],
)

if (loaded.value && !folder.value && !document.value) {
  throw createError({ statusCode: 404, statusMessage: '未找到对应知识路径' })
}
useHead(() => ({
  title: document.value?.title || folder.value?.name || '知识库',
  meta: [
    {
      name: 'description',
      content:
        document.value?.description ||
        folder.value?.description ||
        'Damnatiox Knowledge',
    },
  ],
}))
</script>

<template>
  <div v-if="document" class="reader-grid">
    <main class="document-page">
      <Breadcrumbs :items="breadcrumbs" />
      <header class="document-header">
        <span class="eyebrow">DOCUMENT / {{ document.status }}</span>
        <h1>{{ document.title }}</h1>
        <p v-if="document.description">{{ document.description }}</p>
        <div class="document-meta">
          <span><Folder :size="13" /> {{ folder?.name || '未分类' }}</span>
          <span><CalendarDays :size="13" /> {{ new Date(document.updated_at).toLocaleDateString('zh-CN') }}</span>
          <span>{{ document.reading_time || 1 }} MIN READ</span>
        </div>
        <div class="tags"><span v-for="tag in document.tags" :key="tag" class="tag"># {{ tag }}</span></div>
      </header>
      <MarkdownRenderer :source="document.content" />
      <nav class="document-nav">
        <NuxtLink v-if="previous" :to="documentPublicPath(previous, folders)">
          <ArrowLeft :size="15" /><span><small>上一篇</small><strong>{{ previous.title }}</strong></span>
        </NuxtLink>
        <span v-else />
        <NuxtLink v-if="next" :to="documentPublicPath(next, folders)" class="next">
          <span><small>下一篇</small><strong>{{ next.title }}</strong></span><ArrowRight :size="15" />
        </NuxtLink>
      </nav>
      <section v-if="related.length" class="related">
        <span class="eyebrow">RELATED NOTES</span>
        <h2>相关文章</h2>
        <div>
          <NuxtLink v-for="item in related" :key="item.id" :to="documentPublicPath(item, folders)">
            <FileText :size="15" /><span><strong>{{ item.title }}</strong><small>{{ item.description }}</small></span>
          </NuxtLink>
        </div>
      </section>
    </main>
    <TableOfContents :source="document.content" />
  </div>

  <main v-else-if="folder" class="folder-page">
    <Breadcrumbs :items="breadcrumbs" />
    <header>
      <span class="eyebrow">KNOWLEDGE FOLDER</span>
      <div class="folder-title"><span><Folder :size="26" /></span><h1>{{ folder.name }}</h1></div>
      <p>{{ folder.description || '这个文件夹正在持续整理中。' }}</p>
      <div class="folder-stats">
        <span>{{ childFolders.length }} 子目录</span><span>{{ folderDocuments.length }} 篇文档</span>
      </div>
    </header>
    <section v-if="childFolders.length">
      <div class="section-title"><h2>子目录</h2><span>{{ childFolders.length }}</span></div>
      <div class="child-grid">
        <NuxtLink v-for="item in childFolders" :key="item.id" :to="folderPublicPath(item.id, folders)">
          <span class="mini-folder"><Folder :size="17" /></span>
          <span><strong>{{ item.name }}</strong><small>{{ item.description || '知识子目录' }}</small></span>
          <ArrowRight :size="15" />
        </NuxtLink>
      </div>
    </section>
    <section>
      <div class="section-title"><h2>文档</h2><span>{{ folderDocuments.length }}</span></div>
      <div v-if="folderDocuments.length" class="document-list">
        <NuxtLink v-for="item in folderDocuments" :key="item.id" :to="documentPublicPath(item, folders)">
          <FileText :size="16" />
          <span><strong>{{ item.title }}</strong><small>{{ item.description }}</small></span>
          <time>{{ new Date(item.updated_at).toLocaleDateString('zh-CN') }}</time>
        </NuxtLink>
      </div>
      <div v-else class="empty-state">此文件夹暂无已发布文档。</div>
    </section>
  </main>
</template>

<style scoped>
.reader-grid { width: min(1180px, calc(100% - 48px)); margin: 0 auto; display: grid; grid-template-columns: minmax(0, var(--kb-content-width)) var(--kb-right-sidebar-width); justify-content: center; gap: 64px; padding: 38px 0 100px; }
.document-page { min-width: 0; }
.document-header { padding: 43px 0 39px; margin-bottom: 42px; border-bottom: 1px solid var(--kb-border); }
.document-header h1 { margin: 13px 0 13px; font-size: clamp(34px, 5vw, 54px); line-height: 1.08; letter-spacing: -.045em; }
.document-header > p { max-width: 680px; margin: 0; color: var(--kb-text-muted); font-size: 17px; line-height: 1.65; }
.document-meta { display: flex; flex-wrap: wrap; gap: 17px; margin-top: 21px; color: var(--kb-text-subtle); font: 10px monospace; letter-spacing: .03em; }
.document-meta span { display: flex; align-items: center; gap: 5px; }
.tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 17px; }
.document-nav { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 65px; padding-top: 24px; border-top: 1px solid var(--kb-border); }
.document-nav a { min-width: 0; min-height: 69px; display: flex; align-items: center; gap: 12px; padding: 12px 14px; border: 1px solid var(--kb-border); border-radius: var(--kb-radius-md); background: var(--kb-surface); color: var(--kb-text-muted); }
.document-nav a:hover { border-color: var(--kb-border-strong); color: var(--kb-text); }
.document-nav a.next { text-align: right; justify-content: flex-end; }
.document-nav span { min-width: 0; display: grid; gap: 5px; }
.document-nav small { color: var(--kb-text-subtle); font-size: 10px; }
.document-nav strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; }
.related { margin-top: 58px; }
.related h2 { margin: 6px 0 14px; }
.related > div { display: grid; gap: 7px; }
.related a { display: flex; gap: 10px; padding: 13px; border: 1px solid var(--kb-border); border-radius: var(--kb-radius-sm); color: var(--kb-text-muted); }
.related a span { display: grid; gap: 3px; }
.related a small { color: var(--kb-text-subtle); }
.reader-grid > aside { padding-top: 89px; }
.folder-page { width: min(960px, calc(100% - 48px)); margin: 0 auto; padding: 38px 0 100px; }
.folder-page > header { padding: 47px 0 45px; border-bottom: 1px solid var(--kb-border); }
.folder-title { display: flex; align-items: center; gap: 14px; margin: 13px 0; }
.folder-title > span { width: 48px; height: 48px; display: grid; place-items: center; border: 1px solid var(--kb-border); border-radius: 11px; background: var(--kb-surface); color: var(--kb-accent); }
.folder-title h1 { margin: 0; font-size: clamp(34px, 5vw, 52px); letter-spacing: -.045em; }
.folder-page header p { max-width: 650px; color: var(--kb-text-muted); line-height: 1.65; }
.folder-stats { display: flex; gap: 18px; color: var(--kb-text-subtle); font: 10px monospace; }
.folder-page section { margin-top: 45px; }
.section-title { display: flex; align-items: center; gap: 8px; margin-bottom: 13px; }
.section-title h2 { margin: 0; font-size: 17px; }
.section-title > span { color: var(--kb-text-subtle); font: 10px monospace; }
.child-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 9px; }
.child-grid a { min-width: 0; min-height: 76px; display: grid; grid-template-columns: 34px 1fr 20px; align-items: center; gap: 10px; padding: 12px; border: 1px solid var(--kb-border); border-radius: var(--kb-radius-md); background: var(--kb-surface); color: var(--kb-text-muted); }
.child-grid a:hover { border-color: var(--kb-border-strong); background: var(--kb-surface-hover); }
.mini-folder { width: 32px; height: 32px; display: grid; place-items: center; border-radius: 6px; background: var(--kb-code-bg); color: var(--kb-accent); }
.child-grid a > span:nth-child(2), .document-list a > span { min-width: 0; display: grid; gap: 5px; }
.child-grid strong, .child-grid small, .document-list strong, .document-list small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.child-grid strong, .document-list strong { color: var(--kb-text); font-size: 13px; }
.child-grid small, .document-list small { color: var(--kb-text-subtle); font-size: 11px; }
.document-list { border: 1px solid var(--kb-border); border-radius: var(--kb-radius-md); background: var(--kb-surface); padding: 5px; }
.document-list a { min-height: 65px; display: grid; grid-template-columns: 25px 1fr 90px; align-items: center; gap: 9px; padding: 8px 11px; border-radius: 7px; color: var(--kb-text-muted); }
.document-list a:hover { background: var(--kb-surface-hover); }
.document-list time { color: var(--kb-text-subtle); font: 10px monospace; text-align: right; }
@media (max-width: 1040px) {
  .reader-grid { grid-template-columns: minmax(0, var(--kb-content-width)); }
  .reader-grid > aside { display: none; }
}
@media (max-width: 640px) {
  .reader-grid, .folder-page { width: min(100% - 32px, 820px); padding-top: 24px; }
  .document-header { padding-top: 35px; }
  .child-grid { grid-template-columns: 1fr; }
  .document-list a { grid-template-columns: 25px 1fr; }
  .document-list time { display: none; }
}
</style>
