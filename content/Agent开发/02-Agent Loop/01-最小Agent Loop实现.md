# 最小 Agent Loop 实现

## 1. 最小组成

一个可运行的最小 Agent 至少包含：

1. LLM client；
2. 对话与状态容器；
3. 工具定义和 JSON Schema；
4. tool call 解析；
5. 参数校验与工具执行；
6. tool result 回填；
7. 最终答案识别；
8. 最大步数、超时、取消和错误分类。

“模型输出一段 JSON”只是决策，不是完整闭环。只有结果回填后模型继续判断，才形成 Agent Loop。

## 2. 消息顺序

通用顺序如下：

```text
system: 目标、规则、工具说明
user: 当前任务
assistant: tool_call(id=call_1, name=read_file, args={...})
tool: tool_result(tool_call_id=call_1, content={...})
assistant: tool_call(...) 或 final_answer
```

关键不变量是每个调用 ID 与结果对应。并行调用时，也要保持协议要求的结果集合和顺序。

## 3. 参考实现

```ts
async function runAgent(goal: string, tools: Tool[], options: Options) {
  const state = createInitialState(goal, options)

  while (state.step < state.maxSteps && Date.now() < state.deadline) {
    const response = await callModel({
      messages: state.messages,
      tools: tools.map(toToolSchema),
      signal: state.abortSignal,
    })

    if (response.type === 'final') {
      return validateFinal(response.text, state)
    }

    for (const call of response.toolCalls) {
      const tool = findTool(tools, call.name)
      const parsed = tool.inputSchema.safeParse(call.arguments)
      const result = parsed.success
        ? await executeWithTimeout(tool, parsed.data)
        : invalidArgumentsResult(parsed.error)

      state.messages.push(toToolResultMessage(call.id, result))
      state.trace.push({ call, result })
    }

    state.step += 1
  }

  return stopResult(state)
}
```

## 4. 错误要进入观察

将错误分成模型可利用的结构：

```json
{
  "ok": false,
  "error": {
    "type": "INVALID_ARGUMENT",
    "message": "path is required",
    "retryable": true,
    "fields": { "path": "missing" }
  }
}
```

参数错误可以让模型修正；权限拒绝通常需要换方案；超时可按幂等性决定重试；业务校验失败则应补充上下文或终止。

## 5. 最小验证清单

- 工具调用与结果 ID 对应；
- 未知工具不会执行；
- 非法参数不会进入 handler；
- 工具异常转成结构化结果；
- 超过最大步数会停止；
- 用户取消可中断模型和工具；
- 最终答案之前执行完成度验证；
- trace 能重建每一步。

## 参考资料

- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [Claude Tool Use](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview)
- [Gemini Function Calling](https://ai.google.dev/gemini-api/docs/function-calling)
