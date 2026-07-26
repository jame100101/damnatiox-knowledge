# Agent 开发学习路线总览

这套知识树以 Datawhale 的 **Agent Learning Hub** 为主线，并把每个 checklist 拆成可独立阅读的 Markdown 文档。学习顺序不是“先收集所有框架 API”，而是从可验证的最小闭环出发，逐步增加工具、检索、记忆、Harness、多 Agent、协议、浏览器操作、评测和交付能力。

## 一、主线结构

1. **Agent 基础**：先区分 chatbot、workflow、agent、multi-agent，理解 `observe → think → act → observe`，并判断场景是否真的需要 Agent。
2. **Agent Loop**：实现模型调用、结构化输出、动作执行、结果回填、终止条件和失败处理。
3. **Tools call**：把搜索、文件、数据库、浏览器、代码执行等能力包装成严格接口。
4. **RAG**：掌握 ingestion、chunk、embed、retrieve、rerank、grounded answer 和 citation。
5. **Memory**：区分 context、短期状态、会话记忆和长期记忆，设计写入、召回、更新与遗忘。
6. **Agent Harness**：研究运行时如何组织 loop、registry、permission、session、compaction、trace 与恢复。
7. **多 Agent 协调**：把多 Agent 当作职责、协议、调度和停止条件问题，而不是角色聊天。
8. **Skills、协议与能力打包**：理解 Skill、Tool、Prompt、MCP、A2A、ACP 的边界。
9. **浏览器与 Computer Use**：处理动态页面、视觉/DOM 观察、动作执行、失败恢复和证据留存。
10. **评测、可观测性与安全**：用固定任务集、trace、指标、权限门和回归测试衡量系统。
11. **生产交付**：明确用户和成功标准，补齐预算、重试、部署、配置、文档和运维闭环。
12. **项目阶梯**：从 Calculator Agent 逐级走到 Production Harness。
13. **现代主流 Coding Agent 详细研究**：收录当前工作区已有的 Codex、Claude Code、Grok-1、Hermes Agent、OpenClaw 及横向对比研究。

## 二、贯穿全程的统一数据契约

建议把一次可审计执行抽象为：

```text
TurnState
  -> ToolCall
  -> ToolResult
  -> EvidenceItem
  -> ValidationResult
  -> SessionState
```

- `TurnState`：本轮输入、当前计划、剩余预算、已知约束。
- `ToolCall`：工具名、版本、结构化参数、调用 ID、幂等键。
- `ToolResult`：成功状态、结构化结果、错误类型、耗时和副作用摘要。
- `EvidenceItem`：可回溯的来源、文件位置、查询、截图或日志片段。
- `ValidationResult`：格式、协议、语义、权限和任务完成度检查。
- `SessionState`：跨轮持久化的任务状态、摘要、检查点和恢复信息。

这个契约把“模型说它完成了”与“系统有证据证明完成了”分开，也为 trace、重放、评测和故障恢复提供共同语言。

## 三、推荐学习方法

- 每一阶段都做一个最小可运行产物；阅读只是输入，运行结果才是验证。
- 先建立单 Agent 的可靠闭环，再加入 RAG、Memory 或多 Agent。
- 所有工具使用 JSON Schema 或等价的强类型定义；把参数错误作为可恢复观察返回模型。
- 每次重要运行保留 trace：输入、模型响应、工具调用、工具结果、验证结果、终止原因。
- 在增加能力前先准备回归任务，避免“功能更多、整体成功率反而下降”。
- 把事实、静态推断和架构建议分开记录；研究开源项目时固定 commit。

## 四、路线来源

- [Datawhale Agent Learning Hub](https://datawhalechina.github.io/Agent-Learning-Hub/)
- [Agent Learning Hub GitHub 仓库](https://github.com/datawhalechina/Agent-Learning-Hub)
