import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
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

  it('indexes deep headings with renderer-aligned ids and ignores fenced examples', () => {
    const source = `# Page title
## **Repeated** \`heading\`
## Repeated heading
#### Deep implementation detail
###### Lowest supported detail

\`\`\`markdown
### Example heading only
\`\`\``

    expect(extractHeadings(source)).toEqual([
      { level: 2, title: 'Repeated heading', id: 'repeated-heading' },
      { level: 2, title: 'Repeated heading', id: 'repeated-heading-1' },
      {
        level: 4,
        title: 'Deep implementation detail',
        id: 'deep-implementation-detail',
      },
      {
        level: 6,
        title: 'Lowest supported detail',
        id: 'lowest-supported-detail',
      },
    ])
  })

  it('keeps the TOC complete for every Markdown article in the knowledge base', () => {
    const files: string[] = []
    const visit = (directory: string) => {
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const fullPath = path.join(directory, entry.name)
        if (entry.isDirectory()) visit(fullPath)
        else if (/\.md$/i.test(entry.name)) files.push(fullPath)
      }
    }
    visit(path.resolve(process.cwd(), 'content'))

    const failures: Array<{
      file: string
      rendered: Array<{ level: number; id: string }>
      extracted: Array<{ level: number; id: string }>
    }> = []
    for (const file of files) {
      const source = fs.readFileSync(file, 'utf8')
      const rendered = [
        ...renderMarkdown(source).matchAll(/<h([2-6])\b[^>]*\bid="([^"]+)"[^>]*>/g),
      ].map((match) => ({ level: Number(match[1]), id: match[2]! }))
      const extracted = extractHeadings(source).map(({ level, id }) => ({ level, id }))
      if (JSON.stringify(rendered) !== JSON.stringify(extracted)) {
        failures.push({ file: path.relative(process.cwd(), file), rendered, extracted })
      }
    }

    expect(files.length).toBeGreaterThan(0)
    expect(failures).toEqual([])
  })
})
