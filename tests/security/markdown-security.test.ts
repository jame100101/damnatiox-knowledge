import { describe, expect, it } from 'vitest'
import { renderMarkdown } from '~/utils/markdown'
import { isSafeMarkdownFilename } from '~/utils/slug'

describe('security boundaries', () => {
  it('removes executable HTML and event handlers', () => {
    const html = renderMarkdown(`
<script>alert(1)</script>
<iframe src="https://evil.example"></iframe>
<img src="x" onerror="alert(1)">
<a href="javascript:alert(1)">click</a>
`)
    expect(html).not.toMatch(/script|iframe|onerror|javascript:/i)
  })

  it('rejects traversal, absolute paths and unsupported files', () => {
    for (const name of ['../a.md', '/tmp/a.md', 'C:\\a.md', 'a.html', '.md']) {
      expect(isSafeMarkdownFilename(name)).toBe(false)
    }
  })
})
