# Skills 与协议推荐阅读

- [Claude Code Skills](https://docs.anthropic.com/en/docs/claude-code/skills)：Skill 的发现和使用。
- [Agent Skills](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)：可复用能力包的结构与渐进加载。
- [OpenClaw Skills](https://github.com/openclaw/openclaw)：研究本地 Agent 的 Skill 作用域与加载。
- [Model Context Protocol](https://modelcontextprotocol.io/docs/getting-started/intro)：tools、resources、prompts 与客户端/服务端连接。
- [MCP Servers](https://github.com/modelcontextprotocol/servers)：官方/参考 Server 实现集合。
- [Agent2Agent Protocol](https://a2a-protocol.org/latest/)：跨 Agent 任务和产物交换。
- [Agent Client Protocol](https://agentclientprotocol.com/)：Agent 与编辑器/宿主集成。

建议产出：一个带脚本、模板和 smoke test 的 Skill，并通过 MCP 接入一个只读数据源，记录完整 trace。
