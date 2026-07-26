<script setup lang="ts">
import { RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-vue-next'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { renderMarkdown } from '~/utils/markdown'

const props = defineProps<{ source: string }>()
const root = ref<HTMLElement>()
const viewerDialog = ref<HTMLElement>()
const rendered = computed(() => renderMarkdown(props.source))
const { theme } = useTheme()
const { locale, t } = useLocale()
const viewerOpen = ref(false)
const viewerSvg = ref('')
const viewerTitle = ref<string>(t('diagram'))
const zoom = ref(1)
const panX = ref(0)
const panY = ref(0)
const isPanning = ref(false)
const zoomPercent = computed(() => `${Math.round(zoom.value * 100)}%`)
let previousBodyOverflow = ''
let dragStartX = 0
let dragStartY = 0
let codeGroupSequence = 0
const codeLanguageOrder = new Map([
  ['python', 0],
  ['rust', 1],
  ['javascript', 2],
  ['js', 2],
  ['typescript', 3],
  ['ts', 3],
])

function cssVariable(name: string, fallback: string) {
  return (
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
  )
}

function cloneSvgForViewer(svg: SVGSVGElement) {
  const clone = svg.cloneNode(true) as SVGSVGElement
  const prefix = `diagram-viewer-${Date.now()}-`
  const ids = new Map<string, string>()

  clone.querySelectorAll<HTMLElement>('[id]').forEach((element) => {
    const oldId = element.id
    const newId = `${prefix}${oldId}`
    ids.set(oldId, newId)
    element.id = newId
  })

  clone.querySelectorAll<HTMLElement>('*').forEach((element) => {
    for (const attribute of [...element.attributes]) {
      let value = attribute.value
      ids.forEach((newId, oldId) => {
        value = value.replaceAll(`url(#${oldId})`, `url(#${newId})`)
        if (value === `#${oldId}`) value = `#${newId}`
      })
      if (value !== attribute.value) element.setAttribute(attribute.name, value)
    }
  })

  clone.querySelectorAll('style').forEach((style) => {
    let value = style.textContent || ''
    ids.forEach((newId, oldId) => {
      value = value.replaceAll(`#${oldId}`, `#${newId}`)
    })
    style.textContent = value
  })

  clone.removeAttribute('width')
  clone.removeAttribute('height')
  clone.style.width = ''
  clone.style.maxWidth = ''
  clone.style.height = ''
  clone.setAttribute('preserveAspectRatio', 'xMidYMid meet')
  return clone.outerHTML
}

function prepareDiagram(node: HTMLElement, index: number) {
  const svg = node.querySelector<SVGSVGElement>('svg')
  if (!svg) return

  node.classList.add('mermaid-interactive')
  const label = `${t('enlarge')} ${t('diagram')} ${index + 1}`
  let button = node.querySelector<HTMLButtonElement>('.mermaid-open-button')
  if (!button) {
    button = document.createElement('button')
    button.type = 'button'
    button.className = 'mermaid-open-button'
    button.innerHTML =
      '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M15 3h6v6"/><path d="m21 3-7 7"/><path d="m3 21 7-7"/><path d="M9 21H3v-6"/></svg><span></span>'
    node.append(button)
  }
  const buttonLabel = button.querySelector('span')
  if (buttonLabel) buttonLabel.textContent = t('enlarge')
  button.setAttribute('aria-label', label)
  button.title = `${label} · ${t('diagramOpenHint')}`

  const viewBox = svg.viewBox?.baseVal
  if (viewBox?.width && viewBox?.height && viewBox.width / viewBox.height >= 3) {
    const preferredWidth = Math.min(Math.max(viewBox.width, 1100), 1800)
    svg.style.width = `${preferredWidth}px`
    svg.style.maxWidth = 'none'
    svg.style.height = 'auto'
  }
}

function enhanceCodeGroups() {
  if (!root.value) return
  const groups = new Map<string, HTMLPreElement[]>()
  root.value
    .querySelectorAll<HTMLPreElement>('pre.code-block[data-code-group]')
    .forEach((block) => {
      if (block.closest('.code-group')) return
      const group = block.dataset.codeGroup
      if (!group) return
      groups.set(group, [...(groups.get(group) || []), block])
    })

  groups.forEach((blocks, group) => {
    if (blocks.length < 2) return
    blocks.sort((left, right) => {
      const leftOrder = codeLanguageOrder.get(
        left.dataset.codeLanguage?.toLowerCase() || '',
      )
      const rightOrder = codeLanguageOrder.get(
        right.dataset.codeLanguage?.toLowerCase() || '',
      )
      return (
        (leftOrder ?? Number.MAX_SAFE_INTEGER) - (rightOrder ?? Number.MAX_SAFE_INTEGER)
      )
    })
    const section = document.createElement('section')
    const tabs = document.createElement('div')
    const panels = document.createElement('div')
    const instance = ++codeGroupSequence
    section.className = 'code-group'
    section.dataset.codeGroup = group
    tabs.className = 'code-tabs'
    tabs.setAttribute('role', 'tablist')
    tabs.setAttribute('aria-label', t('codeLanguages'))
    panels.className = 'code-panels'
    blocks[0]!.before(section)
    section.append(tabs, panels)

    const activate = (activeIndex: number) => {
      blocks.forEach((block, index) => {
        const tab = tabs.children[index] as HTMLButtonElement
        const active = index === activeIndex
        block.hidden = !active
        block.setAttribute('aria-hidden', String(!active))
        tab.setAttribute('aria-selected', String(active))
        tab.tabIndex = active ? 0 : -1
      })
    }

    blocks.forEach((block, index) => {
      const tab = document.createElement('button')
      const label =
        block.dataset.codeLabel || block.dataset.codeLanguage || `Code ${index + 1}`
      const tabId = `code-tab-${instance}-${index}`
      const panelId = `code-panel-${instance}-${index}`
      tab.type = 'button'
      tab.className = 'code-tab'
      tab.id = tabId
      tab.textContent = label
      tab.setAttribute('role', 'tab')
      tab.setAttribute('aria-controls', panelId)
      tab.onclick = () => activate(index)
      tab.onkeydown = (event) => {
        const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End']
        if (!keys.includes(event.key)) return
        event.preventDefault()
        const nextIndex =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? blocks.length - 1
              : (index + (event.key === 'ArrowRight' ? 1 : -1) + blocks.length) %
                blocks.length
        activate(nextIndex)
        ;(tabs.children[nextIndex] as HTMLButtonElement).focus()
      }
      block.id = panelId
      block.setAttribute('role', 'tabpanel')
      block.setAttribute('aria-labelledby', tabId)
      tabs.append(tab)
      panels.append(block)
    })
    activate(0)
  })
}

async function enhance() {
  await nextTick()
  if (!root.value) return
  enhanceCodeGroups()
  root.value.querySelectorAll<HTMLButtonElement>('.copy-code').forEach((button) => {
    button.textContent = t('copy')
    button.setAttribute('aria-label', t('copy'))
    button.onclick = async () => {
      const code = button.closest('pre')?.querySelector('code')?.textContent || ''
      await navigator.clipboard.writeText(code)
      button.textContent = t('copied')
      setTimeout(() => (button.textContent = t('copy')), 1200)
    }
  })
  const nodes = root.value.querySelectorAll<HTMLElement>('.mermaid')
  if (nodes.length) {
    const mermaid = (await import('mermaid')).default
    const isLight = theme.value === 'light'
    mermaid.initialize({
      startOnLoad: false,
      theme: isLight ? 'base' : 'dark',
      securityLevel: 'strict',
      themeVariables: isLight
        ? {
            background: cssVariable('--kb-diagram-bg', '#ffffff'),
            primaryColor: cssVariable('--kb-surface-secondary', '#e9eee8'),
            primaryTextColor: cssVariable('--kb-text', '#152019'),
            primaryBorderColor: cssVariable('--kb-control-border', '#87958b'),
            secondaryColor: cssVariable('--kb-surface-hover', '#e1e8e1'),
            secondaryTextColor: cssVariable('--kb-text', '#152019'),
            secondaryBorderColor: cssVariable('--kb-control-border', '#87958b'),
            tertiaryColor: cssVariable('--kb-bg', '#f3f6f1'),
            tertiaryTextColor: cssVariable('--kb-text', '#152019'),
            tertiaryBorderColor: cssVariable('--kb-border-strong', '#9aa79e'),
            lineColor: cssVariable('--kb-icon', '#536259'),
            textColor: cssVariable('--kb-text', '#152019'),
            edgeLabelBackground: cssVariable('--kb-surface', '#ffffff'),
            clusterBkg: cssVariable('--kb-bg', '#f3f6f1'),
            clusterBorder: cssVariable('--kb-border-strong', '#9aa79e'),
            fontFamily: 'Inter, "Noto Sans SC", sans-serif',
          }
        : undefined,
    })
    await mermaid.run({ nodes: [...nodes], suppressErrors: true })
    nodes.forEach(prepareDiagram)
  }
}

function openDiagram(node: HTMLElement) {
  const svg = node.querySelector<SVGSVGElement>('svg')
  if (!svg) return

  const diagrams = root.value
    ? [...root.value.querySelectorAll('.mermaid-interactive')]
    : []
  const index = Math.max(0, diagrams.indexOf(node))
  viewerTitle.value = `${t('diagram')} ${index + 1}`
  viewerSvg.value = cloneSvgForViewer(svg)
  zoom.value = 1
  panX.value = 0
  panY.value = 0
  viewerOpen.value = true
  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  nextTick(() => viewerDialog.value?.focus())
}

function closeViewer() {
  viewerOpen.value = false
  viewerSvg.value = ''
  isPanning.value = false
  document.body.style.overflow = previousBodyOverflow
}

function handleRootClick(event: MouseEvent) {
  const target = event.target
  if (!(target instanceof Element)) return
  const trigger = target.closest('.mermaid-open-button, .mermaid-interactive svg')
  const diagram = target.closest<HTMLElement>('.mermaid-interactive')
  if (trigger && diagram) openDiagram(diagram)
}

function setZoom(value: number) {
  zoom.value = Math.min(4, Math.max(0.5, Number(value.toFixed(2))))
}

function resetView() {
  zoom.value = 1
  panX.value = 0
  panY.value = 0
}

function handleWheel(event: WheelEvent) {
  setZoom(zoom.value + (event.deltaY < 0 ? 0.15 : -0.15))
}

function startPan(event: PointerEvent) {
  if (event.button !== 0) return
  isPanning.value = true
  dragStartX = event.clientX - panX.value
  dragStartY = event.clientY - panY.value
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function movePan(event: PointerEvent) {
  if (!isPanning.value) return
  panX.value = event.clientX - dragStartX
  panY.value = event.clientY - dragStartY
}

function stopPan(event: PointerEvent) {
  if (!isPanning.value) return
  isPanning.value = false
  const target = event.currentTarget as HTMLElement
  if (target.hasPointerCapture(event.pointerId))
    target.releasePointerCapture(event.pointerId)
}

function handleViewerKeydown(event: KeyboardEvent) {
  if (!viewerOpen.value) return
  if (event.key === 'Escape') closeViewer()
  if (event.key === '+' || event.key === '=') setZoom(zoom.value + 0.25)
  if (event.key === '-') setZoom(zoom.value - 0.25)
  if (event.key === '0') resetView()
}

onMounted(() => {
  enhance()
  window.addEventListener('keydown', handleViewerKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleViewerKeydown)
  if (viewerOpen.value) document.body.style.overflow = previousBodyOverflow
})
watch(rendered, enhance)
watch([theme, locale], async () => {
  closeViewer()
  if (root.value) root.value.innerHTML = rendered.value
  await enhance()
})
</script>

<template>
  <!-- eslint-disable vue/no-v-html -->
  <article
    ref="root"
    class="markdown-body"
    @click="handleRootClick"
    v-html="rendered"
  />

  <Teleport to="body">
    <Transition name="diagram-viewer">
      <section
        v-if="viewerOpen"
        ref="viewerDialog"
        class="diagram-viewer-overlay"
        role="dialog"
        aria-modal="true"
        :aria-label="`${viewerTitle} ${t('enlarge')}`"
        tabindex="-1"
        @pointerdown.self="closeViewer"
      >
        <div class="diagram-viewer-shell">
          <header class="diagram-viewer-header">
            <div>
              <span>{{ t('diagramViewer').toUpperCase() }}</span>
              <strong>{{ viewerTitle }}</strong>
            </div>
            <button
              type="button"
              :aria-label="t('closeDiagram')"
              :title="`${t('close')}（Esc）`"
              @click="closeViewer"
            >
              <X :size="19" />
            </button>
          </header>

          <div
            class="diagram-viewer-viewport"
            :class="{ dragging: isPanning }"
            @wheel.prevent="handleWheel"
            @pointerdown="startPan"
            @pointermove="movePan"
            @pointerup="stopPan"
            @pointercancel="stopPan"
            @dblclick="resetView"
          >
            <div
              class="diagram-viewer-canvas"
              :style="{
                transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
              }"
              v-html="viewerSvg"
            />
          </div>

          <footer class="diagram-viewer-footer">
            <span>{{ t('diagramHelp') }}</span>
            <div class="diagram-viewer-controls">
              <button
                type="button"
                :aria-label="t('zoomOut')"
                :title="`${t('zoomOut')}（-）`"
                @click="setZoom(zoom - 0.25)"
              >
                <ZoomOut :size="18" />
              </button>
              <output aria-live="polite">{{ zoomPercent }}</output>
              <button
                type="button"
                :aria-label="t('zoomIn')"
                :title="`${t('zoomIn')}（+）`"
                @click="setZoom(zoom + 0.25)"
              >
                <ZoomIn :size="18" />
              </button>
              <button
                type="button"
                :aria-label="t('resetDiagram')"
                :title="`${t('resetDiagram')}（0）`"
                @click="resetView"
              >
                <RotateCcw :size="17" />
              </button>
            </div>
          </footer>
        </div>
      </section>
    </Transition>
  </Teleport>
</template>

<style>
.markdown-body {
  color: var(--kb-markdown-text);
  font-size: 16px;
  line-height: 1.78;
  overflow-wrap: anywhere;
}
.markdown-body > :first-child {
  margin-top: 0;
}
.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4 {
  color: var(--kb-text);
  line-height: 1.3;
  scroll-margin-top: 30px;
  letter-spacing: -0.015em;
}
.markdown-body h2 {
  margin: 2.6em 0 0.85em;
  padding-bottom: 0.45em;
  border-bottom: 1px solid var(--kb-border);
  font-size: 1.55em;
}
.markdown-body h3 {
  margin: 2em 0 0.7em;
  font-size: 1.22em;
}
.markdown-body a {
  color: var(--kb-accent);
  text-decoration: underline;
  text-decoration-color: var(--kb-link-decoration);
  text-underline-offset: 3px;
}
.markdown-body p,
.markdown-body ul,
.markdown-body ol,
.markdown-body table,
.markdown-body blockquote {
  margin: 1.1em 0;
}
.markdown-body li {
  margin: 0.3em 0;
}
.markdown-body blockquote {
  margin-left: 0;
  padding: 0.3em 1em;
  border-left: 2px solid var(--kb-accent);
  background: var(--kb-surface);
  color: var(--kb-text-muted);
}
.markdown-body code {
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 0.87em;
}
.markdown-body :not(pre) > code {
  padding: 0.18em 0.38em;
  border: 1px solid var(--kb-border);
  border-radius: 4px;
  color: var(--kb-code-inline-text);
  background: var(--kb-code-bg);
}
.markdown-body pre.code-block {
  margin: 1.5em 0;
  border: 1px solid var(--kb-border);
  border-radius: var(--kb-radius-md);
  background: var(--kb-code-bg);
  overflow: auto;
}
.markdown-body pre code {
  display: block;
  padding: 18px;
  background: transparent;
}
.markdown-body .code-toolbar {
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px 0 14px;
  border-bottom: 1px solid var(--kb-border);
  color: var(--kb-text-subtle);
  font: 11px monospace;
  position: sticky;
  left: 0;
}
.markdown-body .copy-code {
  border: 0;
  background: transparent;
  color: var(--kb-text-muted);
  cursor: pointer;
  font-size: 11px;
}
.markdown-body .code-group {
  margin: 1.5em 0;
  overflow: hidden;
  border: 1px solid var(--kb-border);
  border-radius: var(--kb-radius-md);
  background: var(--kb-code-bg);
}
.markdown-body .code-tabs {
  min-height: 42px;
  display: flex;
  align-items: end;
  gap: 3px;
  padding: 6px 8px 0;
  overflow-x: auto;
  border-bottom: 1px solid var(--kb-border);
  background: var(--kb-panel-bg);
}
.markdown-body .code-tab {
  position: relative;
  min-height: 35px;
  flex: none;
  padding: 7px 11px 9px;
  border: 0;
  border-radius: 6px 6px 0 0;
  background: transparent;
  color: var(--kb-text-subtle);
  font:
    600 11px/1 'SFMono-Regular',
    Consolas,
    monospace;
  cursor: pointer;
}
.markdown-body .code-tab:hover {
  color: var(--kb-text);
  background: var(--kb-surface-hover);
}
.markdown-body .code-tab[aria-selected='true'] {
  color: var(--kb-code-text);
  background: var(--kb-code-bg);
}
.markdown-body .code-tab[aria-selected='true']::after {
  content: '';
  position: absolute;
  right: 10px;
  bottom: -1px;
  left: 10px;
  height: 2px;
  border-radius: 2px 2px 0 0;
  background: var(--kb-accent);
}
.markdown-body .code-panels pre.code-block {
  margin: 0;
  border: 0;
  border-radius: 0;
}
.markdown-body .code-panels .code-toolbar > span {
  visibility: hidden;
}
.markdown-body .code-panels .copy-code {
  color: var(--kb-code-text);
  opacity: 0.72;
}
.markdown-body table {
  width: 100%;
  border-collapse: collapse;
  display: block;
  overflow-x: auto;
}
.markdown-body th,
.markdown-body td {
  padding: 9px 12px;
  border: 1px solid var(--kb-border);
  text-align: left;
}
.markdown-body th {
  color: var(--kb-text);
  background: var(--kb-surface-secondary);
}
.markdown-body img {
  max-width: 100%;
  height: auto;
  border: 1px solid var(--kb-border);
  border-radius: var(--kb-radius-md);
}
.markdown-body .task-list-item {
  list-style: none;
}
.markdown-body input[type='checkbox'] {
  accent-color: var(--kb-accent);
  margin-right: 8px;
}
.markdown-body .mermaid {
  position: relative;
  padding: 18px;
  border: 1px solid var(--kb-border);
  border-radius: var(--kb-radius-md);
  background: var(--kb-diagram-bg);
  overflow: auto;
  text-align: center;
}
.markdown-body .mermaid-interactive {
  padding-top: 52px;
  cursor: zoom-in;
}
.markdown-body .mermaid svg {
  display: block;
  min-width: 100%;
  margin: 0 auto;
}
.markdown-body .mermaid-open-button {
  position: absolute;
  z-index: 2;
  top: 10px;
  right: 10px;
  width: max-content;
  min-height: 26px;
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  padding: 3px 7px;
  border: 1px solid var(--kb-control-border);
  border-radius: var(--kb-radius-sm);
  background: var(--kb-panel-bg);
  box-shadow: 0 2px 8px rgb(0 0 0 / 12%);
  color: var(--kb-text);
  font-size: 11px;
  font-weight: 650;
  line-height: 1;
  white-space: nowrap;
  overflow-wrap: normal;
  cursor: zoom-in;
}
.markdown-body .mermaid-open-button svg {
  width: 13px;
  height: 13px;
  min-width: 13px;
  flex: 0 0 13px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.markdown-body .mermaid-open-button:hover {
  border-color: var(--kb-accent);
  color: var(--kb-accent);
}
.markdown-body .katex {
  color: var(--kb-text);
}
.markdown-body .katex-display {
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
}

.diagram-viewer-overlay {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: clamp(12px, 3vw, 34px);
  background: rgb(5 8 6 / 78%);
  backdrop-filter: blur(8px);
}
.diagram-viewer-overlay:focus {
  outline: none;
}
.diagram-viewer-shell {
  width: min(1500px, 100%);
  height: min(900px, 100%);
  min-height: 360px;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  overflow: hidden;
  border: 1px solid var(--kb-border-strong);
  border-radius: var(--kb-radius-lg);
  background: var(--kb-surface);
  box-shadow: 0 30px 90px rgb(0 0 0 / 38%);
}
.diagram-viewer-header,
.diagram-viewer-footer {
  min-height: 58px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 10px 14px 10px 18px;
  background: var(--kb-panel-bg);
}
.diagram-viewer-header {
  border-bottom: 1px solid var(--kb-border);
}
.diagram-viewer-header > div {
  display: grid;
  gap: 3px;
}
.diagram-viewer-header span {
  color: var(--kb-accent);
  font:
    700 9px/1.2 'SFMono-Regular',
    Consolas,
    monospace;
  letter-spacing: 0.14em;
}
.diagram-viewer-header strong {
  color: var(--kb-text);
  font-size: 14px;
}
.diagram-viewer-header button,
.diagram-viewer-controls button {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  flex: none;
  padding: 0;
  border: 1px solid var(--kb-border);
  border-radius: var(--kb-radius-sm);
  background: var(--kb-surface-secondary);
  color: var(--kb-icon-strong);
  cursor: pointer;
}
.diagram-viewer-header button:hover,
.diagram-viewer-controls button:hover {
  border-color: var(--kb-control-border);
  background: var(--kb-surface-hover);
  color: var(--kb-text);
}
.diagram-viewer-viewport {
  position: relative;
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: 32px;
  background:
    radial-gradient(circle, var(--kb-border) 1px, transparent 1px) 0 0 / 20px 20px,
    var(--kb-bg);
  cursor: grab;
  touch-action: none;
  user-select: none;
}
.diagram-viewer-viewport.dragging {
  cursor: grabbing;
}
.diagram-viewer-canvas {
  width: min(1380px, calc(100vw - 120px));
  will-change: transform;
  transform-origin: center;
  transition: transform 100ms ease-out;
}
.diagram-viewer-viewport.dragging .diagram-viewer-canvas {
  transition: none;
}
.diagram-viewer-canvas svg {
  width: 100%;
  max-width: none;
  height: auto;
  display: block;
  overflow: visible;
}
.diagram-viewer-footer {
  border-top: 1px solid var(--kb-border);
  color: var(--kb-text-subtle);
  font-size: 11px;
}
.diagram-viewer-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}
.diagram-viewer-controls output {
  width: 54px;
  text-align: center;
  color: var(--kb-text);
  font:
    12px/1 'SFMono-Regular',
    Consolas,
    monospace;
}
.diagram-viewer-enter-active,
.diagram-viewer-leave-active {
  transition: opacity 160ms ease;
}
.diagram-viewer-enter-active .diagram-viewer-shell,
.diagram-viewer-leave-active .diagram-viewer-shell {
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}
.diagram-viewer-enter-from,
.diagram-viewer-leave-to,
.diagram-viewer-enter-from .diagram-viewer-shell,
.diagram-viewer-leave-to .diagram-viewer-shell {
  opacity: 0;
}
.diagram-viewer-enter-from .diagram-viewer-shell,
.diagram-viewer-leave-to .diagram-viewer-shell {
  transform: translateY(8px) scale(0.985);
}

@media (max-width: 720px) {
  .diagram-viewer-overlay {
    padding: 0;
  }
  .diagram-viewer-shell {
    height: 100%;
    border: 0;
    border-radius: 0;
  }
  .diagram-viewer-canvas {
    width: 1100px;
  }
  .diagram-viewer-footer > span {
    display: none;
  }
  .diagram-viewer-footer {
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .diagram-viewer-enter-active,
  .diagram-viewer-leave-active,
  .diagram-viewer-enter-active .diagram-viewer-shell,
  .diagram-viewer-leave-active .diagram-viewer-shell,
  .diagram-viewer-canvas {
    transition: none;
  }
}
</style>
