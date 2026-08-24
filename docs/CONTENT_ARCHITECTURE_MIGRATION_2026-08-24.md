# 2026-08-24 Agent / Java 内容架构迁移表

## Source of truth 与路由影响

- Git 中的 `content/Agent开发/**`、`content/Java开发/**` 是批量维护与审查源；运行时公开页面读取 Supabase `folders` / `documents`。
- `scripts/sync-content-tree.mjs` 以标题、原文件名和显式 alias 匹配旧记录，移动文档时更新 `folder_id`，尽量保留 document ID。
- 同步时显式设置 `CONTENT_SYNC_ARCHIVE=true` 会把两个根目录下未匹配的旧文档设为草稿、旧目录设为隐藏；不做物理删除，也不会触碰其他知识根。
- 文件夹 slug 变化会改变 `/knowledge/[...path]` 路径；动态侧栏、breadcrumb、recent/search 由数据库记录重新生成。E2E 使用同步后的新路径。
- Markdown importer 不解析任意 frontmatter；本次采用可直接渲染的 `Freshness metadata` 引用块，避免未知字段泄漏到正文之外的 schema 假设。

## Agent：Old → New

| Old path | New path | Action | References affected |
|---|---|---|---|
| `00-Agent开发学习路线.md` | same | update | 课程主线、顶层名称 |
| `01-Agent基础` | same | keep + add | 新增统一工程模型 |
| `02-Agent Loop` | same | keep + add | 新增五层 loop 与机制决策卡 |
| `05-Memory/01-Context上下文.md` | `03-Context Engineering/02-Context上下文.md` | move | sidebar、folder_id |
| `06-Agent Harness/04-Input Context Builder与Prompt Assembly.md` | `03-Context Engineering/03-Context Builder与Prompt Assembly.md` | move | Harness/Context ownership |
| — | `03-Context Engineering/*` | add | Manifest、Assembly、Budget、Compaction、Cache、JIT、Trust |
| `03-Tools call` | `04-Tools与Runtime` | move/update | tool/runtime 术语、route |
| `09-浏览器与Computer Use` | `04-Tools与Runtime/02-Browser Runtime` | move | Browser 归入 runtime |
| `04-RAG` | `05-Knowledge与Memory/01-Knowledge` | move | RAG 归入 Knowledge |
| `05-Memory` 其余内容 | `05-Knowledge与Memory/02-Memory` | move | Memory 与 Context 分离 |
| `06-Agent Harness` | same | keep | Context Builder 移出，Harness 继续组织 |
| `08-Skills协议与能力打包` | `07-Skills与Protocols` | move/update | MCP/A2A/ACP 版本重验 |
| `10-评测可观测性与安全` | `08-Evaluation Observability Safety` | move/add | 提前到 Multi-Agent 前；benchmark map |
| — | `09-Agent Evolution` | add | 受控候选更新闭环 |
| `07-多Agent协调` | `10-Multi-Agent` | move | 顺序后移 |
| — | `11-Model Post-training` | add | optional advanced track |
| `11-交付生产级Agent` | `12-Production Agent` | move | route |
| `12-项目阶梯` | `13-Project Ladder` | move/merge/update | P0–P7 |
| `13-完整Agent链路与框架对照` | `14-完整Agent链路与架构对照` | move | route/术语 |
| `99-现代主流Coding Agent详细研究` | `99-现代Agent架构与源码研究` | move/add | 统一证据模板、Aider/Goose/OpenCode |
| `AGENT_SOURCE_03_GROK1.md` | `90-Model Backend与历史对照/Grok-1模型后端历史对照.md` | move | comparison relative link |

## Java：Old → New

| Old path | New path | Action | References affected |
|---|---|---|---|
| `00-Java后端学习路线总览.md` | `00-Java后端学习路线.md` | move/update | 主路线、route |
| — | `01-Version Baseline与Compatibility Matrix.md` | add | 集中 JDK/Spring 版本事实 |
| `01-Java基础` | `01-Java语言与核心API` | move | route |
| `01-Java基础/12-Java并发与多线程.md` | `02-JVM与并发/02-*` | move | JVM/concurrency 一级化 |
| `02-工程工具与Linux/06-JVM*` | `02-JVM与并发/01-*` | move | 同上 |
| `02-工程工具与Linux` | `03-工程基础与Internet-Linux` | move/update | 新增 HTTP/DNS/TCP/TLS mental model |
| `01-Java基础/13-Java网络编程.md` | `03-工程基础与Internet-Linux/05-*` | move | network 归工程基础 |
| `03-数据库缓存与搜索` | `04-关系型数据库` | move/split | Redis/Search 后移；Mongo optional |
| `04-Spring Framework` | `05-Spring Framework` | move/update | 产品族边界 |
| `05-Spring Boot与Web` | `06-Spring Boot与Web` | move/update | Boot 4/Jakarta/Servlet |
| `06-数据访问与ORM` | `07-数据访问与事务` | move/add | JDBC/MyBatis/JPA 决策 |
| `10-测试与质量工程` | `08-测试与质量工程` | move/add | 提前；testing portfolio |
| `09-安全认证与授权` | same | keep/update | OAuth2/OIDC/JWT 校正 |
| — | `10-应用架构与模块化单体` | add | Modulith、outbox、idempotency、拆分判断 |
| Redis/Elasticsearch/Caffeine/cache docs | `11-缓存与搜索` | move/merge | 从 DB/MQ 移出 |
| `08-高性能与消息队列` 的 MQ docs | `12-消息与事件驱动` | move/update | messaging 与 performance 分离 |
| `07-分布式与微服务` | `13-分布式与微服务` | move/update | 顺序后移；compatibility matrix |
| `08-高性能与消息队列/01-*` | `14-性能工程` | move/update | 独立 measurement loop |
| `11-云原生DevOps与可观测性` | `15-云原生DevOps与可观测性` | move | production specialization |
| `12-前端与全栈交付` | `16-可选专项/01-前端与全栈交付` | move | optional track |
| data structures/design patterns | `16-可选专项/02-计算机科学与工程选修` | move | 非核心主线 |
| MongoDB | `16-可选专项/03-MongoDB数据模型` | split/add | optional data model |
| — | `16-可选专项/04-Spring AI` | add | Java 实现，交叉指向 Agent 原理 |
| `13-项目阶梯` | `17-项目阶梯` | move/add | P0–P8，P4 为核心毕业点 |
| — | `99-开源项目架构研究` | add | 7 个固定 commit 研究入口 |

## Freshness 兼容块

```markdown
> **Freshness metadata**
> - `last_verified`: `2026-08-24`
> - `version_scope`: `...`
> - `source_type`: `official-spec | official-docs | primary-paper | official-repository`
> - `stability`: `stable-concept | version-sensitive | fast-moving`
```

`fast-moving` 文档由 `scripts/validate-content-architecture.mjs` 强制检查四个字段。
