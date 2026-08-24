# OpenCode 架构研究：Terminal Coding Agent

    > **Freshness metadata**
    > - `last_verified`: `2026-08-24`
    > - `version_scope`: `03521003fafdc6d340de6a36a189e3c121b07d40`
    > - `source_type`: `official-repository`
    > - `stability`: `fast-moving`

    ## Research identity

    - **Project / Repository**: [anomalyco/opencode](https://github.com/anomalyco/opencode)
    - **Commit**: [`03521003fafdc6d340de6a36a189e3c121b07d40`](https://github.com/anomalyco/opencode/tree/03521003fafdc6d340de6a36a189e3c121b07d40)
    - **Research date**: `2026-08-24`
    - **Purpose / Product boundary**: 终端/客户端 coding agent；重点研究 session、provider、tool、permission、UI event 与持久化边界。

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

    - 官方仓库采用 TypeScript 等技术构建多包项目，并提供终端交互产品入口。
- 研究应固定 commit，避免把快速变化的 provider、tool 和 UI 行为写成永久事实。
- 工具定义、模型事件与实际进程/文件副作用是三个需要分别追踪的层。

    ## Static inference

    - 多包结构可能把 core/server/UI 分离；必须通过 package dependency 和 runtime entry 验证具体控制权。
- session 事件适合作为 replay/observability 基础，但不自动等于 durable execution。

    这些是从目录、依赖和数据流得到的静态推断，不代表项目维护者的产品承诺。验证时应定位具体入口、调用点和测试。

    ## Unknown / not verified

    - 不同安装渠道和版本的默认 permission policy。
- 托管服务与开源本地组件之间的完整产品边界。

    ## 定向阅读步骤

    1. 从 README/文档确认产品边界与启动方式；
    2. 找到 CLI/API 入口与一次请求的事件流；
    3. 沿 tool invocation 追到 executor/runtime；
    4. 记录 context sources、compaction 与 session persistence；
    5. 用测试确认 permission、cancel、timeout 与错误语义；
    6. 将结论标为 CONFIRMED / INFERRED / UNKNOWN，并把链接固定到本 commit。

    ## Patterns worth learning / not to copy blindly

    学习清晰的状态边界、可观察事件、可替换工具和失败处理。不要直接复制默认权限、模型特定 prompt、遥测策略或平台假设；先映射到自己的 threat model、任务分布和评测门。
