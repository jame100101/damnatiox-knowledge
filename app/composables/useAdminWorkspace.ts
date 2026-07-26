export function useAdminWorkspace() {
  const selectedFolderId = useState<string | null>('admin-workspace-folder', () => null)
  const expandedFolderIds = useState<string[]>('admin-workspace-expanded', () => [])

  function selectFolder(id: string | null) {
    selectedFolderId.value = id
    if (id && !expandedFolderIds.value.includes(id)) {
      expandedFolderIds.value = [...expandedFolderIds.value, id]
    }
  }

  function toggleFolder(id: string) {
    expandedFolderIds.value = expandedFolderIds.value.includes(id)
      ? expandedFolderIds.value.filter((item) => item !== id)
      : [...expandedFolderIds.value, id]
  }

  function expandFolder(id: string) {
    if (!expandedFolderIds.value.includes(id)) {
      expandedFolderIds.value = [...expandedFolderIds.value, id]
    }
  }

  return {
    selectedFolderId,
    expandedFolderIds,
    selectFolder,
    toggleFolder,
    expandFolder,
  }
}
