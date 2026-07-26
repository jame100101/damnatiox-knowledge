<script setup lang="ts">
import {
  ChevronRight,
  FileText,
  Folder as FolderIcon,
  FolderOpen,
} from 'lucide-vue-next'
import type { Folder, FolderNode } from '~/types/knowledge'
import { documentPublicPath, folderPublicPath } from '~/utils/folders'

const props = defineProps<{
  node: FolderNode
  allFolders: Folder[]
  level?: number
  currentFolderId?: string
  currentDocumentId?: string
}>()
const expanded = ref((props.level || 0) < 1)
const hasChildren = computed(
  () => props.node.children.length > 0 || props.node.documents.length > 0,
)
const { t } = useLocale()
function toggleExpanded() {
  if (hasChildren.value) expanded.value = !expanded.value
}
watch(
  [() => props.currentFolderId, () => props.currentDocumentId],
  () => {
    if (
      props.currentFolderId === props.node.id ||
      props.node.documents.some((doc) => doc.id === props.currentDocumentId)
    )
      expanded.value = true
  },
  { immediate: true },
)
</script>

<template>
  <li>
    <div
      class="tree-row"
      :class="{
        active: currentFolderId === node.id && !currentDocumentId,
        expandable: hasChildren,
      }"
      :style="{ '--depth': level || 0 }"
      @click="toggleExpanded"
    >
      <button
        class="tree-toggle"
        type="button"
        :disabled="!hasChildren"
        :aria-label="expanded ? t('collapseFolder') : t('expandFolder')"
        @click.stop="toggleExpanded"
      >
        <ChevronRight :size="13" :class="{ rotated: expanded }" />
      </button>
      <component :is="expanded ? FolderOpen : FolderIcon" :size="15" class="tree-icon" />
      <NuxtLink :to="folderPublicPath(node.id, allFolders)" class="tree-label">
        {{ node.name }}
      </NuxtLink>
      <span class="tree-count">{{ node.documentCount }}</span>
    </div>
    <ul v-if="expanded" class="tree-children">
      <FolderTreeItem
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :all-folders="allFolders"
        :level="(level || 0) + 1"
        :current-folder-id="currentFolderId"
        :current-document-id="currentDocumentId"
      />
      <li v-for="document in node.documents" :key="document.id">
        <NuxtLink
          :to="documentPublicPath(document, allFolders)"
          class="tree-document"
          :class="{ active: currentDocumentId === document.id }"
          :style="{ '--depth': (level || 0) + 1 }"
        >
          <FileText :size="13" />
          <span>{{ document.title }}</span>
        </NuxtLink>
      </li>
    </ul>
  </li>
</template>

<style scoped>
li, ul { list-style: none; margin: 0; padding: 0; }
.tree-row {
  height: 34px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 8px 0 calc(6px + var(--depth) * 13px);
  border-radius: var(--kb-radius-sm);
  color: var(--kb-text-muted);
  font-size: 13px;
  transition: background 140ms, color 140ms;
}
.tree-row:hover, .tree-row.active { background: var(--kb-surface-hover); color: var(--kb-text); }
.tree-row.expandable { cursor: pointer; }
.tree-row.active { box-shadow: inset 2px 0 var(--kb-accent); }
.tree-toggle { width: 18px; height: 24px; display: grid; place-items: center; border: 0; padding: 0; background: none; color: var(--kb-icon); cursor: pointer; }
.tree-toggle:disabled { opacity: 0; }
.tree-toggle svg { transition: transform 140ms; }
.tree-toggle .rotated { transform: rotate(90deg); }
.tree-icon { color: var(--kb-icon); flex: none; }
.tree-label { min-width: 0; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: pointer; }
.tree-count { font: 10px/1.4 monospace; color: var(--kb-text-subtle); }
.tree-document {
  min-height: 30px;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 5px 8px 5px calc(43px + var(--depth) * 13px);
  border-radius: var(--kb-radius-sm);
  color: var(--kb-text-muted);
  font-size: 12px;
  transition: background 140ms, color 140ms;
}
.tree-document span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tree-document:hover, .tree-document.active { background: var(--kb-surface-hover); color: var(--kb-text); }
.tree-document.active { color: var(--kb-accent); }
</style>
