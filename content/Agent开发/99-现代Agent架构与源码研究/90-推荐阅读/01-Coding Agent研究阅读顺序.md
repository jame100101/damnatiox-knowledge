# 现代主流 Coding Agent 研究阅读顺序

本目录的六份研究来自 `D:\agent_learing`，研究快照基于该仓库当前 `89f906cc17c5bc6c6566dda009a6c43561ebd82e`。阅读时保持“源码事实、公开行为、静态推断、架构建议”四层分离。

## 推荐顺序

1. **AGENT_SOURCE_06_COMPARISON**：先看五个项目的总表和统一抽象。
2. **AGENT_SOURCE_01_CODEX**：研究开源 coding agent 的 loop、tool、skills、context 与 harness。
3. **AGENT_SOURCE_02_CLAUDE_CODE**：研究官方公开运行契约、权限、hooks、subagents 和 MCP。
4. **AGENT_SOURCE_05_OPENCLAW**：研究 gateway、长运行 session、memory、context engine。
5. **AGENT_SOURCE_04_HERMES_AGENT**：研究自托管、tool registry、skills、长期记忆与消息入口。
6. **AGENT_SOURCE_03_GROK1**：理解基础模型推理运行时与 Agent Harness 的边界，避免把 KV cache 当 Agent Memory。

## 横向问题

- 主 loop 在哪里，继续和停止条件是什么？
- ToolSpec、Registry、Router、Executor 如何分工？
- ToolResult 是否结构化，错误是否可恢复？
- Permission 是 prompt 约束还是确定性执行层？
- Session、Context 与 Memory 如何分离？
- Compaction 保留哪些不变量？
- Trace、checkpoint、取消、重试怎样实现？
- Skill 与 Tool/MCP 的边界是什么？
- 哪些结论有代码行或官方文档证据，哪些只是建议？

## 统一实现契约

可以用下面的链路对照每个系统：

```text
TurnState
  -> ToolCall
  -> ToolResult
  -> EvidenceItem
  -> ValidationResult
  -> SessionState
```

将项目特有概念映射到统一契约后，再判断哪些机制值得组合进自己的 Agent 架构。
