# Spring Boot 与 Web 开发推荐阅读

Spring Boot 负责约定、自动配置、依赖管理、可执行应用和生产能力；Web 层仍建立在 HTTP、Servlet 或 Reactive 语义上。

## 官方资料优先顺序

- [Spring Boot 4.1 Reference](https://docs.spring.io/spring-boot/reference/)
- [Spring MVC Reference](https://docs.spring.io/spring-framework/reference/web/webmvc.html)
- [Spring Boot Actuator](https://docs.spring.io/spring-boot/reference/actuator/)
- [Jakarta Servlet Specification](https://jakarta.ee/specifications/servlet/)

## 阅读方法

1. 先阅读概念与快速开始，建立最小可运行闭环。
2. 再阅读 reference 中与当前项目直接相关的章节，记录默认值、异常语义和版本要求。
3. 每个关键结论都用最小 Demo、自动化测试或执行计划验证。
4. 升级时重新阅读 migration/release notes，避免把某个版本的默认行为当作永久契约。
5. 博客和视频用于补充视角，最终以规范、官方文档和可重复实验校准。
