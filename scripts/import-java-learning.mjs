import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { syncContentTree } from './sync-content-tree.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const result = await syncContentTree({
  contentRoot: path.join(root, 'content', 'Java开发'),
  rootName: 'Java开发',
  rootDescription: '现代 Java Backend Engineering 学习路线',
  baseTags: ['Java', 'Java 后端'],
  folderAliases: {
    'Java语言与核心API': ['Java基础'],
    '工程基础与Internet-Linux': ['工程工具与Linux'],
    '关系型数据库': ['数据库缓存与搜索'],
    '数据访问与事务': ['数据访问与ORM'],
    '消息与事件驱动': ['高性能与消息队列'],
    '可选专项': ['前端与全栈交付'],
  },
  documentAliases: {
    'Java 后端工程学习路线（2026）': ['Java 后端学习路线总览（2026）'],
    'PostgreSQL 基础：类型、索引、MVCC、执行计划与选型': ['PostgreSQL 与 MongoDB：选修数据库的模型与选型'],
    '消息与事件驱动：共同模型先于产品配置': ['高性能与消息队列：从零开始的阶段导学'],
  },
})

console.log(JSON.stringify(result, null, 2))
