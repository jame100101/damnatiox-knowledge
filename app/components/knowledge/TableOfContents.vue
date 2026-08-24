<script setup lang="ts">
import { ListTree } from 'lucide-vue-next'
import { extractHeadings } from '~/utils/markdown'

const props = defineProps<{ source: string }>()
const { t } = useLocale()
const headings = computed(() => extractHeadings(props.source))
const activeId = ref('')
let observer: IntersectionObserver | undefined
let mounted = false

async function observeHeadings() {
  observer?.disconnect()
  activeId.value = ''
  await nextTick()
  if (!mounted) return
  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.find((entry) => entry.isIntersecting)
      if (visible) activeId.value = visible.target.id
    },
    { rootMargin: '-15% 0px -75% 0px' },
  )
  headings.value.forEach(({ id }) => {
    const el = document.getElementById(id)
    if (el) observer?.observe(el)
  })
}

onMounted(() => {
  mounted = true
  observeHeadings()
})
watch(
  () => props.source,
  () => {
    if (mounted) observeHeadings()
  },
)
onUnmounted(() => {
  mounted = false
  observer?.disconnect()
})
</script>

<template>
  <aside class="toc">
    <div class="toc-title"><ListTree :size="14" /> {{ t('pageToc') }}</div>
    <nav v-if="headings.length">
      <a
        v-for="heading in headings"
        :key="heading.id"
        :href="`#${heading.id}`"
        :class="[`level-${heading.level}`, { active: activeId === heading.id }]"
      >
        {{ heading.title }}
      </a>
    </nav>
    <p v-else class="subtle">{{ t('noHeadings') }}</p>
  </aside>
</template>

<style scoped>
.toc {
  min-width: 0;
}
.toc-title {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 13px;
  color: var(--kb-text-muted);
  font-size: 12px;
  font-weight: 700;
}
.toc-title svg {
  color: var(--kb-icon);
}
nav {
  display: grid;
  gap: 2px;
  border-left: 1px solid var(--kb-border);
}
nav a {
  padding: 5px 8px 5px 13px;
  color: var(--kb-text-subtle);
  font-size: 12px;
  line-height: 1.4;
  transition:
    color 140ms,
    border 140ms;
  border-left: 1px solid transparent;
  margin-left: -1px;
}
nav a:hover,
nav a.active {
  color: var(--kb-text);
}
nav a.active {
  border-left-color: var(--kb-accent);
}
nav a.level-3 {
  padding-left: 22px;
}
nav a.level-4 {
  padding-left: 30px;
}
nav a.level-5 {
  padding-left: 38px;
}
nav a.level-6 {
  padding-left: 46px;
}
p {
  font-size: 12px;
  line-height: 1.5;
}
</style>
