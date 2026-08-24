# JDBC vs MyBatis vs JPA：按问题选择数据访问方式

> **Freshness metadata**
> - `last_verified`: `2026-08-24`
> - `version_scope`: `Spring 7 / Boot 4 ecosystem`
> - `source_type`: `official-docs + engineering synthesis`
> - `stability`: `version-sensitive`

| 维度 | JDBC / JdbcClient | MyBatis | JPA/Hibernate |
|---|---|---|---|
| 控制 | SQL 与 mapping 显式 | SQL 显式、mapping 辅助 | entity/unit-of-work 抽象 |
| 适合 | 简单服务、批量、精确 SQL | SQL 复杂、团队偏 SQL | 聚合生命周期、关系映射、领域模型 |
| 主要成本 | 样板与 mapping | 动态 SQL/mapper 维护 | persistence context、fetch、N+1、映射复杂度 |
| 性能认知 | 仍取决于 SQL/DB/网络 | 同左 | 需要理解 flush、fetch plan、batch |
| 测试 | repository integration test | mapper + real DB | mapping/query + real DB |

## JDBC 最小安全示例

```java
String sql = "select id, name from customer where email = ?";
return jdbcClient.sql(sql)
    .param(email)
    .query(CustomerRow.class)
    .optional();
```

参数绑定处理值，表名/排序字段等 SQL identifier 需要 allowlist，不能直接拼接用户输入。

## 决策顺序

先列业务查询、写入不变量、批量、锁、数据库特性、团队经验与迁移成本；做一个真实 vertical slice；用 integration test 与执行计划比较。一个系统可在边界内混用，但同一聚合避免多个抽象争夺事务与状态管理。

## 共同生产边界

连接池、transaction timeout、migration（Flyway/Liquibase）、pagination、N+1 检查、optimistic/pessimistic locking、batch、SQL observability 与真实数据库 Testcontainers。
