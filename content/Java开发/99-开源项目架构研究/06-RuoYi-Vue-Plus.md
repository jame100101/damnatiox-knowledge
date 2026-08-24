# RuoYi-Vue-Plus 架构研究入口

> **Freshness metadata**
> - `last_verified`: `2026-08-24`
> - `version_scope`: `b37db3fd01a89bd4f296b07e1910209a5e3b305d`
> - `source_type`: `official-repository`
> - `stability`: `fast-moving`

## Research identity

- **Repository**: [dromara/RuoYi-Vue-Plus](https://github.com/dromara/RuoYi-Vue-Plus)
- **Commit**: [`b37db3fd01a89bd4f296b07e1910209a5e3b305d`](https://github.com/dromara/RuoYi-Vue-Plus/tree/b37db3fd01a89bd4f296b07e1910209a5e3b305d)
- **Research date**: `2026-08-24`
- **Purpose**: 观察国内后台系统、多租户、MyBatis-Plus、权限与 Vue 协作的工程组合。

## Architecture / module map

建立 application/common/modules、权限、多租户、数据访问与前端接口的实际快照地图；以仓库结构为准。

## Entry points / request-data flow

选择登录和一个 CRUD：controller→authorization→service→mapper→tenant/data permission→response。

## Patterns worth learning

后台系统的权限粒度、租户上下文、审计、代码组织与工程工具。

## Patterns not to copy blindly

模板功能很多；按业务 threat model 删除未用能力，不把默认角色/租户/数据权限当通用正确答案。

## Evidence status

- **CONFIRMED**：仓库身份、commit 以及本文链接到的公开目录/入口；结论只覆盖该快照。
- **INFERENCE**：模块责任和 flow 由静态目录、依赖与命名推断，需通过测试/运行 trace 复核。
- **UNKNOWN**：配套前端版本、扩展模块和文档站点与此 commit 的精确一致性。

## 阅读任务

1. 在固定 commit 建立 module/dependency map；
2. 从启动入口跟踪一条请求到持久化或外部系统；
3. 选择一个成功测试和一个失败/安全测试；
4. 记录 transaction、identity、error、observability 与 deployment boundary；
5. 输出可定位文件/符号的笔记，不用 stars 代替技术证据。
