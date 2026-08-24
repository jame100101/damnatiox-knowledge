# MongoDB 文档模型与选型（可选）

> **Freshness metadata**
> - `last_verified`: `2026-08-24`
> - `version_scope`: `MongoDB concepts; verify server/driver versions`
> - `source_type`: `MongoDB official docs`
> - `stability`: `version-sensitive`

MongoDB 适合以文档聚合读取/写入、schema 演进与水平扩展需求明确的场景。建模从访问模式出发：一起读取且生命周期一致的数据可嵌入；独立增长、共享或高基数关系考虑引用。

必须学习 `_id`、document size、index、compound index、aggregation pipeline、transactions、read/write concern、replica set、sharding 与 schema validation。它不是“无 schema”，而是 schema 约束位置更灵活。

选择前比较关系一致性、join/analytics、更新模式、团队运维与数据迁移；不要因 JSON 方便就替换关系数据库。
