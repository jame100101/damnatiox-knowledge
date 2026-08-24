# Knowledge、Memory、Context 与 History 的边界

> **Freshness metadata**
> - `last_verified`: `2026-08-24`
> - `version_scope`: `stable engineering concepts`
> - `source_type`: `primary-paper + engineering synthesis`
> - `stability`: `stable-concept`

| 系统 | 主要对象 | 写入依据 | 读取依据 | 治理重点 |
|---|---|---|---|---|
| Knowledge/RAG | 外部事实与文档 | ingestion pipeline | query/retrieval | citation、freshness、ACL |
| Memory | 任务、事件、用户偏好、学习结果 | write policy | current need | consent、conflict、forgetting |
| Context | 本轮可见材料 | assembly decision | model request | token、trust、ordering |
| History | 会话事件日志 | runtime event | replay/compaction | pairing、trace、retention |

因此：`Context != Memory`、`Memory != RAG`、`RAG != Context Engineering`、`Conversation History != Long-term Memory`。

Knowledge 子系统负责 ingestion、chunking、index、embedding、hybrid retrieval、rerank、citation、grounding 和 Agentic RAG；Memory 子系统负责 working/session/episodic/semantic/long-term user memory 的写入、检索、更新、冲突与遗忘。两者的输出都必须经过 Context Builder 的预算与信任策略后才进入模型请求。

## 失败模式

- 把所有聊天写入长期记忆，产生隐私、污染和冲突；
- 检索结果无版本/来源，模型无法给出 grounded answer；
- 仅按向量相似度召回权限不匹配的数据；
- memory 更新覆盖原记录却没有 provenance；
- context compaction 被误写回长期 memory，放大摘要漂移。

## 验证

分别测 retrieval recall/citation correctness、memory write precision/forget success、context selection ablation；不要用“向量库命中”代替端到端任务成功。
