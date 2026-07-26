# Trace、调试、失败恢复与 Validation

## 1. Trace 的最小字段

```ts
type TraceEvent = {
  traceId: string
  spanId: string
  parentSpanId?: string
  threadId: string
  runId: string
  turnId?: string
  eventType: string
  startedAt: string
  durationMs?: number
  status: string
  attributes: Record<string, unknown>
}
```

敏感值做脱敏或只存引用；大工具输出存对象存储，trace 只保留 hash 与定位。

## 2. 故障定位分层

- Prompt/Context：目标或约束缺失、摘要丢信息；
- Model：选择错误工具、格式漂移；
- Tool：参数、超时、外部依赖；
- Retrieval：召回或排序错误；
- State：并发覆盖、恢复不一致；
- Permission：策略误判或范围过宽；
- Validation：成功标准不完整；
- Product：用户目标本身定义错误。

分类能把“模型失败”拆成可行动的问题。

## 3. Replay

重放分两种：

- **Deterministic replay**：复用已记录模型响应和工具结果，验证状态机、UI、finalizer。
- **Live replay**：重新调用模型/工具，评估新版本行为。

Live replay 可能产生副作用，需要 mock、dry-run 或幂等环境。记录 prompt、model、temperature、tool schema 版本和代码 commit。

## 4. 恢复

检查点应在状态和副作用之间建立清楚顺序：

1. 记录 intent；
2. 执行带幂等键的动作；
3. 查询并验证结果；
4. 提交完成状态。

恢复时遇到 intent 未完成，先查询外部状态，不直接重复动作。

## 5. ValidationResult

```json
{
  "passed": false,
  "checks": [
    {
      "name": "unit-tests",
      "status": "failed",
      "evidence_ids": ["E17"],
      "message": "2 tests failed"
    }
  ],
  "missing": ["production health check"]
}
```

Validation 既可以是确定性测试，也可以是模型评审，但两者要区分。构建、schema、权限、文件存在性等优先使用确定性检查。

## 6. 可观测指标

- 任务成功率；
- 首次成功率；
- 每任务 turn/tool 数；
- 重试和循环率；
- tool error 分类；
- latency 分位数；
- token/金额；
- compaction 次数；
- 人工确认等待；
- 恢复成功率；
- 验证失败原因。
