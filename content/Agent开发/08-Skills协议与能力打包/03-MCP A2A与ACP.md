# MCP、A2A 与 ACP

## 1. MCP：Agent/模型应用连接工具与数据

MCP 采用 Host–Client–Server 架构：

- Host：IDE、桌面应用、Agent Harness；
- Client：Host 内与某个 Server 保持会话；
- Server：暴露 tools、resources、prompts 等 capability。

需要关注初始化、capability negotiation、transport、schema、生命周期、认证与隔离。MCP Server 的输出属于外部数据，应继续经过权限、大小限制和不可信内容处理。

## 2. A2A：Agent 与 Agent 协作

A2A 关注不同 Agent 服务之间的能力发现、任务提交、消息、状态更新与产物。它适合跨进程、跨组织或异构 Agent 协作；在单进程内部简单函数调用已足够时，没有必要为协议而协议。

设计重点：

- Agent Card/能力描述；
- task ID 与状态；
- 流式更新；
- artifact；
- 身份与授权；
- 取消、超时、幂等；
- 版本兼容。

## 3. ACP：Agent 与宿主客户端

ACP 关注编辑器、终端、IDE 等客户端如何与 Agent 交换 session、prompt、工具动作和内容更新。它把 Agent 作为可嵌入宿主的服务，而不是只提供一个私有 CLI。

## 4. 边界

```text
Skill: how to do a task
Tool: an executable action
MCP: connect host to tools/resources
A2A: connect agents to agents
ACP: connect agent to client/host
```

## 5. 生产检查

- capability 版本是否协商；
- 远端工具权限是否映射到本地策略；
- schema 是否验证；
- 断线重连是否重复动作；
- 大结果如何分页或外部存储；
- trace ID 是否跨协议传播；
- 用户取消是否端到端传播；
- 对端返回内容是否作为不可信数据处理。

## 参考资料

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Agent2Agent Protocol](https://a2a-protocol.org/latest/)
- [Agent Client Protocol](https://agentclientprotocol.com/)
