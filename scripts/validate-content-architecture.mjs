import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const contentRoot = path.join(root, 'content')

const targets = {
  Agent开发: [
    '01-Agent基础', '02-Agent Loop', '03-Context Engineering', '04-Tools与Runtime',
    '05-Knowledge与Memory', '06-Agent Harness', '07-Skills与Protocols',
    '08-Evaluation Observability Safety', '09-Agent Evolution', '10-Multi-Agent',
    '11-Model Post-training', '12-Production Agent', '13-Project Ladder',
    '14-完整Agent链路与架构对照', '99-现代Agent架构与源码研究',
  ],
  Java开发: [
    '01-Java语言与核心API', '02-JVM与并发', '03-工程基础与Internet-Linux',
    '04-关系型数据库', '05-Spring Framework', '06-Spring Boot与Web',
    '07-数据访问与事务', '08-测试与质量工程', '09-安全认证与授权',
    '10-应用架构与模块化单体', '11-缓存与搜索', '12-消息与事件驱动',
    '13-分布式与微服务', '14-性能工程', '15-云原生DevOps与可观测性',
    '16-可选专项', '17-项目阶梯', '99-开源项目架构研究',
  ],
  语言基础: ['01-TypeScript语言基础', '02-TypeScript跨语言对照'],
}

const retiredByArea = {
  Agent开发: [
    '03-Tools call', '04-RAG', '05-Memory', '07-多Agent协调',
    '08-Skills协议与能力打包', '09-浏览器与Computer Use', '10-评测可观测性与安全',
    '11-交付生产级Agent', '12-项目阶梯', '13-完整Agent链路与框架对照',
    '99-现代主流Coding Agent详细研究',
  ],
  Java开发: [
    '01-Java基础', '02-工程工具与Linux', '03-数据库缓存与搜索',
    '04-Spring Framework', '05-Spring Boot与Web', '06-数据访问与ORM',
    '07-分布式与微服务', '08-高性能与消息队列', '10-测试与质量工程',
    '11-云原生DevOps与可观测性', '12-前端与全栈交付', '13-项目阶梯',
  ],
  语言基础: [],
}

async function walk(directory) {
  const result = []
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name)
    if (entry.isDirectory()) result.push(...(await walk(full)))
    else if (/\.md$/i.test(entry.name)) result.push(full)
  }
  return result
}

const errors = []
for (const [area, required] of Object.entries(targets)) {
  const entries = await fs.readdir(path.join(contentRoot, area), { withFileTypes: true })
  const names = new Set(entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name))
  for (const folder of required) if (!names.has(folder)) errors.push(`${area} 缺少一级目录：${folder}`)
  for (const folder of retiredByArea[area]) if (names.has(folder)) errors.push(`${area} 保留了旧一级目录：${folder}`)
}

const files = (await Promise.all(
  Object.keys(targets).map((area) => walk(path.join(contentRoot, area))),
)).flat()
const knownFiles = new Set(files.map((filename) => path.normalize(filename)))
const titles = new Map()
const hashes = new Map()
let relativeLinks = 0
let fastMoving = 0
let diagrams = 0

for (const filename of files) {
  const relative = path.relative(root, filename)
  const markdown = await fs.readFile(filename, 'utf8')
  const h1s = [...markdown.matchAll(/^#\s+(.+)$/gm)].map((match) => match[1].trim())
  if (h1s.length !== 1) errors.push(`${relative} 一级标题数量为 ${h1s.length}`)
  for (const title of h1s) {
    const previous = titles.get(title)
    if (previous) errors.push(`重复标题：${title}（${previous}；${relative}）`)
    else titles.set(title, relative)
  }
  const fences = (markdown.match(/^```/gm) || []).length
  if (fences % 2 !== 0) errors.push(`${relative} 代码围栏未闭合`)
  diagrams += (markdown.match(/^```mermaid\s*$/gm) || []).length
  const hash = crypto.createHash('sha256').update(markdown.replace(/\s+/g, ' ').trim()).digest('hex')
  if (hashes.has(hash)) errors.push(`完全重复文档：${hashes.get(hash)}；${relative}`)
  else hashes.set(hash, relative)

  const stability = markdown.match(/`stability`:\s*`([^`]+)`/)?.[1]
  if (stability === 'fast-moving') {
    fastMoving += 1
    for (const field of ['last_verified', 'version_scope', 'source_type', 'stability']) {
      if (!markdown.includes(`\`${field}\``)) errors.push(`${relative} 缺少 freshness 字段 ${field}`)
    }
  }

  for (const match of markdown.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].trim().split('#')[0]
    if (!target || /^(?:https?:|mailto:|data:|#)/i.test(target)) continue
    relativeLinks += 1
    const decoded = decodeURIComponent(target.replace(/^<|>$/g, ''))
    const resolved = path.normalize(path.resolve(path.dirname(filename), decoded))
    if (!knownFiles.has(resolved)) errors.push(`${relative} 内部链接不存在：${target}`)
  }
}

