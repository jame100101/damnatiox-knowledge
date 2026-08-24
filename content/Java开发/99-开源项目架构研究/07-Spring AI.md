# Spring AI 架构研究入口

> **Freshness metadata**
> - `last_verified`: `2026-08-24`
> - `version_scope`: `fd3fd6ec700340b90c3d516be57c6e6c87dd7df1`
> - `source_type`: `official-repository`
> - `stability`: `fast-moving`

## Research identity

- **Repository**: [spring-projects/spring-ai](https://github.com/spring-projects/spring-ai)
- **Commit**: [`fd3fd6ec700340b90c3d516be57c6e6c87dd7df1`](https://github.com/spring-projects/spring-ai/tree/fd3fd6ec700340b90c3d516be57c6e6c87dd7df1)
- **Research date**: `2026-08-24`
- **Purpose**: 研究 Java AI integration：Model API、ChatClient、structured output、tools、memory、RAG/vector store、MCP 与 observability。

## Architecture / module map

从 BOM/modules 建立 model/core/client/advisors/vector-store/mcp/observability 的实际依赖图。

## Entry points / request-data flow

从 ChatClient fluent call 跟踪 advisor chain、model request/response；再跟踪一次 tool invocation 到应用 callback。

## Patterns worth learning

provider abstraction、Spring configuration、可组合 advisor 与可观察 AI 调用。

## Patterns not to copy blindly

provider 能力并不完全同构；structured output、memory、RAG 与 permission 仍需应用验证。

## Evidence status

- **CONFIRMED**：仓库身份、commit 以及本文链接到的公开目录/入口；结论只覆盖该快照。
- **INFERENCE**：模块责任和 flow 由静态目录、依赖与命名推断，需通过测试/运行 trace 复核。
- **UNKNOWN**：各 provider 当前能力、MCP revision 覆盖和 Spring AI 2.0 后续 patch 行为。

## 阅读任务

1. 在固定 commit 建立 module/dependency map；
2. 从启动入口跟踪一条请求到持久化或外部系统；
3. 选择一个成功测试和一个失败/安全测试；
4. 记录 transaction、identity、error、observability 与 deployment boundary；
5. 输出可定位文件/符号的笔记，不用 stars 代替技术证据。
