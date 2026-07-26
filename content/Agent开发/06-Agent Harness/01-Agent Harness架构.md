# Agent Harness 架构：模型之外的能力来源

Agent Harness 是承载模型执行任务的运行时。它决定模型能看到什么、能调用什么、如何执行、何时停止、如何记录、如何恢复。相同模型放入不同 Harness，实际能力和可靠性可能差异很大。

## 1. 典型模块

```text
CLI / Web / Message Gateway
  -> Session Manager
  -> Context Builder
  -> Agent Loop
  -> Model Adapter
  -> Tool Registry + Router
  -> Permission Gate
  -> Tool Executor / Sandbox
  -> Event Bus / Trace
  -> Compaction / Memory
  -> Validator / Finalizer
```

## 2. Agent Loop

Loop 负责模型请求、工具调用回填和终止；它不应独自承担所有逻辑。Provider 重试、工具超时、权限、状态提交和 final validation 最好拆成清晰模块。

## 3. Model Adapter

统一不同提供商的：

- 消息角色；
- tool schema；
- 流式事件；
- usage；
- stop reason；
- 错误分类；
- prompt caching；
- reasoning/structured output 能力。

Adapter 不能把 provider 差异全部抹平到最低能力，应保留可选 capability flags。

## 4. Session 与检查点

Session Manager 管理 task/thread/run/turn 的层级、并发 lane、取消和恢复。每次有副作用动作后应提交可恢复检查点，避免进程重启造成重复执行。

## 5. Context Builder 与 Compaction

Context Builder 从系统规则、当前任务、历史摘要、Memory、工具和 Evidence 中选择本轮输入。Compaction 是有损压缩，需要保留约束、决策、待办、失败、调用 ID 和证据引用。

## 6. Event 与 Trace

把运行过程建模为事件：

```text
run.started
model.requested
model.delta
tool.requested
permission.decided
tool.completed
state.checkpointed
context.compacted
validation.completed
run.completed
```

事件可驱动 UI、日志、回放、指标和调试。事件 schema 要版本化。

## 7. Finalizer

Finalizer 负责：

- 检查所有 tool call 已有结果；
- 汇总未完成事项；
- 运行任务级验证；
- 确认副作用状态；
- 保存最终产物与证据；
- 输出明确终止原因。

## 8. 研究 Harness 的方法

不要只看 README。沿一次完整任务追踪入口、session、loop、tool registry、permission、executor、trace、compaction、finalizer，并记录每个模块的输入输出契约。
