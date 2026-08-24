# Skill、Tool、Prompt 与 MCP 的边界

## 1. Tool

Tool 是可执行接口，例如 `read_file(path)`、`search(query)`、`create_issue(...)`。它回答“系统能做什么”，强调参数、结果、权限和副作用。

## 2. Skill

Skill 是一类任务的可复用流程知识，通常包含：

- 何时使用；
- 前置条件；
- 分步方法；
- 需要的工具；
- 脚本、模板或示例；
- 验收标准；
- 失败处理。

它回答“怎样可靠地完成一类任务”。一个 code-review Skill 可以调用 git、测试和评论工具，但本身不是这些工具。

## 3. Prompt

Prompt 是某次模型调用的指令和上下文。它可以引用 Skill，但通常没有独立版本、目录资源、发现机制和 smoke test。把所有流程写进全局 prompt 会导致上下文膨胀，也难以复用和单独评测。

## 4. MCP

MCP（Model Context Protocol）标准化 Host、Client 与 Server 之间的连接，Server 可暴露 tools、resources、prompts。MCP 解决“如何接入外部能力与数据”；Skill 解决“如何组合能力完成任务”。

## 5. 一张表

| 概念   | 核心            | 主要契约                      | 生命周期         |
| ------ | --------------- | ----------------------------- | ---------------- |
| Prompt | 本轮指令/上下文 | 消息与优先级                  | 一次或若干轮     |
| Tool   | 可执行动作      | input/output schema           | 运行时           |
| Skill  | 可复用流程知识  | SKILL.md + 资源 + 验收        | 可版本化能力包   |
| MCP    | 连接协议        | transport/capabilities/schema | 客户端与服务会话 |

## 6. 组合示例

“生成发布说明” Skill：

1. 使用 git Tool 读取两个 tag 间提交；
2. 使用 issue MCP Server 获取关联 issue；
3. 按模板分类变更；
4. 运行链接与版本验证；
5. 输出 release note。

Skill 只在任务匹配时加载详细内容，工具描述保持精简。
