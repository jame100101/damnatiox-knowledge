# 引用、Grounded Answer 与 RAG 失败处理

## 1. 引用不是装饰

可靠引用需要满足：

- **存在性**：URL、文件或查询结果确实存在；
- **蕴含性**：引用内容支持对应陈述；
- **精确性**：定位到页码、段落、行号或 chunk；
- **完整性**：重要事实都有依据；
- **新鲜度**：版本和时间符合问题；
- **权限一致性**：用户可访问对应来源。

模型生成一个看似真实的 URL 不算引用。引用必须来自检索阶段创建的 EvidenceItem。

## 2. 生成协议

上下文可以使用稳定 ID：

```text
[E1] source=official-doc, locator=section-3
...
[E2] source=paper, locator=page-7
...
```

要求模型输出：

```json
{
  "claims": [
    {
      "text": "关键陈述",
      "evidence_ids": ["E1", "E2"],
      "kind": "source_fact"
    }
  ]
}
```

渲染前验证 ID 存在，并可对关键 claim 做 NLI/规则/人工抽查。

## 3. 证据不足

正确行为是明确：

- 已找到哪些信息；
- 哪个问题仍缺证据；
- 搜索过哪些来源；
- 下一步需要什么资料。

不要用常识填补组织内部数据，也不要把“检索没有命中”写成“事实不存在”。

## 4. 常见失败模式

- **幻觉引用**：模型生成未检索的链接；
- **引用漂移**：段落末尾的引用只支持其中一小句；
- **拼接冲突**：不同版本来源被合并成单一结论；
- **Lost in the middle**：关键片段在长上下文中被忽略；
- **检索投毒/Prompt Injection**：文档内容诱导模型改变系统规则；
- **权限后过滤**：敏感片段已进入模型上下文后才隐藏；
- **重复片段压倒多样性**：同一事实多次出现导致虚假置信。

## 5. 防护与验证

- 外部内容标记为 untrusted data；
- 指令与证据使用不同消息/数据通道；
- 权限过滤在检索前或检索时完成；
- 关键回答执行 citation validator；
- 来源冲突时显式并列；
- 保存 query、候选、rerank 分数、最终上下文和 claim 映射；
- 用固定问题集做引用回归。

## 6. RAG Agent 的循环

RAG Agent 可能根据初次结果继续搜索，但需要限制：

```text
plan questions
  -> retrieve
  -> assess coverage
  -> refine missing questions
  -> retrieve again
  -> synthesize with citations
  -> validate
```

覆盖度评估应基于任务问题清单，而不是模型主观说“资料足够”。
