# Aider 架构研究：Git-aware Pair Programming Agent

    > **Freshness metadata**
    > - `last_verified`: `2026-08-24`
    > - `version_scope`: `5dc9490bb35f9729ef2c95d00a19ccd30c26339c`
    > - `source_type`: `official-repository`
    > - `stability`: `fast-moving`

    ## Research identity

    - **Project / Repository**: [Aider-AI/aider](https://github.com/Aider-AI/aider)
    - **Commit**: [`5dc9490bb35f9729ef2c95d00a19ccd30c26339c`](https://github.com/Aider-AI/aider/tree/5dc9490bb35f9729ef2c95d00a19ccd30c26339c)
    - **Research date**: `2026-08-24`
    - **Purpose / Product boundary**: 终端中的 Git-aware AI pair programming；重点研究 repository map、edit format、模型适配与 Git 提交边界。

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

    - 官方仓库以 Python 为主体，提供 CLI，并围绕代码编辑与 Git 工作流组织功能。
- 研究快照固定为上面的 HEAD SHA；本文的事实范围不外推到之后提交。
- 是否启用自动提交、测试或 lint 属于运行配置与用户工作流，不应当作模型本身能力。

    ## Static inference

    - repository map 可视为 Context Engineering 的代码结构压缩层；需要继续沿生成、排名与 token budget 的具体实现验证。
- 不同 edit format 把模型输出约束与补丁应用耦合，是 Output Parser 和 Executor 边界的研究入口。

    这些是从目录、依赖和数据流得到的静态推断，不代表项目维护者的产品承诺。验证时应定位具体入口、调用点和测试。

    ## Unknown / not verified

    - 本快照在所有模型/provider 下的相同行为与性能。
- 产品托管能力、遥测和默认权限在不同发布包中的差异。

    ## 定向阅读步骤

    1. 从 README/文档确认产品边界与启动方式；
    2. 找到 CLI/API 入口与一次请求的事件流；
    3. 沿 tool invocation 追到 executor/runtime；
    4. 记录 context sources、compaction 与 session persistence；
    5. 用测试确认 permission、cancel、timeout 与错误语义；
    6. 将结论标为 CONFIRMED / INFERRED / UNKNOWN，并把链接固定到本 commit。

    ## Patterns worth learning / not to copy blindly

    学习清晰的状态边界、可观察事件、可替换工具和失败处理。不要直接复制默认权限、模型特定 prompt、遥测策略或平台假设；先映射到自己的 threat model、任务分布和评测门。
