# Supervisor、Graph 与停止条件

## 1. Supervisor 模式

Supervisor 保存全局任务图和共享证据，Worker 只处理局部任务：

```text
Supervisor
  -> Planner
  -> Worker A ─┐
  -> Worker B ─┼-> Aggregator -> Reviewer -> Supervisor
  -> Worker C ─┘
```

Supervisor 不是另一个无边界聊天 Agent。它应有确定性职责：分派、检查依赖、限制并发、验证输出、解决冲突、更新状态和终止。

## 2. Graph 编排

把工作流表示为带状态的图：

- 节点：Agent、工具、验证器或人工确认；
- 边：条件转移；
- 状态：共享或分区数据；
- checkpoint：可恢复执行点；
- reducer：并发结果合并规则。

Graph 适合可控编排；模型只在需要判断的节点决策，确定性节点处理验证和路由。

## 3. 停止条件

每个任务和整个系统都要有：

- 完成条件；
- 最大迭代；
- deadline 与预算；
- 无进展阈值；
- reviewer 最大返工次数；
- 冲突升级策略；
- 人工确认状态；
- 取消传播。

例如 writer-reviewer 循环最多两轮；之后输出剩余问题，而不是无限润色。

## 4. 并发与合并

- 只读研究可并行；
- 同一文件写入使用分区、worktree 或串行合并；
- 共享状态采用版本和 reducer；
- 结果必须包含 task ID 与基线版本；
- 合并后重新运行全局验证；
- 子任务取消要向工具请求传播。

## 5. 失败传播

Worker 失败不必让全局任务立即失败。Supervisor 根据任务关键性决定：

- 同参数重试；
- 换 Worker 或工具；
- 缩小任务；
- 使用部分结果；
- 标记阻塞；
- 终止依赖节点。

失败记录需要保留已尝试策略，防止其他 Worker 重复同样路径。

## 6. 测试

- Worker 永久挂起；
- 两个 Worker 同时修改同一资源；
- Reviewer 每次提出新范围；
- 子任务结果 schema 错误；
- Supervisor 重启；
- 用户取消；
- 某分支部分成功；
- Graph 出现环。
