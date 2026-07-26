<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { renderMarkdown } from '~/utils/markdown'

const props = defineProps<{ source: string }>()
const root = ref<HTMLElement>()
const rendered = computed(() => renderMarkdown(props.source))

async function enhance() {
  await nextTick()
  if (!root.value) return
  root.value.querySelectorAll<HTMLButtonElement>('.copy-code').forEach((button) => {
    button.onclick = async () => {
      const code = button.closest('pre')?.querySelector('code')?.textContent || ''
      await navigator.clipboard.writeText(code)
      button.textContent = '已复制'
      setTimeout(() => (button.textContent = '复制'), 1200)
    }
  })
  const nodes = root.value.querySelectorAll<HTMLElement>('.mermaid')
  if (nodes.length) {
    const mermaid = (await import('mermaid')).default
    mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'strict' })
    await mermaid.run({ nodes: [...nodes], suppressErrors: true })
  }
}

onMounted(enhance)
watch(rendered, enhance)
</script>

<template>
  <article ref="root" class="markdown-body" v-html="rendered" />
</template>

<style>
.markdown-body { color: #cfd5db; font-size: 16px; line-height: 1.78; overflow-wrap: anywhere; }
.markdown-body > :first-child { margin-top: 0; }
.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4 { color: var(--kb-text); line-height: 1.3; scroll-margin-top: 30px; letter-spacing: -.015em; }
.markdown-body h2 { margin: 2.6em 0 .85em; padding-bottom: .45em; border-bottom: 1px solid var(--kb-border); font-size: 1.55em; }
.markdown-body h3 { margin: 2em 0 .7em; font-size: 1.22em; }
.markdown-body a { color: var(--kb-accent); text-decoration: underline; text-decoration-color: rgb(216 255 100 / 35%); text-underline-offset: 3px; }
.markdown-body p, .markdown-body ul, .markdown-body ol, .markdown-body table, .markdown-body blockquote { margin: 1.1em 0; }
.markdown-body li { margin: .3em 0; }
.markdown-body blockquote { margin-left: 0; padding: .3em 1em; border-left: 2px solid var(--kb-accent); background: var(--kb-surface); color: var(--kb-text-muted); }
.markdown-body code { font-family: "SFMono-Regular", Consolas, monospace; font-size: .87em; }
.markdown-body :not(pre) > code { padding: .18em .38em; border: 1px solid var(--kb-border); border-radius: 4px; color: #e2f5a8; background: var(--kb-code-bg); }
.markdown-body pre.code-block { margin: 1.5em 0; border: 1px solid var(--kb-border); border-radius: var(--kb-radius-md); background: var(--kb-code-bg); overflow: auto; }
.markdown-body pre code { display: block; padding: 18px; background: transparent; }
.markdown-body .code-toolbar { height: 34px; display: flex; align-items: center; justify-content: space-between; padding: 0 10px 0 14px; border-bottom: 1px solid var(--kb-border); color: var(--kb-text-subtle); font: 11px monospace; position: sticky; left: 0; }
.markdown-body .copy-code { border: 0; background: transparent; color: var(--kb-text-muted); cursor: pointer; font-size: 11px; }
.markdown-body table { width: 100%; border-collapse: collapse; display: block; overflow-x: auto; }
.markdown-body th, .markdown-body td { padding: 9px 12px; border: 1px solid var(--kb-border); text-align: left; }
.markdown-body th { color: var(--kb-text); background: var(--kb-surface-secondary); }
.markdown-body img { max-width: 100%; height: auto; border: 1px solid var(--kb-border); border-radius: var(--kb-radius-md); }
.markdown-body .task-list-item { list-style: none; }
.markdown-body input[type="checkbox"] { accent-color: var(--kb-accent); margin-right: 8px; }
.markdown-body .mermaid { padding: 18px; border: 1px solid var(--kb-border); border-radius: var(--kb-radius-md); background: var(--kb-code-bg); overflow: auto; text-align: center; }
.markdown-body .katex { color: var(--kb-text); }
</style>
