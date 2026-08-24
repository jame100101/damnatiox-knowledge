# P0–P7 Agent 工程项目阶梯

> **Freshness metadata**
> - `last_verified`: `2026-08-24`
> - `version_scope`: `2026 curriculum`
> - `source_type`: `engineering synthesis`
> - `stability`: `version-sensitive`

每一级只引入解决当前问题所需的组件；验收需要 trace 与失败 case，而非录屏。

| Level | Goal | Required Components | Non-goals | Acceptance Tests | Failure / Evidence |
|---|---|---|---|---|---|
| P0 Tool-calling Agent | 单轮选择一个只读工具 | model、schema、parser、mock tool | ReAct、memory、plan | 正确工具/参数；非法参数不执行 | raw/parsed event、result |
| P1 Minimal ReAct | 多轮 observation→action→final | state、tool result、max steps | planner、RAG | 两工具链路；可停止 | step trace、stop reason |
| P2 Minimum SWE Agent | 在小仓库定位、修改、测试 | file I/O、shell、diff、test | multi-agent、长期 memory | 给定 issue 的测试通过 | patch、command log、tests |
| P3 Reliable SWE Agent | 处理超时、失败、取消、重复动作 | validation、retry class、budget、cleanup | durable queue | 错误注入下状态一致 | failure taxonomy、no orphan process |
| P4 Agent Harness | 抽离 context/tool/runtime/policy/session | registries、context manifest、permission、trace | 自动进化 | provider/tool 可替换 | contract/component tests |
| P5 Coding Agent | 支持大型 repo 与交互式开发 | JIT retrieval、compaction、skills、ACP/MCP 可选 | 默认 multi-agent | 多文件任务、上下文压缩后继续 | manifest、citations、reviewable diff |
| P6 Durable Agent | 重启后继续长任务 | checkpoint、lease、idempotency、reconciliation | 跨域自治 | kill/restart/duplicate delivery | persisted state、recovery trace |
| P7 Production Agent | 以 SLO 运营并受控发布 | eval gate、security、cost、observability、runbook、rollback | 追求“全自主” | canary、回归、安全与故障演练 | dashboard、incident/runbook evidence |

## 逐级边界

- P0/P1 不需要 RAG、Memory、Plan、Skills 或 Multi-Agent。
- P2 的核心是 ACI、patch 与测试证据，不是聊天体验。
- P3 先解决可靠性，再在 P4 抽象 Harness。
- P5 只有能力目录变大时才引入 progressive disclosure。
- P6 的 durable state 不得只依赖对话历史。
- P7 的毕业标准是可运营、可审计、可回滚。
