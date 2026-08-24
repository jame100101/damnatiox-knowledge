# Prompt Injection、权限边界与 Human-in-the-loop

## 1. Prompt Injection

Agent 读取网页、邮件、文档和工具输出时，内容中可能包含试图改变系统目标的指令。防护原则：

- 外部内容是 data，不是 instruction；
- 系统规则、用户目标和外部数据分层；
- 工具和资源按最小权限暴露；
- 敏感数据不进入不必要上下文；
- 写/发/删等动作经过确定性策略；
- 最终动作参数在执行前重新校验。

仅在 system prompt 写“忽略恶意指令”不够。

## 2. Data Exfiltration 与 Tool Abuse

典型链路：

```text
untrusted document
  -> persuades model
  -> read secret/tool
  -> sends data to external destination
```

阻断点包括：

- 读取与发送工具不在同一默认权限集合；
- 秘密使用引用注入，不展示明文；
- 出站域名/目标 allowlist；
- 数据分类与流向策略；
- 副作用动作预览；
- 日志与 DLP 检查。

## 3. Human-in-the-loop

适合确认：

- 发送外部消息；
- 删除或覆盖；
- 发布和部署；
- 付款/采购；
- 修改权限；
- 处理高敏感数据；
- 结果不可轻易撤销的动作。

确认界面要显示精确目标、参数、影响、来源和可选修改。确认 token 绑定 tool、规范化参数、会话和过期时间；参数变化后重新确认。

## 4. Sandbox 与资源边界

- 文件系统工作区；
- 网络出站；
- CPU/内存/时间；
- 进程与系统调用；
- 环境变量和凭据；
- 浏览器 profile；
- 数据库角色；
- 子 Agent 委派范围。

模型只能在 Harness 提供的 capability 内行动。

## 5. 安全回归

测试：

- 文档内伪系统指令；
- 工具结果诱导读取密钥；
- 混淆 URL；
- 路径遍历；
- 确认后参数替换；
- 子 Agent 权限扩大；
- 日志泄漏 token；
- 删除/发送的重复执行；
- RAG 权限后过滤。

结果不仅是“模型是否识别”，还要验证确定性策略是否真正阻断。
