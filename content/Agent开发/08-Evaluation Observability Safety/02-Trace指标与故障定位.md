# 可观测性：Trace、Metrics、Logs 与故障定位

## 1. 三类信号

- **Trace**：一次任务的因果链，适合定位哪一步失败；
- **Metrics**：跨任务聚合趋势，适合监控成功率、延迟、成本；
- **Logs**：详细事件与诊断信息，适合搜索异常。

三者用统一 `trace_id/run_id/turn_id/tool_call_id` 关联。

## 2. Span 层级

```text
agent.run
  model.turn
    context.build
    model.request
  tool.call
    permission.check
    tool.execute
    result.validate
  memory.read/write
  context.compact
  final.validate
```

每个 span 记录状态、耗时、错误分类和必要元数据。Prompt、工具结果可能含敏感信息，可存 hash、大小、引用或脱敏摘要。

## 3. Dashboard 指标

- 成功率按任务类别、模型、版本；
- p50/p95 总延迟和各工具延迟；
- 每任务 token/费用；
- tool call 次数与错误率；
- 平均/最大 loop steps；
- 重复调用率；
- compaction 与恢复次数；
- 人工确认通过/拒绝/超时；
- 引用验证失败；
- 副作用后验证失败。

## 4. 故障定位流程

1. 确认最终失败检查；
2. 沿 trace 找到首次偏离；
3. 检查当时 context 是否包含必要信息；
4. 检查模型决策与可见工具；
5. 检查 schema/permission/executor；
6. 检查 result 是否正确回填；
7. 检查状态与 compaction；
8. 将根因加入分类和回归 case。

不要只看最终模型文本，因为根因经常出现在更早的检索或工具结果。

## 5. 成本归因

按 run/turn/tool/provider 记录 token、缓存命中、请求费用和重试。对于多 Agent，还要按子任务归因，避免整体预算被某个 reviewer 循环耗尽。

## 6. 告警

- 成功率显著下降；
- 某工具错误率突增；
- p95 延迟或成本超阈值；
- 权限拒绝/确认异常变化；
- 循环和超时增多；
- 引用验证失败；
- 同一版本出现新的错误分类。
