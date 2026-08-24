# 数据库原理与 SQL：模型、约束、查询、事务与执行计划

先掌握关系模型、约束、范式、SQL 和事务，再学习具体数据库或 ORM，才能判断数据是否正确而不仅是“接口返回了 200”。

## 1. 本文覆盖范围

- 关系、键、约束、范式与反范式
- DDL/DML、JOIN、聚合、窗口函数和子查询
- ACID、隔离异常、锁与 MVCC
- 索引、统计信息、执行计划与迁移

## 2. 核心知识详解

### 1. 关系模型与约束

表表示关系，行是元组，列有域；主键标识行，唯一、非空、检查、外键把业务不变量下沉到数据库。规范化减少更新异常，受控反范式用额外维护成本换读取效率。

- 先定义业务键、生命周期和删除语义，再选代理主键。
- 数据库约束与应用校验互补：前者保护所有写入路径，后者提供友好错误。
- 时区、金额、枚举和 JSON 字段都要有明确数据契约。

**正确性边界：** 外键不是天然性能灾难；是否使用取决于一致性要求、写入模式、分片边界与运维能力。

### 2. SQL 查询与三值逻辑

SQL 是声明式语言，优化器决定执行方式。NULL 引入 TRUE/FALSE/UNKNOWN 三值逻辑；JOIN、WHERE、GROUP BY、HAVING、ORDER BY 和 LIMIT 的语义阶段不同。

- 外连接条件放 ON 或 WHERE 可能改变结果集。
- 聚合结果使用 HAVING 过滤，窗口函数不折叠明细行。
- 分页排序必须稳定且最终包含唯一 tie-breaker。

**正确性边界：** `= NULL` 不返回真，应使用 `IS NULL`；`NOT IN` 遇到 NULL 也可能产生 UNKNOWN。

### 3. 事务、隔离与并发异常

ACID 描述事务属性；隔离级别规定并发可观察行为。MVCC 通过版本让读写少阻塞，但仍可能出现写偏差、丢失更新或范围竞争。

- 事务按业务不变量设计，并通过并发测试验证。
- 悲观锁、乐观版本和唯一约束解决不同竞争模式。
- 死锁是可预期并发结果，应用应缩短事务并对安全操作重试。

**正确性边界：** 同名隔离级别在不同数据库的实现细节并非完全相同，结论以目标数据库文档和实验为准。

### 4. 索引与执行计划

B+Tree 索引减少扫描范围，但增加写放大和空间。联合索引列顺序影响可用前缀、排序和覆盖；统计信息帮助优化器估算基数。

- 使用 EXPLAIN/EXPLAIN ANALYZE 观察实际扫描、行数估计、连接算法和排序。
- 索引服务查询模式，不是每列各建一个。
- 慢查询结合数据库、连接池、锁等待和应用 trace 定位。

**正确性边界：** “使用索引”不等于更快；低选择性、回表、随机 I/O 或错误估算可能让全表扫描更合适。

### 5. Schema 迁移与数据演进

生产变更按 expand-migrate-contract：先增加兼容结构，双读/双写或回填，再切流，最后移除旧结构。DDL 锁表与回填压力需要评估。

- Flyway/Liquibase 版本脚本只追加，已执行迁移不原地修改。
- 迁移前备份与容量评估，迁移后校验行数、约束和业务抽样。
- 应用和 schema 在滚动发布窗口内双向兼容。

**正确性边界：** 代码回滚并不会自动回滚数据；不可逆迁移必须有前滚修复和数据恢复方案。

## 3. 工程链路

```mermaid
flowchart LR
  A["业务不变量"] --> B["表与约束"]
  B --> C["查询模式"]
  C --> D["索引与计划"]
  D --> E["事务并发验证"]
  E --> F["迁移与监控"]
```

## 4. 最小可运行示例

下面的示例只保留关键路径。把它放入对应版本的最小工程，先运行测试或命令确认行为，再逐步加入重试、超时、监控和异常分支。

```sql
CREATE TABLE orders (
  id BIGINT PRIMARY KEY,
  customer_id BIGINT NOT NULL,
  status VARCHAR(24) NOT NULL,
  created_at TIMESTAMP NOT NULL
);
CREATE INDEX idx_orders_customer_created
  ON orders(customer_id, created_at DESC, id DESC);

SELECT id, status, created_at
FROM orders
WHERE customer_id = ? AND (created_at, id) < (?, ?)
ORDER BY created_at DESC, id DESC
FETCH FIRST 20 ROWS ONLY;
```

## 5. 实践与验证

1. 为订单与库存建模，用约束表达合法状态。
2. 构造脏读、不可重复读、幻读/写偏差实验并记录目标数据库行为。
3. 为三条真实查询设计联合索引并比较 EXPLAIN ANALYZE。

## 6. 掌握检查

- [ ] 能解释主键、业务键、外键和唯一约束。
- [ ] 能正确处理 NULL 和外连接。
- [ ] 能用执行计划而非猜测定位 SQL。
- [ ] 能设计可滚动发布的 schema 迁移。

## 参考资料

- [PostgreSQL SQL Language](https://www.postgresql.org/docs/current/sql.html)
- [MySQL Optimization](https://dev.mysql.com/doc/refman/8.4/en/optimization.html)
- [MySQL InnoDB Transactions](https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-model.html)
