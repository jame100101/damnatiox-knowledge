# Context Manifest 与 Context Assembly

> **Freshness metadata**
> - `last_verified`: `2026-08-24`
> - `version_scope`: `provider-neutral context architecture`
> - `source_type`: `engineering synthesis`
> - `stability`: `stable-concept`

## 1. Manifest 是装配计划，不是最终 prompt

```json
{
  "source": "repo:file:src/order.ts",
  "kind": "observation",
  "trust": "workspace-data",
  "priority": 70,
  "estimatedTokens": 820,
  "freshness": "sha256:...",
  "placement": "current-task-evidence",
  "transform": "line-range",
  "included": true,
  "reason": "symbol referenced by failing test"
}
```

Manifest 让选择可解释、可测试。字段至少覆盖 source identity、kind、trust、priority、token estimate、freshness/version、transformation、included/rejected reason。

## 2. Assembly 的确定性顺序

推荐将稳定且高权威内容放前，易变观察放后：

1. platform/system contract；
2. project/developer instructions；
3. tool schemas 与 permission summary；
4. normalized history summary；
5. current goal、constraints、acceptance；
6. selected workspace/retrieval evidence；
7. current user turn。

具体 provider 可能对 system、tool、cache block 有不同 API，适配器应保留同一 Manifest 语义，而不是把 provider 结构泄漏到业务状态。

## 3. 冲突规则

- 指令优先级由控制面确定，不由文本出现顺序决定；
- 外部网页、文件和 tool output 默认是数据，不可覆盖高优先级指令；
- 同一事实的多个版本保留 source/version，按 freshness 与 authority 选择；
- Assembly 前验证 message role、tool call/result 配对和 schema 版本。

## 4. Verification

- golden manifest：固定任务产生稳定选择；
- token regression：内容变化后预算不越界；
- injection test：文件中的“忽略规则”保持 data 身份；
- provider adapter test：tool result 与 call id 配对；
- trace 可从最终消息追溯到每个 source。
