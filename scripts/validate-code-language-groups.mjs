import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const contentRoot = path.resolve('content', 'Agent开发')
const requiredLanguages = ['python', 'rust', 'javascript', 'typescript']
const requiredSet = new Set(requiredLanguages)
const aliases = new Map([
  ['js', 'javascript'],
  ['ts', 'typescript'],
])

function normalizeLanguage(language) {
  const normalized = language.toLowerCase()
  return aliases.get(normalized) ?? normalized
}

function collectMarkdownFiles(directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const fullPath = path.join(directory, entry.name)
      if (entry.isDirectory()) return collectMarkdownFiles(fullPath)
      return entry.isFile() && entry.name.endsWith('.md') ? [fullPath] : []
    })
}

const files = collectMarkdownFiles(contentRoot)
const errors = []
const groups = new Map()
let programmingBlocks = 0
let textBlocks = 0

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')
  const fencePattern = /^```([^\n`]*)\n[\s\S]*?^```[ \t]*$/gm

  for (const match of source.matchAll(fencePattern)) {
    const info = match[1].trim().split(/\s+/).filter(Boolean)
    const language = normalizeLanguage(info[0] ?? '')
    const groupToken = info.find((token) => token.startsWith('group='))
    const group = groupToken?.slice('group='.length) ?? ''
    const line = source.slice(0, match.index).split('\n').length
    const relativeFile = path.relative(process.cwd(), file)

    if (language === 'text') textBlocks += 1
    if (!requiredSet.has(language)) continue

    programmingBlocks += 1
    if (!group) {
      errors.push(`${relativeFile}:${line} 缺少 group 属性`)
      continue
    }

    const key = `${relativeFile}\0${group}`
    const record = groups.get(key) ?? {
      file: relativeFile,
      group,
      languages: [],
    }
    record.languages.push(language)
    groups.set(key, record)
  }
}

for (const record of groups.values()) {
  const languageCounts = Map.groupBy(
    record.languages,
    (language) => language,
  )
  const missing = requiredLanguages.filter(
    (language) => !languageCounts.has(language),
  )
  const duplicates = requiredLanguages.filter(
    (language) => (languageCounts.get(language)?.length ?? 0) > 1,
  )
  const unexpected = [...new Set(record.languages)].filter(
    (language) => !requiredSet.has(language),
  )

  if (missing.length || duplicates.length || unexpected.length) {
    errors.push(
      [
        `${record.file} group=${record.group}`,
        missing.length ? `缺少 ${missing.join(', ')}` : '',
        duplicates.length ? `重复 ${duplicates.join(', ')}` : '',
        unexpected.length ? `含额外语言 ${unexpected.join(', ')}` : '',
      ]
        .filter(Boolean)
        .join('；'),
    )
  }
}

if (errors.length) {
  console.error(`代码语言组校验失败（${errors.length} 项）：`)
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log(
  [
    '代码语言组校验通过',
    `Markdown 文档 ${files.length}`,
    `语言组 ${groups.size}`,
    `编程代码块 ${programmingBlocks}`,
    `text 代码块 ${textBlocks}（按要求跳过）`,
    `每组语言 ${requiredLanguages.join(' / ')}`,
  ].join('；'),
)
