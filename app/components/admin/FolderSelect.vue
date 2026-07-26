<script setup lang="ts">
import { computed } from 'vue'
import type { Folder } from '~/types/knowledge'
import { findFolderPath, wouldCreateCycle } from '~/utils/folders'

const props = defineProps<{
  modelValue: string | null
  folders: Folder[]
  excludeId?: string
  required?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>()
const options = computed(() =>
  [...props.folders]
    .filter(
      (folder) =>
        folder.id !== props.excludeId &&
        (!props.excludeId ||
          !wouldCreateCycle(props.excludeId, folder.id, props.folders)),
    )
    .map((folder) => ({
      ...folder,
      label: findFolderPath(folder.id, props.folders)
        .map((item) => item.name)
        .join(' / '),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'zh-CN')),
)
</script>

<template>
  <select
    class="select"
    :value="modelValue || ''"
    :required="required"
    @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value || null)"
  >
    <option value="">{{ required ? '请选择文件夹' : '根目录 / 未分类' }}</option>
    <option v-for="folder in options" :key="folder.id" :value="folder.id">{{ folder.label }}</option>
  </select>
</template>
