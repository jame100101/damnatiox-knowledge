import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import { slugify } from '../app/utils/slug.ts'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const contentRoot = path.join(projectRoot, 'content', 'Agent开发')

async function loadEnv(filename) {
  const source = await fs.readFile(filename, 'utf8')
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^([^#=\s]+)=(.*)$/)
    if (!match || process.env[match[1]]) continue
    process.env[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, '$2')
  }
}

function displayName(filename) {
  return filename.replace(/^\d{2,3}-/, '').replace(/\.md$/i, '')
}

function orderOf(filename, fallback = 1000) {
  const match = filename.match(/^(\d{2,3})-/)
  if (match) return Number(match[1]) * 10
  const researchMatch = filename.match(/^AGENT_SOURCE_(\d{2})_/)
  return researchMatch ? Number(researchMatch[1]) * 10 : fallback
}

function excerpt(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`|~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 220)
}

function titleOf(markdown, filename) {
  return markdown.match(/^#\s+(.+)$/m)?.[1].trim() || displayName(filename)
}

async function main() {
  await loadEnv(path.join(projectRoot, '.env.local'))
  const url = process.env.NUXT_PUBLIC_SUPABASE_URL
  const key = process.env.NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  const email = process.env.AGENT_SEED_ADMIN_EMAIL || '1781504914@qq.com'
  const password = process.env.AGENT_SEED_ADMIN_PASSWORD
  if (!url || !key || !password) {
    throw new Error(
      'Missing NUXT_PUBLIC_SUPABASE_URL, NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or AGENT_SEED_ADMIN_PASSWORD',
    )
  }

  const supabase = createClient(url, key)
  const { error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (authError) throw authError

  const [
    { data: initialFolders, error: folderLoadError },
    { data: initialDocuments, error: documentLoadError },
  ] = await Promise.all([
    supabase.from('folders').select('*'),
    supabase.from('documents').select('*'),
  ])
  if (folderLoadError) throw folderLoadError
  if (documentLoadError) throw documentLoadError

  const folders = initialFolders || []
  const documents = initialDocuments || []
  const report = {
    foldersCreated: 0,
    foldersUpdated: 0,
    documentsCreated: 0,
    documentsUpdated: 0,
  }

  async function ensureFolder(parentId, directoryName) {
    const name = displayName(directoryName)
    const slug = slugify(name)
    let folder = folders.find(
      (item) =>
        item.parent_id === parentId &&
        (item.slug === slug ||
          item.name.replace(/\s+/g, '') === name.replace(/\s+/g, '')),
    )
    const payload = {
      parent_id: parentId,
      name,
      slug,
      description: `Agent Learning Hub 学习路线：${name}`,
      icon: 'Folder',
      sort_order: orderOf(directoryName),
      is_visible: true,
    }
    if (folder) {
      const { data, error } = await supabase
        .from('folders')
        .update(payload)
        .eq('id', folder.id)
        .select()
        .single()
      if (error) throw error
      Object.assign(folder, data)
      report.foldersUpdated += 1
      return folder
    }
    const { data, error } = await supabase
      .from('folders')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    folders.push(data)
    report.foldersCreated += 1
    return data
  }

  async function ensureDocument(folderId, filename, markdown) {
    const title = titleOf(markdown, filename)
    const slug = slugify(title)
    let document = documents.find(
      (item) =>
        item.folder_id === folderId && (item.slug === slug || item.title === title),
    )
    const payload = {
      folder_id: folderId,
      title,
      slug,
      description: excerpt(markdown),
      tags: [
        'Agent',
        'Agent Learning Hub',
        displayName(path.basename(path.dirname(filename))),
      ],
      content: markdown,
      status: 'published',
      sort_order: orderOf(path.basename(filename)),
      reading_time: Math.max(1, Math.ceil(markdown.replace(/\s+/g, '').length / 500)),
      excerpt: excerpt(markdown),
      original_filename: path.basename(filename),
      file_size_bytes: Buffer.byteLength(markdown, 'utf8'),
      published_at: new Date().toISOString(),
    }
    if (document) {
      const { data, error } = await supabase
        .from('documents')
        .update(payload)
        .eq('id', document.id)
        .select()
        .single()
      if (error) throw error
      Object.assign(document, data)
      report.documentsUpdated += 1
      return
    }
    const { data, error } = await supabase
      .from('documents')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    documents.push(data)
    report.documentsCreated += 1
  }

  async function importDirectory(directory, parentId) {
    const entries = (await fs.readdir(directory, { withFileTypes: true })).sort(
      (a, b) => a.name.localeCompare(b.name, 'zh-CN', { numeric: true }),
    )
    for (const entry of entries.filter((item) => item.isDirectory())) {
      const folder = await ensureFolder(parentId, entry.name)
      await importDirectory(path.join(directory, entry.name), folder.id)
    }
    for (const entry of entries.filter(
      (item) => item.isFile() && /\.md$/i.test(item.name),
    )) {
      const fullPath = path.join(directory, entry.name)
      await ensureDocument(parentId, fullPath, await fs.readFile(fullPath, 'utf8'))
    }
  }

  const rootFolder = await ensureFolder(null, path.basename(contentRoot))
  await importDirectory(contentRoot, rootFolder.id)
  await supabase.auth.signOut()

  console.log(JSON.stringify({ rootFolder: rootFolder.name, ...report }, null, 2))
}

await main()
