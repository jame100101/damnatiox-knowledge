# SKILL.md 设计、渐进加载与 Smoke Test

## 1. 建议目录

```text
release-note-writer/
  SKILL.md
  scripts/
    collect-changes.ts
  templates/
    release-note.md
  examples/
    sample-output.md
  tests/
    smoke-cases.json
```

## 2. SKILL.md 内容

```yaml
---
name: release-note-writer
description: Generate verified release notes from git history and linked issues.
---
```

正文包含：

- 触发条件与不适用场景；
- 输入和前置条件；
- 分步流程；
- 使用哪些脚本/模板；
- 失败和回退；
- 验收标准；
- 最小输出格式。

Description 要便于发现，但不要堆所有实现细节。

## 3. Progressive Disclosure

三层加载：

1. **元数据层**：名称和简短描述始终可检索；
2. **说明层**：任务匹配后加载 SKILL.md；
3. **资源层**：执行到对应步骤时再读取脚本、模板和示例。

这样减少 token，同时避免把不相关脚本注入每个任务。

## 4. 脚本与模板

- 重复、确定性操作放脚本；
- 输出结构放模板；
- 复杂边界放示例；
- 脚本参数要有 help 和校验；
- 不把密钥写入 Skill；
- 资源路径相对 Skill 根目录；
- 标注运行时与依赖版本。

## 5. 验收标准

好的标准可执行：

- 版本范围来自真实 tag；
- 每条 breaking change 有来源；
- 链接可访问；
- 模板所有必填段已生成；
- 输出通过 Markdown lint；
- 没有未替换占位符。

“写得专业”太主观，应拆成可检查 rubric。

## 6. Smoke Test

准备小型 fixture：

```json
{
  "input": { "from": "v1.0.0", "to": "v1.1.0" },
  "expected": {
    "sections": ["Features", "Fixes", "Breaking Changes"],
    "sourceCoverage": 1.0,
    "unresolvedPlaceholders": 0
  }
}
```

比较无 Skill 与有 Skill 的成功率、步骤、成本和错误类型。Skill 只有在任务指标改善时才算有效。
