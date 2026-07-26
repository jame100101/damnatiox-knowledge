import type { Folder, KnowledgeDocument } from '~/types/knowledge'

const now = '2026-07-25T08:00:00.000Z'
const day = '2026-07-24T08:00:00.000Z'

export const demoFolders: Folder[] = [
  { id: 'f-java', parent_id: null, name: 'Java 后端', slug: 'java-backend', description: 'Java 语言、JVM 与 Spring 生态的工程笔记。', icon: 'Braces', sort_order: 10, is_visible: true, created_at: now, updated_at: now },
  { id: 'f-java-basics', parent_id: 'f-java', name: 'Java 基础', slug: 'java-basics', description: '语言基础与核心 API。', icon: 'BookOpen', sort_order: 10, is_visible: true, created_at: now, updated_at: now },
  { id: 'f-spring', parent_id: 'f-java', name: 'Spring', slug: 'spring', description: 'Spring Framework 技术体系。', icon: 'Leaf', sort_order: 20, is_visible: true, created_at: now, updated_at: now },
  { id: 'f-spring-boot', parent_id: 'f-spring', name: 'Spring Boot', slug: 'spring-boot', description: '约定优于配置的 Java 应用开发。', icon: 'Blocks', sort_order: 10, is_visible: true, created_at: now, updated_at: now },
  { id: 'f-spring-security', parent_id: 'f-spring', name: 'Spring Security', slug: 'spring-security', description: '认证、授权与应用安全。', icon: 'Shield', sort_order: 20, is_visible: true, created_at: now, updated_at: day },
  { id: 'f-jvm', parent_id: 'f-java', name: 'JVM', slug: 'jvm', description: '虚拟机、内存与性能分析。', icon: 'Cpu', sort_order: 30, is_visible: true, created_at: now, updated_at: day },
  { id: 'f-agent', parent_id: null, name: 'Agent 开发', slug: 'agent-development', description: 'Agent 架构、工具调用、记忆与多智能体协作。', icon: 'Bot', sort_order: 20, is_visible: true, created_at: now, updated_at: now },
  { id: 'f-agent-basics', parent_id: 'f-agent', name: 'Agent 基础', slug: 'agent-basics', description: null, icon: 'CircleDot', sort_order: 10, is_visible: true, created_at: now, updated_at: day },
  { id: 'f-tools', parent_id: 'f-agent', name: 'Tool Calling', slug: 'tool-calling', description: '让模型可靠地使用外部能力。', icon: 'Wrench', sort_order: 20, is_visible: true, created_at: now, updated_at: now },
  { id: 'f-memory', parent_id: 'f-agent', name: 'Memory', slug: 'memory', description: '短期与长期记忆设计。', icon: 'Brain', sort_order: 30, is_visible: true, created_at: now, updated_at: day },
  { id: 'f-multi-agent', parent_id: 'f-agent', name: 'Multi-Agent', slug: 'multi-agent', description: '多智能体分工与协调。', icon: 'Network', sort_order: 40, is_visible: true, created_at: now, updated_at: day },
  { id: 'f-rag', parent_id: null, name: 'RAG', slug: 'rag', description: '从数据接入到检索生成的完整链路。', icon: 'Database', sort_order: 30, is_visible: true, created_at: now, updated_at: now },
  { id: 'f-loader', parent_id: 'f-rag', name: 'Document Loader', slug: 'document-loader', description: null, icon: 'FileInput', sort_order: 10, is_visible: true, created_at: now, updated_at: day },
  { id: 'f-chunking', parent_id: 'f-rag', name: 'Chunking', slug: 'chunking', description: '文档分块策略与质量评估。', icon: 'SplitSquareVertical', sort_order: 20, is_visible: true, created_at: now, updated_at: now },
  { id: 'f-embedding', parent_id: 'f-rag', name: 'Embedding', slug: 'embedding', description: null, icon: 'Binary', sort_order: 30, is_visible: true, created_at: now, updated_at: day },
  { id: 'f-vector', parent_id: 'f-rag', name: 'Vector Store', slug: 'vector-store', description: null, icon: 'Boxes', sort_order: 40, is_visible: true, created_at: now, updated_at: day },
  { id: 'f-retrieval', parent_id: 'f-rag', name: 'Retrieval', slug: 'retrieval', description: null, icon: 'Search', sort_order: 50, is_visible: true, created_at: now, updated_at: day },
]

