# Keycloak 架构研究入口

> **Freshness metadata**
> - `last_verified`: `2026-08-24`
> - `version_scope`: `97ae0a6f456d59db3d2f93bba91c52a2413abda7`
> - `source_type`: `official-repository`
> - `stability`: `fast-moving`

## Research identity

- **Repository**: [keycloak/keycloak](https://github.com/keycloak/keycloak)
- **Commit**: [`97ae0a6f456d59db3d2f93bba91c52a2413abda7`](https://github.com/keycloak/keycloak/tree/97ae0a6f456d59db3d2f93bba91c52a2413abda7)
- **Research date**: `2026-08-24`
- **Purpose**: 定向研究大型 IAM、OAuth 2.0/OIDC、realm、authentication flow、token 与扩展 SPI。

## Architecture / module map

只阅读启动/runtime、services、model、server SPI、protocol 与选定测试，不要求初学者通读仓库。

## Entry points / request-data flow

选择 authorization-code flow：浏览器请求→realm/client validation→authentication flow→code/token；记录 session 与 key boundary。

## Patterns worth learning

身份协议状态机、扩展 SPI、大型安全测试与配置迁移。

## Patterns not to copy blindly

身份服务器安全边界复杂；不要复制内部实现自制 OAuth/OIDC server。

## Evidence status

- **CONFIRMED**：仓库身份、commit 以及本文链接到的公开目录/入口；结论只覆盖该快照。
- **INFERENCE**：模块责任和 flow 由静态目录、依赖与命名推断，需通过测试/运行 trace 复核。
- **UNKNOWN**：产品发行版、企业扩展、部署与运营默认值不由源码快照完全说明。

## 阅读任务

1. 在固定 commit 建立 module/dependency map；
2. 从启动入口跟踪一条请求到持久化或外部系统；
3. 选择一个成功测试和一个失败/安全测试；
4. 记录 transaction、identity、error、observability 与 deployment boundary；
5. 输出可定位文件/符号的笔记，不用 stars 代替技术证据。
