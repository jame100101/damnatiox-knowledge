# PostgreSQL 基础：类型、索引、MVCC、执行计划与选型

> **Freshness metadata**
> - `last_verified`: `2026-08-24`
> - `version_scope`: `PostgreSQL concepts; verify server version for syntax`
> - `source_type`: `PostgreSQL official documentation`
> - `stability`: `version-sensitive`

PostgreSQL 是关系数据库主线的一部分；MongoDB 已移到可选数据模型专项。

## 核心知识

- schema、constraint、primary/foreign/unique/check；
- 丰富类型与明确转换；JSONB 用于局部半结构数据，不替代关系建模；
- B-tree 默认索引及 GIN/GiST/BRIN 的不同访问模型；
- MVCC 快照、事务隔离、row/version cleanup 与 VACUUM；
- `EXPLAIN (ANALYZE, BUFFERS)` 结合真实执行时间与 I/O，注意它会实际执行语句；
- connection 是稀缺资源，应用使用 pool，但 pool 过大可能放大竞争。

```sql
CREATE TABLE orders (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id bigint NOT NULL,
  status text NOT NULL CHECK (status IN ('NEW','PAID','CANCELLED')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_customer_created ON orders(customer_id, created_at DESC);
```

复合索引顺序依据过滤、排序与基数，不靠“所有列都建索引”。事务边界由业务不变量决定；长事务会延长旧版本可见性并增加维护成本。

## MySQL 与 PostgreSQL 的学习方式

掌握共同关系模型与事务后，再比较 SQL dialect、索引、隔离默认值、JSON、复制、运维和生态。不要用单一 benchmark 评选“更快”，也不要在 ORM 层假定两者完全可互换。
