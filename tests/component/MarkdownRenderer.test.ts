import { flushPromises, mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import MarkdownRenderer from '~/components/markdown/MarkdownRenderer.vue'

const mermaidMocks = vi.hoisted(() => ({
  initialize: vi.fn(),
  run: vi.fn(),
}))

vi.mock('mermaid', () => ({
  default: mermaidMocks,
}))

describe('MarkdownRenderer', () => {
  beforeEach(() => {
    vi.stubGlobal('useTheme', () => ({ theme: ref('dark') }))
    vi.stubGlobal('useLocale', () => ({
      locale: ref('zh-CN'),
      t: (key: string) =>
        (
          ({
            copy: '复制',
            copied: '已复制',
            codeLanguages: '代码语言',
            enlarge: '放大查看',
            diagram: '流程图',
            diagramOpenHint: '也可直接点击图表',
            diagramViewer: '流程图查看器',
            close: '关闭',
            closeDiagram: '关闭流程图',
            zoomOut: '缩小流程图',
            zoomIn: '放大流程图',
            resetDiagram: '复位流程图',
            diagramHelp: '滚轮缩放 · 拖拽移动 · 双击复位',
          }) as Record<string, string>
        )[key] || key,
    }))
    mermaidMocks.initialize.mockReset()
    mermaidMocks.run.mockReset()
    mermaidMocks.run.mockImplementation(async ({ nodes }: { nodes: HTMLElement[] }) => {
      nodes.forEach((node) => {
        node.dataset.processed = 'true'
        node.innerHTML = `
          <svg viewBox="0 0 1200 140" width="100%" role="img">
            <defs><marker id="arrow"><path d="M0 0L10 5L0 10Z" /></marker></defs>
            <path d="M10 70H1190" marker-end="url(#arrow)" />
          </svg>
        `
      })
    })
  })

  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
  })

  it('renders a preview while stripping malicious markup', () => {
    const wrapper = mount(MarkdownRenderer, {
      props: {
        source:
          '## Preview\n\n<script>window.pwned=true</script>\n\n<img src=x onerror="window.pwned=true">',
      },
    })
    expect(wrapper.find('h2').text()).toBe('Preview')
    expect(wrapper.html()).not.toContain('<script')
    expect(wrapper.html()).not.toContain('onerror')
  })

  it('opens Mermaid diagrams in a zoomable viewer', async () => {
    const wrapper = mount(MarkdownRenderer, {
      attachTo: document.body,
      props: {
        source: '```mermaid\nflowchart LR\nA[Observe] --> B[Think] --> C[Act]\n```',
      },
    })

    await flushPromises()

    const openButton = (
      wrapper.element as HTMLElement
    ).querySelector<HTMLButtonElement>('.mermaid-open-button')
    expect(openButton?.textContent).toBe('放大查看')
    expect(openButton?.getAttribute('aria-label')).toBe('放大查看 流程图 1')
    expect(openButton).toBeTruthy()

    const diagram = (wrapper.element as HTMLElement).querySelector<HTMLElement>(
      '.mermaid-interactive',
    )
    const scrollViewport = diagram?.querySelector<HTMLElement>(
      '.mermaid-scroll-viewport',
    )
    expect(scrollViewport?.querySelector('svg')).toBeTruthy()
    expect(scrollViewport?.contains(openButton!)).toBe(false)
    expect(openButton?.parentElement).toBe(diagram)

    const openButtonIcon = openButton!.querySelector<SVGSVGElement>('svg')
    expect(openButtonIcon).toBeTruthy()
    expect(openButtonIcon?.getAttribute('width')).toBeNull()

    openButton?.click()
    await nextTick()

    const dialog = document.body.querySelector<HTMLElement>('.diagram-viewer-overlay')
    expect(dialog?.getAttribute('role')).toBe('dialog')
    expect(dialog?.querySelector('.diagram-viewer-canvas svg')).toBeTruthy()
    expect(document.body.style.overflow).toBe('hidden')

    document.body
      .querySelector<HTMLButtonElement>('button[aria-label="放大流程图"]')
      ?.click()
    await nextTick()
    expect(document.body.querySelector('output')?.textContent).toBe('125%')

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(document.body.querySelector('.diagram-viewer-overlay')).toBeNull()
    expect(document.body.style.overflow).toBe('')

    wrapper.unmount()
  })

  it('switches grouped code examples by language tab', async () => {
    const wrapper = mount(MarkdownRenderer, {
      props: {
        source: `\`\`\`typescript group=agent-loop label=TypeScript
console.log("observe")
\`\`\`

\`\`\`python group=agent-loop label=Python
print("observe")
\`\`\`

\`\`\`javascript group=agent-loop label=JavaScript
console.log("observe")
\`\`\`

\`\`\`rust group=agent-loop label=Rust
println!("observe");
\`\`\``,
      },
    })

    await flushPromises()

    const tabs = wrapper.findAll<HTMLButtonElement>('[role="tab"]')
    expect(tabs.map((tab) => tab.text())).toEqual([
      'Python',
      'Rust',
      'JavaScript',
      'TypeScript',
    ])
    expect(wrapper.findAll<HTMLPreElement>('[role="tabpanel"]')).toHaveLength(4)
    expect(tabs[0]?.attributes('aria-selected')).toBe('true')
    expect(
      wrapper.findAll<HTMLPreElement>('[role="tabpanel"]')[1]?.element.hidden,
    ).toBe(true)

    await tabs[1]?.trigger('click')
    expect(tabs[1]?.attributes('aria-selected')).toBe('true')
    expect(
      wrapper.findAll<HTMLPreElement>('[role="tabpanel"]')[1]?.element.hidden,
    ).toBe(false)

    await tabs[1]?.trigger('keydown', { key: 'ArrowRight' })
    expect(tabs[2]?.attributes('aria-selected')).toBe('true')

    await tabs[2]?.trigger('keydown', { key: 'End' })
    expect(tabs[3]?.attributes('aria-selected')).toBe('true')
  })
})
