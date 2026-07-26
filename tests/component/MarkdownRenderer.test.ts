import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MarkdownRenderer from '~/components/markdown/MarkdownRenderer.vue'

describe('MarkdownRenderer', () => {
  beforeEach(() => {
    vi.stubGlobal('useTheme', () => ({ theme: ref('dark') }))
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
})
