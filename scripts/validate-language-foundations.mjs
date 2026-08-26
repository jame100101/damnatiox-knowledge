import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const contentRoot = path.join(root, 'content', '语言基础')

async function walk(directory) {
  const files = []
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await walk(full)))
    else if (/\.md$/i.test(entry.name)) files.push(full)
  }
  return files
}

const files = await walk(contentRoot)
const errors = []
let typeScriptExamples = 0
let officialLinks = 0
let mermaidDiagrams = 0
let characters = 0

for (const file of files) {
  const source = await fs.readFile(file, 'utf8')
  const relative = path.relative(root, file)
  characters += source.length
  const h1s = source.match(/^#\s+.+$/gm) || []
  const h2s = source.match(/^##\s+.+$/gm) || []
  const fences = source.match(/^```/gm) || []
  if (h1s.length !== 1) errors.push(`${relative}: H1 数量为 ${h1s.length}`)
  if (h2s.length < 2) errors.push(`${relative}: H2 少于 2 个`)
  if (fences.length % 2 !== 0) errors.push(`${relative}: 代码围栏未闭合`)
  if (source.length < 2500) errors.push(`${relative}: 内容少于 2500 字符`)
  typeScriptExamples += (source.match(/^```typescript(?:\s|$)/gm) || []).length
  officialLinks += (source.match(/https:\/\/www\.typescriptlang\.org\//g) || []).length
  mermaidDiagrams += (source.match(/^```mermaid\s*$/gm) || []).length
}

const combined = await Promise.all(files.map((file) => fs.readFile(file, 'utf8')))
const text = combined.join('\n')
for (const required of [
  'TypeScript 7.0',
  '环境配置',
  '类型擦除',
  '值空间',
  '类型空间',
  'unknown',
  'never',
  'interface',
  '结构化',
  '泛型',
  '可辨识联合',
  '控制流',
  'keyof',
  '映射类型',
  '条件类型',
  '模板字面量类型',
  'infer',
  'NodeNext',
  'Bundler',
  '.d.ts',
  'strictNullChecks',
  '运行时验证',
  'JavaScript',
  'Java',
  'Python',
  'C++',
  'RAII',
  'JVM',
  '类型提示',
  '模板实例化',
]) {
  if (!text.includes(required)) errors.push(`缺少核心主题：${required}`)
}

if (files.length !== 25) errors.push(`文档数量应为 25，实际 ${files.length}`)
if (typeScriptExamples < 45) errors.push(`TypeScript 示例不足：${typeScriptExamples}`)
if (officialLinks < 30) errors.push(`官方 TypeScript 链接不足：${officialLinks}`)
if (mermaidDiagrams < 4) errors.push(`Mermaid 图不足：${mermaidDiagrams}`)

const report = {
  documents: files.length,
  characters,
  typeScriptExamples,
  officialLinks,
  mermaidDiagrams,
  errors,
}

console.log(JSON.stringify(report, null, 2))
if (errors.length) process.exitCode = 1
