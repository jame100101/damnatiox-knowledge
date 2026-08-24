# Model Post-training：Agent 工程的可选高级轨道

> **Freshness metadata**
> - `last_verified`: `2026-08-24`
> - `version_scope`: `2026 post-training concepts`
> - `source_type`: `primary-paper + official-research`
> - `stability`: `version-sensitive`

## 1. 先区分两条改进路径

| Harness Improvement | Model Improvement |
|---|---|
| context selection、tools、permissions、retry、validator、workflow | 改变模型参数或专门适配器 |
| 迭代快、可解释、容易回滚 | 需要数据、训练算力、模型评测与部署 |
| 适合工具错误、状态与控制问题 | 适合稳定重复的模型能力缺口 |

构建 Agent 并不要求训练模型。多数早期失败应先定位是否由缺失 context、schema、runtime、permission、validation 或预算造成。

## 2. 方法

- SFT：从高质量输入—目标轨迹学习行为；
- Preference optimization：从偏好对/排序优化输出选择；
- RL / Agentic RL：在环境交互中根据 reward 优化策略；
- Tool-use training：训练 tool selection、argument、result interpretation；
- Trajectory data：包含 observation/action/result/credit，而不只是最终答案。

## 3. 难点

Reward 可能被投机；长轨迹 credit assignment 困难；环境不确定导致高方差；离线数据混入旧 tool schema；训练成功不代表安全权限正确。必须保留训练/验证/隐藏评测隔离，并在真实 Harness 中端到端测试。
