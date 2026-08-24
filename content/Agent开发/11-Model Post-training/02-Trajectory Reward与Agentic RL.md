# Trajectory、Reward、Environment 与 Agentic RL

> **Freshness metadata**
> - `last_verified`: `2026-08-24`
> - `version_scope`: `fast-moving research area`
> - `source_type`: `primary-paper`
> - `stability`: `fast-moving`

## 数据单位

一条 trajectory 应关联 task/environment version，并按步骤保存 observation、model decision、tool invocation、runtime result、state transition、cost、终止原因和最终 validator。删除 secret 与用户标识；无效/失败轨迹也有价值，但需准确标注。

## Reward 与 credit

- outcome reward：最终测试通过，信号清晰但稀疏；
- process reward：中间步骤质量，密集但可能引入 evaluator 偏差；
- constraint penalty：越权、超预算、无效调用；
- multi-objective：成功、成本、延迟、安全不能随意压成未经解释的单一分数。

Credit assignment 要判断哪些动作真正导致结果。长任务中可使用分段 validator、subgoal evidence 或 counterfactual/ablation，但评测协议必须固定。

## Production boundary

训练 environment 与生产 tool/runtime 存在 distribution shift。上线前用固定 Harness、真实 schema、permission gate、延迟与错误注入做回归；模型仍不拥有最终授权。
