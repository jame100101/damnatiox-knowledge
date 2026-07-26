<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: '新建文档' })
</script>

<template>
  <div>
    <AdminPageHeader eyebrow="EDITOR" title="新建 Markdown 文档" description="上传文件、核对元数据并实时预览。" />
    <DocumentEditor />
  </div>
</template>
