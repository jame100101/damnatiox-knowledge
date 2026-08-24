# Spring Modulith 架构研究入口

> **Freshness metadata**
> - `last_verified`: `2026-08-24`
> - `version_scope`: `fc0a547c05dfd240d23c32f3fbb9fa45283af21f`
> - `source_type`: `official-repository`
> - `stability`: `fast-moving`

## Research identity

- **Repository**: [spring-projects/spring-modulith](https://github.com/spring-projects/spring-modulith)
- **Commit**: [`fc0a547c05dfd240d23c32f3fbb9fa45283af21f`](https://github.com/spring-projects/spring-modulith/tree/fc0a547c05dfd240d23c32f3fbb9fa45283af21f)
- **Research date**: `2026-08-24`
- **Purpose**: 研究 application module、verification、module test、observability、event publication 与 externalization。

## Architecture / module map

从核心 API、runtime、test、observability、events 与 examples/documentation 模块建立依赖图。

## Entry points / request-data flow

选择一个 sample，跟踪 module discovery→verification→@ApplicationModuleTest→event publication registry。

## Patterns worth learning

用可执行规则守住模块边界；把事件可靠性与模块交互纳入测试/观察。

## Patterns not to copy blindly

框架不会自动产生正确 bounded context；不要为使用 annotation 而制造模块。

## Evidence status

- **CONFIRMED**：仓库身份、commit 以及本文链接到的公开目录/入口；结论只覆盖该快照。
- **INFERENCE**：模块责任和 flow 由静态目录、依赖与命名推断，需通过测试/运行 trace 复核。
- **UNKNOWN**：各模块在所选 Boot line 的精确兼容性和 optional integration 默认行为。

## 阅读任务

1. 在固定 commit 建立 module/dependency map；
2. 从启动入口跟踪一条请求到持久化或外部系统；
3. 选择一个成功测试和一个失败/安全测试；
4. 记录 transaction、identity、error、observability 与 deployment boundary；
5. 输出可定位文件/符号的笔记，不用 stars 代替技术证据。
