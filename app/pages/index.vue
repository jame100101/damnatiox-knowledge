<script setup lang="ts">
import {
  ArrowRight,
  BookOpenText,
  Clock3,
  FileText,
  Folder,
  Search,
  Tags,
} from 'lucide-vue-next'
import { buildFolderTree, documentPublicPath, folderPublicPath } from '~/utils/folders'

useHead({ title: '知识工作台' })
const { folders, documents, load } = useKnowledge()
await callOnce('home-knowledge', () => load())
const tree = computed(() => buildFolderTree(folders.value, documents.value))
const recent = computed(() =>
  [...documents.value]
    .sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at))
    .slice(0, 5),
)
const tags = computed(() => {
  const counts = new Map<string, number>()
  documents.value.flatMap((doc) => doc.tags).forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1))
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)
})
const latestUpdate = computed(() => recent.value[0]?.updated_at)
const openSearch = () =>
  window.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }),
  )
</script>

<template>
  <div class="home">
    <header class="workspace-header">
      <div>
        <span class="eyebrow">PERSONAL KNOWLEDGE SYSTEM</span>
        <h1>Damnatiox Knowledge</h1>
        <p>把工程实践、系统原理与 AI 开发经验组织成可持续维护的知识结构。</p>
      </div>
      <button class="command-search" type="button" @click="openSearch">
        <Search :size="17" />
        <span>搜索所有知识、标签和正文</span>
        <kbd>Ctrl K</kbd>
      </button>
    </header>

    <section class="metrics" aria-label="知识库统计">
      <div><Folder :size="15" /><span><strong>{{ folders.length }}</strong><small>文件夹</small></span></div>
      <div><FileText :size="15" /><span><strong>{{ documents.length }}</strong><small>已发布文档</small></span></div>
      <div><Tags :size="15" /><span><strong>{{ tags.length }}</strong><small>活跃标签</small></span></div>
      <div><Clock3 :size="15" /><span><strong>{{ latestUpdate ? new Date(latestUpdate).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) : '—' }}</strong><small>最近更新</small></span></div>
    </section>

    <section>
      <div class="section-heading">
        <div><span class="eyebrow">LIBRARY</span><h2>知识领域</h2></div>
        <span class="muted">{{ tree.length }} 个顶级目录</span>
      </div>
      <div class="folder-grid">
        <NuxtLink v-for="node in tree" :key="node.id" :to="folderPublicPath(node.id, folders)" class="folder-card">
          <div class="folder-card-top"><span class="folder-icon"><Folder :size="19" /></span><ArrowRight :size="16" /></div>
          <h3>{{ node.name }}</h3>
          <p>{{ node.description || '持续整理中的知识目录。' }}</p>
          <div class="folder-meta"><span>{{ node.children.length }} 子目录</span><span>{{ node.documentCount }} 文档</span></div>
        </NuxtLink>
      </div>
    </section>

    <div class="home-columns">
      <section>
        <div class="section-heading">
          <div><span class="eyebrow">RECENT</span><h2>最近更新</h2></div>
        </div>
        <div class="recent-list surface">
          <NuxtLink v-for="document in recent" :key="document.id" :to="documentPublicPath(document, folders)">
            <span class="doc-icon"><BookOpenText :size="16" /></span>
            <span class="doc-info"><strong>{{ document.title }}</strong><small>{{ document.description }}</small></span>
            <span class="doc-time">{{ new Date(document.updated_at).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) }}</span>
          </NuxtLink>
        </div>
      </section>
      <section>
        <div class="section-heading">
          <div><span class="eyebrow">INDEX</span><h2>热门标签</h2></div>
        </div>
        <div class="tag-panel surface">
          <button v-for="[tag, count] in tags" :key="tag" class="tag" type="button" @click="openSearch">
            # {{ tag }} <span>{{ count }}</span>
          </button>
          <p>标签来自已发布文档，可通过全局搜索定位相关内容。</p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.home { width: min(1120px, calc(100% - 48px)); margin: 0 auto; padding: 72px 0 90px; }
