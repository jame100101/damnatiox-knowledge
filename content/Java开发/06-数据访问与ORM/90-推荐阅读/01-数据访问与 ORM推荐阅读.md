# 数据访问与 ORM推荐阅读

本阶段从 JDBC 连接池出发，比较 SQL Mapper 与 ORM 的抽象边界，并把事务、迁移、查询性能纳入同一设计。

## 官方资料优先顺序

- [MyBatis 3 Reference](https://mybatis.org/mybatis-3/)
- [Spring Data JPA Reference](https://docs.spring.io/spring-data/jpa/reference/jpa.html)
- [Hibernate ORM Documentation](https://hibernate.org/orm/documentation/)
- [Flyway Documentation](https://documentation.red-gate.com/flyway)
- [HikariCP](https://github.com/brettwooldridge/HikariCP)

## 阅读方法

1. 先阅读概念与快速开始，建立最小可运行闭环。
2. 再阅读 reference 中与当前项目直接相关的章节，记录默认值、异常语义和版本要求。
3. 每个关键结论都用最小 Demo、自动化测试或执行计划验证。
4. 升级时重新阅读 migration/release notes，避免把某个版本的默认行为当作永久契约。
5. 博客和视频用于补充视角，最终以规范、官方文档和可重复实验校准。
