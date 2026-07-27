import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

async function loadEnv(filename) {
  const source = await fs.readFile(filename, 'utf8')
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^([^#=\s]+)=(.*)$/)
    if (!match || process.env[match[1]]) continue
    process.env[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, '$2')
  }
}

await loadEnv(path.join(projectRoot, '.env.local'))
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
  supabase.from('folders').select('id,parent_id,name,is_visible'),
  supabase
    .from('documents')
    .select('id,folder_id,title,status,content')
    .eq('status', 'published'),
])
if (folderError) throw folderError
if (documentError) throw documentError

const root = folders.find(
  (folder) => folder.parent_id === null && folder.name === 'Java开发',
)
if (!root) throw new Error('Java开发 root folder was not found through public RLS')

const folderIds = new Set([root.id])
let changed = true
while (changed) {
  changed = false
  for (const folder of folders) {
    if (
      folder.parent_id &&
      folderIds.has(folder.parent_id) &&
      !folderIds.has(folder.id)
    ) {
      folderIds.add(folder.id)
      changed = true
    }
  }
}

const javaDocuments = documents.filter((document) => folderIds.has(document.folder_id))
const foundation = folders.find(
  (folder) => folder.parent_id === root.id && folder.name === 'Java基础',
)
const foundationDocuments = foundation
  ? documents.filter((document) => document.folder_id === foundation.id)
  : []
const contentCharacters = javaDocuments.reduce(
  (total, document) => total + document.content.length,
  0,
)

const report = {
  publicFolders: folderIds.size,
  publicDocuments: javaDocuments.length,
  foundationDocuments: foundationDocuments.length,
  contentCharacters,
}
if (
  report.publicFolders !== 27 ||
  report.publicDocuments !== 74 ||
  report.foundationDocuments !== 14 ||
  report.contentCharacters < 130_000
) {
  throw new Error(`Unexpected public import result: ${JSON.stringify(report)}`)
}
console.log(JSON.stringify({ ...report, status: 'ok' }, null, 2))
