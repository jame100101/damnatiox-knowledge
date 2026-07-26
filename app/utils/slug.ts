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
}

export function slugify(input: string): string {
  let value = input.trim()
  for (const [source, target] of Object.entries(transliteration)) {
    value = value.replaceAll(source, ` ${target} `)
  }
  return value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
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
