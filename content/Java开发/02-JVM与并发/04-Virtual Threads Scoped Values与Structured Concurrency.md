# Virtual Threads、Scoped Values 与 Structured Concurrency

> **Freshness metadata**
> - `last_verified`: `2026-08-24`
> - `version_scope`: `Virtual Threads stable since Java 21; Scoped Values final in JDK 25; Structured Concurrency sixth preview in JDK 26`
> - `source_type`: `OpenJDK JEP`
> - `stability`: `version-sensitive`

## 1. 四种不同概念

| 概念 | 抽象 | 解决的问题 |
|---|---|---|
| Platform thread | OS 调度线程的 Java 表示 | 通用并发执行 |
| Virtual thread | JVM 调度的轻量 Thread | 大量阻塞型任务的 thread-per-task 成本 |
| Async programming | 以 future/callback 表达稍后完成 | 避免调用线程等待、组合完成事件 |
| Reactive programming | stream + non-blocking + demand/backpressure | 端到端异步数据流和资源控制 |

Virtual Thread 不保证单个请求更快；收益来自能以同步风格承载更多并发阻塞任务。CPU-bound 工作仍受核心数约束。监测连接池、外部 API 和锁等真实瓶颈。

## 2. Scoped Values（JDK 25）

用于在有界调用期间共享不可变/只读式上下文，尤其适合 request identity 或 trace context。它不是全局变量，也不替代显式业务参数。

```java
static final ScopedValue<String> REQUEST_ID = ScopedValue.newInstance();

ScopedValue.where(REQUEST_ID, "req-42").run(() -> service());
```

共享对象本身若可变，仍需同步。不要将 secret 或大型对象无界传播。

## 3. Structured Concurrency（JDK 26 Sixth Preview）

其目标是让父任务与子任务生命周期形成词法结构，统一 join、失败与取消。由于是 Preview，示例需使用 `--enable-preview`，API 可在后续版本继续变化。

```java
// JDK 26 preview：以当期 JEP/API 为准
try (var scope = StructuredTaskScope.open()) {
    var user = scope.fork(this::loadUser);
    var order = scope.fork(this::loadOrder);
    scope.join();
    return new Result(user.get(), order.get());
}
```

## 4. 验证

模拟一个子任务失败、deadline、父任务取消与 scoped binding；确认兄弟任务处理、异常传播、资源关闭和 thread dump/JFR 可观察性。生产基线若禁用 preview，使用稳定 Executor/Future 设计并把迁移封装在边界内。
