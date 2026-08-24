# P0–P8 Java 后端项目阶梯

> **Freshness metadata**
> - `last_verified`: `2026-08-24`
> - `version_scope`: `2026 curriculum; JDK 25 baseline`
> - `source_type`: `engineering synthesis`
> - `stability`: `version-sensitive`

| Level | Goal / Technology | Non-goals | Acceptance / Tests | Observability / Security / Failure |
|---|---|---|---|---|
| P0 Java CLI | 核心语法/API、文件任务 | Spring/DB | unit tests、可执行包 | structured error、坏输入 |
| P1 JDBC Service | SQL/schema/transaction/JDBC | ORM/cache | real DB integration、migration | query timing、rollback/deadlock case |
| P2 Boot REST | MVC、validation、error、config | auth/microservice | API tests/OpenAPI | request id、timeout、invalid payload |
| P3 Tested Persistence | MyBatis 或 JPA、Testcontainers | 多 ORM 炫技 | N+1/locking/batch tests | DB metrics、concurrent update |
| P4 Secure Modular Monolith | Security、feature modules、transaction、outbox | microservices | module verification、authz、contract | audit、duplicate event、secret policy |
| P5 Event-driven App | Kafka/Rabbit/Rocket 选一、idempotent consumer | 三 MQ 全学 | duplicate/order/DLQ tests | lag、retry、poison event |
| P6 Distributed Service | service/data boundary、gateway、resilience | 为拆而拆 | contract/partial-failure tests | trace、timeout、circuit、saga |
| P7 Cloud-native Production | container/K8s/CI-CD/OTel/SLO | 只写 YAML | canary/rollback/load/DR | dashboard、runbook、incident |
| P8 Optional Spring AI | ChatClient/tool/RAG/MCP 选需 | 训练模型 | eval、structured validation | prompt/tool trace、injection/permission |

P4 是核心毕业点：即使项目不进入微服务，也应具备清晰模块、测试、安全、事务、可观察事件与运维证据。

每级 Deliverables：source、README、ADR、schema/migration、tests、CI、failure report、trace/metrics screenshot 或 machine-readable artifact。下一级只能在上一层验收通过后引入。
