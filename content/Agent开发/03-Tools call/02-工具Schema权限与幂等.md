# 工具 Schema、权限门与幂等设计

## 1. 输入 Schema 要表达语义

仅写 `type: string` 远远不够。一个文件读取工具应明确：

- 路径是相对工作区还是绝对路径；
- 是否允许 glob；
- 编码；
- 最大字节数；
- 行号是否从 1 开始；
- 路径必须存在且位于哪些根目录。

```json
{
  "type": "object",
  "properties": {
    "path": {
      "type": "string",
      "minLength": 1,
      "maxLength": 500,
      "description": "Path relative to the workspace root"
    },
    "line_start": { "type": "integer", "minimum": 1 },
    "line_end": { "type": "integer", "minimum": 1 }
  },
  "required": ["path"],
  "additionalProperties": false
}
```

## 2. 权限是确定性层

Permission Gate 在执行前检查主体、动作、资源和上下文：

```text
allow = policy(subject, tool, normalized_arguments, session, environment)
```

常见策略：

- 只读工具默认通过；
- 工作区内可逆写入按策略通过；
- 外部发布、发送、删除、付款需要确认；
- 密钥只由运行时注入，模型上下文只出现引用名；
- 子 Agent 的权限应是父任务权限的子集。

权限决策要进入 trace，包括命中的规则、请求范围和最终决定。

## 3. 幂等键

非幂等工具遇到超时时，系统不知道动作是否已发生。为创建订单、发消息、触发部署等动作加入幂等键：

```text
idempotency_key = hash(session_id + task_id + logical_action)
```

重试时复用同一个键。若外部服务不支持幂等键，执行前后分别查询状态，或在本地写入 outbox 记录。

## 4. 参数规范化

权限与幂等计算前先：

- 解析并规范化路径；
- 统一 URL、域名和端口；
- 对 JSON key 排序；
- 去除无语义空白；
- 明确默认值；
- 拒绝类型混淆。

否则 `a/../b`、大小写、尾斜杠等差异可能绕开重复检测或策略匹配。

## 5. 测试

- Schema 的正例、边界值、缺字段和多余字段；
- 权限允许、拒绝、确认三条路径；
- 同一幂等键重复调用；
- 工具执行后响应丢失；
- 子 Agent 请求超出委派范围；
- 路径规范化和符号链接边界；
- 敏感字段是否出现在日志或模型消息。

<!-- agent-learning-expansion:v2 -->
## 6. Schema：从语法约束到业务约束

```json
{
  "type": "object",
  "additionalProperties": false,
  "required": ["document_id", "expected_version", "content"],
  "properties": {
    "document_id": { "type": "string", "minLength": 1 },
    "expected_version": { "type": "integer", "minimum": 0 },
    "content": { "type": "string", "maxLength": 200000 }
  }
}
```

`additionalProperties: false` 可以减少模型凭空增加字段；`expected_version` 支持乐观并发控制。但 schema 通过后，还要检查调用者是否有该文档写权限、版本是否仍匹配、内容是否满足业务规则。

## 7. 幂等不是简单“重试安全”

幂等键应由“调用者 + 工具版本 + 规范化参数 + 任务范围”生成并持久化。首次执行写入 `pending`，成功后保存可复用结果；相同键再次到达时返回原结果。对于发送邮件、支付、发布等动作，若外部系统响应丢失，状态可能是 `unknown`，此时应先查询外部状态，而不是再次提交。

## 8. 最小权限的落点

最小权限要同时落在工具暴露、参数范围、凭据、运行目录和网络目标上。不要把一个全能 `run_command(command: string)` 当作所有能力入口；优先暴露语义清晰、输入受限、结果结构化的工具，并对高影响动作设置独立审批。
