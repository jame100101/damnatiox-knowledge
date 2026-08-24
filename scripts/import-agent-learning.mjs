import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { syncContentTree } from './sync-content-tree.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const result = await syncContentTree({
  contentRoot: path.join(root, 'content', 'Agent开发'),
  rootName: 'Agent开发',
  rootDescription: '现代 Agent Engineering 学习路线',
  baseTags: ['Agent', 'Agent Engineering'],
  folderAliases: {
    'Tools与Runtime': ['Tools call'],
    'Knowledge与Memory': ['RAG'],
    'Skills与Protocols': ['Skills协议与能力打包'],
    'Evaluation Observability Safety': ['评测可观测性与安全'],
    'Multi-Agent': ['多Agent协调'],
    'Production Agent': ['交付生产级Agent'],
    'Project Ladder': ['项目阶梯'],
    '完整Agent链路与架构对照': ['完整Agent链路与框架对照'],
    '现代Agent架构与源码研究': ['现代主流Coding Agent详细研究'],
  },
  documentAliases: {
    'Agent 开发学习路线：从 Minimum Agent 到 Production Agent': ['Agent 开发学习路线总览'],
    'P0–P7 Agent 工程项目阶梯': ['十一级 Agent 项目实践路线'],
    '现代 Agent 架构与实现细节对比': ['五个项目的 Agent 架构与实现细节对比'],
  },
})

console.log(JSON.stringify(result, null, 2))
