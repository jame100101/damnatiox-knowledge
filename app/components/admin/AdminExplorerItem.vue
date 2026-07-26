<script setup lang="ts">
import {
  ChevronDown,
  ChevronRight,
  FilePenLine,
  FilePlus2,
  FileText,
  FileUp,
  Folder,
  FolderOpen,
  FolderPlus,
  MoreHorizontal,
  MoveDown,
  MoveUp,
  Pencil,
  Trash2,
} from 'lucide-vue-next'
import type { FolderNode } from '~/types/knowledge'

type ExplorerAction =
  | 'new-folder'
  | 'new-document'
  | 'upload'
  | 'rename'
  | 'move-up'
  | 'move-down'
  | 'delete'

const props = defineProps<{
  node: FolderNode
  level?: number
  selectedFolderId: string | null
  expandedFolderIds: string[]
  openMenuId: string | null
}>()

const emit = defineEmits<{
  select: [id: string]
  toggle: [id: string]
  menu: [id: string | null]
  action: [
    payload: {
      type: 'folder' | 'document'
      action: ExplorerAction | 'edit'
      id: string
    },
  ]
}>()

const level = computed(() => props.level || 0)
const expanded = computed(() => props.expandedFolderIds.includes(props.node.id))
const hasChildren = computed(() =>
  Boolean(props.node.children.length || props.node.documents.length),
)

function runFolderAction(action: ExplorerAction) {
  emit('menu', null)
  emit('action', { type: 'folder', action, id: props.node.id })
}

function runDocumentAction(
  action: Extract<ExplorerAction, 'move-up' | 'move-down' | 'delete'> | 'edit',
  id: string,
) {
  emit('menu', null)
  emit('action', { type: 'document', action, id })
}
</script>

<template>
  <li class="explorer-node">
    <div
      class="explorer-row folder-row"
      :class="{ selected: selectedFolderId === node.id }"
      :style="{ '--tree-level': level }"
      @click="emit('select', node.id)"
    >
      <button
        class="tree-toggle"
        type="button"
        :aria-label="expanded ? '收起文件夹' : '展开文件夹'"
        :disabled="!hasChildren"
        @click.stop="emit('toggle', node.id)"
      >
        <ChevronDown v-if="expanded && hasChildren" :size="14" />
        <ChevronRight v-else :size="14" />
      </button>
      <FolderOpen v-if="expanded" class="type-icon" :size="16" />
      <Folder v-else class="type-icon" :size="16" />
      <span class="row-name">{{ node.name }}</span>
      <span class="row-count">{{ node.documentCount }}</span>
      <button
        class="more-button"
        type="button"
        :aria-label="`${node.name}操作`"
        @click.stop="
          emit('menu', openMenuId === `folder:${node.id}` ? null : `folder:${node.id}`)
        "
      >
        <MoreHorizontal :size="15" />
      </button>
      <div v-if="openMenuId === `folder:${node.id}`" class="row-menu" @click.stop>
        <button type="button" @click="runFolderAction('new-folder')">
          <FolderPlus :size="14" /> 新建子文件夹
        </button>
        <button type="button" @click="runFolderAction('new-document')">
          <FilePlus2 :size="14" /> 新建 Markdown
        </button>
        <button type="button" @click="runFolderAction('upload')">
          <FileUp :size="14" /> 导入 Markdown
        </button>
        <button type="button" @click="runFolderAction('rename')">
          <Pencil :size="14" /> 重命名
        </button>
        <span />
        <button type="button" @click="runFolderAction('move-up')">
          <MoveUp :size="14" /> 上移
        </button>
        <button type="button" @click="runFolderAction('move-down')">
          <MoveDown :size="14" /> 下移
        </button>
        <button class="danger" type="button" @click="runFolderAction('delete')">
          <Trash2 :size="14" /> 删除文件夹
        </button>
      </div>
    </div>

    <ul v-if="expanded" class="node-children">
      <AdminExplorerItem
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="level + 1"
        :selected-folder-id="selectedFolderId"
        :expanded-folder-ids="expandedFolderIds"
        :open-menu-id="openMenuId"
        @select="emit('select', $event)"
        @toggle="emit('toggle', $event)"
        @menu="emit('menu', $event)"
        @action="emit('action', $event)"
      />
      <li
        v-for="document in node.documents"
        :key="document.id"
        class="explorer-row document-row"
        :class="{ draft: document.status === 'draft' }"
        :style="{ '--tree-level': level + 1 }"
        @dblclick="runDocumentAction('edit', document.id)"
      >
        <span class="tree-spacer" />
        <FileText class="type-icon" :size="15" />
        <button
          class="document-name"
          type="button"
          @click="runDocumentAction('edit', document.id)"
        >
          {{ document.title }}
        </button>
        <i
          class="status-dot"
          :title="document.status === 'draft' ? '草稿' : '已发布'"
        />
        <button
          class="more-button"
          type="button"
          :aria-label="`${document.title}操作`"
          @click.stop="
            emit(
              'menu',
              openMenuId === `document:${document.id}`
                ? null
                : `document:${document.id}`,
            )
          "
        >
          <MoreHorizontal :size="15" />
        </button>
        <div
          v-if="openMenuId === `document:${document.id}`"
          class="row-menu"
          @click.stop
        >
          <button type="button" @click="runDocumentAction('edit', document.id)">
            <FilePenLine :size="14" /> 编辑 Markdown
          </button>
          <button type="button" @click="runDocumentAction('move-up', document.id)">
            <MoveUp :size="14" /> 上移
          </button>
          <button type="button" @click="runDocumentAction('move-down', document.id)">
            <MoveDown :size="14" /> 下移
          </button>
          <button
            class="danger"
            type="button"
            @click="runDocumentAction('delete', document.id)"
          >
            <Trash2 :size="14" /> 删除文件
          </button>
        </div>
      </li>
    </ul>
  </li>
