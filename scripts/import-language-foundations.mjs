import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { syncContentTree } from './sync-content-tree.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const result = await syncContentTree({
  contentRoot: path.join(root, 'content', '语言基础'),
  rootName: '语言基础',
  rootDescription:
    '编程语言基础与跨语言模型：从 TypeScript 到 JavaScript、Java、Python、C++',
  baseTags: ['语言基础', 'TypeScript'],
})

console.log(JSON.stringify(result, null, 2))
