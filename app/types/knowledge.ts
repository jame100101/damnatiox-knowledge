export type Folder = {
  id: string
  parent_id: string | null
  name: string
  slug: string
  description: string | null
  icon: string | null
  sort_order: number
  is_visible: boolean
  created_at: string
  updated_at: string
}

export type DocumentStatus = 'draft' | 'published'

export type KnowledgeDocument = {
  id: string
  folder_id: string | null
  owner_id?: string | null
  slug: string
  title: string
  description: string | null
  content: string
  tags: string[]
  cover_url?: string | null
  source_storage_path?: string | null
  original_filename?: string | null
  file_size_bytes?: number | null
  content_hash?: string | null
  status: DocumentStatus
  sort_order: number
  reading_time: number | null
  excerpt: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export type FolderNode = Folder & {
  children: FolderNode[]
  documents: KnowledgeDocument[]
  documentCount: number
}

export type Breadcrumb = {
  label: string
  path: string
  type: 'root' | 'folder' | 'document'
}

export type DocumentDraft = {
  id?: string
  folder_id: string | null
  title: string
  slug: string
  description: string
  tags: string[]
  content: string
  status: DocumentStatus
  sort_order: number
  original_filename?: string
  file_size_bytes?: number
}
