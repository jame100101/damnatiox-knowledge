# Java 后端工程学习路线（2026）

> **Freshness metadata**
> - `last_verified`: `2026-08-24`
> - `version_scope`: `JDK 25 LTS baseline; JDK 26 feature release; Spring Boot 4.x`
> - `source_type`: `official-spec + official-docs`
> - `stability`: `version-sensitive`

这条路线遵循：

```text
Java Fundamentals
      ↓
Build a Service
      ↓
Test & Secure It
      ↓
Design Its Architecture
      ↓
Add Infrastructure When Needed
      ↓
Scale to Distributed Systems
      ↓
Operate It in Production
```

## 主线

1. **Java 语言与核心 API**：语法、OOP、异常、String、集合、泛型、反射、I/O/NIO、JDBC basics。
2. **JVM 与并发**：runtime、memory、class loading、bytecode、JIT、GC、JMM、threads、executors、locks、atomic、CompletableFuture、virtual threads、JFR 与诊断。
3. **工程与 Internet/Linux**：构建、Git、Shell、Docker basics，以及 HTTP 请求从 DNS/TCP/TLS 到 Spring Controller 的路径。
4. **关系型数据库**：SQL、schema、index、execution plan、transaction、isolation、locking、MVCC、MySQL/InnoDB、PostgreSQL。
5. **Spring Framework → Spring Boot/Web → 数据访问/事务**：先理解容器与 Web 请求，再选择 JDBC/MyBatis/JPA。
6. **测试 → 安全 → 应用架构**：模块化单体是核心毕业点；在微服务之前建立行为边界、身份边界和事务边界。
7. **按需基础设施**：缓存/搜索、消息/事件、分布式/微服务、性能、云原生与可观测性。
8. **可选专项**：前端全栈、MongoDB、算法/设计模式、Spring AI。
9. **项目阶梯 P0–P8**：P4 Secure Modular Monolith 是主线毕业点；后续属于扩展与生产专项。
10. **开源架构研究**：固定 commit，区分 confirmed、inference、unknown。

## 顺序约束

- Redis 和 Elasticsearch 不是数据库入门前置；MongoDB 不是所有 Java 后端项目必修。
- Spring Boot 是对 Spring 应用的自动配置、依赖管理和运行/运维体验，不是“Spring 的升级版”。
- 微服务是组织、部署、数据所有权与故障隔离的 trade-off，不是单体的高级形态。
- 虚拟线程主要降低高并发阻塞型任务的线程成本；不要把它表述为每个任务执行更快。
- OAuth 2.0 是授权框架；OIDC 在其上提供身份层；JWT 是令牌格式，不是登录系统。

## 学习闭环

每阶段都交付 `code + tests + architecture note + failure simulation + observability evidence`。版本相关事实集中在同级《Version Baseline 与 Compatibility Matrix》，概念文档只保留 `version_scope` 与复查日期。
