# Short-term Memory：短期状态与会话工作记忆

短期记忆服务于当前任务或会话，生命周期从几分钟到一次任务结束。它比原始对话更结构化，典型内容包括当前计划、临时变量、已尝试动作、最近观察、待办、检查点和用户临时偏好。

## 1. 与 Context 的区别

- Context：本轮发给模型的实际输入。
- Short-term Memory：可供 Context Builder 选择的会话状态。

短期记忆可以比当前上下文更大，例如完整工具 trace 保存在数据库中，本轮只装入摘要和最近几步。

## 2. 数据结构

```ts
type SessionMemory = {
  sessionId: string
  goal: string
  plan: PlanStep[]
  workingFacts: Fact[]
  attempts: Attempt[]
  evidenceRefs: string[]
  pendingConfirmations: Confirmation[]
  checkpoint: number
  updatedAt: string
}
```

`workingFacts` 应带来源和置信状态；`attempts` 保存失败原因与参数指纹；`pendingConfirmations` 防止恢复后跳过确认。

## 3. 写入时机

- 用户明确改变目标；
- 工具产生影响下一步的结果；
- 完成或阻塞一个子任务；
- 做出不可轻易撤销的架构决策；
- 创建检查点；
- Context Compaction 前。

不要把每个 token 或所有自然语言都重复写入状态库。

## 4. 恢复

崩溃恢复时：

1. 读取最后已提交检查点；
2. 核对外部副作用状态；
3. 恢复未完成步骤；
4. 对“执行完成但提交未知”的动作使用幂等键或查询确认；
5. 生成恢复观察，并进入正常 loop。

## 5. 清理

任务结束后，短期状态应：

- 保留必要 trace 和交付证据；
- 将可复用事实提炼为候选长期记忆；
- 丢弃临时 token、重复日志和过期页面状态；
- 按保留策略删除敏感中间数据。

## 6. 测试

- 中途重启能否从检查点继续；
- Compaction 后是否重复已完成工具；
- 并发子任务更新是否覆盖彼此；
- 用户撤销的偏好是否仍残留；
- 过期会话是否按策略清理。
