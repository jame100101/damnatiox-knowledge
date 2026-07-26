# Tools Call 推荐阅读

- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)：严格 schema、工具选择和消息结构。
- [Anthropic Tool Use](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview)：client tool、server tool 及 `tool_result` 契约。
- [Gemini Function Calling](https://ai.google.dev/gemini-api/docs/function-calling)：多工具组合与函数调用配置。
- [Model Context Protocol](https://modelcontextprotocol.io/docs/getting-started/intro)：标准化接入 tools、resources 和 prompts。
- [Toolformer](https://arxiv.org/abs/2302.04761)：研究模型学习何时调用外部工具的思路。

建议实践：定义 `calculator`、`search`、`read_file` 三个严格工具，加入非法参数、超时、空结果、重复调用和证据抽取测试。
