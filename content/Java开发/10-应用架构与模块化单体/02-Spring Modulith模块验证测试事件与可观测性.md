# Spring Modulith：模块验证、集成测试、事件与可观测性

> **Freshness metadata**
> - `last_verified`: `2026-08-24`
> - `version_scope`: `spring-projects/spring-modulith at fc0a547c05dfd240d23c32f3fbb9fa45283af21f`
> - `source_type`: `official-repository + official-docs`
> - `stability`: `fast-moving`

Spring Modulith 基于 Spring Boot 应用的 package 结构发现 application modules，并提供 module verification、module-focused integration testing、运行时观察与 event publication 能力。它帮助验证模块化单体，不会自动替你定义正确业务边界。

## 关键能力

- ApplicationModules：检查 cycles、模块 API 访问与可选规则；
- `@ApplicationModuleTest`：限制/引导模块集成测试范围；
- module observability：让模块交互映射到运行时观察；
- event publication registry：记录事件发布状态，支持失败后的补偿/重发思路；
- externalization：按具体版本/模块把内部事件交给外部 broker。

## 边界

模块事件与数据库事务要明确：同步 listener 可参与当前事务；异步 listener 产生新的失败窗口；可靠跨进程发布使用 transactional outbox/event publication，而不是假设一次方法调用和 broker publish 原子完成。

先在单 JVM 内验证 module API、transaction 与 events；只有在组织/部署/数据所有权收益明确时再把同一边界物理拆分。
