# Spring Framework推荐阅读

Spring 的核心是 IoC 容器、代理式 AOP、一致的数据访问/事务抽象和 Web 编程模型。

## 官方资料优先顺序

- [Spring Framework Reference](https://docs.spring.io/spring-framework/reference/)
- [Spring Core Technologies](https://docs.spring.io/spring-framework/reference/core.html)
- [Spring Transaction Management](https://docs.spring.io/spring-framework/reference/data-access/transaction.html)
- [Spring Testing](https://docs.spring.io/spring-framework/reference/testing.html)

## 阅读方法

1. 先阅读概念与快速开始，建立最小可运行闭环。
2. 再阅读 reference 中与当前项目直接相关的章节，记录默认值、异常语义和版本要求。
3. 每个关键结论都用最小 Demo、自动化测试或执行计划验证。
4. 升级时重新阅读 migration/release notes，避免把某个版本的默认行为当作永久契约。
5. 博客和视频用于补充视角，最终以规范、官方文档和可重复实验校准。
