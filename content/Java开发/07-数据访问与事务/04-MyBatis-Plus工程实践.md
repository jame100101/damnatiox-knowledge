# MyBatis-Plus 工程实践

MyBatis-Plus 在 MyBatis 上提供通用 Mapper、条件构造器、分页和插件，以减少重复 CRUD。它保留 MyBatis 的 SQL 模型，复杂查询、索引与事务仍需开发者负责。

## 1. 学习目标

- 掌握 BaseMapper 与 LambdaWrapper
- 理解分页、乐观锁、逻辑删除与多租户插件
- 避免字段泄漏、SQL 注入和无条件更新

## 2. 核心概念

### 1. 实体与 Mapper

`@TableName`、`@TableId`、`@TableField` 描述映射，`BaseMapper` 提供常用单表方法。DTO、领域对象和数据库实体职责不同，外部请求不应直接控制实体全部字段。

**正确边界：** 通用 CRUD 只减少样板，不应让 Controller 直接暴露 Mapper。

### 2. 条件构造器

LambdaWrapper 用方法引用表达列，降低字符串列名重构风险。动态条件应显式控制，排序字段使用白名单，禁止把客户端片段传给 `last`/`apply`。

**正确边界：** 参数值通常会绑定，但原样拼接 SQL 片段仍可能形成注入。

### 3. 插件

分页插件改写 count 和 page SQL；乐观锁插件依赖 version 条件更新；逻辑删除用标记替代物理删除；多租户插件注入 tenant 条件。插件顺序和不适用语句需测试。

**正确边界：** 逻辑删除不能自动满足隐私擦除；多租户插件也不能替代数据库权限与测试。

### 4. 批量与性能

批量写需要控制批大小、事务长度、驱动选项和失败定位。分页 count 对复杂查询可能昂贵；大数据滚动使用稳定唯一排序的游标。

**正确边界：** `saveBatch` 不保证所有数据库/驱动场景都生成单条批语句，应以日志和指标验证。

## 3. 运行链路

```mermaid
flowchart LR
  A["DTO"] --> B["应用服务"]
  B --> C["LambdaWrapper/自定义SQL"]
  C --> D["MyBatis-Plus拦截器链"]
  D --> E["MyBatis参数绑定"]
  E --> F["数据库约束与索引"]
```

## 4. 最小示例

```java
Page<UserEntity> page = new Page<>(1, 20, true);
LambdaQueryWrapper<UserEntity> query = Wrappers.lambdaQuery();
query.eq(UserEntity::getTenantId, tenantId)
    .eq(status != null, UserEntity::getStatus, status)
    .likeRight(keyword != null, UserEntity::getName, keyword)
    .orderByDesc(UserEntity::getId);

IPage<UserEntity> result = userMapper.selectPage(page, query);
```

## 5. 练习与验证

1. 验证乐观锁冲突时受影响行数
2. 对复杂分页检查 count SQL
3. 测试租户条件覆盖查询、更新和删除

## 6. 常见误区

- 从请求接收任意排序字段并拼接
- 忽略批量事务过大与失败定位
- 把逻辑删除当作自动数据归档

## 7. 掌握检查

- [ ] 能不用术语堆砌，向初学者解释本主题解决的问题。
- [ ] 能运行示例并观察正常、边界和失败分支。
- [ ] 能说明该能力在完整 Java 后端链路中的位置和替换边界。
- [ ] 能以测试、执行计划、指标或规范条款验证关键结论。

## 参考资料

- [MyBatis-Plus Introduction](https://baomidou.com/en/introduce/)
- [Persistence Layer Interface](https://baomidou.com/en/guides/data-interface/)
- [MyBatis-Plus Plugins](https://baomidou.com/en/plugins/)
