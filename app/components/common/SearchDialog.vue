<script setup lang="ts">
import { CornerDownLeft, FileText, Folder, Search, X } from 'lucide-vue-next'
import { documentPublicPath, folderPublicPath } from '~/utils/folders'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
const { folders, documents } = useKnowledge()
const { t } = useLocale()
const query = ref('')
const input = ref<HTMLInputElement>()
const normalized = computed(() => query.value.trim().toLocaleLowerCase())
const folderResults = computed(() =>
  normalized.value
    ? folders.value
        .filter((folder) =>
          `${folder.name} ${folder.description || ''}`
            .toLocaleLowerCase()
            .includes(normalized.value),
        )
        .slice(0, 5)
    : [],
)
const documentResults = computed(() =>
  normalized.value
    ? documents.value
        .filter((document) =>
          `${document.title} ${document.description || ''} ${document.tags.join(' ')} ${document.content}`
            .toLocaleLowerCase()
            .includes(normalized.value),
        )
        .slice(0, 8)
    : documents.value.slice(0, 5),
)
watch(
  () => props.open,
  async (open) => {
    if (open) {
      query.value = ''
      await nextTick()
      input.value?.focus()
    }
  },
)
function close() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="search-overlay" role="presentation" @mousedown.self="close">
      <section
        class="search-dialog"
        role="dialog"
        aria-modal="true"
        :aria-label="t('searchTitle')"
        @keydown.esc="close"
      >
        <header>
          <Search :size="18" />
          <input
            ref="input"
            v-model="query"
            :placeholder="t('searchPlaceholder')"
            :aria-label="t('searchKeyword')"
          />
          <button type="button" :aria-label="t('closeSearch')" @click="close">
            <X :size="17" />
          </button>
        </header>
        <div class="search-results">
          <template v-if="folderResults.length">
            <span class="result-label">{{ t('folderResults') }}</span>
            <NuxtLink
              v-for="folder in folderResults"
              :key="folder.id"
              :to="folderPublicPath(folder.id, folders)"
              @click="close"
            >
              <Folder :size="15" />
              <span
                ><strong>{{ folder.name }}</strong
                ><small>{{ folder.description }}</small></span
              >
              <CornerDownLeft :size="13" />
            </NuxtLink>
          </template>
          <span class="result-label">{{ query ? t('documents') : t('recentDocuments') }}</span>
          <NuxtLink
            v-for="document in documentResults"
            :key="document.id"
            :to="documentPublicPath(document, folders)"
            @click="close"
          >
            <FileText :size="15" />
            <span
              ><strong>{{ document.title }}</strong
              ><small>{{ document.description }}</small></span
            >
            <CornerDownLeft :size="13" />
          </NuxtLink>
          <div
            v-if="!folderResults.length && !documentResults.length"
            class="no-results"
          >
            {{ t('noResults') }}
          </div>
        </div>
        <footer><kbd>↑↓</kbd> {{ t('browse') }} <kbd>Enter</kbd> {{ t('open') }} <kbd>Esc</kbd> {{ t('close') }}</footer>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.search-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: start center;
  padding: 12vh 16px 20px;
  background: rgb(3 5 7 / 72%);
  backdrop-filter: blur(3px);
}
.search-dialog {
  width: min(620px, 100%);
  border: 1px solid var(--kb-border-strong);
  border-radius: var(--kb-radius-lg);
  background: var(--kb-surface);
  box-shadow: var(--kb-shadow);
  overflow: hidden;
}
header {
  height: 58px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  border-bottom: 1px solid var(--kb-border);
  color: var(--kb-text-muted);
}
header input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--kb-text);
  font-size: 15px;
}
header button {
  display: grid;
  place-items: center;
  border: 0;
  background: transparent;
  color: var(--kb-text-subtle);
  cursor: pointer;
}
.search-results {
  max-height: 440px;
  overflow-y: auto;
  padding: 9px;
}
.result-label {
  display: block;
  padding: 8px;
  color: var(--kb-text-subtle);
  font: 700 10px monospace;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.search-results a {
  min-height: 52px;
  display: grid;
  grid-template-columns: 20px 1fr 18px;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  border-radius: 7px;
  color: var(--kb-text-muted);
}
.search-results a:hover {
  background: var(--kb-surface-hover);
  color: var(--kb-text);
}
.search-results a > span {
  min-width: 0;
  display: grid;
  gap: 3px;
}
.search-results strong,
.search-results small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.search-results strong {
  font-size: 13px;
}
.search-results small {
  color: var(--kb-text-subtle);
  font-size: 11px;
}
.no-results {
  padding: 50px 16px;
  text-align: center;
  color: var(--kb-text-subtle);
}
footer {
  padding: 9px 15px;
  border-top: 1px solid var(--kb-border);
  color: var(--kb-text-subtle);
  font-size: 10px;
}
kbd {
  border: 1px solid var(--kb-icon-tile-border);
  border-radius: 3px;
  background: var(--kb-shortcut-bg);
  color: var(--kb-shortcut-text);
  padding: 1px 4px;
}
</style>
