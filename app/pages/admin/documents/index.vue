<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
await navigateTo('/admin', { replace: true })
</script>
