import hljs from 'highlight.js'
import katex from 'katex'
import MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'
import taskLists from 'markdown-it-task-lists'
import texmath from 'markdown-it-texmath'
import sanitizeHtml from 'sanitize-html'
import { slugify } from './slug'

export type ParsedMarkdown = {
  content: string
  title: string
  description: string
  slug: string
  tags: string[]
  status: 'draft' | 'published'
  order: number
  folderSuggestion: string
}

function unquoteFrontmatterValue(value: string): string {
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

function splitFrontmatter(source: string): {
  content: string
  data: Record<string, string | string[]>
} {
  const normalized = source.replace(/^\uFEFF/, '')
  if (!normalized.startsWith('---\n') && !normalized.startsWith('---\r\n')) {
    return { content: normalized, data: {} }
  }
  const lines = normalized.split(/\r?\n/)
  const closingIndex = lines.findIndex(
    (line, index) => index > 0 && line.trim() === '---',
  )
  if (closingIndex < 0) throw new Error('缺少 Frontmatter 结束标记')

  const data: Record<string, string | string[]> = {}
  let activeListKey = ''
  for (const line of lines.slice(1, closingIndex)) {
    const listItem = /^\s*-\s+(.+)$/.exec(line)
    if (listItem && activeListKey) {
      const current = data[activeListKey]
      const values = Array.isArray(current) ? current : []
      values.push(unquoteFrontmatterValue(listItem[1]!))
      data[activeListKey] = values
      continue
    }
    const field = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line)
    if (!field) {
      if (line.trim()) throw new Error(`不支持的字段格式：${line.trim()}`)
      continue
    }
    const key = field[1]!
    const rawValue = field[2]!.trim()
    activeListKey = rawValue ? '' : key
    if (!rawValue) {
      data[key] = []
      continue
    }
    if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
      data[key] = rawValue
        .slice(1, -1)
        .split(',')
        .map(unquoteFrontmatterValue)
        .filter(Boolean)
      continue
    }
    data[key] = unquoteFrontmatterValue(rawValue)
  }
  return {
    content: lines.slice(closingIndex + 1).join('\n'),
    data,
  }
}

function stripUnsafeProtocols(value: string): string {
  return /^(https?:|mailto:|tel:|\/|#)/i.test(value) ? value : '#'
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }
    return entities[character] || character
  })
}

const md: MarkdownIt = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})
  .use(anchor, {
    slugify: (value: string) => slugify(value) || `section-${Date.now()}`,
  })
  .use(taskLists, { enabled: true, label: true })
  .use(texmath, {
    engine: katex,
    delimiters: 'dollars',
    katexOptions: { trust: false, strict: 'ignore', throwOnError: false },
  })

const languageLabels: Record<string, string> = {
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  py: 'Python',
  python: 'Python',
  rs: 'Rust',
  rust: 'Rust',
  sh: 'Shell',
  bash: 'Shell',
  text: 'Text',
}

md.renderer.rules.fence = (tokens: any[], idx: number) => {
  const token = tokens[idx]
  const parts = String(token?.info || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  const language = (parts.shift() || 'text').toLowerCase()
  const metadata = Object.fromEntries(
    parts
      .map((part) => /^([a-z][\w-]*)=(.+)$/i.exec(part))
      .filter(Boolean)
      .map((match) => [
        match![1]!.toLowerCase(),
        match![2]!.replace(/^["']|["']$/g, ''),
      ]),
  )

  if (language === 'mermaid') {
    return `<div class="mermaid">${escapeHtml(token?.content || '')}</div>\n`
  }

  const highlighted = hljs.getLanguage(language)
    ? hljs.highlight(token?.content || '', { language }).value
    : hljs.highlightAuto(token?.content || '').value
  const group = metadata.group ? escapeHtml(metadata.group) : ''
  const label = escapeHtml(metadata.label || languageLabels[language] || language)
  const groupAttributes = group
    ? ` data-code-group="${group}" data-code-language="${escapeHtml(language)}" data-code-label="${label}"`
    : ''

  return `<pre class="code-block"${groupAttributes}><div class="code-toolbar"><span>${label}</span><button type="button" class="copy-code" aria-label="复制代码">复制</button></div><code class="hljs">${highlighted}</code></pre>\n`
}

md.renderer.rules.link_open = (
  tokens: any[],
  idx: number,
  options: any,
  _env: any,
  self: any,
) => {
  const href = tokens[idx]?.attrGet('href') || ''
  tokens[idx]?.attrSet('href', stripUnsafeProtocols(href))
  if (/^https?:/i.test(href)) {
    tokens[idx]?.attrSet('target', '_blank')
    tokens[idx]?.attrSet('rel', 'noopener noreferrer')
  }
  return self.renderToken(tokens, idx, options)
}

export function parseFrontmatter(
  source: string,
  filename = 'untitled.md',
): ParsedMarkdown {
  const fallbackTitle = filename.replace(/\.(md|markdown)$/i, '')
  try {
    const parsed = splitFrontmatter(source)
    const data = parsed.data
    const title = String(data.title || fallbackTitle).trim() || fallbackTitle
    const tags = Array.isArray(data.tags)
      ? data.tags
          .map(String)
          .map((item) => item.trim())
          .filter(Boolean)
      : typeof data.tags === 'string'
        ? data.tags
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
        : []
    return {
      content: parsed.content.trimStart(),
      title,
      description: String(data.description || ''),
      slug: slugify(String(data.slug || title || fallbackTitle)),
      tags,
      status: data.status === 'published' ? 'published' : 'draft',
      order: Number.isFinite(Number(data.order)) ? Number(data.order) : 0,
      folderSuggestion: String(data.folder || ''),
    }
  } catch (error) {
    throw new Error(
      `Frontmatter 解析失败：${error instanceof Error ? error.message : '格式错误'}`,
      { cause: error },
    )
  }
}

export function renderMarkdown(source: string): string {
  const raw = md.render(source.replace(/\[\[([^\]]+)\]\]/g, '[$1](#broken-wiki-link)'))
  return sanitizeHtml(raw, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      'img',
      'input',
      'div',
      'span',
      'button',
      'math',
      'semantics',
      'annotation',
      'mrow',
      'mi',
      'mo',
      'mn',
      'msup',
      'mfrac',
    ],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['id', 'class', 'aria-label', 'role'],
      a: ['href', 'name', 'target', 'rel', 'class'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      input: ['type', 'checked', 'disabled'],
      button: ['type', 'class', 'aria-label'],
      pre: [
        'class',
        'id',
        'role',
        'data-code-group',
        'data-code-language',
        'data-code-label',
        'aria-labelledby',
        'hidden',
      ],
      annotation: ['encoding'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['http', 'https', 'data'] },
    transformTags: {
      img: sanitizeHtml.simpleTransform('img', { loading: 'lazy' }, true),
    },
  })
}

export function extractHeadings(source: string) {
  return source
    .split('\n')
    .map((line) => /^(#{2,3})\s+(.+)$/.exec(line))
    .filter(Boolean)
    .map((match) => ({
      level: match![1]!.length,
      title: match![2]!.replace(/[*_`]/g, '').trim(),
      id: slugify(match![2]!.replace(/[*_`]/g, '').trim()),
    }))
}

export function readingTime(source: string): number {
  const latinWords = source.match(/[a-zA-Z0-9]+/g)?.length || 0
  const cjkChars = source.match(/[\u3400-\u9fff]/g)?.length || 0
  return Math.max(1, Math.ceil(latinWords / 220 + cjkChars / 400))
}

export function excerpt(source: string, length = 180): string {
  return source
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#>*_`[\]()!-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, length)
}