export const demoDocuments: KnowledgeDocument[] = [
  {
    id: 'd-spring-boot', folder_id: 'f-spring-boot', slug: 'spring-boot-introduction', title: 'Spring Boot 简介',
    description: '理解 Spring Boot 的核心价值、自动配置机制与工程结构。',
    content: `## 为什么选择 Spring Boot\n\nSpring Boot 通过**自动配置**、Starter 依赖和内嵌服务器，让 Spring 应用更快进入业务开发阶段。\n\n> 它没有隐藏 Spring，而是为常见组合提供合理默认值。\n\n## 核心机制\n\n### 自动配置\n\n应用启动时，框架会根据 classpath、配置项和已有 Bean 判断应启用哪些配置。\n\n\`\`\`java\n@SpringBootApplication\npublic class Application {\n  public static void main(String[] args) {\n    SpringApplication.run(Application.class, args);\n  }\n}\n\`\`\`\n\n## 启动流程\n\n\`\`\`mermaid\nflowchart LR\n  A[main] --> B[创建上下文]\n  B --> C[执行自动配置]\n  C --> D[启动 Web Server]\n\`\`\`\n\n## 下一步\n\n- [x] 理解 Starter\n- [x] 创建第一个应用\n- [ ] 分析自动配置报告`,
    tags: ['java', 'spring', 'spring-boot'], status: 'published', sort_order: 10, reading_time: 3,
    excerpt: '理解 Spring Boot 的核心价值、自动配置机制与工程结构。', published_at: now, created_at: day, updated_at: now,
  },
  {
    id: 'd-tools', folder_id: 'f-tools', slug: 'tool-calling-basics', title: 'Tool Calling 基础',
    description: '从 Schema 设计到调用闭环，构建可靠的工具使用能力。',
    content: `## 工具调用循环\n\n模型选择工具并生成参数，应用执行后将结构化结果送回模型。\n\n## Schema 设计\n\n### 输入要明确\n\n字段名称应表达业务语义，同时给出约束与示例。\n\n\`\`\`json\n{\n  "name": "search_knowledge",\n  "parameters": { "query": "string", "limit": "number" }\n}\n\`\`\`\n\n## 可靠性\n\n对超时、无结果和无效参数分别建模，不要把错误伪装成成功。`,
    tags: ['agent', 'tools', 'schema'], status: 'published', sort_order: 10, reading_time: 2,
    excerpt: '从 Schema 设计到调用闭环，构建可靠的工具使用能力。', published_at: now, created_at: day, updated_at: now,
  },
  {
    id: 'd-chunking', folder_id: 'f-chunking', slug: 'document-chunking-basics', title: '文档切分基础',
    description: '根据文档结构、语义边界和检索目标选择切分策略。',
    content: `## 切分不是越小越好\n\nChunk 需要在语义完整性与检索精度之间取得平衡。\n\n## 常见策略\n\n| 策略 | 优点 | 适合场景 |\n|---|---|---|\n| 固定长度 | 简单稳定 | 结构较弱的文本 |\n| 标题分层 | 保留结构 | Markdown、技术文档 |\n| 语义切分 | 边界自然 | 长篇叙述文本 |\n\n## 评估\n\n### 检索覆盖率\n\n观察正确上下文是否进入 top-k，并同时记录噪声比例。`,
    tags: ['rag', 'chunking', 'retrieval'], status: 'published', sort_order: 10, reading_time: 2,
    excerpt: '根据文档结构、语义边界和检索目标选择切分策略。', published_at: day, created_at: day, updated_at: day,
  },
]
