# Agent Benchmark Map：测量对象、环境、信号与限制

> **Freshness metadata**
> - `last_verified`: `2026-08-24`
> - `version_scope`: `benchmark definitions verified 2026-08-24`
> - `source_type`: `official-benchmark + primary-paper`
> - `stability`: `version-sensitive`

| Benchmark | What It Measures | Environment | Success Signal | 主要限制 | 适合 |
|---|---|---|---|---|---|
| SWE-bench | 对真实 issue 修改仓库 | 固定 repo/container/test patch | 相关测试通过 | 数据污染、版本/容器成本、通过不代表补丁质量完整 | SWE/Coding Agent |
| Terminal-Bench | 在终端环境完成长任务 | 容器/终端与验证脚本 | deterministic task verifier | 任务覆盖与环境镜像影响外推 | shell/computer-use Agent |
| GAIA | 需要推理、检索与工具的现实问题 | web/file/tool 组合 | final answer exact/judged | web 漂移、答案型任务不等于生产副作用 | general assistant Agent |
| OSWorld | GUI 操作系统任务 | 可重置桌面 VM、视觉/无障碍状态 | task-specific state checker | UI 漂移、执行慢、可重复性成本高 | computer-use Agent |
| WebArena | 真实风格网站中的端到端任务 | 自托管网站与浏览器 | URL/DOM/backend state evaluator | 站点集合有限、视觉与浏览器差异 | web Agent |
| tau-bench | 对话式 tool-agent 与 policy 执行 | 用户模拟器、工具、领域 policy | task success + policy compliance | 模拟用户/领域分布与真实流量不同 | customer-service/tool Agent |

## 使用原则

1. Benchmark 分数不是产品成功率；先映射到真实任务、权限和失败成本。
2. 固定 benchmark commit、数据版本、环境镜像、模型、sampling、tool schema 和最大预算。
3. 同时报告 success、cost、latency、steps、invalid actions、policy violations，并给置信区间。
4. 对可确定任务优先 deterministic validator；LLM judge 记录 rubric、模型版本、顺序偏差和人工抽检。
5. 防止测试集进入 prompt、memory 或检索库；区分开发集、回归集和隐藏集。

## 产品评测映射

先为产品定义 `Task + Environment + Initial State + Allowed Actions + Success State + Budget`，再选择 benchmark 作外部对照。生产回归应保留真实脱敏失败 case，而不是只追逐公开榜单。
