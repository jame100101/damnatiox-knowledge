# Memory 推荐阅读

- [Generative Agents](https://arxiv.org/abs/2304.03442)：观察、反思、规划与记忆流的经典研究。
- [Mem0](https://github.com/mem0ai/mem0)：长期记忆层的抽取、存储和召回实现。
- [Letta](https://github.com/letta-ai/letta)：stateful Agent 的 context 与 memory 管理。
- [LangGraph Persistence](https://docs.langchain.com/oss/python/langgraph/persistence)：thread、checkpoint、store 和可恢复执行。
- [Lilian Weng：LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/)：规划、记忆与工具使用的系统综述。

建议实践：实现一个 session store，支持检查点和恢复；再加入有 scope、source、TTL 的长期记忆表，并用跨项目泄漏测试验证隔离。
