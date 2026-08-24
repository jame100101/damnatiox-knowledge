# Testing Portfolio：行为边界、回归与发布证据

> **Freshness metadata**
> - `last_verified`: `2026-08-24`
> - `version_scope`: `JUnit / Spring Test / Testcontainers concepts`
> - `source_type`: `official-docs + engineering synthesis`
> - `stability`: `version-sensitive`

测试金字塔是成本反馈模型，不是固定数量配额。建立 portfolio：

- unit：纯领域规则、快速定位；
- slice：MVC/JPA 等限定 Spring context；
- integration：真实 wiring、数据库、broker/container；
- API/contract：跨服务接口与兼容性；
- end-to-end：关键用户路径；
- regression/performance/security：发布门与非功能边界。

```java
@Test
void duplicateRequestReturnsOriginalOrder() {
    var first = service.create("idem-42", command);
    var second = service.create("idem-42", command);
    assertEquals(first.id(), second.id());
    assertEquals(1, repository.count());
}
```

覆盖率只表示哪些代码被执行，不表示断言质量、边界覆盖或 mutation resistance。关键是测试目标、初始状态、行为、外部副作用和可复现失败证据。
