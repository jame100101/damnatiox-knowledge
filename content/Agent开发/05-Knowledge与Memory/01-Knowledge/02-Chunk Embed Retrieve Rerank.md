# Chunk、Embed、Retrieve 与 Rerank 详解

## 1. Chunk：确定检索的最小语义单元

切得太小，片段缺少上下文；切得太大，相似度被无关内容稀释并浪费 token。评估 chunk 时不要只看平均长度，要抽样检查：

- 一个片段是否表达完整事实；
- 标题和表头是否被继承；
- 引用定位是否能回到原文；
- 相邻重叠是否造成大量重复；
- 更新一个小段时是否需要重建整个索引。

建议保存 `document_id`、`chunk_id`、`parent_id`、`ordinal`、字符/页码范围和内容 hash。

## 2. Embed：把文本映射到向量空间

Embedding 模型把查询与片段变成向量，用距离衡量语义接近。工程注意点：

- 查询与文档使用匹配的模型/前缀；
- 记录模型名和版本；
- 更换模型通常需要重建索引；
- 归一化与相似度函数要与模型建议一致；
- 多语言、代码和领域术语需单独评测；
- 不能用 embedding 距离直接解释事实正确性。

## 3. Retrieve：高召回候选生成

候选层常组合：

- dense vector search；
- BM25/sparse search；
- metadata filter；
- graph/邻接扩展；
- parent/child expansion；
- query decomposition 多查询召回。

`top_k` 不是越大越好。过大会增加 rerank 成本和上下文噪声，应通过标注问题集调参。

## 4. Rerank：精排

Cross-encoder 或 LLM reranker 同时阅读 query 与候选，通常比单独向量相似度更能判断相关性。设计时考虑：

- 初召回 K 与最终保留 N；
- 批处理、缓存、延迟；
- 长文截断是否丢掉关键句；
- 多样性，避免前 N 全来自同一重复页面；
- 时间、权威性和权限等业务特征。

## 5. Context Packing

把最终片段装入 prompt 前：

1. 去重；
2. 合并相邻 chunk；
3. 保留 citation ID；
4. 分配 token 预算；
5. 为冲突来源保留双方；
6. 明确来源边界；
7. 对网页内容进行不可信数据标记。

## 6. 一个可复现的实验

准备 50～100 个问题，每个问题标注相关文档/片段。记录：

| 配置            | Recall@10 | MRR | Context Precision | 延迟 |
| --------------- | --------: | --: | ----------------: | ---: |
| dense           |           |     |                   |      |
| BM25            |           |     |                   |      |
| hybrid          |           |     |                   |      |
| hybrid + rerank |           |     |                   |      |

再对失败案例分类：解析丢失、切分错误、术语不匹配、过滤错误、排序错误、上下文截断。只有分类后，优化才有方向。

<!-- agent-learning-expansion:v2 -->
## 7. Chunk 的目标是“可检索且可解释”

Chunk 既要足够小以便精确命中，也要保留回答问题所需的完整语义。除正文外应携带 `document_id`、章节路径、页码或行号、版本、ACL 与父块 ID。父子检索常用小块召回、父块补全上下文，可在精确率和可读性间折中。

## 8. Dense、Sparse 与融合

Dense embedding 对同义表达和语义相似有效，BM25 等 sparse 检索对错误码、函数名、编号和罕见实体更稳。Reciprocal Rank Fusion 可在不直接比较两种分数尺度时融合排名：

$$
RRF(d) = \sum_{r \in rankings}\frac{1}{k + rank_r(d)}
$$

`k` 用于降低头部排名差异的剧烈影响。融合后仍需在带真实查询和相关性标注的数据集上调参。

## 9. Rerank 与 Context Packing

Reranker 对 query-document 对做更精细判断，通常成本高于初筛，所以只处理候选集合。Context packing 不是简单取前 N：需要去重相邻片段、保留多来源覆盖、按引用 ID 包装、控制单来源占比，并为问题中不同子目标分配上下文预算。
