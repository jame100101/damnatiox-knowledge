# Transaction Boundary、Outbox 与 Idempotency

> **Freshness metadata**
> - `last_verified`: `2026-08-24`
> - `version_scope`: `stable distributed data patterns`
> - `source_type`: `primary-pattern literature + engineering synthesis`
> - `stability`: `stable-concept`

## 问题

数据库提交与 broker publish 是两个系统，普通代码无法让二者天然原子。Transactional outbox 在同一数据库事务写业务记录和 outbox row，独立 relay 发布；consumer 仍可能收到重复消息，因此必须幂等。

```sql
BEGIN;
INSERT INTO orders(id, status) VALUES (:id, 'CREATED');
INSERT INTO outbox(event_id, aggregate_id, event_type, payload)
VALUES (:eventId, :id, 'OrderCreated', :json);
COMMIT;
```

Idempotency key 需要定义 scope、request fingerprint、result retention、并发竞争和过期策略。只在 controller 查一次 key 存在竞态；应使用 unique constraint/transaction 让“首次创建”原子。

## Failure simulation

在 commit 后 publish 前 kill 进程、重复 relay、consumer 处理后 ack 前崩溃、乱序和 poison message。验收要求最终状态正确、重复不产生二次副作用、trace 可从业务 ID 关联 event ID。
