# Tools Call 推荐阅读

- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)：严格 schema、工具选择和消息结构。
- [Anthropic Tool Use](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview)：client tool、server tool 及 `tool_result` 契约。
- [Gemini Function Calling](https://ai.google.dev/gemini-api/docs/function-calling)：多工具组合与函数调用配置。
- [Model Context Protocol](https://modelcontextprotocol.io/docs/getting-started/intro)：标准化接入 tools、resources 和 prompts。
- [Toolformer](https://arxiv.org/abs/2302.04761)：研究模型学习何时调用外部工具的思路。
- [Python `subprocess`](https://docs.python.org/3/library/subprocess.html)：进程创建、参数数组、stdout/stderr、timeout 与返回码。
- [Node.js `child_process`](https://nodejs.org/api/child_process.html)：流式进程、管道背压、取消以及 `exit`/`close` 的区别。
- [Node.js File system](https://nodejs.org/api/fs.html)：文件读写、流、文件句柄和平台差异。
- [Rust `std::process::Command`](https://doc.rust-lang.org/std/process/struct.Command.html)：类型化构造子进程及其标准流。
- [SWE-agent ACI Commands](https://swe-agent.com/0.7/config/commands/)：面向语言模型设计导航、编辑、搜索和执行命令的实例。

建议实践：定义 `calculator`、`search`、`read_file`、`write_file`、`start_process` 和 `read_process` 六个严格工具，加入非法参数、超时、空结果、重复调用、输出截断、并发写冲突和证据抽取测试。