.workspace-header { display: grid; grid-template-columns: 1fr minmax(310px, 400px); align-items: end; gap: 60px; padding-bottom: 42px; border-bottom: 1px solid var(--kb-border); }
h1 { margin: 11px 0 12px; max-width: 700px; font-size: clamp(34px, 5vw, 60px); line-height: 1; letter-spacing: -.055em; }
.workspace-header p { max-width: 660px; margin: 0; color: var(--kb-text-muted); line-height: 1.7; }
.command-search { height: 48px; display: flex; align-items: center; gap: 10px; padding: 0 12px; border: 1px solid var(--kb-border-strong); border-radius: var(--kb-radius-md); background: var(--kb-surface); color: var(--kb-text-muted); cursor: pointer; box-shadow: 0 10px 30px rgb(0 0 0 / 15%); }
.command-search:hover { background: var(--kb-surface-hover); }
.command-search span { flex: 1; text-align: left; font-size: 13px; }
.command-search kbd { border: 1px solid var(--kb-border); border-radius: 4px; padding: 3px 6px; color: var(--kb-text-subtle); font: 10px monospace; background: var(--kb-code-bg); }
.metrics { display: grid; grid-template-columns: repeat(4, 1fr); margin: 30px 0 70px; border: 1px solid var(--kb-border); border-radius: var(--kb-radius-md); background: var(--kb-surface); }
.metrics > div { min-height: 75px; display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-right: 1px solid var(--kb-border); color: var(--kb-text-subtle); }
.metrics > div:last-child { border: 0; }
.metrics span { display: grid; gap: 3px; }
.metrics strong { color: var(--kb-text); font-size: 16px; }
.metrics small { color: var(--kb-text-subtle); font-size: 10px; text-transform: uppercase; letter-spacing: .05em; }
.section-heading { min-height: 53px; display: flex; align-items: end; justify-content: space-between; margin-bottom: 16px; }
.section-heading > div { display: grid; gap: 4px; }
h2 { margin: 0; font-size: 20px; letter-spacing: -.025em; }
.section-heading > span { font-size: 12px; }
.folder-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.folder-card { min-height: 208px; display: flex; flex-direction: column; padding: 18px; border: 1px solid var(--kb-border); border-radius: var(--kb-radius-md); background: var(--kb-surface); transition: background 160ms, border 160ms, transform 160ms; }
.folder-card:hover { background: var(--kb-surface-hover); border-color: var(--kb-border-strong); transform: translateY(-2px); }
.folder-card-top { display: flex; align-items: center; justify-content: space-between; color: var(--kb-text-subtle); }
.folder-icon { width: 37px; height: 37px; display: grid; place-items: center; border: 1px solid var(--kb-border); border-radius: 8px; background: var(--kb-code-bg); color: var(--kb-accent); }
.folder-card h3 { margin: 22px 0 8px; font-size: 16px; }
.folder-card p { margin: 0; flex: 1; color: var(--kb-text-muted); font-size: 13px; line-height: 1.55; }
.folder-meta { display: flex; gap: 14px; margin-top: 16px; color: var(--kb-text-subtle); font: 10px monospace; }
.home-columns { display: grid; grid-template-columns: 1.5fr 1fr; gap: 28px; margin-top: 58px; }
.recent-list { padding: 5px; }
.recent-list a { min-height: 68px; display: grid; grid-template-columns: 34px 1fr 45px; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 7px; }
.recent-list a:hover { background: var(--kb-surface-hover); }
.doc-icon { width: 31px; height: 31px; display: grid; place-items: center; border: 1px solid var(--kb-border); border-radius: 6px; color: var(--kb-text-muted); }
.doc-info { min-width: 0; display: grid; gap: 4px; }
.doc-info strong, .doc-info small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.doc-info strong { font-size: 13px; }
.doc-info small { color: var(--kb-text-subtle); font-size: 11px; }
.doc-time { color: var(--kb-text-subtle); font: 10px monospace; }
.tag-panel { padding: 20px; }
.tag-panel .tag { margin: 0 5px 7px 0; cursor: pointer; }
.tag-panel .tag span { color: var(--kb-text-subtle); }
.tag-panel p { margin: 14px 0 0; padding-top: 14px; border-top: 1px solid var(--kb-border); color: var(--kb-text-subtle); font-size: 11px; line-height: 1.6; }
@media (max-width: 900px) {
  .home { width: min(100% - 32px, 720px); padding-top: 42px; }
  .workspace-header { grid-template-columns: 1fr; gap: 24px; }
  .metrics { grid-template-columns: repeat(2, 1fr); }
  .metrics > div:nth-child(2) { border-right: 0; }
  .metrics > div:nth-child(-n+2) { border-bottom: 1px solid var(--kb-border); }
  .folder-grid { grid-template-columns: 1fr; }
  .folder-card { min-height: 170px; }
  .home-columns { grid-template-columns: 1fr; }
}
</style>
