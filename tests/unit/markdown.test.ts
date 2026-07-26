import { describe, expect, it } from 'vitest'
import {
  excerpt,
  extractHeadings,
  parseFrontmatter,
  readingTime,
  renderMarkdown,
} from '~/utils/markdown'

describe('Markdown pipeline', () => {
  it('parses supported frontmatter with defaults', () => {
    const parsed = parseFrontmatter(
      `---
title: Spring Boot 自动配置
tags:
  - java
  - spring
status: published
order: 10
folder: Java 后端/Spring
---
## 正文
`,
      'fallback.md',
    )
    expect(parsed.title).toBe('Spring Boot 自动配置')
    expect(parsed.slug).toBe('spring-boot-auto-configuration')
    expect(parsed.tags).toEqual(['java', 'spring'])
    expect(parsed.status).toBe('published')
    expect(parsed.order).toBe(10)
    expect(parsed.folderSuggestion).toContain('Java 后端')
  })

  it('uses filename defaults when frontmatter is absent', () => {
    const parsed = parseFrontmatter('# Hello', 'hello-world.md')
    expect(parsed.title).toBe('hello-world')
    expect(parsed.slug).toBe('hello-world')
    expect(parsed.tags).toEqual([])
  })

  it('renders tables, tasks, code, headings and math', () => {
    const html = renderMarkdown(`## Title

- [x] done

|a|b|
|-|-|
|1|2|

\`code\`

$E=mc^2$`)
    expect(html).toContain('<h2')
    expect(html).toContain('<table>')
    expect(html).toContain('checkbox')
    expect(html).toContain('<code>')
    expect(html).toContain('katex')
  })

  it('keeps sanitized language-group metadata for switchable code examples', () => {
    const html = renderMarkdown(`\`\`\`python group=agent-loop label=Python
print("observe")
\`\`\`

\`\`\`rust group=agent-loop label=Rust
println!("observe");
\`\`\``)
    expect(html).toContain('data-code-group="agent-loop"')
    expect(html).toContain('data-code-language="python"')
    expect(html).toContain('data-code-label="Rust"')
    expect(html).not.toContain('group=agent-loop')
  })

  it('creates a table of contents, reading time and excerpt', () => {
    expect(extractHeadings('## Intro\n### Detail')).toEqual([
      { level: 2, title: 'Intro', id: 'intro' },
      { level: 3, title: 'Detail', id: 'detail' },
    ])
    expect(readingTime('短文')).toBe(1)
    expect(excerpt('# Title\n\nHello **world**')).toContain('Title')
  })
})