</template>

<style scoped>
ul,
li {
  margin: 0;
  padding: 0;
  list-style: none;
}
.explorer-row {
  --indent: calc(var(--tree-level) * 14px);
  position: relative;
  min-height: 34px;
  display: grid;
  grid-template-columns: 18px 18px minmax(0, 1fr) auto 24px;
  align-items: center;
  gap: 3px;
  padding: 3px 4px 3px calc(5px + var(--indent));
  border: 1px solid transparent;
  border-radius: 7px;
  color: var(--kb-text-muted);
  cursor: pointer;
}
.explorer-row:hover,
.explorer-row.selected {
  border-color: var(--kb-border);
  background: var(--kb-surface-hover);
  color: var(--kb-text);
}
.explorer-row.selected {
  box-shadow: inset 2px 0 var(--kb-accent);
}
.tree-toggle,
.more-button,
.document-name {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}
.tree-toggle {
  width: 18px;
  height: 24px;
  display: grid;
  place-items: center;
  padding: 0;
  color: var(--kb-text-subtle);
}
.tree-toggle:disabled {
  opacity: 0;
}
.type-icon {
  color: var(--kb-text-subtle);
}
.row-name,
.document-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
  font-size: 12px;
}
.document-name {
  padding: 0;
}
.row-count {
  color: var(--kb-text-subtle);
  font: 9px monospace;
}
.more-button {
  width: 24px;
  height: 26px;
  display: grid;
  place-items: center;
  padding: 0;
  border-radius: 5px;
  opacity: 0;
}
.explorer-row:hover .more-button,
.more-button:focus-visible,
.row-menu + .more-button {
  opacity: 1;
}
.more-button:hover {
  background: var(--kb-surface-secondary);
}
.node-children {
  display: grid;
  gap: 1px;
}
.tree-spacer {
  width: 18px;
}
.document-row {
  cursor: default;
}
.document-row.draft .type-icon {
  color: #bc944c;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--kb-success);
}
.document-row.draft .status-dot {
  background: #bc944c;
}
.row-menu {
  position: absolute;
  z-index: 80;
  top: calc(100% - 2px);
  right: 3px;
  width: 174px;
  display: grid;
  gap: 2px;
  padding: 5px;
  border: 1px solid var(--kb-border-strong);
  border-radius: 8px;
  background: var(--kb-panel-bg);
  box-shadow: var(--kb-shadow);
}
.row-menu button {
  min-height: 32px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: var(--kb-text-muted);
  font-size: 11px;
  cursor: pointer;
}
.row-menu button:hover {
  background: var(--kb-surface-hover);
  color: var(--kb-text);
}
.row-menu span {
  height: 1px;
  margin: 2px 3px;
  background: var(--kb-border);
}
.row-menu button.danger:hover {
  color: var(--kb-danger);
}
</style>
