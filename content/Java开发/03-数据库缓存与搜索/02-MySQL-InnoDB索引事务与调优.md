# MySQL：InnoDB、索引、事务、MVCC、日志与性能调优

MySQL 学习重点是 InnoDB 存储、聚簇索引、事务隔离、锁、redo/undo/binlog 和可证据化调优。

## 1. 本文覆盖范围

- 数据类型、字符集、用户权限、备份恢复
- InnoDB 聚簇/二级索引与页结构
- 隔离、MVCC、记录锁/间隙锁/next-key lock
- redo、undo、binlog、复制与 EXPLAIN

## 2. 核心知识详解

### 1. 类型、字符集与 schema

选择最贴合语义的类型，金额用 DECIMAL，时间区分 TIMESTAMP/DATETIME，文本统一 utf8mb4 与明确 collation。字段宽度、NULL 和默认值影响存储和业务语义。

- 账号使用最小权限，备份需要定期恢复演练。
- 大字段与高频访问列分离，避免无边界 JSON 替代结构建模。
- 字符集要在库、表、连接和客户端一致。

**正确性边界：** VARCHAR(n) 的 n 是字符数语义但字节占用受字符集影响；索引长度仍有字节限制。

### 2. 聚簇索引与二级索引

InnoDB 表数据按主键聚簇，二级索引叶节点存主键值，因此宽或随机主键会放大所有二级索引。覆盖索引可直接提供查询列，减少回表。

- 主键短、稳定、递增趋势通常更友好，但分布式 ID 还需权衡热点与全局性。
- 联合索引遵循查询谓词、选择性、排序与覆盖综合设计。
- 前缀索引节省空间但降低区分度且不总能覆盖。

**正确性边界：** “最左前缀”不是机械口诀；范围条件后的列能否用于过滤/排序要结合优化器和执行计划。

### 3. 事务、MVCC 与锁

InnoDB 使用 undo 版本和 read view 支持一致性读，当前读通过锁读取最新可见版本。Repeatable Read 下 next-key lock 可保护索引范围，但锁行为受查询、索引和执行计划影响。

- 更新条件必须命中合适索引，避免扩大扫描和锁范围。
- 用版本号实现乐观锁；唯一约束解决“先查后插”竞争。
- 死锁查看日志并统一访问顺序，应用对整个事务做有界重试。

**正确性边界：** MVCC 不等于“完全没有锁”；写入、当前读、约束检查仍会加锁。

### 4. redo、undo 与 binlog

redo log 支持崩溃恢复，undo 支持回滚和 MVCC，binlog 是 Server 层逻辑变更日志用于复制与时间点恢复。提交过程协调 redo 与 binlog 以保持一致。

- 备份 + binlog 才能做时间点恢复，必须演练。
- 刷盘策略在持久性和吞吐之间权衡。
- 复制延迟下读写分离要处理 read-your-writes。

**正确性边界：** 三种日志服务不同目标，不能互相替代。

### 5. 查询与运维调优

调优从慢查询和业务 SLO 出发，使用 EXPLAIN ANALYZE、performance_schema、锁等待、buffer pool 和 I/O 指标建立证据。

- 修正查询/索引优先于盲目调参数。
- 连接数由并发模型和数据库 CPU/I/O 决定，避免连接风暴。
- 在线 DDL、统计信息更新和索引构建安排容量窗口。

**正确性边界：** 平均延迟会掩盖长尾，至少观察 P95/P99、扫描行数和锁等待。

## 3. 工程链路

```mermaid
flowchart LR
  A["慢请求 Trace"] --> B["定位 SQL"]
  B --> C["EXPLAIN ANALYZE"]
  C --> D["索引/锁/统计/I-O"]
  D --> E["小范围修改"]
  E --> F["回归与压测"]
```

## 4. 实践与验证

1. 验证覆盖索引、回表和联合索引列顺序。
2. 制造死锁并从 InnoDB 状态中还原等待图。
3. 完成全量备份 + binlog 时间点恢复演练。

## 5. 掌握检查

- [ ] 能解释 InnoDB 聚簇索引。
- [ ] 能区分一致性读与当前读。
- [ ] 能说明 redo/undo/binlog 各自职责。
- [ ] 能用实际执行计划验证优化。

## 参考资料

- [MySQL 8.4 Reference](https://dev.mysql.com/doc/refman/8.4/en/)
- [InnoDB Transaction Model](https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-model.html)
- [Optimizing InnoDB](https://dev.mysql.com/doc/refman/8.4/en/optimizing-innodb.html)
