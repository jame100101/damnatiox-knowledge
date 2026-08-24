# JHipster Generator 架构研究入口

> **Freshness metadata**
> - `last_verified`: `2026-08-24`
> - `version_scope`: `f9d0f75c20ebf5f367fe91e0ebb68ccbbd25e15d`
> - `source_type`: `official-repository`
> - `stability`: `fast-moving`

## Research identity

- **Repository**: [jhipster/generator-jhipster](https://github.com/jhipster/generator-jhipster)
- **Commit**: [`f9d0f75c20ebf5f367fe91e0ebb68ccbbd25e15d`](https://github.com/jhipster/generator-jhipster/tree/f9d0f75c20ebf5f367fe91e0ebb68ccbbd25e15d)
- **Research date**: `2026-08-24`
- **Purpose**: 观察 Spring Boot + frontend + cloud/deployment 的产品化代码生成组合。

## Architecture / module map

关注 generators、options/model、templates、blueprints 与测试 fixture；生成器本身和生成项目是两层产品。

## Entry points / request-data flow

从配置/CLI 进入 generator composition，再定位模板与 post-process；对一个选项比较生成 diff。

## Patterns worth learning

可重复 scaffolding、技术选项矩阵、模板测试与升级思路。

## Patterns not to copy blindly

大矩阵带来复杂度；生成代码不是架构决策的替代，也不应全部保留未用组件。

## Evidence status

- **CONFIRMED**：仓库身份、commit 以及本文链接到的公开目录/入口；结论只覆盖该快照。
- **INFERENCE**：模块责任和 flow 由静态目录、依赖与命名推断，需通过测试/运行 trace 复核。
- **UNKNOWN**：每个 blueprint 和部署目标的支持状态与生成项目运行时行为。

## 阅读任务

1. 在固定 commit 建立 module/dependency map；
2. 从启动入口跟踪一条请求到持久化或外部系统；
3. 选择一个成功测试和一个失败/安全测试；
4. 记录 transaction、identity、error、observability 与 deployment boundary；
5. 输出可定位文件/符号的笔记，不用 stars 代替技术证据。
