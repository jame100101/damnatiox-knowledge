-- Safe public sample data. No credentials or secrets.
insert into public.folders (id, parent_id, name, slug, description, icon, sort_order)
values
  ('10000000-0000-0000-0000-000000000001', null, 'Java 后端', 'java-backend', 'Java 语言、JVM 与 Spring 生态。', 'Braces', 10),
  ('10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Java 基础', 'java-basics', '语言基础与核心 API。', 'BookOpen', 10),
  ('10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Spring', 'spring', 'Spring Framework 技术体系。', 'Leaf', 20),
  ('10000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', 'Spring Boot', 'spring-boot', '约定优于配置的 Java 应用开发。', 'Blocks', 10),
  ('10000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003', 'Spring Security', 'spring-security', '认证、授权与应用安全。', 'Shield', 20),
  ('10000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', 'JVM', 'jvm', '虚拟机、内存与性能分析。', 'Cpu', 30),
  ('20000000-0000-0000-0000-000000000001', null, 'Agent 开发', 'agent-development', 'Agent 架构、工具调用、记忆与协作。', 'Bot', 20),
  ('20000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Agent 基础', 'agent-basics', null, 'CircleDot', 10),
  ('20000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'Tool Calling', 'tool-calling', '让模型可靠使用外部能力。', 'Wrench', 20),
  ('20000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', 'Memory', 'memory', '短期与长期记忆设计。', 'Brain', 30),
  ('20000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000001', 'Multi-Agent', 'multi-agent', '多智能体分工与协调。', 'Network', 40),
  ('30000000-0000-0000-0000-000000000001', null, 'RAG', 'rag', '从数据接入到检索生成的完整链路。', 'Database', 30),
  ('30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'Document Loader', 'document-loader', null, 'FileInput', 10),
  ('30000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'Chunking', 'chunking', '文档分块策略与质量评估。', 'SplitSquareVertical', 20),
  ('30000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001', 'Embedding', 'embedding', null, 'Binary', 30),
  ('30000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000001', 'Vector Store', 'vector-store', null, 'Boxes', 40),
  ('30000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000001', 'Retrieval', 'retrieval', null, 'Search', 50)
on conflict (id) do nothing;

insert into public.documents (
  id, folder_id, slug, title, description, content, tags, status,
  sort_order, reading_time, excerpt, published_at
)
values
  (
    '11000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000004',
    'spring-boot-introduction',
    'Spring Boot 简介',
    '理解 Spring Boot 的核心价值、自动配置机制与工程结构。',
    E'## 为什么选择 Spring Boot\n\nSpring Boot 通过自动配置、Starter 依赖和内嵌服务器，让应用更快进入业务开发阶段。\n\n## 核心机制\n\n### 自动配置\n\n框架根据 classpath、配置项和已有 Bean 判断应启用哪些配置。',
    array['java', 'spring', 'spring-boot'],
    'published', 10, 3, '理解 Spring Boot 的核心价值、自动配置机制与工程结构。', now()
  ),
  (
    '21000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000003',
    'tool-calling-basics',
    'Tool Calling 基础',
    '从 Schema 设计到调用闭环，构建可靠的工具使用能力。',
    E'## 工具调用循环\n\n模型选择工具并生成参数，应用执行后将结构化结果送回模型。\n\n## Schema 设计\n\n字段名称应表达业务语义，同时给出约束与示例。',
    array['agent', 'tools', 'schema'],
    'published', 10, 2, '从 Schema 设计到调用闭环，构建可靠的工具使用能力。', now()
  ),
  (
    '31000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000003',
    'document-chunking-basics',
    '文档切分基础',
    '根据文档结构、语义边界和检索目标选择切分策略。',
    E'## 切分不是越小越好\n\nChunk 需要在语义完整性与检索精度之间取得平衡。\n\n## 常见策略\n\n固定长度、标题分层和语义切分各有适用场景。',
    array['rag', 'chunking', 'retrieval'],
    'published', 10, 2, '根据文档结构、语义边界和检索目标选择切分策略。', now()
  )
on conflict (id) do nothing;
