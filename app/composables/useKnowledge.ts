import type {
  DocumentDraft,
  Folder,
  KnowledgeDocument,
} from '~/types/knowledge'
import { demoDocuments, demoFolders } from '~/data/demo'
import { excerpt, readingTime } from '~/utils/markdown'

export function useKnowledge() {
  const nuxtApp = useNuxtApp()
  const folders = useState<Folder[]>('knowledge-folders', () => [])
  const documents = useState<KnowledgeDocument[]>('knowledge-documents', () => [])
  const loaded = useState('knowledge-loaded', () => false)
  const loading = useState('knowledge-loading', () => false)
  const error = useState<string | null>('knowledge-error', () => null)
  const updateAvailable = useState('knowledge-update', () => false)
  const isDemo = computed(() => !nuxtApp.$supabaseConfigured)

  async function load(force = false, includeDrafts = false) {
    if ((loaded.value && !force) || loading.value) return
    loading.value = true
    error.value = null
    try {
      if (isDemo.value) {
        folders.value = structuredClone(demoFolders)
        documents.value = structuredClone(demoDocuments)
      } else {
        const [folderResult, documentResult] = await Promise.all([
          nuxtApp.$supabase
            .from('folders')
            .select('*')
            .order('sort_order')
            .order('name'),
          nuxtApp.$supabase
            .from('documents')
            .select('*')
            .in('status', includeDrafts ? ['draft', 'published'] : ['published'])
            .order('sort_order')
            .order('title'),
        ])
        if (folderResult.error) throw folderResult.error
        if (documentResult.error) throw documentResult.error
        folders.value = (folderResult.data || []) as Folder[]
        documents.value = (documentResult.data || []) as KnowledgeDocument[]
      }
      loaded.value = true
      updateAvailable.value = false
    } catch (cause) {
      error.value =
        cause instanceof Error ? cause.message : '读取知识库数据时发生错误'
    } finally {
      loading.value = false
    }
  }

  async function saveFolder(
    input: Partial<Folder> & Pick<Folder, 'name' | 'slug'>,
  ) {
    if (isDemo.value) {
      const now = new Date().toISOString()
      const folder: Folder = {
        id: input.id || crypto.randomUUID(),
        parent_id: input.parent_id || null,
        name: input.name,
        slug: input.slug,
        description: input.description || null,
        icon: input.icon || 'Folder',
        sort_order: input.sort_order || 0,
        is_visible: input.is_visible ?? true,
        created_at: input.created_at || now,
        updated_at: now,
      }
      const index = folders.value.findIndex((item) => item.id === folder.id)
      if (index >= 0) folders.value[index] = folder
      else folders.value.push(folder)
      return folder
    }
    const payload = {
      parent_id: input.parent_id || null,
      name: input.name,
      slug: input.slug,
      description: input.description || null,
      icon: input.icon || 'Folder',
      sort_order: input.sort_order || 0,
      is_visible: input.is_visible ?? true,
    }
    const query = input.id
      ? nuxtApp.$supabase.from('folders').update(payload).eq('id', input.id)
      : nuxtApp.$supabase.from('folders').insert(payload)
    const { data, error: saveError } = await query.select().single()
    if (saveError) throw saveError
    await load(true, true)
    return data as Folder
  }

  async function deleteFolder(id: string) {
    if (isDemo.value) {
      const hasContent =
        folders.value.some((item) => item.parent_id === id) ||
        documents.value.some((item) => item.folder_id === id)
      if (hasContent) throw new Error('非空文件夹需要先移动其中的内容')
      folders.value = folders.value.filter((item) => item.id !== id)
      return
    }
    const { error: deleteError } = await nuxtApp.$supabase
      .from('folders')
      .delete()
      .eq('id', id)
    if (deleteError) throw deleteError
    await load(true, true)
  }

  async function saveDocument(draft: DocumentDraft, file?: File) {
    const payload = {
      folder_id: draft.folder_id,
      title: draft.title,
      slug: draft.slug,
      description: draft.description || null,
      tags: draft.tags,
      content: draft.content,
      status: draft.status,
      sort_order: draft.sort_order,
      reading_time: readingTime(draft.content),
      excerpt: excerpt(draft.content),
      original_filename: draft.original_filename || null,
      file_size_bytes: draft.file_size_bytes || null,
      published_at:
        draft.status === 'published' ? new Date().toISOString() : null,
    }
    if (isDemo.value) {
      const now = new Date().toISOString()
      const document: KnowledgeDocument = {
        ...payload,
        id: draft.id || crypto.randomUUID(),
        owner_id: null,
        content_hash: null,
        source_storage_path: null,
        cover_url: null,
        created_at: now,
        updated_at: now,
      }
      const index = documents.value.findIndex((item) => item.id === document.id)
      if (index >= 0) documents.value[index] = document
      else documents.value.push(document)
      return document
    }
    let documentId = draft.id
    const query = documentId
      ? nuxtApp.$supabase
          .from('documents')
          .update(payload)
          .eq('id', documentId)
      : nuxtApp.$supabase.from('documents').insert(payload)
    const { data, error: saveError } = await query.select().single()
    if (saveError) throw saveError
    documentId = data.id
    if (file) {
      const filename = draft.original_filename || `${draft.slug}.md`
      const storagePath = `documents/${documentId}/${crypto.randomUUID()}-${filename}`
      const { error: uploadError } = await nuxtApp.$supabase.storage
        .from('knowledge-source')
        .upload(storagePath, file, {
          contentType: 'text/markdown; charset=utf-8',
          upsert: false,
        })
      if (uploadError) throw uploadError
      await nuxtApp.$supabase
        .from('documents')
        .update({ source_storage_path: storagePath })
        .eq('id', documentId)
      data.source_storage_path = storagePath
    }
    await load(true, true)
    return data as KnowledgeDocument
  }

  async function deleteDocument(id: string) {
    if (isDemo.value) {
      documents.value = documents.value.filter((item) => item.id !== id)
      return
    }
    const document = documents.value.find((item) => item.id === id)
    if (document?.source_storage_path) {
      await nuxtApp.$supabase.storage
        .from('knowledge-source')
        .remove([document.source_storage_path])
    }
    const { error: deleteError } = await nuxtApp.$supabase
      .from('documents')
      .delete()
      .eq('id', id)
    if (deleteError) throw deleteError
    await load(true, true)
  }

  return {
    folders,
    documents,
    loaded,
    loading,
    error,
    updateAvailable,
    isDemo,
    load,
    saveFolder,
    deleteFolder,
    saveDocument,
    deleteDocument,
  }
}
