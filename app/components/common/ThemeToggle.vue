<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next'

withDefaults(defineProps<{ showLabel?: boolean }>(), { showLabel: false })

const { isDark, toggleTheme } = useTheme()
const ready = ref(false)
const actionLabel = computed(() => (isDark.value ? '切换到浅色模式' : '切换到深色模式'))

onMounted(() => {
  ready.value = true
})
</script>

<template>
  <button
    class="theme-toggle"
    type="button"
    :aria-label="actionLabel"
    :title="actionLabel"
    :aria-pressed="!isDark"
    :disabled="!ready"
    @click="toggleTheme"
  >
    <Sun v-if="isDark" :size="16" />
    <Moon v-else :size="16" />
    <span v-if="showLabel">{{ isDark ? '浅色模式' : '深色模式' }}</span>
  </button>
</template>

<style scoped>
.theme-toggle {
  min-width: 34px;
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 7px 9px;
  border: 1px solid transparent;
  border-radius: var(--kb-radius-sm);
  background: transparent;
  color: var(--kb-icon);
  cursor: pointer;
  transition:
    color 150ms ease,
    background 150ms ease,
    border-color 150ms ease;
}
.theme-toggle:hover {
  border-color: var(--kb-border);
  background: var(--kb-surface-hover);
  color: var(--kb-text);
}
.theme-toggle span {
  flex: 1;
  text-align: left;
  font-size: 13px;
}
.theme-toggle:disabled {
  cursor: wait;
  opacity: 0.6;
}
</style>
