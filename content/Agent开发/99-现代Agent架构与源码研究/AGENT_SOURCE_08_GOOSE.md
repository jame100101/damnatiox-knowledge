# Goose 架构研究：可扩展 Coding Agent

    > **Freshness metadata**
    > - `last_verified`: `2026-08-24`
    > - `version_scope`: `3cfe512ad2558ba9f774d7c39f2f1adc19789b46`
    > - `source_type`: `official-repository`
    > - `stability`: `fast-moving`

    ## Research identity

    - **Project / Repository**: [block/goose](https://github.com/block/goose)
    - **Commit**: [`3cfe512ad2558ba9f774d7c39f2f1adc19789b46`](https://github.com/block/goose/tree/3cfe512ad2558ba9f774d7c39f2f1adc19789b46)
    - **Research date**: `2026-08-24`
    - **Purpose / Product boundary**: 本地优先、可扩展的开发 Agent；重点研究 Rust 核心、extensions、会话与工具协议。

    ## 统一架构检查

    | Dimension | 阅读问题 |
    |---|---|
    | Agent Loop | 谁决定下一动作、如何停止、错误怎样回填？ |
    | Context | 指令、仓库、history、compaction 如何装配？ |
    | Tools / Runtime | schema 到真实文件/进程之间有哪些层？ |
    | Permission / Safety | 哪些动作需批准，策略在哪一层强制？ |
    | Session / Persistence | 会话、任务、artifact 如何保存与恢复？ |
    | Plan / Subagent | 是核心路径、可选能力还是不存在？ |
    | Skills / MCP | 能力如何发现、加载和版本化？ |
    | UI / CLI | 用户如何观察事件、diff、命令和批准？ |
    | Observability | trace、日志、成本、错误如何关联？ |

    ## Confirmed facts

    - 官方仓库包含 Rust 代码与面向开发任务的 CLI/桌面入口。
- 能力通过扩展接入，阅读时需区分 extension discovery、协议传输与真实 executor。
- 研究快照固定为指定 commit。

    ## Static inference

    - extension 边界适合分析 MCP 能力与 Agent 核心的解耦，但具体信任策略必须由代码和测试逐项确认。
- 多 UI 入口共享会话核心的程度应通过 crate 依赖和事件类型验证。

    这些是从目录、依赖和数据流得到的静态推断，不代表项目维护者的产品承诺。验证时应定位具体入口、调用点和测试。

    ## Unknown / not verified

    - 远程扩展在所有部署形态中的认证与隔离默认值。
- 桌面、CLI 与企业分发的功能差异。

    ## 定向阅读步骤

    1. 从 README/文档确认产品边界与启动方式；
    2. 找到 CLI/API 入口与一次请求的事件流；
    3. 沿 tool invocation 追到 executor/runtime；
    4. 记录 context sources、compaction 与 session persistence；
    5. 用测试确认 permission、cancel、timeout 与错误语义；
    6. 将结论标为 CONFIRMED / INFERRED / UNKNOWN，并把链接固定到本 commit。

    ## Patterns worth learning / not to copy blindly

    学习清晰的状态边界、可观察事件、可替换工具和失败处理。不要直接复制默认权限、模型特定 prompt、遥测策略或平台假设；先映射到自己的 threat model、任务分布和评测门。
