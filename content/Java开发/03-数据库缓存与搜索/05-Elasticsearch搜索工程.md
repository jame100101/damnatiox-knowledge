# Elasticsearch 搜索工程：Mapping、分析器、Query DSL、分片与聚合

Elasticsearch 是搜索与分析引擎，不是关系数据库的透明替代。核心是 mapping、倒排索引、查询/过滤上下文、分片和生命周期管理。

## 1. 本文覆盖范围

- document/index/mapping 与 text/keyword
- analyzer、tokenizer、filter 与相关性
- Query DSL、filter、bool、聚合与分页
- primary/replica shard、routing、alias、reindex 与 ILM

## 2. 核心知识详解

### 1. Mapping 与字段类型

mapping 决定字段如何索引。text 经分析用于全文检索，keyword 保存精确值用于过滤、排序和聚合；日期、数值、nested、object 与向量各有语义。

- 生产禁用无边界动态字段或使用严格模板，避免 mapping explosion。
- 同一字符串常用 multi-field 同时提供 text 与 keyword。
- mapping 不兼容修改通常需新索引 + reindex + alias 切换。

**正确性边界：** 把所有字符串设为 text 会让精确聚合/排序困难；把全文设 keyword 又失去分析检索。

### 2. 分析器与相关性

分析器由字符过滤、tokenizer 和 token filter 组成，索引与查询分析需匹配。BM25 等相关性基于词频、文档频率和长度规范。

- 使用 `_analyze` 验证中英文分词、同义词、大小写和停用词。
- 同义词更新和搜索规则要版本化并离线评测。
- 结构化约束放 filter，全文相关放 query。

**正确性边界：** 相关性分数只在当前查询与索引统计下有意义，不能直接当跨查询业务概率。

### 3. Query DSL、聚合与分页

Query DSL 是 JSON AST，bool 组合 must/should/filter/must_not。聚合在匹配文档上做 bucket/metric/pipeline 分析。深分页 from/size 成本高，使用 search_after + PIT。

- filter context 可缓存且不计算 score。
- 排序包含唯一 tie-breaker，PIT 保持分页视图。
- 高基数 terms 聚合、脚本和通配前缀需要资源预算。

**正确性边界：** terms 聚合在分片采样下的 doc_count 可能有误差；精确需求检查 size/shard_size 与方案。

### 4. 分片、副本与路由

primary shard 决定索引分区，replica 提供冗余和搜索容量。协调节点把请求分发到相关分片并合并结果；分片太多会增加堆、集群状态和协调开销。

- 按数据增长、节点、恢复时间和查询并发规划 shard。
- allocation awareness 跨故障域分布副本。
- routing 可减少扇出但会带来热点和数据倾斜风险。

**正确性边界：** 增加副本提高读取容量与容错，但会增加写入和存储成本。

### 5. 同步、别名与生命周期

数据库到 ES 常通过 outbox/CDC 异步同步，ES 是派生读模型。alias 支持无停机切换，ILM/data stream 管理时间序列 rollover 和保留。

- 事件带版本，消费者幂等，监控延迟和失败队列。
- 查询结果需要强一致回源时，按 ID 回数据库验证。
- 快照到独立仓库并演练恢复。

**正确性边界：** 双写数据库与 ES 无分布式原子性，直接在请求中两边写会产生不一致。

## 3. 工程链路

```mermaid
flowchart LR
  A["数据库事务 + Outbox"] --> B["CDC/消息"]
  B --> C["幂等索引器"]
  C --> D["Elasticsearch 新索引"]
  D --> E["Alias 原子切换"]
  E --> F["搜索 API"]
```

## 4. 实践与验证

1. 为商品搜索设计 mapping，并用 `_analyze` 验证中英文分析。
2. 实现 PIT + search_after 稳定翻页。
3. 模拟数据库到 ES 事件乱序，用版本控制拒绝旧更新。

## 5. 掌握检查

- [ ] 能区分 text 与 keyword。
- [ ] 能说明 query 与 filter context。
- [ ] 能规划分片而不是默认多分片。
- [ ] 能设计数据库到搜索索引的一致性链路。

## 参考资料

- [Elasticsearch Reference](https://www.elastic.co/guide/en/elasticsearch/reference/current/)
- [Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html)
- [Mapping](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html)
- [Search Shard Routing](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-shard-routing.html)
