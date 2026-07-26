# Agent 开发学习路线总览

这套知识树以 Datawhale 的 **Agent Learning Hub** 为主线，并把每个 checklist 拆成可独立阅读的 Markdown 文档。学习顺序不是“先收集所有框架 API”，而是从可验证的最小闭环出发，逐步增加 SWE Agent、任务拆分与调度、工具与文件/进程执行、检索、记忆、Harness、多 Agent、协议、浏览器操作、评测和交付能力。

## 一、主线结构

1. **Agent 基础**：先区分 chatbot、workflow、agent、multi-agent，理解 ReAct 式 `observe → decide → act → observe`，再以 SWE Agent、SWE-agent 和 ACI 建立代码环境交互的基本概念。
2. **Agent Loop**：实现模型调用、任务拆分、Plan 表示、DAG 调度、流程控制、Output Parser、结果回填、终止条件和失败处理。
3. **Tools call**：把搜索、文件、数据库、浏览器、Terminal 和代码执行包装成严格接口；掌握进程生命周期、stdout/stderr、原子文件更新与证据。
4. **RAG**：掌握 ingestion、chunk、embed、retrieve、rerank、grounded answer 和 citation。
5. **Memory**：区分 context、短期状态、会话记忆和长期记忆，设计写入、召回、更新与遗忘。
6. **Agent Harness**：研究运行时如何组织 Context Assembly、loop、registry、permission、Executor、middleware、session、compaction、trace 与恢复。
7. **多 Agent 协调**：把多 Agent 当作职责、协议、调度和停止条件问题，而不是角色聊天。
8. **Skills、协议与能力打包**：理解 Skill、Tool、Prompt、MCP、A2A、ACP 的边界。
9. **浏览器与 Computer Use**：处理动态页面、视觉/DOM 观察、动作执行、失败恢复和证据留存。
10. **评测、可观测性与安全**：用固定任务集、trace、指标、权限门和回归测试衡量系统。
11. **生产交付**：明确用户和成功标准，补齐预算、重试、部署、配置、文档和运维闭环。
12. **项目阶梯**：从 Calculator Agent 逐级走到 Production Harness。
13. **完整 Agent 链路与框架对照**：把输入、成功契约、Context Builder、Plan、Scheduler、Parser、Executor、Evidence、Finalizer 和持久化连成一条可验证链路，并对照六套权威路线。
14. **现代主流 Coding Agent 详细研究**：收录当前工作区已有的 Codex、Claude Code、Grok-1、Hermes Agent、OpenClaw 及横向对比研究。

## 二、贯穿全程的统一数据契约

建议把一次可审计执行抽象为：

```text
RunInput
  -> SuccessContract
  -> ContextManifest
  -> PlanGraph / ScheduledTask
  -> ModelResponse / ParsedDecision
  -> ToolCall / ToolResult
  -> EvidenceItem / ValidationResult
  -> SessionState / RunResult
```

- `RunInput`：身份、workspace、用户输入、附件、deadline 和初始预算。
- `SuccessContract`：目标、交付物、验收条件、证据要求和非目标。
- `ContextManifest`：本轮每个输入片段的来源、信任层、token、选择原因和截断状态。
- `PlanGraph / ScheduledTask`：可验收步骤、依赖、资源、状态、计划版本与 worker lease。
- `ModelResponse / ParsedDecision`：provider 原始响应与解析后的工具/最终输出决策。
- `ToolCall`：工具名、版本、结构化参数、调用 ID、幂等键。
- `ToolResult`：成功状态、结构化结果、错误类型、耗时和副作用摘要。
- `EvidenceItem`：可回溯的来源、文件位置、查询、截图或日志片段。
- `ValidationResult`：格式、协议、语义、权限和任务完成度检查。
- `SessionState / RunResult`：跨轮状态、摘要、检查点、恢复信息以及最终交付。

这个契约把“模型说它完成了”与“系统有证据证明完成了”分开，也为 trace、重放、评测和故障恢复提供共同语言。

## 三、推荐学习方法

- 每一阶段都做一个最小可运行产物；阅读只是输入，运行结果才是验证。
- 先建立单 Agent 的可靠闭环，再加入 RAG、Memory 或多 Agent。
- 把 Planner、Scheduler、Runner、Output Parser、Tool Executor 与 OS Process Executor 分开实现和测试。
- 所有工具使用 JSON Schema 或等价的强类型定义；把参数错误作为可恢复观察返回模型。
- Context 采用 typed fragment 与预算装配；结构化输出之后仍做 schema、业务和任务级验证。
- 每次重要运行保留 trace：输入、模型响应、工具调用、工具结果、验证结果、终止原因。
- 在增加能力前先准备回归任务，避免“功能更多、整体成功率反而下降”。
- 把事实、静态推断和架构建议分开记录；研究开源项目时固定 commit。

## 四、路线来源

- [Datawhale Agent Learning Hub](https://datawhalechina.github.io/Agent-Learning-Hub/)
- [Agent Learning Hub GitHub 仓库](https://github.com/datawhalechina/Agent-Learning-Hub)
