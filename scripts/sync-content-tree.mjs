import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import { slugify } from '../app/utils/slug.ts'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

async function loadEnv(filename) {
  try {
    const source = await fs.readFile(filename, 'utf8')
    for (const line of source.split(/\r?\n/)) {
      const match = line.match(/^([^#=\s]+)=(.*)$/)
      if (!match || process.env[match[1]]) continue
      process.env[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, '$2')
    }
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }
}

function displayName(filename) {
  return filename.replace(/^\d{2,3}-/, '').replace(/\.md$/i, '')
}

function orderOf(filename, fallback = 1000) {
  const numbered = filename.match(/^(\d{2,3})-/)
  // `000-` is reserved for a flattened recommendation document. Keep it
  // ahead of ordinary `00-`/`01-` material without a wrapper folder.
  if (numbered?.[1] === '000') return -10
  if (numbered) return Number(numbered[1]) * 10
  const research = filename.match(/(?:AGENT_SOURCE_)?(\d{2})[_-]/)
  return research ? Number(research[1]) * 10 : fallback
}

function normalize(value) {
  return String(value || '')
    .replace(/\s+/g, '')
    .toLocaleLowerCase('zh-CN')
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

async function scanTree(contentRoot) {
  const folders = []
  const documents = []

  async function visit(directory, parentKey) {
    const entries = (await fs.readdir(directory, { withFileTypes: true })).sort(
      (a, b) => a.name.localeCompare(b.name, 'zh-CN', { numeric: true }),
    )
    for (const entry of entries.filter((item) => item.isDirectory())) {
      const fullPath = path.join(directory, entry.name)
      const key = path.relative(contentRoot, fullPath)
      folders.push({
        key,
        parentKey,
        name: displayName(entry.name),
        slug: slugify(displayName(entry.name)),
        sortOrder: orderOf(entry.name),
      })
      await visit(fullPath, key)
    }
    for (const entry of entries.filter(
      (item) => item.isFile() && /\.md$/i.test(item.name),
    )) {
      const fullPath = path.join(directory, entry.name)
      const markdown = await fs.readFile(fullPath, 'utf8')
      documents.push({
        relative: path.relative(contentRoot, fullPath),
        parentKey,
        filename: entry.name,
        markdown,
        title: titleOf(markdown, entry.name),
        slug: slugify(titleOf(markdown, entry.name)),
        sortOrder: orderOf(entry.name),
      })
    }
  }

  await visit(contentRoot, null)
  return { folders, documents }
}

function descendantFolderIds(allFolders, rootId) {
  const ids = new Set([rootId])
  let changed = true
  while (changed) {
    changed = false
    for (const folder of allFolders) {
      if (folder.parent_id && ids.has(folder.parent_id) && !ids.has(folder.id)) {
        ids.add(folder.id)
        changed = true
      }
    }
  }
  return ids
}

export async function syncContentTree({
  contentRoot,
  rootName,
  rootDescription,
  baseTags,
  folderAliases = {},
  documentAliases = {},
}) {
  await loadEnv(path.join(projectRoot, '.env.local'))
  const url = process.env.NUXT_PUBLIC_SUPABASE_URL
  const publishableKey = process.env.NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const email = process.env.AGENT_SEED_ADMIN_EMAIL || '1781504914@qq.com'
  const password = process.env.AGENT_SEED_ADMIN_PASSWORD
  if (!url || (!serviceRoleKey && (!publishableKey || !password))) {
    throw new Error('Missing Supabase URL or import credentials')
  }

  const desired = await scanTree(contentRoot)
  const supabase = createClient(url, serviceRoleKey || publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  if (!serviceRoleKey) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const [
    { data: folderRows, error: folderError },
    { data: documentRows, error: docError },
  ] = await Promise.all([
    supabase.from('folders').select('*'),
    supabase.from('documents').select('*'),
  ])
  if (folderError) throw folderError
  if (docError) throw docError

  const folders = folderRows || []
  const documents = documentRows || []
  let root = folders.find(
    (item) =>
      item.parent_id === null &&
      (item.slug === slugify(rootName) || normalize(item.name) === normalize(rootName)),
  )
  const report = {
    foldersCreated: 0,
    foldersUpdated: 0,
    foldersMoved: 0,
    documentsCreated: 0,
    documentsUpdated: 0,
    documentsMoved: 0,
    documentsArchived: 0,
    foldersArchived: 0,
  }

  const rootPayload = {
    parent_id: null,
    name: rootName,
    slug: slugify(rootName),
    description: rootDescription,
    icon: 'Folder',
    sort_order: 1000,
    is_visible: true,
  }
  if (root) {
    const { data, error } = await supabase
      .from('folders')
      .update(rootPayload)
      .eq('id', root.id)
      .select()
      .single()
    if (error) throw error
    root = data
    report.foldersUpdated += 1
  } else {
    const { data, error } = await supabase
      .from('folders')
      .insert(rootPayload)
      .select()
      .single()
    if (error) throw error
    root = data
    folders.push(data)
    report.foldersCreated += 1
  }

  const originalTreeIds = descendantFolderIds(folders, root.id)
  const originalFolders = folders.filter((folder) => originalTreeIds.has(folder.id))
  const originalDocuments = documents.filter((doc) =>
    originalTreeIds.has(doc.folder_id),
  )
  const claimedFolderIds = new Set([root.id])
  const folderIdByKey = new Map([[null, root.id]])

  for (const item of desired.folders) {
    const parentId = folderIdByKey.get(item.parentKey)
    const aliases = folderAliases[item.name] || []
    const names = new Set([normalize(item.name), ...aliases.map(normalize)])
    let folder = originalFolders.find(
      (row) =>
        !claimedFolderIds.has(row.id) &&
        row.parent_id === parentId &&
        (row.slug === item.slug || names.has(normalize(row.name))),
    )
    if (!folder) {
      const candidates = originalFolders.filter(
        (row) =>
          !claimedFolderIds.has(row.id) &&
          (row.slug === item.slug || names.has(normalize(row.name))),
      )
      if (candidates.length === 1) folder = candidates[0]
    }

    const payload = {
      parent_id: parentId,
      name: item.name,
      slug: item.slug,
      description: `${rootDescription}：${item.name}`,
      icon: 'Folder',
      sort_order: item.sortOrder,
      is_visible: true,
    }
    if (folder) {
      if (folder.parent_id !== parentId) report.foldersMoved += 1
      const { data, error } = await supabase
        .from('folders')
        .update(payload)
        .eq('id', folder.id)
        .select()
        .single()
      if (error) throw error
      folder = data
      report.foldersUpdated += 1
    } else {
      const { data, error } = await supabase
        .from('folders')
        .insert(payload)
        .select()
        .single()
      if (error) throw error
      folder = data
      report.foldersCreated += 1
    }
    claimedFolderIds.add(folder.id)
    folderIdByKey.set(item.key, folder.id)
  }

  const claimedDocumentIds = new Set()
  for (const item of desired.documents) {
    const folderId = folderIdByKey.get(item.parentKey)
    const aliases = documentAliases[item.title] || []
    const titles = new Set([normalize(item.title), ...aliases.map(normalize)])
    let document = originalDocuments.find(
      (row) =>
        !claimedDocumentIds.has(row.id) &&
        row.folder_id === folderId &&
        (row.slug === item.slug || titles.has(normalize(row.title))),
    )
    if (!document) {
      const titleCandidates = originalDocuments.filter(
        (row) => !claimedDocumentIds.has(row.id) && titles.has(normalize(row.title)),
      )
      if (titleCandidates.length === 1) document = titleCandidates[0]
    }
    if (!document) {
      const filenameCandidates = originalDocuments.filter(
        (row) =>
          !claimedDocumentIds.has(row.id) && row.original_filename === item.filename,
      )
      if (filenameCandidates.length === 1) document = filenameCandidates[0]
    }

    const section =
      item.relative
        .split(path.sep)
        .map(displayName)
        .find((name) => name !== item.title) || rootName
    const payload = {
      folder_id: folderId,
      title: item.title,
      slug: item.slug,
      description: excerpt(item.markdown),
      tags: [...new Set([...baseTags, section])],
      content: item.markdown,
      status: 'published',
      sort_order: item.sortOrder,
      reading_time: Math.max(
        1,
        Math.ceil(item.markdown.replace(/\s+/g, '').length / 500),
      ),
      excerpt: excerpt(item.markdown),
      original_filename: item.filename,
      file_size_bytes: Buffer.byteLength(item.markdown, 'utf8'),
      published_at: document?.published_at || new Date().toISOString(),
    }
    if (document) {
      if (document.folder_id !== folderId) report.documentsMoved += 1
      const { data, error } = await supabase
        .from('documents')
        .update(payload)
        .eq('id', document.id)
        .select()
        .single()
      if (error) throw error
      claimedDocumentIds.add(data.id)
      report.documentsUpdated += 1
    } else {
      const { data, error } = await supabase
        .from('documents')
        .insert(payload)
        .select()
        .single()
      if (error) throw error
      claimedDocumentIds.add(data.id)
      report.documentsCreated += 1
    }
  }

  if (process.env.CONTENT_SYNC_ARCHIVE === 'true') {
    const staleDocuments = originalDocuments.filter(
      (row) => !claimedDocumentIds.has(row.id),
    )
    for (const row of staleDocuments) {
      const { error } = await supabase
        .from('documents')
        .update({ status: 'draft' })
        .eq('id', row.id)
      if (error) throw error
      report.documentsArchived += 1
    }
    const staleFolders = originalFolders.filter(
      (row) => row.id !== root.id && !claimedFolderIds.has(row.id),
    )
    for (const row of staleFolders) {
      const { error } = await supabase
        .from('folders')
        .update({ is_visible: false })
        .eq('id', row.id)
      if (error) throw error
      report.foldersArchived += 1
    }
  }

  if (!serviceRoleKey) await supabase.auth.signOut()
  return {
    rootFolder: root.name,
    desiredFolders: desired.folders.length + 1,
    desiredDocuments: desired.documents.length,
    archive: process.env.CONTENT_SYNC_ARCHIVE === 'true',
    ...report,
  }
}
