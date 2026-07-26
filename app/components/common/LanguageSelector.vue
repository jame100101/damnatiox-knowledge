<script setup lang="ts">
import { Check, ChevronDown, Languages } from 'lucide-vue-next'

const { currentOption, locale, localeOptions, setLocale, t } = useLocale()
const open = ref(false)
const root = ref<HTMLElement>()

function select(value: (typeof localeOptions)[number]['value']) {
  setLocale(value)
  open.value = false
}

function handlePointerDown(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) open.value = false
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('pointerdown', handlePointerDown)
  window.addEventListener('keydown', handleKeydown)
})
onUnmounted(() => {
  document.removeEventListener('pointerdown', handlePointerDown)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div ref="root" class="language-selector">
    <button
      class="language-trigger"
      type="button"
      :aria-label="`${t('language')}：${currentOption.label}`"
      :title="t('language')"
      :aria-expanded="open"
      aria-haspopup="listbox"
      @click="open = !open"
    >
      <Languages :size="16" />
      <span>{{ currentOption.shortLabel }}</span>
      <ChevronDown :size="12" :class="{ rotated: open }" />
    </button>
    <Transition name="language-menu">
      <div v-if="open" class="language-menu" role="listbox" :aria-label="t('language')">
        <button
          v-for="option in localeOptions"
          :key="option.value"
          type="button"
          role="option"
          :aria-selected="locale === option.value"
          :class="{ active: locale === option.value }"
          @click="select(option.value)"
        >
          <span>{{ option.label }}</span>
          <Check v-if="locale === option.value" :size="14" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.language-selector {
  position: relative;
  flex: none;
}
.language-trigger {
  min-width: 66px;
  min-height: 34px;
  display: inline-flex !important;
  grid-template-columns: none !important;
  align-items: center;
  gap: 5px;
  border: 1px solid transparent !important;
  border-radius: var(--kb-radius-sm);
  color: var(--kb-icon);
  cursor: pointer;
}
.language-trigger:hover,
.language-trigger[aria-expanded='true'] {
  border-color: var(--kb-border) !important;
  background: var(--kb-surface-hover) !important;
  color: var(--kb-text);
}
.language-trigger span {
  min-width: 20px;
  font:
    600 11px/1 'SFMono-Regular',
    Consolas,
    monospace;
}
.language-trigger svg:last-child {
  transition: transform 140ms ease;
}
.language-trigger svg.rotated {
  transform: rotate(180deg);
}
.language-menu {
  position: absolute;
  right: 0;
  bottom: calc(100% + 8px);
  z-index: 80;
  width: 174px;
  display: grid;
  gap: 3px;
  padding: 5px;
  border: 1px solid var(--kb-border-strong);
  border-radius: var(--kb-radius-md);
  background: var(--kb-panel-bg);
  box-shadow: var(--kb-shadow);
}
.language-menu button {
  width: 100%;
  min-height: 36px;
  display: flex !important;
  grid-template-columns: none !important;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px !important;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--kb-text-muted);
  font-size: 13px;
  text-align: left;
  cursor: pointer;
}
.language-menu button:hover,
.language-menu button.active {
  background: var(--kb-surface-hover);
  color: var(--kb-text);
}
.language-menu button.active {
  box-shadow: inset 2px 0 var(--kb-accent);
}
.language-menu-enter-active,
.language-menu-leave-active {
  transition:
    opacity 120ms ease,
    transform 120ms ease;
}
.language-menu-enter-from,
.language-menu-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
