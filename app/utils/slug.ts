const transliteration: Record<string, string> = {
  Java: 'java',
  后端: 'backend',
  基础: 'basics',
  开发: 'development',
  文档: 'document',
  切分: 'chunking',
  简介: 'introduction',
  自动配置: 'auto-configuration',
  知识: 'knowledge',
  网络: 'network',
  操作系统: 'operating-system',
  推荐阅读: 'recommended-reading',
  工具调用: 'tool-calling',
  类型区分: 'types',
  基本循环: 'basic-loop',
  适用范围: 'when-to-use',
  记忆: 'memory',
  短期: 'short-term',
  长期: 'long-term',
  上下文: 'context',
  多智能体: 'multi-agent',
  协调: 'coordination',
  技能: 'skills',
  协议: 'protocols',
  能力打包: 'capability-packaging',
  浏览器: 'browser',
  计算机操作: 'computer-use',
  评测: 'evaluation',
  可观测性: 'observability',
  安全: 'safety',
  交付: 'shipping',
  现代: 'modern',
  主流: 'mainstream',
  详细研究: 'detailed-research',
}

function stableHash(input: string): string {
  let hash = 0x811c9dc5
  for (const character of input) {
    const codePoint = character.codePointAt(0)!
    hash ^= codePoint
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(36).padStart(7, '0')
}

/**
 * Return a deterministic, database-safe slug.
 *
 * Supabase constrains folder and document slugs to lowercase ASCII letters,
 * digits and hyphens. Known Chinese concepts get readable translations. Any
 * remaining non-ASCII text contributes a stable hash, so arbitrary Chinese
 * names stay valid and two different names do not collapse to the same slug.
 */
export function slugify(input: string): string {
  const source = input.trim().normalize('NFKC')
  let value = source
  for (const [chinese, english] of Object.entries(transliteration).sort(
    ([left], [right]) => right.length - left.length,
  )) {
    value = value.replaceAll(chinese, ` ${english} `)
  }

  const hasUnmappedNonAscii = [...value].some(
    (character) => character.codePointAt(0)! > 0x7f,
  )
  let slug = value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')

  const hash = stableHash(source)
  if (hasUnmappedNonAscii) slug = slug ? `${slug}-${hash}` : `item-${hash}`
  if (!slug) slug = `item-${hash}`

  if (slug.length > 120) {
    slug = `${slug.slice(0, 112).replace(/-+$/g, '')}-${hash}`
  }
  return slug
}

export function sanitizeFilename(input: string): string {
  const basename = input.replaceAll('\\', '/').split('/').pop() || ''
  return basename
    .replace(/\p{Cc}/gu, '')
    .replace(/^\.+/, '')
    .replace(/[<>:"|?*]/g, '-')
    .trim()
}

export function isSafeMarkdownFilename(name: string): boolean {
  const clean = sanitizeFilename(name)
  return (
    clean === name &&
    clean.length > 0 &&
    clean.length <= 180 &&
    /\.(md|markdown)$/i.test(clean)
  )
}
