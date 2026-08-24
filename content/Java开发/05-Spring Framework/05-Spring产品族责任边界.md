# Spring Framework、Boot、MVC、Data 与 Cloud 的责任边界

> **Freshness metadata**
> - `last_verified`: `2026-08-24`
> - `version_scope`: `Spring Framework 7 / Spring Boot 4 lines`
> - `source_type`: `Spring official reference`
> - `stability`: `version-sensitive`

| 项目 | 主要责任 | 不是 |
|---|---|---|
| Spring Framework | IoC/DI、AOP、transactions、events、resource、validation、web foundation | 自动选择所有应用依赖 |
| Spring Boot | opinionated auto-configuration、starter/BOM、external config、embedded runtime、Actuator | Spring Framework 的“升级版” |
| Spring MVC | Servlet 栈的 HTTP request/handler/response 模型 | reactive runtime |
| Spring Data | repository abstractions 与不同数据技术集成 | 单一 ORM 或数据库 |
| Spring Cloud | 分布式系统常见模式的项目集合与 release train | 微服务必需品 |

Boot 根据 classpath、properties 和条件创建/调整 bean；用户定义 bean 可使条件 back off。理解 `ConditionEvaluationReport` 比背自动配置类名更持久。Spring Cloud 必须按 Boot compatibility matrix 选 release train，不能只把 BOM 版本改到“最新”。
