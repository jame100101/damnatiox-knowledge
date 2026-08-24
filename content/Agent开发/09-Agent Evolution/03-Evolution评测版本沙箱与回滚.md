# Evolution 的 Evaluation、Version、Sandbox 与 Rollback

> **Freshness metadata**
> - `last_verified`: `2026-08-24`
> - `version_scope`: `stable release-control patterns`
> - `source_type`: `software-delivery practice + agent evaluation`
> - `stability`: `stable-concept`

## 接受门

- 目标回归集显著改善；
- 关键安全/权限 case 零回退；
- 非目标能力、成本、p95 延迟在预算内；
- 候选生成与评估不存在数据泄漏；
- artifact 可重建、版本可定位、回滚经过演练。

## 版本向量

不要只记录“Agent v2”：至少记录 app commit、prompt/context policy、skill bundle、tool schema/runtime、model/version、dataset、environment image、evaluator。任何一项变化都可能改变结果。

## Sandbox 与 canary

Sandbox 限制文件、网络、process、secret、CPU/memory/time；canary 只接收低风险流量并与 control 组比较。若 guardrail violation、未知 side effect、error rate 或成本越阈值，自动停止并回滚到上一完整版本向量。

## 回滚不等于 Git revert

还要处理 memory/schema migration、队列中的旧任务、已发布 skill cache、模型路由和外部副作用。每次 evolution 发布都应定义 forward/backward compatibility 与 in-flight task 策略。
