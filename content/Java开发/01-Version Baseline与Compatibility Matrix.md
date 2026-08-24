# Java Backend Version Baseline 与 Compatibility Matrix

> **Freshness metadata**
> - `last_verified`: `2026-08-24`
> - `version_scope`: `verified 2026-08-24`
> - `source_type`: `official-JEP + official-project-docs`
> - `stability`: `fast-moving`

## 1. 状态词

| 状态 | 含义 |
|---|---|
| LTS | 由具体 vendor 提供长期支持；OpenJDK 六个月发布节奏本身不承诺所有发行版的相同支持期 |
| feature release | 六个月功能发布；后续由新 feature release 取代 |
| GA | 正式发布，可用于生产评估；仍需 vendor 与依赖支持 |
| milestone / RC | 预发布，不作为默认生产基线 |
| preview | API/语言特性可能变化，编译与运行通常需 `--enable-preview` |
| incubator | 非永久 API 模块，命名和设计仍可变化 |
| deprecated / EOL | 计划移除或已结束维护；必须有迁移计划 |

## 2. 2026-08-24 基线

| Component | 教学/项目基线 | 当前状态与约束 |
|---|---|---|
| Java | JDK 25 | 作为本路线 LTS 主线；确认所选发行商支持周期 |
| Java current feature | JDK 26 | 2026-03 feature release；用于理解新特性，不替换项目稳定性评估 |
| Virtual Threads | Java 21+ | stable；适合 thread-per-request 的阻塞 I/O 可扩展性 |
| Scoped Values | Java 25+ | JEP 506 delivered；用于有界、只读式上下文传播 |
| Structured Concurrency | JDK 26 | JEP 525，Sixth Preview；需要 preview flags，不写成稳定 API |
| Spring Boot | 4.1.x GA line | 官方 4.1.0 于 2026-06 GA，当前 reference 要求 Java 17+，兼容到 Java 26 |
| Spring Framework | 7.0.x line | Boot 4.1 reference 的最低 Framework 版本由 Boot 管理，应用不手工混配 |
| Servlet | 6.1 baseline | Boot 4.1 支持 Tomcat 11/Jetty 12.1 等 Servlet 6.1 容器；包名使用 `jakarta.*` |
| Spring Cloud | 2025.1 Oakwood | 官方矩阵对应 Boot 4.0.x；不要假定对 Boot 4.1 的组合兼容 |
| Spring Cloud Alibaba | 2025.1.x | 官方分支对应 Spring Cloud 2025.1.x / Boot 4.0.x / JDK 17+ |
| Spring AI | 2.0 line | 2026-06 GA；fast-moving，可选专项，按官方 BOM 管理 |

> Spring Boot 4.1 与 Spring Cloud 2025.1 不是已验证组合。需要 Spring Cloud 时以其 Supported Versions 为上限选择 Boot，或等待官方兼容矩阵更新。

## 3. 版本选择流程

1. 选 vendor JDK 并确认支持期；
2. 选 Boot GA line；
3. 若使用 Spring Cloud/Alibaba，反向检查官方 release train matrix；
4. 用 BOM 管理模块，不手工拼接 patch；
5. 检查 CVE、deprecated modules、EOL 与数据库驱动；
6. 在 CI 测试目标 JDK、容器和数据库组合；
7. 把实际版本写入构建文件与 SBOM，不散落在概念文章。

## 4. 官方来源

- [OpenJDK JDK 25](https://openjdk.org/projects/jdk/25/)
- [OpenJDK JDK 26](https://openjdk.org/projects/jdk/26/)
- [JEP 506: Scoped Values](https://openjdk.org/jeps/506)
- [JEP 525: Structured Concurrency (Sixth Preview)](https://openjdk.org/jeps/525)
- [Spring Boot system requirements](https://docs.spring.io/spring-boot/system-requirements.html)
- [Spring Cloud supported versions](https://github.com/spring-cloud/spring-cloud-release/wiki/Supported-Versions)
- [Spring Cloud Alibaba repository](https://github.com/alibaba/spring-cloud-alibaba)
- [Spring AI reference](https://docs.spring.io/spring-ai/reference/)
