# JIT Retrieval 与 Progressive Disclosure

> **Freshness metadata**
> - `last_verified`: `2026-08-24`
> - `version_scope`: `stable retrieval patterns`
> - `source_type`: `engineering synthesis`
> - `stability`: `stable-concept`

**JIT Retrieval** 在产生具体信息需求后再检索；**Progressive Disclosure** 先暴露能力摘要或目录，再按选择加载细节。二者都减少“把整个仓库、所有 Skill、全部历史塞进 prompt”的噪声。

## 最小流程

1. 在 manifest 中注册可检索源的 summary 与 locator；
2. 模型或确定性 planner 形成 information need；
3. retrieval policy 检查权限、范围和预算；
4. 先返回索引/候选，再读取最相关细节；
5. 保存 query、结果、未选原因和 citation；
6. 任务转移后从活跃 context 淘汰，但保留 trace 引用。

## 适用边界

- 适合大型代码库、技能库、文档库和远程工具目录；
- 小型固定 prompt 的额外检索延迟可能大于收益；
- 检索召回不足时，progressive loading 会“看不见”关键资料，需 fallback search；
- 结果仍是 data，需做 injection/trust 处理；
- retrieval query 可能泄漏敏感目标，需最小化与审计。

## 验证

建立 information-need 数据集，测 recall@k、最终任务成功率、加载 token、检索轮次与延迟；不要只优化向量相似度。
