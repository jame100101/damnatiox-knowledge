# Spring AI 工程实现总览（可选）

> **Freshness metadata**
> - `last_verified`: `2026-08-24`
> - `version_scope`: `Spring AI 2.0 line; repository fd3fd6ec700340b90c3d516be57c6e6c87dd7df1`
> - `source_type`: `Spring official reference + official-repository`
> - `stability`: `fast-moving`

Spring AI 为 Java/Spring 应用提供 Model API、`ChatClient`、structured output、tool calling、chat memory、RAG、vector store、MCP 与 observability 集成。它是实现层，不替代 Agent 原理。

## 分层

- Model API/ChatClient：provider-neutral 调用与 fluent orchestration；
- Structured Output：把模型文本映射到 schema，仍需业务校验；
- Tool Calling：声明工具并处理 invocation，真实副作用仍由应用 permission/runtime 管理；
- Memory：会话消息管理，不自动等于长期用户记忆；
- RAG/Vector Store：检索与 advisor pipeline；需要 citation、ACL、freshness；
- MCP：按官方当前 spec 与 Spring AI 当前模块版本核对 client/server 能力；
- Observability：记录 model/tool latency、tokens 与 trace，保护 prompt/secret/PII。

```java
record Answer(String summary, java.util.List<String> sources) {}

Answer answer = chatClient.prompt()
    .user(question)
    .call()
    .entity(Answer.class);
```

反序列化成功只证明结构匹配；source 存在性、权限、业务不变量仍需 deterministic validation。

## Cross-reference

Agent 原理请阅读 `Agent开发 / 02-Agent Loop`、`03-Context Engineering`、`04-Tools与Runtime`、`05-Knowledge与Memory` 与 `06-Agent Harness`。本模块只讨论 Java/Spring AI 的实现映射，避免复制理论。
