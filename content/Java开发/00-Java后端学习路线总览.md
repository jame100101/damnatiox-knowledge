# Java 后端学习路线总览（2026）

> 主线版本：JDK 25 LTS。JDK 26 用于学习最新功能版本及 API；框架与依赖按项目兼容矩阵选择。路线整合本地 14 份 Java 课件、JavaDevelop 笔记、官方文档、roadmap.sh 与 JavaGuide 的学习顺序，并排除了与 Java 后端主线无关的内容。

## 1. 路线目标

完成本路线后，应能从语言和 JVM 基础出发，独立完成数据库建模、Spring Boot 服务、认证授权、缓存和消息、测试、容器化、可观测与生产发布；每一阶段都以可运行代码、测试、诊断证据和交付文档验收。

## 2. 版本基线

- **Java：** JDK 25 是当前最新 LTS，JDK 26 是当前最新功能版本。长期项目优先使用经过供应商支持的 LTS 补丁线。
- **Spring：** 新项目核对 Spring Framework 7 与 Spring Boot 4 的 Java/Servlet/Jakarta 基线；已有项目按 Spring Boot 3.5、4.0 等维护线的兼容矩阵升级。
- **构建：** Maven/Gradle Toolchain 固定编译 JDK，依赖由 BOM、版本目录或锁文件统一管理。
- **数据：** MySQL/PostgreSQL、Redis、消息系统和搜索引擎均以官方当前维护版本为准，并保留迁移与回滚测试。

## 3. 学习顺序

```mermaid
flowchart TD
  A["01 Java 基础：语法/OOP/API/集合/IO/JDBC/并发/网络"] --> B["02 工程工具与 Linux"]
  B --> C["03 数据库、Redis 与搜索"]
  C --> D["04 Spring Framework"]
  D --> E["05 Spring Boot 与 Web"]
  E --> F["06 MyBatis/JPA/事务/迁移"]
  F --> G["07 分布式与微服务"]
  G --> H["08 性能、缓存与消息队列"]
  H --> I["09 安全认证与授权"]
  I --> J["10 测试与质量工程"]
  J --> K["11 云原生、DevOps 与可观测性"]
  K --> L["12 前端与全栈交付"]
  L --> M["13 项目阶梯与验收"]
```

### 阶段一：语言与标准库

逐章完成 14 份课件对应文档。重点不是背 API，而是类型系统、对象模型、异常契约、集合复杂度、资源生命周期、JDBC 事务、Java Memory Model、线程协调和网络协议。

### 阶段二：单体服务工程能力

掌握 Git、Maven/Gradle、Linux、Docker、SQL、索引、事务、Redis；用 Spring Framework、Spring Boot、MVC、MyBatis/JPA 构建结构清晰、可测试的模块化单体。

### 阶段三：生产与分布式能力

先学习部分失败、CAP/一致性和幂等，再引入服务发现、RPC、网关、限流、消息队列、分布式事务、缓存和分片。每次拆分都需说明组织边界、数据所有权和运维收益。

### 阶段四：质量和交付

以测试金字塔、契约测试、Testcontainers、性能测试、安全验证、容器、Kubernetes、CI/CD、OpenTelemetry 和 SLO 形成上线闭环。

## 4. 每阶段统一验收

1. **知识：** 能解释术语、前提、失败模式和技术边界。
2. **代码：** 有最小示例、自动化测试、静态检查和可重复构建。
3. **数据：** 有 schema、迁移、执行计划、事务和恢复设计。
4. **运行：** 有配置、日志、指标、trace、health、容量和告警。
5. **安全：** 有身份、授权、输入、秘密、依赖和审计检查。
6. **交付：** 有镜像、部署、回滚、runbook 和故障演练证据。

## 5. 推荐学习节奏

| 周期 | 内容 | 可验证交付 |
|---|---|---|
| 1–6 周 | Java 基础、集合、IO、JDBC、并发、网络 | 命令行工具、并发任务器、JDBC 小项目 |
| 7–10 周 | 工具、Linux、数据库、Redis | 可复现构建、SQL 调优报告、缓存实验 |
| 11–16 周 | Spring、Boot、Web、MyBatis/JPA | 模块化 REST 服务与集成测试 |
| 17–22 周 | 分布式、网关、消息、高性能 | Outbox、幂等消费、容量与故障报告 |
| 23–26 周 | 安全、测试、云原生、可观测 | OIDC 服务、K8s 部署、SLO 仪表盘 |
| 持续 | 项目阶梯 | 可演示、可部署、可复盘的作品集 |

## 6. 正确性校验方法

- 语言规则以 JLS/JVMS 和 Java API 为准；框架行为以当前 reference 与源码测试为准。
- 数据库结论使用真实 schema、数据分布和 `EXPLAIN ANALYZE` 验证。
- 分布式结论必须声明故障模型、超时、重试、交付和一致性范围。
- 性能结论给出环境、负载、分位数、资源和剖析证据。
- 安全结论转成越权、重放、注入、泄露和依赖测试。

## 参考路线

- [Oracle Java Downloads](https://www.oracle.com/java/technologies/downloads/)
- [Spring Boot Reference](https://docs.spring.io/spring-boot/reference/)
- [roadmap.sh Backend Roadmap](https://roadmap.sh/backend)
- [roadmap.sh Spring Boot Roadmap](https://roadmap.sh/spring-boot)
- [JavaGuide Java 学习路线](https://javaguide.cn/roadmap/java-roadmap.html)
