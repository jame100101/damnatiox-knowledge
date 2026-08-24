# Spring Petclinic 架构研究入口

> **Freshness metadata**
> - `last_verified`: `2026-08-24`
> - `version_scope`: `88e37c15cf6fc8490b01bc3e8e2c800cec1ac272`
> - `source_type`: `official-repository`
> - `stability`: `fast-moving`

## Research identity

- **Repository**: [spring-projects/spring-petclinic](https://github.com/spring-projects/spring-petclinic)
- **Commit**: [`88e37c15cf6fc8490b01bc3e8e2c800cec1ac272`](https://github.com/spring-projects/spring-petclinic/tree/88e37c15cf6fc8490b01bc3e8e2c800cec1ac272)
- **Research date**: `2026-08-24`
- **Purpose**: 学习单体 Spring Boot MVC、persistence 与 test 的清晰小型结构。

## Architecture / module map

关注 application entry、owner/vet/visit 等领域包、web controller、repository 与 test source set。

## Entry points / request-data flow

从 PetClinicApplication 启动，沿 owner 查询/编辑请求追踪 MVC mapping、validation、service/repository 与数据库。

## Patterns worth learning

小型 vertical slice、表单校验、repository test、profile/config 的可读组合。

## Patterns not to copy blindly

示例规模、领域和安全要求有限；不要直接当生产脚手架。

## Evidence status

- **CONFIRMED**：仓库身份、commit 以及本文链接到的公开目录/入口；结论只覆盖该快照。
- **INFERENCE**：模块责任和 flow 由静态目录、依赖与命名推断，需通过测试/运行 trace 复核。
- **UNKNOWN**：特定 profile、数据库实现与最新 UI 构建在所有发行渠道中的差异。

## 阅读任务

1. 在固定 commit 建立 module/dependency map；
2. 从启动入口跟踪一条请求到持久化或外部系统；
3. 选择一个成功测试和一个失败/安全测试；
4. 记录 transaction、identity、error、observability 与 deployment boundary；
5. 输出可定位文件/符号的笔记，不用 stars 代替技术证据。
