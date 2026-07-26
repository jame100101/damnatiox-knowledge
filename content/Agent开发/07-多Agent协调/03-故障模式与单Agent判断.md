# 多 Agent 故障模式与单 Agent 判断

## 1. 常见故障

### 循环争论

Reviewer 和 Writer 没有明确 rubric 与最大轮数，反复交换意见。解决：固定验收项、差异化上下文、返工预算和终止规则。

### 任务漂移

子 Agent 将“研究一个模块”扩展成重构整个项目。解决：objective、write scope、allowed tools、output schema 和 change budget。

### 上下文膨胀

每个 Agent 都继承全量历史，再把完整输出广播。解决：引用式共享、局部上下文、结构化摘要和对象存储。

### 事实被投票取代

多个 Agent 说法一致不代表正确。事实结论要依赖 Evidence，而不是多数票。

### 写冲突

并发修改同一文件或状态。解决：资源所有权、worktree/分支、乐观锁、合并验证。

### 权限放大

子 Agent 获得父 Agent 全部权限。解决：最小委派 token、工具白名单、资源 scope 和过期时间。

## 2. 单 Agent 基线

先用单 Agent 跑固定任务集，记录：

- 成功率；
- 平均步骤；
- token/成本；
- 延迟；
- 人工干预；
- 错误分类；
- trace 可读性。

再引入多 Agent，对比是否真正改善关键指标。若成功率相同但成本与故障点显著增加，应保留单 Agent。

## 3. 拆分信号

适合拆分：

- 子任务可独立验证；
- 并行能显著缩短时延；
- 需要完全不同工具或上下文；
- 独立 reviewer 能捕获可量化缺陷；
- 权限隔离有实际价值。

不适合拆分：

- 每一步强依赖上一步微小细节；
- 任务本身短；
- 没有可靠合并器；
- 产物无法结构化比较；
- 只是希望“多想几遍”。

## 4. 评测设计

做 A/B：

```text
A: single agent + same tools + same total budget
B: supervisor + workers + reviewer + same total budget
```

控制模型、工具和总预算，比较 pass@1、成本、延迟、故障恢复、引用正确性和用户评分，避免多 Agent 因额外 token 获得不公平优势。
