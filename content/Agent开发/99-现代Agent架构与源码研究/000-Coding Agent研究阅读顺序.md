# 现代主流 Coding Agent 研究阅读顺序

> `last_verified: 2026-08-24`

本页已经从“推荐阅读”子文件夹移动到当前目录，并通过 `000-` 排序保持第一。所有报告采用固定 commit，区分 **CONFIRMED 源码事实、官方行为、INFERRED 架构推断与 UNKNOWN 未验证项**。

## 1. 最短学习路径

1. [十个 Agent 总对比](./AGENT_SOURCE_06_COMPARISON.md)：先建立 Loop、Context、Tool、Executor、Session、Compaction、Permission 的统一坐标。
2. [pi-agent](./AGENT_SOURCE_11_PI_AGENT.md)：从最小双层 Loop、typed events 和 tool dispatch 开始。
3. [Aider](./AGENT_SOURCE_07_AIDER.md)：理解 Repo Map、Edit Format、Git/lint/test reflection。
4. [OpenAI Codex](./AGENT_SOURCE_01_CODEX.md)：进入完整 Rust coding runtime、工具生命周期和 App Server。
5. [DeepSeek Harness Web](./AGENT_SOURCE_10_DEEPSEEK_HARNESS_WEB.md)：研究 Cordis Host/Browser 双插件树与 event-sourced session。
6. [OpenCode](./AGENT_SOURCE_09_OPENCODE.md)：研究 Effect SessionProcessor、MessageV2、permission 与 workspace snapshot。
7. [Goose](./AGENT_SOURCE_08_GOOSE.md)：研究 StateMachine Operations、MCP Extensions 和安全检查链。
8. [Grok Build](./AGENT_SOURCE_12_GROK_BUILD.md)：研究 Rust session actor、冲突感知工具批次和 worktree subagents。
9. [Hermes Agent](./AGENT_SOURCE_04_HERMES_AGENT.md)：研究自托管、长期 session、skills、memory 与 verification continuation。
10. [OpenClaw](./AGENT_SOURCE_05_OPENCLAW.md)：研究 Gateway、多 channel、多 runtime、context engine 和 memory 插件边界。
11. [Claude Code](./AGENT_SOURCE_02_CLAUDE_CODE.md)：以公开仓库、官方文档与 Agent SDK 学习产品契约，同时牢记核心 runtime 的公开源码边界。

## 2. 按问题选读

| 研究问题 | 优先报告 |
|---|---|
| 最小 Observe–Think–Act Loop | pi-agent |
| Repository context 与 patch parser | Aider |
| 完整工具 runtime 与 sandbox | Codex |
| Plugin composition 与 Web 架构 | DeepSeek Harness Web |
| Server/session/snapshot | OpenCode |
| Operation state machine 与 MCP | Goose |
| 并行工具与 worktree subagent | Grok Build |
| 长期个人 Agent 与 memory | Hermes Agent |
| Gateway、channel、context engine | OpenClaw |
| Hooks/plugins/permissions 产品契约 | Claude Code |

## 3. 每篇都要回答的横向问题

- 主 Loop 的 owner 是谁？Turn、Step、Task 如何区分？
- 下一轮继续、等待和停止的原因是否结构化？
- Context 从哪些持久事实投影，优先级和 token budget 如何决定？
- ToolSpec、Registry、Policy、Router、Executor、ToolResult 如何分层？
- 参数截断、超时、取消、重试会不会重复副作用？
- Permission、Approval、Sandbox 是否在不同层强制？
- Session、Context、Memory、Cache 是否被正确区分？
- Compaction 如何保持 tool pair、约束、任务和 workspace 不变量？
- Subagent 是否有深度、预算、取消、隔离与结果合并契约？
- TUI/Web/ACP/SDK 是否消费同一个 event/session truth？
- Trace 是否能关联 session、turn、model request、tool call、patch 和 final？

## 4. 统一检查链

```text
InputEnvelope
  -> TurnState
  -> ContextProjection
  -> ModelStream
  -> ParsedAction / ToolCall
  -> PermissionDecision
  -> ExecutionResult
  -> ToolResult / Evidence / Patch
  -> SessionEvent
  -> ValidationResult
  -> Continue | Compact | Wait | Stop
```

先将项目特有名词映射到这条链，再比较实现。这样不会因某项目把“Step”叫“Turn”、把“Plugin”叫“Extension”，就误判成完全不同的架构。

## 5. 版本核验规则

1. 精确结论固定到 commit，不用 floating `main` 链接证明默认值。
2. HEAD audit 只确认主模块和行为边界仍存在，不自动覆盖旧快照细节。
3. README/官方文档、源码、测试冲突时，记录漂移并优先可执行测试与实现。
4. 闭源产品只写公开契约，不虚构内部 class 或算法。
5. 基础模型 runtime 不放进 Agent Harness 横向表；模型 KV cache 也不写成 Agent Memory。
