# Agent 基础推荐阅读

## 必读

1. [Datawhale Agent Learning Hub](https://datawhalechina.github.io/Agent-Learning-Hub/)
   先看 Stage 0～1 的 checklist，明确阶段产物，而不是只收藏链接。
2. [Anthropic：Building effective agents](https://www.anthropic.com/research/building-effective-agents)
   重点理解 workflow 与 agent 的边界、prompt chaining、routing、parallelization、orchestrator-workers 与 evaluator-optimizer。
3. [OpenAI：A practical guide to building agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/)
   关注模型、工具、指令、guardrail、单 Agent 到多 Agent 的渐进设计。
4. [ReAct 论文](https://arxiv.org/abs/2210.03629)
   理解为什么推理与环境动作要交错，以及工具观察如何改变后续决策。

## 阅读时要回答的问题

- 作者所说的 “agent” 是模型、完整应用，还是运行时 Harness？
- 控制流由谁决定？
- 工具失败如何反馈？
- 终止条件和预算由谁强制？
- 文中的演示如何转成可回归测试的任务？

## 建议产出

写一页架构判断记录，至少包含：目标用户、任务、普通 Workflow 基线、需要 Agent 的理由、成功标准、工具列表、最大步数和风险动作确认点。
