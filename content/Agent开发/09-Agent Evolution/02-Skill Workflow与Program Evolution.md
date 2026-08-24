# Skill、Workflow 与 Program Evolution

> **Freshness metadata**
> - `last_verified`: `2026-08-24`
> - `version_scope`: `fast-moving research patterns`
> - `source_type`: `primary-paper + official-repository`
> - `stability`: `fast-moving`

## 候选更新包

一个候选不是“新文本”，而是：`diff + rationale + source traces + permissions + tests + expected metric change + rollback plan`。

### Skill

从重复成功轨迹提取步骤时，先去除 secret、临时路径和单任务偶然条件；写入 version、capability、preconditions、side effects 与 smoke tests。Skill discovery 指标要测是否在正确任务加载，而不只是内容正确。

### Workflow

候选可修改 node、transition、retry、approval 或 compensation。使用模型生成候选时，workflow engine 仍只接受通过 schema 和静态检查的版本。比较 dead-end、平均步骤、恢复率和人工接管率。

### Program

自动改代码沿用软件交付纪律：isolated branch/worktree、tests、lint/typecheck、dependency review、diff limit、code owner、canary。禁止候选代码直接获得生产 credential。

## 参考实现的阅读方式

Hermes Agent、OpenClaw 及 Darwin Skill、EvoSkill、Agent Lightning 等方向可用于发现机制，但先确认具体项目版本、论文与代码是否仍维护。把其 confirmed implementation、论文 proposal 与本仓库 inference 分栏记录，不把项目口号当评测结论。
