# Token Budget、Compaction、Prompt Cache 与 History

> **Freshness metadata**
> - `last_verified`: `2026-08-24`
> - `version_scope`: `provider-neutral; cache APIs vary by provider`
> - `source_type`: `official-provider-docs + engineering synthesis`
> - `stability`: `version-sensitive`

## 1. Budget 是分配策略

先为输出和工具回填留出硬余量，再给约束、当前任务、代码证据、history、retrieval 分配预算。`window - prompt = output` 只是容量关系；真正的预算还需考虑并行分支、重试和成本上限。

```text
input_budget = context_window
             - reserved_output
             - tool_protocol_margin
             - provider_safety_margin
```

## 2. Compaction 不是简单截断

压缩顺序通常是：去重 → 移除可重取的大输出 → 保留决定/错误/未完成项 → 对旧 history 结构化摘要 → 必要时窗口化。摘要必须记录生成版本与源范围，并保存原始 trace 的可追溯引用。

需要保留：当前目标、不可变约束、已做决定及理由、未解决错误、artifact 地址、permission、stop/cancel 状态。可以外置：重复工具输出、已成功且可重建的中间日志、与当前分支无关的旧讨论。

## 3. Prompt Cache 布局

Cache 是 provider/runtime 能力而不是通用语义保证。常见策略：稳定 instruction/tool catalog 前缀保持字节级稳定；易变时间戳、当前 observation 放后；tool 列表使用确定排序；记录 cache key 与命中指标。不要为追求命中把过期权限或旧 schema 固定下来。

## 4. History 管理

History 是事件序列，至少区分 user/model/tool/control。对 tool call 与 result 保存 ID；对 retry 保存 attempt；对 compaction 保存旧范围到摘要的映射。History 可用于 trace 和恢复，但并不自动成为长期 memory。

## 5. Failure modes

- lost constraint：摘要丢失验收条件；
- stale cache：权限或工具 schema 已变化；
- orphan tool result：压缩后 result 找不到 call；
- summary drift：多轮摘要逐渐改写事实；
- budget cliff：估算与 provider tokenizer 差异导致请求拒绝。

验证使用固定任务比较 success、input tokens、cache hit、compaction 次数、lost-fact rate，并对摘要做源事实一致性检查。
