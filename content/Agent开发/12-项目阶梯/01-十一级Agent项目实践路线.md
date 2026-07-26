# 十一级 Agent 项目实践路线

## Level 1：Calculator Agent

实现最小 tool call loop。验收：结构化参数、非法表达式处理、最大步骤、固定算例。

## Level 2：Web Research Agent

实现搜索、来源筛选、证据保存和带引用总结。验收：关键陈述引用真实来源，空结果有恢复。

## Level 3：PDF QA Agent

实现解析、chunk、embedding、retrieval、citation。验收：标注问题集上的 Recall@K 与引用正确率。

## Level 4：Coding Review Agent

读取 diff、定位文件、风险排序、给出测试建议。验收：只基于真实 diff，不虚构行号，有严重度 rubric。

## Level 5：Browser Agent

观察页面、定位、点击、提取、失败恢复。验收：保存 DOM、截图和动作日志，处理弹窗与加载失败。

## Level 6：Claude Code-like Nano Agent

加入 shell、文件编辑、测试、workspace 边界、session 和 compact。验收：能修改小仓库并用测试验证。

## Level 7：OpenClaw-like Gateway

加入 channel、routing、session、memory、heartbeat、delivery 和 concurrency。验收：消息可恢复、不重复投递、长任务有心跳。

## Level 8：Reusable Skill Pack

编写多个 `SKILL.md`，带脚本、模板、触发条件和 smoke test。验收：有 Skill 相比无 Skill 提高固定任务成功率。

## Level 9：Multi-Agent Writer

实现 planner、researcher、writer、reviewer。验收：schema、预算、停止条件明确，并与单 Agent 基线比较。

## Level 10：Personal Agent

加入跨会话 memory、skills 和消息入口。验收：scope、来源、TTL、删除和隐私控制完整。

## Level 11：Production Harness

补齐 eval、trace、权限、CI、runner、回放、成本和部署。验收：另一位开发者可以 clone、配置、运行、调试和回滚。

## 建议节奏

每一级保留：

```text
README
architecture.md
eval/cases.json
traces/sample-run.json
failures.md
CHANGELOG.md
```

升级前记录上一版基线；新能力必须通过同一任务集证明收益。项目之间尽量复用 ToolResult、EvidenceItem、ValidationResult 和 SessionState 契约。

## 路线来源

- [Datawhale Agent Learning Hub - Project Ladder](https://github.com/datawhalechina/Agent-Learning-Hub)
