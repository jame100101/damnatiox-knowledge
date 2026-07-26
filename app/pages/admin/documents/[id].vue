<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
const route = useRoute()
const { documents, load } = useKnowledge()
await load(false, true)
const document = computed(() => documents.value.find((item) => item.id === route.params.id))
if (!document.value) throw createError({ statusCode: 404, statusMessage: '文档不存在' })
useHead(() => ({ title: `编辑 ${document.value?.title}` }))
</script>

<template>
  <div v-if="document">
    <AdminPageHeader eyebrow="EDITOR" :title="`编辑：${document.title}`" description="修改正文、文件夹、标签或发布状态。" />
    <DocumentEditor :document="document" />
  </div>
</template>
