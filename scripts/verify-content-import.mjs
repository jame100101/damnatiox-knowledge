import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

async function loadEnv(filename) {
  const source = await fs.readFile(filename, 'utf8')
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^([^#=\s]+)=(.*)$/)
    if (!match || process.env[match[1]]) continue
    process.env[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, '$2')
  }
}

async function localTitles(area) {
  const titles = []
  async function visit(directory) {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name)
      if (entry.isDirectory()) await visit(full)
      else if (/\.md$/i.test(entry.name)) {
        const source = await fs.readFile(full, 'utf8')
        titles.push(
          source.match(/^#\s+(.+)$/m)?.[1].trim() || entry.name.replace(/\.md$/i, ''),
        )
      }
    }
  }
  await visit(path.join(rootDir, 'content', area))
  return titles.sort((a, b) => a.localeCompare(b, 'zh-CN'))
}

function treeIds(folders, rootId) {
  const result = new Set([rootId])
  let changed = true
  while (changed) {
    changed = false
    for (const folder of folders) {
      if (folder.parent_id && result.has(folder.parent_id) && !result.has(folder.id)) {
        result.add(folder.id)
        changed = true
      }
    }
  }
  return result
}

await loadEnv(path.join(rootDir, '.env.local'))
const url = process.env.NUXT_PUBLIC_SUPABASE_URL
const key = process.env.NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
if (!url || !key) throw new Error('Missing public Supabase configuration')

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
})
const [
  { data: folders, error: folderError },
  { data: documents, error: documentError },
] = await Promise.all([
  supabase.from('folders').select('id,parent_id,name,slug,is_visible'),
  supabase
    .from('documents')
    .select('id,folder_id,title,slug,status,content,original_filename,sort_order')
    .eq('status', 'published'),
])
if (folderError) throw folderError
if (documentError) throw documentError

const expectedTop = {
  Agent开发: [
    'Agent基础',
    'Agent Loop',
    'Context Engineering',
    'Tools与Runtime',
    'Knowledge与Memory',
    'Agent Harness',
    'Skills与Protocols',
    'Evaluation Observability Safety',
    'Agent Evolution',
    'Multi-Agent',
    'Model Post-training',
    'Production Agent',
    'Project Ladder',
    '完整Agent链路与架构对照',
    '现代Agent架构与源码研究',
  ],
  Java开发: [
    'Java语言与核心API',
    'JVM与并发',
    '工程基础与Internet-Linux',
    '关系型数据库',
    'Spring Framework',
    'Spring Boot与Web',
    '数据访问与事务',
    '测试与质量工程',
    '安全认证与授权',
    '应用架构与模块化单体',
    '缓存与搜索',
    '消息与事件驱动',
    '分布式与微服务',
    '性能工程',
    '云原生DevOps与可观测性',
    '可选专项',
    '项目阶梯',
    '开源项目架构研究',
  ],
}

const reports = []
for (const area of Object.keys(expectedTop)) {
  const root = folders.find(
    (folder) => folder.parent_id === null && folder.name === area,
  )
  if (!root) throw new Error(`${area} root not found through public RLS`)
  const ids = treeIds(folders, root.id)
  const dbDocuments = documents.filter((document) => ids.has(document.folder_id))
  const dbTitles = dbDocuments
    .map((document) => document.title)
    .sort((a, b) => a.localeCompare(b, 'zh-CN'))
  const expectedTitles = await localTitles(area)
  const missing = expectedTitles.filter((title) => !dbTitles.includes(title))
  const extra = dbTitles.filter((title) => !expectedTitles.includes(title))
  const topNames = folders
    .filter((folder) => folder.parent_id === root.id)
    .map((folder) => folder.name)
  const missingTop = expectedTop[area].filter((name) => !topNames.includes(name))
  const metadataDocuments = dbDocuments.filter((document) =>
    document.content.includes('**Freshness metadata**'),
  ).length
  const recommendationFolders = folders
    .filter(
      (folder) => ids.has(folder.id) && folder.is_visible && folder.name === '推荐阅读',
    )
    .map((folder) => folder.id)
  const recommendationDocuments = dbDocuments.filter((document) =>
    document.original_filename?.startsWith('000-'),
  )
  const misorderedRecommendations = recommendationDocuments
    .filter((document) => document.sort_order !== -10)
    .map((document) => ({ title: document.title, sortOrder: document.sort_order }))
  const report = {
    area,
    publicFolders: ids.size,
    localDocuments: expectedTitles.length,
    publicDocuments: dbDocuments.length,
    metadataDocuments,
    recommendationDocuments: recommendationDocuments.length,
    recommendationFolders,
    misorderedRecommendations,
    missingTop,
    missing,
    extra,
  }
  reports.push(report)
  if (
    missingTop.length ||
    missing.length ||
    extra.length ||
    recommendationFolders.length ||
    misorderedRecommendations.length ||
    dbDocuments.length !== expectedTitles.length
  ) {
    throw new Error(`Unexpected public import result: ${JSON.stringify(report)}`)
  }
}

console.log(JSON.stringify({ reports, status: 'ok' }, null, 2))
