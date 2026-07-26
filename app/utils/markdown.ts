import matter from 'gray-matter'
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
  highlight(code, language) {
    if (language === 'mermaid') {
      return `<div class="mermaid">${escapeHtml(code)}</div>`
    }
    const highlighted =
      language && hljs.getLanguage(language)
        ? hljs.highlight(code, { language }).value
        : hljs.highlightAuto(code).value
    return `<pre class="code-block"><div class="code-toolbar"><span>${escapeHtml(language || 'text')}</span><button type="button" class="copy-code" aria-label="复制代码">复制</button></div><code class="hljs">${highlighted}</code></pre>`
  },
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

md.renderer.rules.link_open = (tokens: any[], idx: number, options: any, _env: any, self: any) => {
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
    const parsed = matter(source)
    const data = parsed.data as Record<string, unknown>
    const title = String(data.title || fallbackTitle).trim() || fallbackTitle
    const tags = Array.isArray(data.tags)
      ? data.tags.map(String).map((item) => item.trim()).filter(Boolean)
      : typeof data.tags === 'string'
        ? data.tags.split(',').map((item) => item.trim()).filter(Boolean)
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
