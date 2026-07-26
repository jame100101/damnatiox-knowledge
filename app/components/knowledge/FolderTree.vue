<script setup lang="ts">
import type { Folder, KnowledgeDocument } from '~/types/knowledge'
import { buildFolderTree } from '~/utils/folders'

const props = defineProps<{
  folders: Folder[]
  documents: KnowledgeDocument[]
  currentFolderId?: string
  currentDocumentId?: string
}>()
const tree = computed(() => buildFolderTree(props.folders, props.documents))
</script>

<template>
  <ul class="folder-tree" aria-label="知识文件夹">
    <FolderTreeItem
      v-for="node in tree"
      :key="node.id"
      :node="node"
      :all-folders="folders"
      :current-folder-id="currentFolderId"
      :current-document-id="currentDocumentId"
    />
  </ul>
</template>

<style scoped>
.folder-tree { margin: 0; padding: 0; }
</style>
