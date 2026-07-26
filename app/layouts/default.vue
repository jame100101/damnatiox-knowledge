<script setup lang="ts">
import { Menu, PanelLeftClose, RefreshCw, Search, Settings, X } from 'lucide-vue-next'
const route = useRoute()
const { folders, documents, loading, updateAvailable, load, isDemo } = useKnowledge()
const searchOpen = ref(false)
const mobileOpen = ref(false)
const collapsed = useCookie('kb-sidebar-collapsed', { default: () => false })
const context = computed(() => {
  const path = Array.isArray(route.params.path)
    ? route.params.path.map(String)
    : route.params.path
      ? [String(route.params.path)]
      : []
  let parentId: string | null = null
  let folderId: string | undefined
  let documentId: string | undefined
  for (const segment of path) {
    const folder = folders.value.find(
      (item) => item.parent_id === parentId && item.slug === segment,
    )
    if (folder) {
      folderId = folder.id
      parentId = folder.id
    } else {
      documentId = documents.value.find(
        (item) => item.folder_id === parentId && item.slug === segment,
      )?.id
    }
  }
  return { folderId, documentId }
})

await callOnce('load-knowledge', () => load())
useKnowledgeRealtime()

function onKeydown(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    searchOpen.value = true
  }
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
watch(() => route.fullPath, () => (mobileOpen.value = false))
</script>

<template>
  <div class="app-shell" :class="{ collapsed }">
    <header class="mobile-header">
      <button type="button" aria-label="打开目录" @click="mobileOpen = true"><Menu :size="20" /></button>
      <NuxtLink to="/" class="mobile-brand"><BrandMark /><strong>Damnatiox</strong></NuxtLink>
      <button type="button" aria-label="搜索" @click="searchOpen = true"><Search :size="19" /></button>
    </header>

    <div v-if="mobileOpen" class="mobile-backdrop" @click="mobileOpen = false" />
    <aside class="left-sidebar" :class="{ mobileOpen }">
      <div class="brand">
        <NuxtLink to="/"><BrandMark /><span><strong>Damnatiox</strong><small>KNOWLEDGE</small></span></NuxtLink>
        <button class="icon-button mobile-close" type="button" aria-label="关闭目录" @click="mobileOpen = false"><X :size="17" /></button>
      </div>
      <button class="search-trigger" type="button" @click="searchOpen = true">
        <Search :size="15" /><span>搜索知识库</span><kbd>⌘ K</kbd>
      </button>
      <div class="sidebar-label"><span>LIBRARY</span><span>{{ documents.length }}</span></div>
      <div class="tree-scroll">
        <div v-if="loading" class="tree-loading"><span v-for="i in 7" :key="i" class="skeleton" /></div>
        <FolderTree
          v-else
          :folders="folders"
          :documents="documents"
          :current-folder-id="context.folderId"
          :current-document-id="context.documentId"
        />
      </div>
      <footer class="sidebar-footer">
        <NuxtLink to="/admin"><Settings :size="15" /> 管理后台</NuxtLink>
        <button type="button" aria-label="收起侧栏" @click="collapsed = true"><PanelLeftClose :size="16" /></button>
      </footer>
    </aside>

    <button v-if="collapsed" class="restore-sidebar" type="button" @click="collapsed = false">
      <BrandMark />
    </button>

    <main class="main-pane">
      <div v-if="isDemo" class="demo-strip">
        <span><i /> DEMO DATA</span>
        <span>连接 Supabase 后自动切换到跨设备数据</span>
      </div>
      <button v-if="updateAvailable" class="update-toast" type="button" @click="load(true)">
        <RefreshCw :size="15" /> 知识库已有更新，点击刷新
      </button>
      <slot />
    </main>
    <SearchDialog :open="searchOpen" @close="searchOpen = false" />
  </div>
</template>

