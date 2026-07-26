import type {
  Breadcrumb,
  Folder,
  FolderNode,
  KnowledgeDocument,
} from '~/types/knowledge'

export function buildFolderTree(
  folders: Folder[],
  documents: KnowledgeDocument[] = [],
): FolderNode[] {
  const nodes = new Map<string, FolderNode>()
  for (const folder of folders) {
    nodes.set(folder.id, {
      ...folder,
      children: [],
      documents: documents
        .filter((doc) => doc.folder_id === folder.id)
        .sort(sortDocuments),
      documentCount: 0,
    })
  }
  const roots: FolderNode[] = []
  for (const node of nodes.values()) {
    const parent = node.parent_id ? nodes.get(node.parent_id) : undefined
    if (parent) parent.children.push(node)
    else roots.push(node)
  }
  const sortAndCount = (items: FolderNode[]): number => {
    items.sort(sortFolders)
    let total = 0
    for (const node of items) {
      const childCount = sortAndCount(node.children)
      node.documentCount = node.documents.length + childCount
      total += node.documentCount
    }
    return total
  }
  sortAndCount(roots)
  return roots
}

export function sortFolders(a: Folder, b: Folder): number {
  return a.sort_order - b.sort_order || a.name.localeCompare(b.name, 'zh-CN')
}

export function sortDocuments(
  a: KnowledgeDocument,
  b: KnowledgeDocument,
): number {
  return a.sort_order - b.sort_order || a.title.localeCompare(b.title, 'zh-CN')
}

export function findFolderPath(
  folderId: string | null,
  folders: Folder[],
): Folder[] {
  if (!folderId) return []
  const byId = new Map(folders.map((folder) => [folder.id, folder]))
  const path: Folder[] = []
  const visited = new Set<string>()
  let current = byId.get(folderId)
  while (current && !visited.has(current.id)) {
    visited.add(current.id)
    path.unshift(current)
    current = current.parent_id ? byId.get(current.parent_id) : undefined
  }
  return path
}

export function folderPublicPath(folderId: string, folders: Folder[]): string {
  return `/knowledge/${findFolderPath(folderId, folders)
    .map((folder) => folder.slug)
    .join('/')}`
}

export function documentPublicPath(
  document: KnowledgeDocument,
  folders: Folder[],
): string {
  const folderPath = document.folder_id
    ? findFolderPath(document.folder_id, folders).map((folder) => folder.slug)
    : []
  return `/knowledge/${[...folderPath, document.slug].join('/')}`
}

export function resolveKnowledgePath(
  segments: string[],
  folders: Folder[],
  documents: KnowledgeDocument[],
): { folder?: Folder; document?: KnowledgeDocument } {
  let parentId: string | null = null
  let folder: Folder | undefined
  for (let index = 0; index < segments.length; index++) {
    const segment = segments[index]
    const nextFolder = folders.find(
      (item) => item.parent_id === parentId && item.slug === segment,
    )
    if (nextFolder) {
      folder = nextFolder
      parentId = nextFolder.id
      continue
    }
    if (index === segments.length - 1) {
      const document = documents.find(
        (item) => item.folder_id === parentId && item.slug === segment,
      )
      if (document) return { folder, document }
    }
    return {}
  }
  return { folder }
}

export function wouldCreateCycle(
  folderId: string,
  newParentId: string | null,
  folders: Folder[],
): boolean {
  if (!newParentId) return false
  if (folderId === newParentId) return true
  const byId = new Map(folders.map((folder) => [folder.id, folder]))
  const visited = new Set<string>()
  let current = byId.get(newParentId)
  while (current && !visited.has(current.id)) {
    if (current.id === folderId) return true
    visited.add(current.id)
    current = current.parent_id ? byId.get(current.parent_id) : undefined
  }
  return false
}

export function buildBreadcrumbs(
  document: KnowledgeDocument | undefined,
  folder: Folder | undefined,
  folders: Folder[],
): Breadcrumb[] {
  const crumbs: Breadcrumb[] = [
    { label: '知识库', path: '/', type: 'root' },
  ]
  const path = findFolderPath(document?.folder_id || folder?.id || null, folders)
  path.forEach((item, index) => {
    crumbs.push({
      label: item.name,
      path: `/knowledge/${path
        .slice(0, index + 1)
        .map((part) => part.slug)
        .join('/')}`,
      type: 'folder',
    })
  })
  if (document) {
    crumbs.push({
      label: document.title,
      path: documentPublicPath(document, folders),
      type: 'document',
    })
  }
  return crumbs
}
