# Tool Registry、Permission Gate、Session Store 与 Compaction

## 1. Tool Registry

Registry 管理工具元数据、版本、handler 和 capability。它需要支持：

- 名称冲突检测；
- 按会话、角色、平台选择可见工具；
- provider schema 转换；
- 工具搜索与延迟加载；
- 禁用或降级不可用工具；
- 版本和 deprecation；
- 统一 metrics 与 hooks。

Registry 决定“系统拥有什么”，Router 决定“本轮暴露什么”。

## 2. Permission Gate

Permission Gate 应位于工具解析之后、handler 之前。输入使用规范化参数，输出包含 allow/deny/ask、规则 ID、范围和过期时间。确认结果只覆盖精确动作，不能模糊扩展到未来所有参数。

## 3. Session Store

推荐层级：

```text
Thread: 用户可持续对话
  Run: 一次目标执行
    Turn: 一次模型决策
      ToolCall / ToolResult
```

存储：

- 当前目标和状态；
- 消息与摘要版本；
- tool call/result；
- EvidenceItem；
- 权限确认；
- checkpoint；
- usage、成本和错误。

并发更新使用乐观锁、版本号或事务，避免子任务覆盖主任务状态。

## 4. Context Compaction

Compaction 的输入是旧上下文与结构化状态，输出不是普通聊天摘要，而是下一阶段可执行的 checkpoint。必须保留：

- 当前目标和成功标准；
- 已完成/未完成任务；
- 关键决策及理由；
- 已产生的副作用；
- 失败尝试与禁止重复动作；
- 证据 ID 和外部存储定位；
- 当前权限与预算。

## 5. 组合不变量

- Registry 暴露的工具必须经过 Permission Gate；
- Permission 决策与实际执行参数一致；
- ToolResult 在 session 提交后才对后续 turn 可见；
- Compaction 不丢失未决确认和 tool call 配对；
- 恢复后先核对外部状态，再继续；
- Trace 能关联 thread/run/turn/call。

## 6. 测试

- 工具热加载时会话是否使用正确版本；
- Permission 确认后参数被修改是否重新确认；
- 并发 tool result 是否丢失；
- Compaction 前后成功条件是否一致；
- 崩溃恢复是否重复写操作；
- 旧 trace 能否用对应 schema 解码。