<style scoped>
.app-shell { min-height: 100vh; }
.left-sidebar { position: fixed; inset: 0 auto 0 0; z-index: 30; width: var(--kb-sidebar-width); display: flex; flex-direction: column; border-right: 1px solid var(--kb-border); background: var(--kb-surface); transition: transform 180ms ease; }
.brand { height: 67px; display: flex; align-items: center; justify-content: space-between; padding: 0 15px 0 17px; }
.brand > a { display: flex; align-items: center; gap: 10px; }
.brand span { display: grid; gap: 1px; }
.brand strong { font-size: 13px; letter-spacing: -.01em; }
.brand small { color: var(--kb-text-subtle); font: 700 9px monospace; letter-spacing: .14em; }
.icon-button, .mobile-header button, .sidebar-footer button { border: 0; background: transparent; color: var(--kb-text-muted); cursor: pointer; }
.search-trigger { height: 36px; display: flex; align-items: center; gap: 8px; margin: 0 12px 14px; padding: 0 10px; border: 1px solid var(--kb-border); border-radius: var(--kb-radius-sm); background: var(--kb-bg); color: var(--kb-text-subtle); cursor: pointer; text-align: left; }
.search-trigger:hover { border-color: var(--kb-border-strong); color: var(--kb-text-muted); }
.search-trigger span { flex: 1; }
.search-trigger kbd { font: 10px monospace; border: 1px solid var(--kb-border); border-radius: 3px; padding: 1px 4px; }
.sidebar-label { display: flex; justify-content: space-between; padding: 0 19px 8px; color: var(--kb-text-subtle); font: 700 9px monospace; letter-spacing: .12em; }
.tree-scroll { min-height: 0; flex: 1; padding: 0 7px 18px; overflow-y: auto; }
.tree-loading { display: grid; gap: 9px; padding: 7px 10px; }
.tree-loading span { height: 16px; }
.sidebar-footer { min-height: 49px; display: flex; align-items: center; gap: 8px; padding: 7px 12px; border-top: 1px solid var(--kb-border); }
.sidebar-footer a { min-width: 0; flex: 1; display: flex; align-items: center; gap: 8px; padding: 7px; color: var(--kb-text-subtle); font-size: 12px; }
.sidebar-footer a:hover { color: var(--kb-text); }
.sidebar-footer button { display: grid; place-items: center; padding: 8px; }
.main-pane { min-height: 100vh; margin-left: var(--kb-sidebar-width); transition: margin 180ms ease; }
.collapsed .left-sidebar { transform: translateX(-100%); }
.collapsed .main-pane { margin-left: 0; }
.restore-sidebar { position: fixed; left: 12px; bottom: 12px; z-index: 20; border: 0; padding: 0; border-radius: 8px; background: transparent; cursor: pointer; }
.demo-strip { min-height: 28px; display: flex; align-items: center; justify-content: center; gap: 18px; border-bottom: 1px solid #31351d; background: #15180e; color: #899259; font: 10px monospace; }
.demo-strip span:first-child { color: var(--kb-accent); font-weight: 700; letter-spacing: .07em; }
.demo-strip i { display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: var(--kb-accent); }
.update-toast { position: fixed; z-index: 40; top: 16px; left: 50%; translate: -50% 0; display: flex; align-items: center; gap: 8px; padding: 9px 13px; border: 1px solid var(--kb-border-strong); border-radius: 99px; background: var(--kb-surface-secondary); box-shadow: var(--kb-shadow); color: var(--kb-text); cursor: pointer; }
.mobile-header, .mobile-backdrop, .mobile-close { display: none; }
@media (max-width: 900px) {
  .mobile-header { height: 55px; display: flex; align-items: center; justify-content: space-between; padding: 0 14px; border-bottom: 1px solid var(--kb-border); position: sticky; top: 0; z-index: 20; background: rgb(11 13 15 / 95%); }
  .mobile-header button { width: 40px; height: 40px; display: grid; place-items: center; }
  .mobile-brand { display: flex; align-items: center; gap: 8px; font-size: 13px; }
  .left-sidebar { transform: translateX(-100%); box-shadow: var(--kb-shadow); }
  .left-sidebar.mobileOpen { transform: translateX(0); }
  .mobile-close { display: grid; place-items: center; padding: 8px; }
  .mobile-backdrop { display: block; position: fixed; inset: 0; z-index: 25; background: rgb(0 0 0 / 55%); }
  .main-pane, .collapsed .main-pane { margin-left: 0; }
  .restore-sidebar { display: none; }
  .demo-strip { font-size: 9px; padding: 5px 10px; text-align: center; }
  .demo-strip span:last-child { display: none; }
}
</style>
