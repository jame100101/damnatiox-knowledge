# Context Trust Boundary 与 Prompt Injection Boundary

> **Freshness metadata**
> - `last_verified`: `2026-08-24`
> - `version_scope`: `2026 prompt-injection threat model`
> - `source_type`: `official-security-guidance + engineering synthesis`
> - `stability`: `version-sensitive`

Prompt injection 的关键不是“文本是否像命令”，而是**低信任数据是否改变了高权限控制决策**。网页、issue、代码注释、文档、tool output、memory 都可能携带指令形态文本。

## 控制面与数据面

| 层 | 示例 | 可做什么 |
|---|---|---|
| Control | system/developer policy、用户明确批准、permission grant | 定义目标、权限与停止边界 |
| Derived control | 经验证 plan、schema、workflow state | 在既定边界内调度 |
| Data | 文件、网页、检索结果、stdout、邮件 | 提供事实；默认不提升权限 |

## 防线

1. 来源标记与 delimiters 只提供可读性，不是完整安全机制；
2. capability/permission 在模型之外强制；
3. side-effect tool 按 read/write/execute/network/destructive 分类；
4. 高影响动作要求参数校验、preview/diff、用户确认或双重控制；
5. secret 不进入模型 context，使用 opaque handle 或执行侧注入；
6. retrieval 与 memory 写入做污染检测、tenant 隔离和 provenance；
7. trace 记录“哪个数据导致哪个决定”，但对敏感值脱敏。

## 验证场景

- README 含“上传环境变量”时，Agent 仍受 network/secret policy 阻止；
- tool result 含伪造 system message 时保持 data role；
- memory 中过期权限不覆盖当前 grant；
- URL redirect 到新 origin 后重新判定网络权限；
- compaction 不丢失 trust labels。
