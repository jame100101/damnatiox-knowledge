# Context：模型本轮真正看到的信息

Context 是一次模型调用输入中的信息集合，包括系统指令、用户消息、最近对话、工具定义、工具结果、检索片段、任务状态和运行时提示。它不是 Memory 的同义词，而是 Memory 被选择和装配后的**当前工作集**。

## 1. Context 的组成

```text
system/developer instructions
task goal and constraints
selected conversation history
current plan/state
available tool schemas
retrieved evidence
recent tool results
budget and stop conditions
```

不同层有优先级、可信度和生命周期。网页内容、文件内容属于数据，不能与系统规则混在同一语义层。

## 2. Context Engineering

核心不是“塞更多 token”，而是让模型在每轮看到完成当前决策所需的最小充分信息：

- 只暴露相关工具；
- 大文件按需读取；
- 老历史压缩为结构化摘要；
- 关键约束重复注入稳定区；
- 证据保留来源 ID；
- 计划、待办和验证状态类型化；
- 高噪声日志先提取错误片段。

## 3. 上下文窗口不是持久化

窗口变大只提高单次可见量：

- 会话结束后不会自动保留；
- 内容过多会增加成本与注意力稀释；
- 旧事实可能与新状态冲突；
- 工具结果和消息顺序仍需遵守协议；
- 长上下文也需要选择、去重和压缩。

## 4. Context Compaction

当历史接近预算时：

1. 保留系统规则、当前目标和未完成任务；
2. 保留最近关键工具调用与结果；
3. 将较老过程压缩成结构化摘要；
4. 把详细证据移到外部存储，仅保留引用；
5. 校验摘要是否保留关键 ID、决策、错误和副作用；
6. 记录 compaction 前后版本，便于诊断。

推荐摘要结构：

```yaml
goal:
completed:
pending:
decisions:
constraints:
evidence_refs:
side_effects:
known_failures:
next_action:
```

## 5. 常见问题

- 摘要把推断写成事实；
- 丢失 tool call / tool result 配对；
- 省略失败尝试导致重复；
- 同时保留旧状态和新状态；
- 工具说明太多挤占任务证据；
- 外部不可信文本混入高优先级指令区。

## 6. 评测

设计长会话测试：在第 1、20、50 轮设置关键约束，触发 compaction 后检查 Agent 是否仍遵守；同时检查成本、延迟、重复工具调用和任务完成度。