const agentFiles = await walk(path.join(contentRoot, 'Agent开发'))
const agentAll = await Promise.all(agentFiles.map((file) => fs.readFile(file, 'utf8')))
const agentText = agentAll.join('\n')
for (const concept of [
  'Agent = Model + Context + Tools', 'Agent = Model + Harness', 'Minimal Loop',
  'Reliable Loop', 'Context Manifest', 'Prompt Cache', 'Progressive Disclosure',
  'MCP 2026-07-28', 'A2A 1.0', 'Agent Client Protocol', 'SWE-bench',
  'Terminal-Bench', 'OSWorld', 'WebArena', 'Agent Evolution',
  'Harness Improvement', 'Model Improvement',
]) if (!agentText.includes(concept)) errors.push(`Agent 架构缺少概念：${concept}`)

const javaFiles = await walk(path.join(contentRoot, 'Java开发'))
const javaAll = await Promise.all(javaFiles.map((file) => fs.readFile(file, 'utf8')))
const javaText = javaAll.join('\n')
for (const concept of [
  'JDK 25', 'JDK 26', 'Scoped Values', 'Structured Concurrency', 'Sixth Preview',
  'HTTP semantics', 'MVCC', 'JDBC vs MyBatis vs JPA', 'Testing Portfolio',
  'OAuth2', 'OIDC', 'Modular Monolith', 'Spring Modulith', 'Outbox', 'Idempotency',
  'Spring Cloud Compatibility Matrix', 'Spring AI', 'P0–P8',
]) if (!javaText.includes(concept)) errors.push(`Java 架构缺少概念：${concept}`)

if (/Structured Concurrency.{0,30}(?:stable|稳定 API)/iu.test(javaText)) errors.push('Structured Concurrency 被表述为稳定 API')
if (/Virtual Threads?.{0,20}(?:一定|总是|天然).{0,10}(?:更快|提升性能)/iu.test(javaText)) errors.push('Virtual Threads 存在泛化性能承诺')

const languageFiles = await walk(path.join(contentRoot, '语言基础'))
const languageAll = await Promise.all(languageFiles.map((file) => fs.readFile(file, 'utf8')))
const languageText = languageAll.join('\n')
for (const concept of [
  'TypeScript 7.0', '类型擦除', 'unknown', 'never', '结构化', '可辨识联合',
  'strictNullChecks', 'noUncheckedIndexedAccess', 'exactOptionalPropertyTypes',
  'keyof', '映射类型', '条件类型', '模板字面量类型', 'infer', 'NodeNext',
  '声明文件', '运行时验证', 'JavaScript', 'Java', 'Python', 'C++', 'RAII',
]) if (!languageText.includes(concept)) errors.push(`语言基础缺少概念：${concept}`)

const typeScriptExamples = (languageText.match(/^```typescript(?:\s|$)/gm) || []).length
const officialTypeScriptLinks = (languageText.match(/https:\/\/www\.typescriptlang\.org\//g) || []).length
if (languageFiles.length < 25) errors.push(`语言基础文档不足：${languageFiles.length} < 25`)
if (typeScriptExamples < 45) errors.push(`TypeScript 代码示例不足：${typeScriptExamples} < 45`)
if (officialTypeScriptLinks < 30) errors.push(`TypeScript 官方资料引用不足：${officialTypeScriptLinks} < 30`)

const report = {
  documents: files.length,
  agentDocuments: agentAll.length,
  javaDocuments: javaAll.length,
  languageDocuments: languageAll.length,
  typeScriptExamples,
  officialTypeScriptLinks,
  uniqueTitles: titles.size,
  fastMovingDocuments: fastMoving,
  relativeLinks,
  mermaidDiagrams: diagrams,
  errors,
}

console.log(JSON.stringify(report, null, 2))
if (errors.length) process.exitCode = 1
