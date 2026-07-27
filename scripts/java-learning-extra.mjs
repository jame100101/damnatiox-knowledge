const ref = {
  jpa: [
    'Spring Data JPA Reference',
    'https://docs.spring.io/spring-data/jpa/reference/jpa.html',
  ],
  hibernate: [
    'Hibernate ORM Documentation',
    'https://hibernate.org/orm/documentation/',
  ],
  mybatis: ['MyBatis 3 Reference', 'https://mybatis.org/mybatis-3/'],
  flyway: ['Flyway Documentation', 'https://documentation.red-gate.com/flyway'],
  hikari: ['HikariCP', 'https://github.com/brettwooldridge/HikariCP'],
  netty: ['Netty Documentation', 'https://netty.io/wiki/'],
  nacos: ['Nacos Documentation', 'https://nacos.io/en/docs/latest/'],
  dubbo: [
    'Apache Dubbo Documentation',
    'https://dubbo.apache.org/en/overview/what/overview/',
  ],
  grpc: ['gRPC Java Basics', 'https://grpc.io/docs/languages/java/basics/'],
  kafka: ['Apache Kafka Documentation', 'https://kafka.apache.org/documentation/'],
  rabbit: ['RabbitMQ Documentation', 'https://www.rabbitmq.com/docs'],
  rocket: [
    'Apache RocketMQ Concepts',
    'https://rocketmq.apache.org/docs/introduction/02concepts/',
  ],
  security: [
    'Spring Security Reference',
    'https://docs.spring.io/spring-security/reference/index.html',
  ],
  oauth: [
    'OAuth 2.0 Security Best Current Practice',
    'https://www.rfc-editor.org/rfc/rfc9700.html',
  ],
  junit: ['JUnit 5 User Guide', 'https://junit.org/junit5/docs/current/user-guide/'],
  mockito: ['Mockito Documentation', 'https://site.mockito.org/'],
  testcontainers: ['Testcontainers for Java', 'https://java.testcontainers.org/'],
  playwright: ['Playwright Java', 'https://playwright.dev/java/'],
  docker: ['Docker Documentation', 'https://docs.docker.com/'],
  kubernetes: ['Kubernetes Documentation', 'https://kubernetes.io/docs/home/'],
  otel: ['OpenTelemetry Java', 'https://opentelemetry.io/docs/languages/java/'],
  vue: ['Vue.js Guide', 'https://vuejs.org/guide/introduction.html'],
  typescript: [
    'TypeScript Handbook',
    'https://www.typescriptlang.org/docs/handbook/intro.html',
  ],
}

function t(name, explanation, points, correctness) {
  return { name, explanation, points, correctness }
}

function d(file, title, summary, scope, topics, process, practice, checks, refs) {
  return { file, title, summary, scope, topics, process, practice, checks, refs }
}

export const extraBackendSections = [
  {
    folder: '06-数据访问与ORM',
    title: '数据访问与 ORM',
    intro:
      '本阶段从 JDBC 连接池出发，比较 SQL Mapper 与 ORM 的抽象边界，并把事务、迁移、查询性能纳入同一设计。',
    refs: [ref.mybatis, ref.jpa, ref.hibernate, ref.flyway, ref.hikari],
    docs: [
      d(
        '01-MyBatis映射与动态SQL.md',
        'MyBatis：映射、动态 SQL、插件与工程边界',
        'MyBatis 保留 SQL 主导权，并负责参数绑定、结果映射、会话及缓存等基础设施；它不是自动生成全部查询的 ORM。',
        [
          'SqlSession 与 Mapper 代理',
          '参数绑定、ResultMap 与关联映射',
          '动态 SQL、批处理和分页',
          '一级/二级缓存与插件',
        ],
        [
          t(
            '执行链与生命周期',
            '`SqlSessionFactory` 是长期共享工厂，`SqlSession` 表示一次非线程安全的数据库会话；Spring 集成会把会话和事务绑定到当前执行上下文。',
            [
              'Mapper 接口由代理转成 statement id 和参数对象。',
              'Executor、StatementHandler、ParameterHandler、ResultSetHandler 构成核心执行链。',
              '会话使用 try-with-resources 或由 Spring 管理，禁止跨线程共享。',
            ],
            'Mapper 代理可作为线程安全的注入对象，但代理内部使用的会话必须由框架按操作/事务管理。',
          ),
          t(
            '参数与结果映射',
            '`#{}` 使用预编译参数，`${}` 是文本替换；复杂结果通过 ResultMap 显式描述列、属性、标识列和嵌套关系。',
            [
              '默认使用 `#{}`，动态表名/排序列通过白名单映射后再拼接。',
              '用 `<id>` 标识对象身份，避免一对多联接重复组装。',
              '数据库命名与 Java 属性命名差异可显式映射或统一下划线转换。',
            ],
            '`${}` 不做参数化，直接接收请求值会形成注入入口；即使是 ORDER BY 也应映射到固定列名。',
          ),
          t(
            '动态 SQL、批处理与分页',
            '`if/choose/trim/where/set/foreach` 用于按条件生成 SQL。批量写入、分页和大结果集必须结合数据库方言与执行计划。',
            [
              '空集合、空条件和批量大小均设显式边界。',
              '深分页优先基于稳定排序键做 keyset/seek pagination。',
              '批处理提交按数据量切块，并准确处理部分失败。',
            ],
            '客户端一次构造超长 IN 列表既可能超过数据库限制，也会增加解析与网络成本。',
          ),
          t(
            '缓存与插件',
            '一级缓存限定在 SqlSession；二级缓存按 namespace 共享。插件可拦截 Executor、StatementHandler 等接口，但会影响全局语义。',
            [
              '事务写入会使相关缓存失效，跨系统更新仍需额外一致性方案。',
              '分页、审计或租户插件应有 SQL 边界测试。',
              '优先使用显式服务逻辑，插件只承载稳定横切规则。',
            ],
            '二级缓存不是 Redis 的替代，也不保证与数据库外部写入实时一致。',
          ),
        ],
        `\`\`\`mermaid
sequenceDiagram
  participant S as Service
  participant M as Mapper Proxy
  participant E as Executor
  participant D as Database
  S->>M: 调用方法(参数)
  M->>E: statementId + boundSql
  E->>D: PreparedStatement
  D-->>E: ResultSet
  E-->>S: ResultMap 组装对象
\`\`\``,
        [
          '实现带白名单排序和 seek 分页的订单查询。',
          '对一对多映射分别测试 join 和分步查询，比较 SQL 数与数据量。',
          '用数据库真实执行计划验证索引，而不是只看生成的 SQL。',
        ],
        [
          '能解释 `#{}` 与 `${}` 的边界。',
          '能定位 N+1 和映射重复。',
          '能说明一级/二级缓存失效范围。',
          '能为动态 SQL 写边界测试。',
        ],
        [ref.mybatis, ['MyBatis Spring', 'https://mybatis.org/spring/']],
      ),
      d(
        '02-JPA-Hibernate与Spring-Data.md',
        'JPA、Hibernate 与 Spring Data：实体状态、映射和查询',
        'Jakarta Persistence 是规范，Hibernate 是常见实现，Spring Data JPA 在其上提供仓库抽象；三者的职责需要分开理解。',
        [
          '实体生命周期与持久化上下文',
          '关联、继承和值对象映射',
          'JPQL、Criteria、Specification 与原生 SQL',
          '抓取策略、锁和批处理',
        ],
        [
          t(
            '持久化上下文与脏检查',
            '实体处于 transient、managed、detached、removed 等状态。持久化上下文保证同一标识的对象身份，并在 flush 时通过脏检查生成 SQL。',
            [
              '`persist` 管理新实体，`merge` 返回受管副本，原对象仍可能是 detached。',
              'flush 将变更同步到数据库连接，不等于事务已经提交。',
              '长事务会让上下文积累对象，批处理时分批 flush/clear。',
            ],
            '看到对象字段已变不代表其他事务已可见；可见性由数据库隔离和提交决定。',
          ),
          t(
            '关联与聚合边界',
            '一对一、一对多、多对一和多对多映射描述对象关系，但领域聚合和数据库外键仍需独立设计。',
            [
              '双向关联由 owning side 写入外键，双方对象引用由业务代码保持一致。',
              '集合默认避免 EAGER；查询用 fetch join、EntityGraph 或 DTO 投影显式取数。',
              '多对多含业务属性时建独立关联实体。',
            ],
            '把所有关系设为 EAGER 会产生笛卡尔积、重复数据或不可控查询，并不等于消除 N+1。',
          ),
          t(
            '查询抽象选择',
            '派生查询适合简单条件；JPQL 面向实体；Specification/Criteria 适合组合条件；复杂报表或方言特性可用原生 SQL/专用查询层。',
            [
              '列表接口优先 DTO 投影，避免序列化实体图。',
              '分页同时提供稳定排序，并审查 count 查询成本。',
              '查询结果数量和 SQL 次数纳入自动化测试。',
            ],
            'Repository 方法名很长通常说明查询语义已超出派生查询的可读范围。',
          ),
          t(
            '并发控制与批处理',
            '乐观锁通过版本列检测丢失更新，悲观锁由数据库锁定记录/范围。批处理还受主键生成策略、flush 频率和 JDBC batching 影响。',
            [
              '捕获乐观锁冲突后按业务语义提示或有限重试。',
              '锁顺序固定、事务短小，减少死锁窗口。',
              '批量导入与在线事务使用不同资源配额。',
            ],
            '自动重试整个非幂等业务可能重复外部副作用；重试边界必须明确。',
          ),
        ],
        `\`\`\`mermaid
stateDiagram-v2
  [*] --> Transient
  Transient --> Managed: persist
  Managed --> Detached: clear/close
  Detached --> Managed: merge 返回副本
  Managed --> Removed: remove
  Managed --> Database: flush SQL
\`\`\``,
        [
          '建立订单、订单项和值对象映射，写出数量、SQL 次数和事务边界测试。',
          '演示 N+1、fetch join、DTO 投影三种方案并比较结果。',
          '用 `@Version` 构造并发更新冲突。',
        ],
        [
          '能区分规范、实现和仓库抽象。',
          '能解释 flush/commit。',
          '能选择抓取策略。',
          '能处理乐观锁冲突。',
        ],
        [
          ref.jpa,
          ref.hibernate,
          [
            'Jakarta Persistence Specification',
            'https://jakarta.ee/specifications/persistence/',
          ],
        ],
      ),
      d(
        '03-连接池事务迁移与数据访问决策.md',
        '连接池、事务、数据库迁移与数据访问技术决策',
        '稳定的数据访问层依赖连接预算、事务语义、模式迁移和可观测性，而不仅是选择 MyBatis 或 JPA。',
        [
          'HikariCP 连接池预算',
          'Spring 事务传播与隔离',
          'Flyway/Liquibase 迁移',
          'MyBatis、JPA、jOOQ/JDBC 决策',
        ],
        [
          t(
            '连接池是受限资源',
            '连接池复用昂贵的数据库连接，并限制应用对数据库的并发压力。池大小由数据库容量、实例数、查询延迟与并发模型共同决定。',
            [
              '总连接预算 = 每实例最大连接数 × 最大实例数，再为运维和迁移预留。',
              '监控 active、idle、pending、acquire timeout 和数据库端会话。',
              '连接泄漏检测用于诊断，不作为日常关闭连接的替代。',
            ],
            '池越大吞吐并非越高；超过数据库并行能力会增加排队、上下文切换和尾延迟。',
          ),
          t(
            'Spring 声明式事务',
            '`@Transactional` 通常由代理拦截公开方法，事务资源绑定到当前线程；传播行为定义嵌套调用如何加入、挂起或新建事务。',
            [
              '默认回滚规则、readOnly、timeout、isolation 均显式理解。',
              '同类自调用绕过代理；异步/新线程不会自动继承事务。',
              '数据库写入与消息发送使用 outbox 等方案连接，而非幻想单机注解覆盖两个系统。',
            ],
            '`REQUIRES_NEW` 会占用额外连接并可能扩大连接池需求，不是“确保提交”的通用按钮。',
          ),
          t(
            '版本化模式迁移',
            '迁移脚本与应用版本一起评审、测试和发布。生产使用 expand/migrate/contract 等兼容步骤，避免新旧实例并存时破坏读写。',
            [
              '历史已执行迁移保持不可变，修复用新版本脚本。',
              '大表 DDL 评估锁、日志、复制延迟和回滚路径。',
              '启动迁移与应用副本扩容解耦，防止多实例竞争。',
            ],
            '回滚应用不一定能回滚数据结构；破坏性迁移需要前向修复与兼容窗口。',
          ),
          t(
            '技术选择矩阵',
            'MyBatis 适合 SQL 可控和复杂查询；JPA 适合聚合持久化和领域模型；JDBC/jOOQ 适合显式 SQL 与类型安全组合。一个系统可按模块选择。',
            [
              '按查询复杂度、对象图、团队技能、性能可预测性选择。',
              '统一事务、异常翻译、连接池和观测，不重复造基础设施。',
              '用基准和执行计划判断性能，不按框架名推测。',
            ],
            '数据访问框架不改变数据库的锁、隔离、索引与事务规律。',
          ),
        ],
        `\`\`\`mermaid
flowchart LR
  A["请求"] --> B["事务代理"]
  B --> C["连接池借连接"]
  C --> D["SQL Mapper / ORM"]
  D --> E["数据库"]
  E --> F["commit / rollback"]
  F --> G["归还连接 + 指标"]
\`\`\``,
        [
          '计算 3 个应用实例的连接预算并模拟池耗尽。',
          '实现可跨两个版本滚动发布的列重命名迁移。',
          '为同一查询分别写 MyBatis/JPA 投影并记录 SQL 与耗时。',
        ],
        [
          '能解释代理和线程边界。',
          '能制定连接预算。',
          '能设计兼容迁移。',
          '能用证据选择数据访问技术。',
        ],
        [
          ref.hikari,
          ref.flyway,
          [
            'Spring Transaction Management',
            'https://docs.spring.io/spring-framework/reference/data-access/transaction.html',
          ],
        ],
      ),
    ],
  },
  {
    folder: '07-分布式与微服务',
    title: '分布式系统与微服务',
    intro:
      '微服务是组织和边界决策，不是默认架构。先掌握故障、时间、复制与一致性，再学习 RPC、注册配置、网关和分布式事务。',
    refs: [
      [
        'Fallacies of Distributed Computing',
        'https://learn.microsoft.com/en-us/azure/architecture/microservices/design/distributed-computing',
      ],
      ref.netty,
      ref.nacos,
      ref.dubbo,
      ref.grpc,
    ],
    docs: [
      d(
        '01-分布式基础CAP-BASE与共识.md',
        '分布式基础：故障模型、CAP、BASE、复制与共识',
        '分布式系统的难点来自网络延迟、部分失败、并发和缺少全局时钟；术语必须放回具体模型与业务不变量中。',
        [
          '故障、超时和时间',
          'CAP 与一致性模型',
          '复制、quorum 与冲突',
          'Paxos、Raft 与 Gossip',
        ],
        [
          t(
            '部分失败与时间',
            '调用超时只能说明截止时间内没有收到结果，远端可能未执行、正在执行或已成功但响应丢失。网络分区、进程暂停和时钟漂移使状态判断具有不确定性。',
            [
              '所有远程调用设置 deadline，并把剩余预算向下游传播。',
              '重试采用退避、抖动、上限和幂等键。',
              '业务顺序依赖逻辑版本/序列，而不是直接相信墙上时钟。',
            ],
            'timeout 不是失败证明；无条件重试可能重复扣款或制造重试风暴。',
          ),
          t(
            'CAP 的精确含义',
            'CAP 讨论发生网络分区时，系统在一致性与可用性之间的选择。这里的一致性通常指线性一致，可用性要求每个非故障节点对请求给出非错误响应。',
            [
              '没有分区时仍需考虑延迟、事务隔离、持久性与成本。',
              '同一系统可对不同数据采用不同策略。',
              'BASE 是工程理念缩写，不是一个可计算的一致性等级。',
            ],
            '把数据库贴成永久的 CP/AP 标签会掩盖具体配置、操作类型和故障条件。',
          ),
          t(
            '复制与一致性模型',
            '主从、多主、无主复制在写入路径、冲突和故障转移上不同。线性一致、顺序一致、因果一致、最终一致提供不同可观察保证。',
            [
              '读写 quorum 关系只在特定复制假设下提供重叠，不自动等于线性一致。',
              '复制延迟会导致读到旧值、单调读破坏或 read-your-writes 破坏。',
              '冲突通过版本、业务合并、CRDT 或人工处理。',
            ],
            '最终一致只说明没有新更新后副本趋同，并未给出收敛时间或冲突语义。',
          ),
          t(
            '共识与 Gossip',
            'Paxos 和 Raft 用于在故障模型下就日志/值达成一致；Raft 以 leader、term、log replication 和 majority 描述。Gossip 适合大规模成员与状态传播，通常追求最终收敛。',
            [
              '共识组多数可用才可持续提交，成员数量影响容错与开销。',
              'leader election 不等于业务主从切换的全部步骤。',
              'Gossip 传播快且去中心化，但不提供线性一致提交。',
            ],
            'Raft 不是分布式锁 API；上层仍需 fencing token、租约和业务状态机。',
          ),
        ],
        `\`\`\`mermaid
flowchart TD
  A["远程操作"] --> B{"在 deadline 内收到结果?"}
  B -->|是| C["验证响应与业务版本"]
  B -->|否| D["状态未知"]
  D --> E{"操作幂等且预算允许?"}
  E -->|是| F["退避 + 抖动重试"]
  E -->|否| G["查询状态/补偿/人工处理"]
\`\`\``,
        [
          '构造响应丢失场景，设计订单创建的幂等键与状态查询。',
          '画出三副本 Raft 在一个节点故障时的提交条件。',
          '为用户资料和余额分别选择一致性模型并说明不变量。',
        ],
        [
          '能准确陈述 CAP 条件。',
          '能解释 timeout 的不确定性。',
          '能区分共识与 Gossip。',
          '能把一致性选择落到业务不变量。',
        ],
        [
          ['CAP FAQ', 'https://www.cs.utexas.edu/~lorenzo/corsi/cs380d/papers/CAP.pdf'],
          ['Raft', 'https://raft.github.io/'],
          [
            'SWIM Paper',
            'https://www.cs.cornell.edu/projects/Quicksilver/public_pdfs/SWIM.pdf',
          ],
        ],
      ),
      d(
        '02-RPC-HTTP-OpenFeign-Dubbo-gRPC与Netty.md',
        '服务通信：HTTP、OpenFeign、Dubbo、gRPC 与 Netty',
        '通信技术选择取决于契约、互操作、延迟、流式需求和运维能力；框架封装不会消除远程调用故障。',
        [
          'HTTP/REST 与契约',
          'OpenFeign 声明式客户端',
          'Dubbo 与 gRPC',
          'Netty 事件循环与背压',
        ],
        [
          t(
            '契约与兼容',
            '服务契约包含路径/方法或 RPC 方法、字段类型、错误模型、认证、超时和幂等语义。演进遵循添加优先、宽读严写与兼容窗口。',
            [
              'OpenAPI/Protobuf 作为可评审和生成代码的契约。',
              '字段删除、重命名、枚举扩展和语义变化均评估旧客户端。',
              '错误用稳定 code 表达，文本只作诊断。',
            ],
            'HTTP 200 包裹所有错误会破坏缓存、网关、监控和客户端通用处理。',
          ),
          t(
            'OpenFeign 与 HTTP 客户端',
            'OpenFeign 将 Java 接口声明映射为 HTTP 请求，便于 Spring Cloud 集成；底层仍需要连接池、DNS、TLS、序列化、deadline 和错误解码。',
            [
              '连接超时与读取超时分开，并设总 deadline。',
              '对可重试方法标注幂等性，限制重试层数。',
              '记录目标服务、方法、状态、延迟和 trace，不记录密钥。',
            ],
            '在网关、客户端库和服务网格同时重试会放大流量，重试所有权需唯一且可观测。',
          ),
          t(
            'Dubbo 与 gRPC',
            'Dubbo 提供服务发现、流量治理和多协议 RPC；gRPC 以 Protobuf 和 HTTP/2 提供 unary、server/client/bidirectional streaming。两者都需要兼容契约和治理。',
            [
              '流式调用明确背压、取消和半关闭语义。',
              '跨语言与外部开放接口优先评估生态和代理兼容。',
              '负载均衡统计与服务发现健康状态必须联动。',
            ],
            '二进制协议通常更紧凑，但端到端性能还受业务处理、TLS、连接复用和消息大小影响。',
          ),
          t(
            'Netty 事件循环',
            'Netty 用 EventLoop 处理 channel 事件，pipeline 中的 handler 负责解码、业务和编码。事件循环线程上阻塞会拖慢同一 loop 的多个连接。',
            [
              '协议帧定义长度/边界，限制消息大小以避免内存攻击。',
              '阻塞业务移交有界执行器，并把结果安全写回 event loop。',
              '高/低水位、读取控制和队列上限实现背压。',
            ],
            '增加工作线程不会自动解决下游阻塞；队列无界只会把过载变成内存和尾延迟问题。',
          ),
        ],
        `\`\`\`mermaid
flowchart LR
  A["IDL/OpenAPI"] --> B["生成/声明客户端"]
  B --> C["连接池 + TLS + Deadline"]
  C --> D["服务发现/负载均衡"]
  D --> E["服务端协议解码"]
  E --> F["业务执行器"]
  F --> G["稳定错误码 + Trace"]
\`\`\``,
        [
          '用 OpenAPI 或 Protobuf 定义可兼容演进的订单契约。',
          '在客户端加入 deadline、幂等重试和指标，模拟慢响应。',
          '写一个 Netty 长度字段协议并验证半包、粘包和超大帧。',
        ],
        [
          '能设计兼容契约。',
          '能控制多层重试。',
          '能解释流式背压。',
          '能避免阻塞 EventLoop。',
        ],
        [
          ref.netty,
          ref.dubbo,
          ref.grpc,
          [
            'Spring Cloud OpenFeign',
            'https://docs.spring.io/spring-cloud-openfeign/reference/',
          ],
        ],
      ),
      d(
        '03-Nacos注册发现与配置治理.md',
        'Nacos：服务注册、发现、健康检查与配置治理',
        '注册中心解决实例寻址，配置中心管理动态配置；两者都需要命名空间、权限、版本和故障策略。',
        [
          '实例与服务模型',
          '健康检查与负载均衡',
          '配置发布与回滚',
          '多环境、权限和容灾',
        ],
        [
          t(
            '服务与实例',
            '服务名、group、namespace、cluster 和实例元数据共同决定注册和查询范围。临时/持久实例在故障感知与存储语义上不同。',
            [
              '服务标识包含应用、环境和接口版本，避免同名污染。',
              '实例地址通过平台注入，不写死宿主机地址。',
              '上下线、优雅停机和注册撤销纳入发布流程。',
            ],
            '注册成功只表示控制面记录存在，不证明业务端点已经 ready。',
          ),
          t(
            '健康与路由',
            '客户端/服务端通过心跳、主动探测或连接状态识别实例，消费者结合权重、区域和健康列表选择目标。',
            [
              'readiness 成功后再接流量，停机先摘流再等待请求结束。',
              '本地缓存保证注册中心短故障时继续使用已知实例。',
              '故障实例剔除速度与误判风险平衡。',
            ],
            '健康检查频率越高并不总更可靠；网络抖动可能造成频繁摘挂和负载震荡。',
          ),
          t(
            '配置版本与发布',
            '配置由 dataId/group/namespace 定位，变更需要校验、灰度、审计、回滚和消费确认。应用收到新值后还要验证语义。',
            [
              '敏感值使用专用密钥系统，不以普通明文配置传播。',
              '配置对象绑定、范围和刷新边界可测试。',
              '破坏性配置通过双读/双配置窗口演进。',
            ],
            '动态刷新不是事务；多个实例看到新配置的时间可能不同，业务逻辑应容忍短暂混合版本。',
          ),
          t(
            '容灾和权限',
            'Nacos 集群本身也会故障。客户端缓存、超时、限流和降级定义控制面不可用时的数据面行为。',
            [
              '最小权限区分发布者、读取者与运维者。',
              '备份命名空间、配置与数据库，定期演练恢复。',
              '监控推送延迟、失败、实例数异常和客户端版本。',
            ],
            '把注册中心做成所有请求的同步依赖会使控制面故障直接扩大为数据面故障。',
          ),
        ],
        `\`\`\`mermaid
sequenceDiagram
  participant P as Provider
  participant N as Nacos
  participant C as Consumer
  P->>P: readiness 通过
  P->>N: register + heartbeat
  C->>N: subscribe service
  N-->>C: healthy instances
  C->>P: load-balanced request
  P->>N: deregister before shutdown
\`\`\``,
        [
          '建立 dev/test/prod 命名空间和最小权限。',
          '模拟 Nacos 短时不可用，验证消费者本地缓存。',
          '发布一个动态限流配置并演练校验、灰度和回滚。',
        ],
        [
          '能区分注册与 readiness。',
          '能设计实例优雅下线。',
          '能治理动态配置。',
          '能说明控制面故障策略。',
        ],
        [
          ref.nacos,
          [
            'Spring Cloud Alibaba Nacos',
            'https://sca.aliyun.com/en/docs/2023/user-guide/nacos/quick-start/',
          ],
        ],
      ),
      d(
        '04-网关负载均衡限流熔断与重试.md',
        'API 网关、负载均衡、限流、熔断、降级与重试',
        '流量治理的目标是保护系统并给调用方可预测语义；每个机制都需要范围、预算、观测和恢复条件。',
        ['L4/L7 与网关职责', '负载均衡与健康', '限流和排队', '超时、重试、熔断与降级'],
        [
          t(
            '网关职责边界',
            '网关负责路由、TLS 终止、认证入口、限流、协议适配和观测等通用能力；核心业务规则留在领域服务。',
            [
              '路由配置版本化，发布前检测冲突和不可达后端。',
              '请求体大小、header、上传和连接限制显式设置。',
              '网关故障域与容量独立规划，避免单点。',
            ],
            '把业务编排全部塞入网关会形成难测试、难扩展的新单体。',
          ),
          t(
            '负载均衡',
            '轮询、最少连接、加权、EWMA、哈希等算法适合不同负载；健康检查和 outlier detection 决定候选集合。',
            [
              '长请求/流式连接关注活动负载而非仅请求数。',
              '一致性哈希减少扩缩容时映射变化，但不替代副本。',
              '客户端负载均衡需及时获得实例变化和区域信息。',
            ],
            '会话黏性隐藏状态问题且削弱均衡；确有需求时仍需故障迁移方案。',
          ),
          t(
            '限流、排队与背压',
            '令牌桶允许可控突发，漏桶平滑输出，固定/滑动窗口按时间计数。限流维度可按租户、接口、来源和全局资源组合。',
            [
              '返回明确状态和 Retry-After，区分配额与过载。',
              '队列必须有界，设置最大等待和丢弃/拒绝策略。',
              '下游容量变化通过自适应或配置更新反映。',
            ],
            '排队不创造容量；无界排队会把拒绝转成超时、内存增长和过期工作。',
          ),
          t(
            '超时、重试、熔断和降级',
            'deadline 限制端到端时间；熔断器按失败/慢调用打开并在半开状态探测恢复；降级返回明确的次优结果。',
            [
              '每层超时小于上层剩余预算，并保留处理响应的时间。',
              '只重试幂等或带幂等键操作，使用退避抖动和 retry budget。',
              '降级结果标识新鲜度与完整性，禁止把伪造成功当真实成功。',
            ],
            '熔断器按依赖和操作隔离；全局一个熔断器会让无关功能互相拖累。',
          ),
        ],
        `\`\`\`mermaid
flowchart LR
  A["请求"] --> B["认证/路由"]
  B --> C{"限流预算"}
  C -->|拒绝| D["429 + Retry-After"]
  C -->|允许| E["有界并发/队列"]
  E --> F["Deadline + 熔断器"]
  F --> G["负载均衡实例"]
  G --> H["成功/明确降级"]
\`\`\``,
        [
          '为读接口设计 token bucket 和 429 契约。',
          '模拟单实例慢调用，验证 outlier、熔断和恢复。',
          '计算三层调用链的 deadline 与 retry budget。',
        ],
        [
          '能区分限流和排队。',
          '能传播 deadline。',
          '能避免重试放大。',
          '能定义诚实的降级语义。',
        ],
        [
          [
            'Spring Cloud Gateway',
            'https://docs.spring.io/spring-cloud-gateway/reference/',
          ],
          ['Resilience4j', 'https://resilience4j.readme.io/docs'],
          [
            'Envoy Load Balancing',
            'https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/overview',
          ],
        ],
      ),
      d(
        '05-分布式ID事务与可靠事件.md',
        '分布式 ID、分布式事务、Outbox、Saga 与可靠事件',
        '跨服务一致性先定义业务不变量与失败补偿，再在本地事务、幂等和事件之间选择最小机制。',
        ['ID 生成', '两阶段提交边界', 'Transactional Outbox', 'Saga、幂等和对账'],
        [
          t(
            '分布式 ID',
            '数据库序列/自增、号段、UUID/ULID 和 Snowflake 类算法在排序、索引局部性、中心依赖和时钟上权衡。',
            [
              '外部公开 ID 避免暴露业务量，可与内部主键分离。',
              'Snowflake 类方案必须治理 worker id、时钟回拨和位宽寿命。',
              'ID 唯一不等于请求幂等；重试仍需业务幂等键。',
            ],
            '按时间大致有序的 ID 不是严格业务顺序，也不应作为全局时钟。',
          ),
          t(
            '原子提交协议',
            'XA/2PC 通过协调器和参与者 prepare/commit 获得原子性，但有锁持有、协调和可用性代价；适合边界明确且基础设施支持的场景。',
            [
              '先评估能否重新划分聚合，在单库事务中维护核心不变量。',
              '超时后查询事务状态，参与者恢复流程可演练。',
              '不要用分布式锁代替事务原子性。',
            ],
            '2PC 保证的范围取决于参与资源和实现，并不包含未参与的外部 HTTP 副作用。',
          ),
          t(
            'Transactional Outbox',
            '业务数据和 outbox 事件在同一本地事务写入，独立发布器把事件发送到 broker；消费者按 event id 幂等处理。',
            [
              '事件包含 schema version、aggregate id、sequence 和 trace context。',
              '发布至少一次，因此消费者去重与可重入是必要设计。',
              '监控未发布积压、失败次数和端到端事件延迟。',
            ],
            'Outbox 解决数据库与事件记录的原子性，不保证 broker 和所有消费者恰好一次。',
          ),
          t(
            'Saga 与对账',
            'Saga 把长事务拆为本地事务序列，通过编排器或事件协同推进，失败时执行语义补偿。补偿不是数据库回滚，而是新的业务操作。',
            [
              '状态机记录每步、重试、补偿和人工介入。',
              '预留资源设置过期时间，补偿可重复执行。',
              '定期对账发现未达最终状态和跨系统差异。',
            ],
            '某些副作用不可逆；设计时需设置确认点、人工流程或风险准备金。',
          ),
        ],
        `\`\`\`mermaid
flowchart LR
  A["本地事务"] --> B["业务表"]
  A --> C["Outbox"]
  C --> D["发布器至少一次发送"]
  D --> E["Broker"]
  E --> F["幂等消费者"]
  F --> G["本地事务/状态机"]
  G --> H["对账与补偿"]
\`\`\``,
        [
          '实现订单表与 outbox 同事务写入并模拟发布器崩溃重启。',
          '为消费者设计去重表和可重入更新。',
          '画出支付失败、库存释放和补偿失败的 Saga 状态机。',
        ],
        [
          '能区分唯一 ID 与幂等键。',
          '能说明 2PC 适用边界。',
          '能实现 Outbox。',
          '能为不可逆步骤设计对账。',
        ],
        [
          [
            'Transactional Outbox Pattern',
            'https://microservices.io/patterns/data/transactional-outbox.html',
          ],
          ['Saga Pattern', 'https://microservices.io/patterns/data/saga.html'],
          ['RFC 9562 UUID', 'https://www.rfc-editor.org/rfc/rfc9562.html'],
        ],
      ),
    ],
  },
  {
    folder: '08-高性能与消息队列',
    title: '高性能与消息队列',
    intro:
      '性能工程从测量和预算开始。消息中间件用于解耦、缓冲和事件流，但交付语义、顺序、积压与恢复必须显式设计。',
    refs: [
      ref.kafka,
      ref.rabbit,
      ref.rocket,
      [
        'Elasticsearch Reference',
        'https://www.elastic.co/docs/reference/elasticsearch',
      ],
    ],
    docs: [
      d(
        '01-性能工程容量规划与JVM诊断.md',
        '性能工程：容量、基准、剖析与 JVM 诊断',
        '优化目标应是可度量的吞吐、延迟分位数、资源与成本，而不是抽象的“更快”。',
        [
          'SLO 与容量模型',
          '正确基准测试',
          'CPU/内存/锁/IO 剖析',
          'JFR、jcmd、GC 日志与压测闭环',
        ],
        [
          t(
            '预算与排队',
            '吞吐、并发与平均响应时间可用 Little 定律在稳定系统中关联。端到端延迟预算分配给网关、排队、服务、数据库和网络。',
            [
              '使用 p50/p95/p99 和错误率，不只看平均值。',
              '容量测试逐步升压，识别饱和点和拐点。',
              '稳态、突发、故障和恢复分别验证。',
            ],
            'Little 定律要求稳定长期平均；系统积压持续增长时直接套用会误导。',
          ),
          t(
            '基准测试方法',
            'JVM 有 JIT、逃逸分析、GC 和预热，微基准使用 JMH 避免死代码消除、常量折叠和错误计时。',
            [
              '端到端压测与微基准回答不同问题。',
              '固定数据、环境、版本和负载生成器容量。',
              '报告置信区间、样本和火焰图证据。',
            ],
            '一次 `System.nanoTime` 循环不是可靠 JVM 微基准。',
          ),
          t(
            '证据驱动剖析',
            'CPU profile 找热点，allocation profile 找分配，heap dump 找保留路径，线程转储找阻塞，GC 日志解释暂停与堆行为。',
            [
              '先复现并建立基线，再改一个变量。',
              '区分 CPU 饱和、锁等待、IO 等待和下游排队。',
              '生产优先低开销 JFR，敏感数据采集有权限和留存控制。',
            ],
            '对象数量多不等于泄漏；从 GC Roots 的意外保留路径才是关键证据。',
          ),
          t(
            '优化与验证',
            '优化顺序通常是删除不必要工作、改算法/查询、批量与缓存、减少分配/锁，最后才微调 JVM 参数。',
            [
              '每次优化验证正确性和尾延迟。',
              'GC 选择依据堆、暂停目标和吞吐。',
              '变更设回滚阈值和线上观测。',
            ],
            '增加堆可能减少 GC 频率，也可能增加内存成本和故障转储时间；需要测量。',
          ),
        ],
        `\`\`\`mermaid
flowchart LR
  A["定义 SLO/负载"] --> B["建立基线"]
  B --> C["剖析定位瓶颈"]
  C --> D["提出单一假设"]
  D --> E["实现 + 正确性测试"]
  E --> F["同负载复测"]
  F --> G{"达到目标且无回归?"}
  G -->|否| C
  G -->|是| H["灰度与持续观测"]
\`\`\``,
        [
          '用 JMH 比较两种集合查找，解释预热和 Blackhole。',
          '对一个接口采集 JFR 并区分 CPU、锁与分配热点。',
          '写出峰值、实例数、连接池和数据库容量表。',
        ],
        [
          '能使用分位数和饱和点。',
          '能写可信 JMH。',
          '能读基础 JFR/线程/堆证据。',
          '能验证优化收益与回归。',
        ],
        [
          ['JMH', 'https://openjdk.org/projects/code-tools/jmh/'],
          ['Java Flight Recorder', 'https://docs.oracle.com/en/java/javase/26/jfapi/'],
          [
            'jcmd',
            'https://docs.oracle.com/en/java/javase/26/docs/specs/man/jcmd.html',
          ],
        ],
      ),
      d(
        '02-消息队列基础与可靠消费.md',
        '消息队列基础：交付、顺序、幂等、积压与死信',
        '消息系统在生产者、broker 和消费者之间引入异步边界；可靠性来自协议、持久化、确认、幂等和运维共同作用。',
        [
          '消息模型与分区/队列',
          '至少一次与幂等',
          '顺序、重试和死信',
          '积压、回压和模式演进',
        ],
        [
          t(
            '投递链路与确认',
            '生产确认表示 broker 已按配置接收，不代表消费者完成业务。消费者先处理后确认可减少丢失，但崩溃会重投。',
            [
              '生产端设置 id、key、schema version 和 trace。',
              'broker 副本、持久化和确认级别按损失预算选择。',
              '消费确认只在本地事务成功后发送。',
            ],
            '所谓“发送成功”必须说明成功到哪一层、在何种副本/落盘配置下。',
          ),
          t(
            '至少一次与幂等',
            '常见端到端语义是至少一次，因此消费者以 event id 或业务幂等键去重，并把去重记录与业务更新放在同一本地事务。',
            [
              '去重表设置唯一约束与合理保留期。',
              '更新可用状态机条件或 compare-and-set。',
              '外部副作用使用供应方幂等接口或内部 outbox。',
            ],
            '框架的 exactly-once 通常限定于特定 broker 读写事务，不自动涵盖任意数据库和 HTTP 服务。',
          ),
          t(
            '顺序与失败处理',
            '顺序通常只在队列/分区内成立。选择业务 key 让同一聚合进入同一分区，并用序列号拒绝旧事件。',
            [
              '重试主题/队列采用退避，避免毒消息阻塞主队列。',
              '死信包含原消息、错误、次数和可重放信息。',
              '人工修复与 replay 需要审计和幂等。',
            ],
            '全局顺序显著限制并行度；业务多半只需要单实体顺序。',
          ),
          t(
            '积压与模式演进',
            '消费者速率低于生产速率会积压。监控 lag、最老消息年龄、失败率和处理耗时，并规划扩容、暂停或丢弃策略。',
            [
              '消息 schema 采用兼容演进和消费者驱动验证。',
              '大 payload 存对象存储，消息只传引用和校验信息。',
              '设置 TTL 前确认过期语义和审计需求。',
            ],
            '只增加消费者数受分区数、下游容量和 key 热点限制。',
          ),
        ],
        `\`\`\`mermaid
sequenceDiagram
  participant P as Producer
  participant B as Broker
  participant C as Consumer
  participant D as Database
  P->>B: eventId + key + schema
  B-->>P: broker ack
  B->>C: deliver
  C->>D: 业务更新 + 去重记录(同事务)
  D-->>C: commit
  C-->>B: consumer ack
\`\`\``,
        [
          '模拟消费者提交数据库后、发送 ack 前崩溃，验证去重。',
          '设计毒消息的退避、死信、修复与重放流程。',
          '为订单事件定义兼容 schema 和分区 key。',
        ],
        [
          '能描述确认边界。',
          '能实现幂等消费。',
          '能限定顺序范围。',
          '能治理积压和 replay。',
        ],
        [ref.kafka, ref.rabbit, ref.rocket],
      ),
      d(
        '03-Kafka事件流平台.md',
        'Apache Kafka：日志、分区、副本、消费组与事务',
        'Kafka 把 topic 表示为分区追加日志，消费者以 offset 追踪位置，适合事件流、日志集成和可重放处理。',
        [
          'Topic/partition/record',
          '副本、leader 与 producer ack',
          '消费组与 offset',
          '幂等生产、事务与再均衡',
        ],
        [
          t(
            '日志与分区',
            'record 按 key 分配到 partition，分区内有序并以 offset 定位；保留按时间/大小或 compact 策略执行。',
            [
              '分区数决定最大并行度和元数据开销。',
              'key 选择兼顾实体顺序与热点。',
              'compact 保留每个 key 的最近值语义，不等同于立即只留一条。',
            ],
            'offset 不是跨分区的全局时间顺序。',
          ),
          t(
            '生产可靠性',
            'acks、min.insync.replicas、副本因子和 unclean leader election 共同影响耐久性与可用性。幂等 producer 避免单会话重试重复。',
            [
              '批量、linger、压缩在延迟与吞吐间权衡。',
              '处理超大消息会影响网络、内存和复制。',
              '监控 ISR、under-replicated partition 和请求错误。',
            ],
            'acks=all 的强度依赖 ISR 配置和 broker 持久性，仍需说明故障模型。',
          ),
          t(
            '消费组与再均衡',
            '同组内每个分区同时由一个成员消费；成员变化触发分区再分配。offset 提交位置必须与业务处理语义一致。',
            [
              '批量拉取后逐条失败要记录精确进度。',
              '长处理调整 poll/heartbeat 参数或把工作移交并控制并发。',
              '静态成员与 cooperative rebalance 可减少停顿，但不消除故障。',
            ],
            '先提交 offset 再处理会造成丢失窗口；处理后提交会产生可控重投。',
          ),
          t(
            '事务与流处理',
            'Kafka 事务可原子写多个分区并提交消费 offset，read_committed 消费者过滤未提交记录；Kafka Streams 用 state store 和 changelog 支撑状态处理。',
            [
              '事务 id 在实例间唯一且支持 fencing。',
              '外部数据库仍用 outbox/idempotency 连接。',
              '状态存储配置恢复时间和磁盘预算。',
            ],
            'Kafka exactly-once 语义有明确系统边界，不覆盖任意外部副作用。',
          ),
        ],
        `\`\`\`mermaid
flowchart LR
  P["Producer key"] --> T["Topic"]
  T --> P0["Partition 0"]
  T --> P1["Partition 1"]
  T --> P2["Partition 2"]
  P0 --> C1["Consumer group: C1"]
  P1 --> C2["Consumer group: C2"]
  P2 --> C1
\`\`\``,
        [
          '建立三分区 topic，验证同 key 顺序和跨分区无全序。',
          '模拟消费者再均衡和处理后未提交 offset。',
          '比较普通 producer、幂等 producer 与事务 producer 的边界。',
        ],
        [
          '能设计分区 key。',
          '能解释 ISR 与 ack。',
          '能处理再均衡。',
          '能准确限定 Kafka 事务。',
        ],
        [ref.kafka, ['Kafka Design', 'https://kafka.apache.org/documentation/#design']],
      ),
      d(
        '04-RabbitMQ与RocketMQ.md',
        'RabbitMQ 与 RocketMQ：路由、队列、可靠性和选择',
        'RabbitMQ 擅长灵活 AMQP 路由和工作队列；RocketMQ 面向大规模消息与事务/延时等业务能力。选择应基于语义和运维证据。',
        [
          'RabbitMQ exchange/binding/queue',
          'publisher confirms 与 consumer ack',
          'quorum queue 与死信',
          'RocketMQ topic、consumer group 与事务消息',
        ],
        [
          t(
            'RabbitMQ 路由模型',
            'producer 发布到 exchange，exchange 按 direct/topic/fanout/headers 规则路由到 binding queue；消费者从队列取消息。',
            [
              'exchange/queue 声明需兼容，durable 与消息持久化分别配置。',
              'prefetch 限制未确认消息并形成消费者背压。',
              'mandatory/alternate exchange 处理不可路由消息。',
            ],
            '消息成功到 exchange 不表示一定进入预期队列；需处理 unroutable 反馈。',
          ),
          t(
            'RabbitMQ 可靠性',
            'publisher confirms、持久消息、持久/quorum queue 和 consumer ack 共同建立链路。quorum queue 基于 Raft 复制，适合需要数据安全的队列。',
            [
              '确认使用异步批量关联，避免逐条同步等待。',
              'consumer nack/requeue 设置次数和退避，避免忙循环。',
              '监控 ready/unacked、内存/磁盘告警和节点分区。',
            ],
            '镜像/副本不会修复消费者非幂等，也不会保证外部数据库原子提交。',
          ),
          t(
            '死信与延时',
            'TTL、拒绝、队列长度等可触发 dead-letter；死信交换把消息转入重试或人工队列。延时策略需关注排序、容量和过期扫描。',
            [
              '死信原因、原始 routing key、重试次数写入可审计 header。',
              '重试队列按等级设置，不无限自循环。',
              '最终失败进入人工可查询状态。',
            ],
            '死信转发本身也可能失败，配置和监控必须覆盖目标交换机/队列。',
          ),
          t(
            'RocketMQ 语义与选择',
            'RocketMQ 以 topic、message queue、producer/consumer group 组织消息，并提供顺序、延时和事务消息等能力；事务消息通过半消息和回查连接本地事务状态。',
            [
              '事务回查实现幂等并能从持久状态判断。',
              '顺序范围由 message group/queue 决定。',
              '按团队运维能力、生态、延迟与功能验证选型。',
            ],
            '事务消息仍需要消费者幂等，并且本地事务状态查询必须可靠。',
          ),
        ],
        `\`\`\`mermaid
flowchart LR
  P["Publisher"] --> E["Exchange / Topic"]
  E --> Q1["业务队列"]
  E --> Q2["重试队列"]
  Q1 --> C["幂等消费者"]
  C -->|失败到上限| DLQ["死信/人工队列"]
\`\`\``,
        [
          '搭建 RabbitMQ topic exchange，验证不可路由消息与 publisher confirm。',
          '模拟 consumer nack/requeue，修复为有界退避和死信。',
          '为订单事务消息写状态回查决策表。',
        ],
        [
          '能解释 exchange 与 queue。',
          '能组合 confirms/acks/持久化。',
          '能治理死信。',
          '能按语义选择 broker。',
        ],
        [
          ref.rabbit,
          ['RabbitMQ Quorum Queues', 'https://www.rabbitmq.com/docs/quorum-queues'],
          ref.rocket,
        ],
      ),
      d(
        '05-缓存CDN分库分表与热点治理.md',
        '缓存、CDN、读写分离、分库分表与热点治理',
        '扩展数据路径应先优化模型、索引和缓存，再引入复制或分片；每一层都增加一致性和运维成本。',
        ['多级缓存与失效', 'CDN 与边缘缓存', '读写分离', '分片、全局查询与热点'],
        [
          t(
            '缓存策略',
            'cache-aside 由应用读缓存、miss 查库并回填，写入通常先提交数据库再失效缓存。TTL、版本和事件失效共同限制陈旧窗口。',
            [
              '空值缓存/布隆过滤器防穿透。',
              '互斥回填、逻辑过期或请求合并防击穿。',
              '随机 TTL、容量策略与预热防雪崩。',
            ],
            '删除缓存失败仍会陈旧；关键数据需要重试、事件或版本校验，不能声称强一致。',
          ),
          t(
            'CDN 与 HTTP 缓存',
            'CDN 依据 URL、header 和缓存键在边缘保存静态或可缓存响应。Cache-Control、ETag、Vary 和 purge 决定新鲜度。',
            [
              '缓存键必须包含影响内容的租户/语言等维度。',
              '私有响应与认证 header 默认不进入共享缓存。',
              '资源使用内容哈希 URL，HTML 使用短 TTL/重验证。',
            ],
            'CDN purge 有传播延迟，敏感撤回需要短 TTL、版本 URL 或边缘鉴权配合。',
          ),
          t(
            '读写分离',
            '写入主库、读取副本可扩展读，但复制延迟会破坏 read-your-writes。路由需按一致性要求而非接口名称决定。',
            [
              '写后短时间读主库或携带复制位置。',
              '副本 lag 超阈值摘除，报表与在线流量隔离。',
              '故障切换防脑裂并验证数据点。',
            ],
            '读副本不是无成本容量，长查询仍会占 IO/缓存并影响复制。',
          ),
          t(
            '分片与热点',
            '分片键决定数据分布、查询路由和扩容成本。范围、哈希、目录和一致性哈希各有权衡。',
            [
              '优先让高频操作单分片完成。',
              '全局唯一约束、跨分片事务和排序需单独设计。',
              '热点 key 可拆分、局部缓存或隔离，但合并语义必须正确。',
            ],
            '分库分表不会自动提升单条复杂 SQL，且会把 JOIN、事务、迁移和查询复杂度移到应用/中间件。',
          ),
        ],
        `\`\`\`mermaid
flowchart LR
  U["用户"] --> CDN["CDN"]
  CDN --> APP["应用"]
  APP --> C["本地/Redis 缓存"]
  C -->|miss| R{"一致性要求"}
  R -->|强读| P["主库/目标分片"]
  R -->|可陈旧读| S["只读副本"]
\`\`\``,
        [
          '设计用户资料的缓存键、TTL、失效失败和写后读策略。',
          '为一个多租户订单表比较两种分片键。',
          '演练副本 lag 和热点 key，记录保护动作。',
        ],
        [
          '能说明缓存陈旧窗口。',
          '能正确配置共享缓存键。',
          '能处理写后读。',
          '能分析分片代价。',
        ],
        [
          ['Redis Caching', 'https://redis.io/docs/latest/develop/use/'],
          [
            'MDN HTTP Caching',
            'https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching',
          ],
          [
            'MySQL Replication',
            'https://dev.mysql.com/doc/refman/8.4/en/replication.html',
          ],
        ],
      ),
    ],
  },
  {
    folder: '09-安全认证与授权',
    title: '安全、认证与授权',
    intro:
      '安全贯穿身份、会话、输入、数据、依赖、配置和审计。Spring Security 提供机制，系统仍需明确威胁模型和业务授权。',
    refs: [
      ref.security,
      ref.oauth,
      [
        'OWASP ASVS',
        'https://owasp.org/www-project-application-security-verification-standard/',
      ],
    ],
    docs: [
      d(
        '01-Spring-Security过滤链与方法授权.md',
        'Spring Security：过滤链、认证、授权与方法安全',
        'Spring Security 在 Servlet 应用中通过 SecurityFilterChain 建立安全上下文，并在请求与方法边界执行认证和授权。',
        [
          '过滤链与 SecurityContext',
          'AuthenticationProvider',
          '请求与方法授权',
          '密码、会话与审计',
        ],
        [
          t(
            '过滤链和上下文',
            '请求先匹配一条 `SecurityFilterChain`，过滤器按顺序处理上下文加载、认证机制、异常转换和授权。上下文默认与当前请求线程关联。',
            [
              '多条 chain 的 matcher 从专用到通用排列。',
              '异步任务显式传播最小身份信息。',
              '拒绝响应区分未认证 401 与权限不足 403。',
            ],
            '自己插入 filter 时顺序错误会绕过或重复处理；优先使用框架 DSL 和标准扩展点。',
          ),
          t(
            '认证提供者',
            'AuthenticationManager 把凭据交给匹配的 AuthenticationProvider；成功后返回已认证主体与 authorities。密码以自适应单向哈希保存。',
            [
              'BCrypt/Argon2 等参数随硬件和风险升级。',
              '登录失败信息避免账号枚举，同时保留内部审计原因。',
              'MFA、设备和风险策略属于更高层认证流程。',
            ],
            '加密密码后可解密与密码哈希是不同方案；服务端保存的是不可逆验证值。',
          ),
          t(
            '授权模型',
            '请求授权保护 URL，方法授权保护服务操作；RBAC 易管理，ABAC/资源所有权表达上下文。默认拒绝和最小权限减少漏配。',
            [
              '权限使用业务动作如 `order:refund`，不要只依赖角色名。',
              '对象级授权在加载/修改资源时检查租户与所有权。',
              '管理员操作和权限变化记录不可抵赖审计。',
            ],
            '隐藏按钮只是用户体验，不是授权；服务端每个敏感操作仍检查权限。',
          ),
          t(
            '会话与注销',
            'Cookie 会话由服务端状态和浏览器 cookie 标识，需 Secure、HttpOnly、SameSite、固定攻击防护和过期策略。注销使会话/refresh token 失效。',
            [
              '登录后轮换 session id。',
              '并发会话和绝对/空闲超时按风险设置。',
              '集群会话可共享存储或使用粘性，但都规划故障。',
            ],
            '删除浏览器 cookie 不一定撤销服务端会话或其他设备令牌。',
          ),
        ],
        `\`\`\`mermaid
flowchart LR
  A["HTTP Request"] --> B["SecurityFilterChain 匹配"]
  B --> C["认证过滤器"]
  C --> D["AuthenticationProvider"]
  D --> E["SecurityContext"]
  E --> F["URL 授权"]
  F --> G["Controller"]
  G --> H["方法/对象级授权"]
\`\`\``,
        [
          '为普通用户、运营和管理员设计动作权限矩阵。',
          '写 401、403、跨租户访问和方法授权测试。',
          '演练密码参数升级与会话注销。',
        ],
        [
          '能画出过滤链。',
          '能区分认证和授权。',
          '能实现对象级授权。',
          '能解释安全会话配置。',
        ],
        [
          ref.security,
          [
            'Spring Security Architecture',
            'https://docs.spring.io/spring-security/reference/servlet/architecture.html',
          ],
          [
            'Password Storage',
            'https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html',
          ],
        ],
      ),
      d(
        '02-OAuth2-OIDC-JWT与API安全.md',
        'OAuth 2.0、OIDC、JWT 与 API 安全',
        'OAuth 2.0 是委托授权框架，OIDC 在其上提供身份层，JWT 是一种令牌格式；三者不是同义词。',
        [
          '授权码与 PKCE',
          'OIDC ID Token',
          'JWT 验证',
          'Refresh token、撤销与资源服务器',
        ],
        [
          t(
            '角色与流程',
            'OAuth 定义 resource owner、client、authorization server 和 resource server。浏览器/移动端通常使用 Authorization Code + PKCE。',
            [
              'redirect URI 精确匹配，state 防请求关联攻击，nonce 关联 OIDC 登录。',
              '公开客户端不保存 client secret。',
              '避免隐式授权和资源所有者密码流程。',
            ],
            'OAuth access token 证明授权，不天然证明用户登录属性；OIDC ID Token 面向 client 身份会话。',
          ),
          t(
            'JWT 验证',
            'JWT 是带声明的 JWS/JWE 容器。资源服务器验证签名算法、issuer、audience、有效期、not-before 和业务权限。',
            [
              '算法由服务端配置白名单，不信任 header 自选。',
              '按 `kid` 获取并缓存可信 JWK，处理轮换。',
              '令牌只放必要声明，避免敏感数据和过大 header。',
            ],
            'Base64URL 编码不是加密；签名 JWT 的 payload 对持有者可见。',
          ),
          t(
            '令牌生命周期',
            '短 access token 限制泄露窗口；refresh token 用于获取新 token，并执行 rotation、重用检测和客户端绑定。',
            [
              '撤销、登出、密码/权限变化定义传播延迟。',
              '浏览器 token 优先安全 cookie/BFF，降低脚本窃取面。',
              '服务间使用专用 client identity 和最小 scope。',
            ],
            '“无状态 JWT”不代表系统没有状态；密钥、授权、撤销、客户端和审计仍是状态。',
          ),
          t(
            'API 防护',
            'API 除身份外还需输入校验、对象级授权、CSRF/CORS、速率限制、审计和秘密管理。',
            [
              'CORS 是浏览器读取策略，不是认证。',
              'cookie 认证的状态变更请求使用 CSRF token/SameSite 等防护。',
              '输出编码、参数化查询和安全反序列化分别处理不同注入面。',
            ],
            '允许任意 Origin 并携带凭据会扩大跨站风险；规则应是明确来源白名单。',
          ),
        ],
        `\`\`\`mermaid
sequenceDiagram
  participant U as Browser
  participant C as Client/BFF
  participant A as Authorization Server
  participant R as Resource Server
  U->>A: authorize + PKCE challenge + state
  A-->>C: code
  C->>A: code + verifier
  A-->>C: access token / ID token
  C->>R: access token
  R->>R: 验签 + iss/aud/exp/scope
  R-->>C: resource
\`\`\``,
        [
          '画出 BFF 授权码+PKCE流程和威胁点。',
          '为资源服务器写错误 issuer、audience、过期和权限不足测试。',
          '设计 refresh rotation 与重用检测状态。',
        ],
        [
          '能区分 OAuth/OIDC/JWT。',
          '能完整验证 JWT。',
          '能安全管理 refresh token。',
          '能区分 CORS 与 CSRF。',
        ],
        [
          ref.oauth,
          [
            'OpenID Connect Core',
            'https://openid.net/specs/openid-connect-core-1_0.html',
          ],
          [
            'Spring Security OAuth2',
            'https://docs.spring.io/spring-security/reference/servlet/oauth2/',
          ],
        ],
      ),
      d(
        '03-应用安全秘密供应链与审计.md',
        'Java 应用安全：输入、秘密、供应链、文件与审计',
        '应用安全需要把不可信输入限制在语法和业务边界内，并建立秘密、依赖、文件、日志和运行时的纵深防护。',
        [
          '输入与反序列化',
          '文件上传/SSRF/路径',
          '秘密与依赖供应链',
          '审计、隐私和安全测试',
        ],
        [
          t(
            '输入与输出边界',
            '输入先做长度、类型、格式和业务约束；数据库参数化、HTML 上下文编码、命令参数隔离分别防御不同解释器。',
            [
              '禁止把用户值拼进 SQL、shell、模板或表达式。',
              'JSON 多态反序列化采用类型白名单与大小/深度限制。',
              '错误响应稳定且不泄露堆栈、SQL 和内部路径。',
            ],
            '单一“过滤特殊字符”不能覆盖不同解释器语法和编码上下文。',
          ),
          t(
            '文件与网络访问',
            '上传验证大小、实际类型、扩展、名称和解压配额，存储在不可执行的独立位置。服务端取 URL 防 DNS 重绑定和内网访问。',
            [
              '生成服务端文件名，规范化并确认路径仍在根目录。',
              '图片/文档转码放隔离进程并设超时。',
              '出站网络默认限制目标、端口和重定向。',
            ],
            '只检查文件扩展名或最初 DNS 解析结果不足以覆盖内容伪装与重绑定。',
          ),
          t(
            '秘密和供应链',
            '密钥来自 Secret Manager/KMS 或平台挂载，具备最小权限、轮换、审计和吊销。依赖锁定、SBOM、签名/provenance 和漏洞响应组成供应链控制。',
            [
              '仓库凭据不写入 Git、镜像层和构建日志。',
              '依赖升级在兼容测试后及时发布。',
              'CI 的第三方 action/plugin 固定可信版本并限制 token。',
            ],
            '环境变量也可能被进程转储、诊断端点或日志泄露，仍需访问控制和最小暴露。',
          ),
          t(
            '审计与验证',
            '安全审计记录主体、动作、资源、结果、时间、来源和关联 ID，并保护完整性。SAST、SCA、DAST、测试和人工评审覆盖不同缺陷。',
            [
              '敏感数据脱敏并定义留存、访问与删除。',
              '安全事件告警有责任人和处置 runbook。',
              '权限、越权、重放和并发竞态写成测试。',
            ],
            '应用日志不等于合规审计；后者需要完整性、稳定结构和严格访问。',
          ),
        ],
        `\`\`\`mermaid
flowchart TD
  A["不可信输入"] --> B["大小/类型/语法校验"]
  B --> C["业务授权与不变量"]
  C --> D["参数化/上下文编码"]
  D --> E["最小权限资源"]
  E --> F["审计 + 指标 + 告警"]
\`\`\``,
        [
          '为上传接口测试路径穿越、伪造类型、压缩炸弹和超量。',
          '生成 SBOM 并为一个高危依赖写响应步骤。',
          '审查日志并移除 token/密码/个人敏感值。',
        ],
        [
          '能按解释器选择防护。',
          '能安全处理文件和 SSRF。',
          '能轮换秘密。',
          '能设计可验证审计。',
        ],
        [
          [
            'OWASP ASVS',
            'https://owasp.org/www-project-application-security-verification-standard/',
          ],
          ['OWASP Cheat Sheet Series', 'https://cheatsheetseries.owasp.org/'],
          ['CycloneDX Maven Plugin', 'https://cyclonedx.org/tool-center/'],
        ],
      ),
    ],
  },
  {
    folder: '10-测试与质量工程',
    title: '测试与质量工程',
    intro:
      '测试以风险和反馈速度组织：小范围测试提供快速定位，真实依赖测试覆盖集成语义，端到端和性能测试验证关键用户链路。',
    refs: [ref.junit, ref.mockito, ref.testcontainers, ref.playwright],
    docs: [
      d(
        '01-测试策略-JUnit与Mockito.md',
        '测试策略、JUnit 5 与 Mockito',
        '高质量测试验证可观察行为和重要不变量，并在失败时给出定位信息；覆盖率是辅助信号，不是目标本身。',
        [
          '测试分层与风险',
          'JUnit 生命周期、参数化与断言',
          'Mockito test double',
          '并发、时间与随机性测试',
        ],
        [
          t(
            '测试分层',
            '单元测试隔离小范围逻辑，组件/集成测试验证模块和真实基础设施，端到端测试覆盖少量关键旅程。数量由风险、速度和维护成本决定。',
            [
              '先覆盖核心业务不变量、错误路径和边界值。',
              '测试名称描述场景、动作和结果。',
              '失败能定位到最近的责任边界，不依赖执行顺序。',
            ],
            '“测试金字塔”是反馈和成本原则，不要求固定比例，也不排斥高价值集成测试。',
          ),
          t(
            'JUnit 5 结构',
            'JUnit Jupiter 用 `@Test`、生命周期、nested、parameterized、dynamic tests 和 extension model 组织测试。',
            [
              '每个测试 Arrange/Act/Assert 清晰，公共 fixture 控制大小。',
              '参数化测试覆盖等价类和边界，不用复制方法。',
              '异常验证同时检查类型和稳定业务字段。',
            ],
            '默认测试实例生命周期和并行配置会影响共享可变状态；不要依赖隐式顺序。',
          ),
          t(
            'Mockito 的适用边界',
            'mock 适合替换慢、不可控或跨边界依赖；stub 提供输入，spy 包装真实对象，fake 是可工作的简化实现。',
            [
              '优先验证返回值和状态，只有协议本身重要时验证交互。',
              '不 mock 值对象、集合和被测类内部实现细节。',
              '严格 stub 帮助发现未使用或错误调用。',
            ],
            '大量 mock 链通常说明设计边界不清，且测试可能与实现耦合。',
          ),
          t(
            '非确定性控制',
            '时间、随机、线程、文件和网络通过显式依赖注入或测试夹具控制。异步测试等待条件而非固定 sleep。',
            [
              '注入 Clock 和随机源，固定 seed 并输出失败 seed。',
              '并发测试重复运行并配合 JCStress/模型检查验证竞态。',
              '资源在 after/try-with-resources 中可靠清理。',
            ],
            '单次并发测试通过不能证明没有竞态；需要状态空间、压力和 JVM 内存模型证据。',
          ),
        ],
        `\`\`\`mermaid
flowchart TD
  A["业务风险"] --> B["纯逻辑单元测试"]
  A --> C["模块/数据库集成测试"]
  A --> D["契约测试"]
  A --> E["少量端到端测试"]
  B --> F["快速反馈"]
  C --> G["真实语义"]
  D --> G
  E --> H["用户旅程"]
\`\`\``,
        [
          '用参数化测试覆盖价格计算的边界和异常。',
          '重构一个过度 mock 的 service，使领域逻辑可直接测试。',
          '注入 Clock，验证跨日和过期行为。',
        ],
        [
          '能按风险选测试层。',
          '能正确使用 JUnit fixture。',
          '能说明 mock 代价。',
          '能控制时间和异步非确定性。',
        ],
        [
          ref.junit,
          ref.mockito,
          ['OpenJDK JCStress', 'https://openjdk.org/projects/code-tools/jcstress/'],
        ],
      ),
      d(
        '02-Spring集成-Testcontainers与契约测试.md',
        'Spring 集成测试、Testcontainers 与契约测试',
        '框架切片、真实数据库和服务契约测试共同覆盖序列化、事务、SQL、配置和边界兼容性。',
        [
          'Spring TestContext 与 slice',
          'Testcontainers 真实依赖',
          '数据夹具与事务',
          'HTTP/消息契约测试',
        ],
        [
          t(
            'Spring 测试范围',
            '`@SpringBootTest` 启动完整应用上下文，`@WebMvcTest`、`@DataJpaTest` 等 slice 只加载目标层。选择最小能验证风险的范围。',
            [
              '上下文缓存要求配置稳定，避免每个测试产生唯一配置。',
              'MockMvc/WebTestClient 验证路由、序列化、校验和安全。',
              '测试配置与生产结构相似，但凭据和外部地址隔离。',
            ],
            'slice 测试中的 mock 可能掩盖真实序列化或事务问题，关键链路仍需完整集成测试。',
          ),
          t(
            'Testcontainers',
            'Testcontainers 用临时 Docker 容器运行与生产同类的数据库、broker 或浏览器，并通过动态属性把地址注入应用。',
            [
              '固定受支持镜像版本，等待真实 readiness 条件。',
              '容器可按测试类/套件复用，但数据必须隔离。',
              'CI 预留 Docker、镜像缓存和并发资源。',
            ],
            '用 H2 替代 MySQL/PostgreSQL 会隐藏方言、锁、索引和事务差异。',
          ),
          t(
            '数据夹具',
            'fixture 要小、可读且只声明测试相关字段。迁移脚本先执行，再通过 builder、SQL 或 API 准备数据。',
            [
              '每个测试拥有独立 schema/事务/唯一租户，避免污染。',
              '提交、锁和异步事件测试不依赖自动回滚假象。',
              '失败时输出 SQL、容器日志和相关记录。',
            ],
            '测试方法自动回滚可能让代码看不到真实 commit 后事件或锁行为。',
          ),
          t(
            '契约测试',
            'provider/consumer contract 把请求、响应、消息 schema 和兼容规则自动化，帮助服务独立发布。',
            [
              '消费者只声明真实使用字段和场景。',
              '提供者在 CI 验证所有受支持消费者契约。',
              'breaking change 通过新版本和迁移窗口发布。',
            ],
            '契约测试不覆盖提供者内部正确性，也不替代少量端到端链路。',
          ),
        ],
        `\`\`\`mermaid
flowchart LR
  A["Migration"] --> B["Testcontainer 启动"]
  B --> C["Spring Context"]
  C --> D["准备最小 Fixture"]
  D --> E["调用 HTTP/消息入口"]
  E --> F["断言响应 + DB + 事件"]
  F --> G["清理/隔离"]
\`\`\``,
        [
          '用 PostgreSQL Testcontainer 验证事务隔离和索引查询。',
          '为 REST 接口写 provider/consumer contract。',
          '比较 slice 与完整上下文的覆盖范围和耗时。',
        ],
        [
          '能选 Spring 测试范围。',
          '能运行真实依赖。',
          '能隔离数据。',
          '能管理契约兼容性。',
        ],
        [
          ref.testcontainers,
          [
            'Spring Boot Testing',
            'https://docs.spring.io/spring-boot/reference/testing/',
          ],
          ['Spring Cloud Contract', 'https://spring.io/projects/spring-cloud-contract'],
        ],
      ),
      d(
        '03-API-UI自动化与测试平台.md',
        'API、UI 自动化与持续质量平台',
        '自动化测试需要稳定定位、独立数据、并行能力、失败证据和责任闭环，脚本数量本身不代表质量。',
        [
          'API schema 与场景测试',
          'Playwright/Selenium/Cypress 思路',
          '数据与环境',
          'CI 报告、flaky 治理和质量门禁',
        ],
        [
          t(
            'API 测试',
            '接口测试覆盖认证、参数、业务状态机、幂等、并发、错误码和 schema，而不仅是状态 200。',
            [
              'OpenAPI schema 校验与业务断言并用。',
              '测试创建自己的数据，并通过 API/受控 fixture 清理。',
              '记录 request id、trace id 和关键响应供定位。',
            ],
            '只对整段 JSON 快照容易产生噪声并遗漏语义；关键字段用明确断言。',
          ),
          t(
            'UI 自动化',
            'UI 测试以用户可见角色、标签和稳定测试标识定位，等待可观察状态，不依赖 DOM 层级和固定 sleep。',
            [
              'Page Object/组件对象封装业务动作而非每个元素。',
              '浏览器上下文隔离账号、cookie 和存储。',
              '失败保存截图、trace、视频、网络和控制台。',
            ],
            'CSS/XPath 长路径紧耦合实现，页面小改动会造成大量无业务意义失败。',
          ),
          t(
            '环境和数据',
            '测试环境以 IaC/容器可重复创建，外部依赖使用 sandbox、契约 stub 或受控真实环境。',
            [
              '数据用唯一前缀和租户隔离，支持并行。',
              '时区、语言、网络慢速和移动尺寸纳入场景。',
              '测试密钥单独管理且权限最小。',
            ],
            '共享不可重置环境会产生顺序依赖和假阳性，优先建设可创建的环境。',
          ),
          t(
            '持续质量平台',
            'CI 按变更风险运行 lint、单元、集成、契约、E2E、安全与性能子集，结果聚合到可追踪报告。',
            [
              'flaky 记录所有者、频率和修复期限，不静默无限重跑。',
              '质量门禁基于关键测试和风险，不仅覆盖率阈值。',
              '测试失败可关联代码、环境、日志和工单。',
            ],
            '把 flaky 测试永久 quarantine 会逐步失去保护；隔离只是有期限的修复阶段。',
          ),
        ],
        `\`\`\`mermaid
flowchart LR
  A["Commit"] --> B["Lint/Unit"]
  B --> C["Integration/Contract"]
  C --> D["API/UI 关键旅程"]
  D --> E["报告 + Trace + Screenshot"]
  E --> F{"质量门禁"}
  F -->|通过| G["部署"]
  F -->|失败| H["定位/修复/责任人"]
\`\`\``,
        [
          '用 Playwright Java 自动化登录、创建订单和权限拒绝。',
          '构造并行 API 测试数据并证明互不污染。',
          '建立 flaky 指标和一条有期限的治理规则。',
        ],
        [
          '能写语义 API 断言。',
          '能使用稳定 UI locator。',
          '能隔离环境数据。',
          '能治理 flaky 而非隐藏。',
        ],
        [
          ref.playwright,
          ['Selenium Documentation', 'https://www.selenium.dev/documentation/'],
          ['Cypress Documentation', 'https://docs.cypress.io/'],
        ],
      ),
      d(
        '04-性能稳定性与故障演练.md',
        '性能、稳定性测试与故障演练',
        '性能测试验证容量和 SLO，稳定性测试验证长时间资源行为，故障演练验证系统和团队的恢复能力。',
        [
          '负载模型与压测工具',
          '容量、尖峰、耐久和极限',
          '故障注入',
          '结果分析与回归基线',
        ],
        [
          t(
            '负载模型',
            '从生产业务量、用户行为和数据分布建立 open/closed workload，定义到达率、并发、think time、大小和读写比。',
            [
              '生成器自身 CPU/网络要有余量。',
              '测试数据命中真实索引和热点分布。',
              '预热缓存/JIT与冷启动分开报告。',
            ],
            '只设并发用户数而不说明到达率和等待模型，难以复现实载。',
          ),
          t(
            '场景类型',
            '基线确认单实例，load 验证预期峰值，stress 找拐点，spike 验证突发，soak 发现泄漏，breakpoint 找保护边界。',
            [
              '每个场景有 SLO、资源和错误阈值。',
              '扩缩容和缓存冷却时间计入。',
              '测试结束观察恢复和积压清空。',
            ],
            '极限吞吐不等于可运营容量；生产容量需保留故障和增长余量。',
          ),
          t(
            '故障演练',
            '在有停止条件的环境注入延迟、错误、进程终止、节点/网络/依赖故障，观察限流、重试、熔断、迁移和告警。',
            [
              '先写稳态指标、假设、爆炸半径和回滚。',
              '从单实例和非高峰小流量逐步扩大。',
              '同时验证技术恢复和人员 runbook。',
            ],
            '随机破坏不是科学实验；没有假设、观测和终止条件只会制造噪声。',
          ),
          t(
            '诊断与基线',
            '把客户端分位数与服务端 RED、JVM、数据库、broker 和网络指标对齐，用 trace/JFR/执行计划解释瓶颈。',
            [
              '版本基线保留代码、配置、数据和环境。',
              '回归阈值考虑统计波动。',
              '容量报告写出最大安全负载和首个饱和资源。',
            ],
            '客户端显示超时可能由负载机、网络或服务造成，必须用多侧证据定位。',
          ),
        ],
        `\`\`\`mermaid
flowchart TD
  A["生产模型 + SLO"] --> B["基线/负载/尖峰/耐久"]
  B --> C["资源与分位数"]
  C --> D["故障注入"]
  D --> E["保护、告警、恢复"]
  E --> F["容量报告 + 回归阈值"]
\`\`\``,
        [
          '用 k6/JMeter/Locust 之一建立到达率模型并校验负载机余量。',
          '执行数据库延迟故障，验证 deadline、熔断和恢复。',
          '产出含 p99、资源、饱和点和建议容量的报告。',
        ],
        [
          '能描述 open/closed 模型。',
          '能区分测试场景。',
          '能安全设计故障实验。',
          '能用跨层证据解释结果。',
        ],
        [
          ['Apache JMeter', 'https://jmeter.apache.org/usermanual/'],
          ['k6 Documentation', 'https://grafana.com/docs/k6/latest/'],
          ['Locust Documentation', 'https://docs.locust.io/'],
        ],
      ),
    ],
  },
  {
    folder: '11-云原生DevOps与可观测性',
    title: '云原生、DevOps 与可观测性',
    intro:
      '交付能力覆盖镜像、部署、配置、迁移、发布、回滚、遥测、SLO 和值班响应，使服务从“可运行”走向“可运营”。',
    refs: [ref.docker, ref.kubernetes, ref.otel, ['OpenSLO', 'https://openslo.com/']],
    docs: [
      d(
        '01-Docker镜像-Compose与供应链.md',
        'Docker：镜像、容器、Compose 与供应链',
        '容器是受隔离和资源限制的进程；镜像应可复现、最小、非 root，并能回溯到源码和依赖。',
        [
          'OCI 镜像与容器',
          'Java 多阶段构建',
          'Compose 本地依赖',
          'SBOM、签名与运行时限制',
        ],
        [
          t(
            '镜像与容器',
            '镜像由只读层和配置组成，容器增加可写层并运行进程。持久数据进入 volume/外部服务，配置和秘密在运行时注入。',
            [
              '固定 base image digest 或受控版本。',
              '一个主进程正确响应 SIGTERM 并优雅退出。',
              '日志写 stdout/stderr，临时文件有配额。',
            ],
            '删除 Dockerfile 后续层中的秘密不会从早期层移除；构建秘密使用 BuildKit secret。',
          ),
          t(
            'Java 镜像',
            '多阶段构建将编译工具与运行镜像分离，可使用 layered jar、jlink 或 CDS 优化下载与启动，但先保证调试和补丁能力。',
            [
              '以非 root 用户运行并使用只读根文件系统。',
              '容器内存/CPU 限制纳入 JVM heap、native memory 和线程预算。',
              '健康检查与应用 readiness 一致。',
            ],
            '只设置 `-Xmx` 未覆盖 metaspace、direct buffer、线程栈和本地库内存。',
          ),
          t(
            'Compose',
            'Compose 声明应用、数据库、Redis、broker 的网络、volume、health 和依赖，适合本地及 CI 集成环境。',
            [
              'depends_on 的启动顺序不等于应用 ready，使用 health/重试。',
              '数据卷和网络命名隔离不同项目。',
              '示例环境变量提供非生产默认值。',
            ],
            'Compose 不是生产编排器的完整等价物，仍需在目标平台验证。',
          ),
          t(
            '供应链和运行限制',
            '流水线生成 SBOM、扫描 OS/JAR 依赖、签名镜像并记录 provenance；运行时限制 capability、seccomp、网络和文件系统。',
            [
              '镜像按不可变 digest 部署。',
              '漏洞有例外、所有者和修复期限。',
              'registry 权限区分推送、发布和拉取。',
            ],
            '没有已知 CVE 不代表镜像安全，仍需最小权限、配置和运行时检测。',
          ),
        ],
        `\`\`\`mermaid
flowchart LR
  A["源码 + Lock"] --> B["Builder Stage"]
  B --> C["测试"]
  C --> D["最小 Runtime Image"]
  D --> E["SBOM/Scan/Sign"]
  E --> F["Registry Digest"]
  F --> G["受限容器运行"]
\`\`\``,
        [
          '为 Spring Boot 服务写多阶段、非 root、只读根镜像。',
          '用 Compose 启动数据库和 Redis 并等待 readiness。',
          '生成 SBOM，验证镜像 digest 与 commit 关联。',
        ],
        [
          '能解释镜像层。',
          '能预算容器 JVM 内存。',
          '能写健康依赖。',
          '能建立镜像供应链证据。',
        ],
        [
          ref.docker,
          ['OCI Image Specification', 'https://github.com/opencontainers/image-spec'],
          [
            'Spring Boot Container Images',
            'https://docs.spring.io/spring-boot/reference/packaging/container-images/',
          ],
        ],
      ),
      d(
        '02-Kubernetes工作负载网络配置与探针.md',
        'Kubernetes：工作负载、网络、配置、Secret 与探针',
        'Kubernetes 以声明式控制器协调期望状态；应用需要配合不可变镜像、探针、资源、终止和配置语义。',
        [
          'Pod/Deployment/StatefulSet/Job',
          'Service、Ingress/Gateway 与 DNS',
          'ConfigMap/Secret',
          'requests/limits、probe 与滚动更新',
        ],
        [
          t(
            '工作负载控制器',
            'Pod 是调度单元；Deployment 管理无状态 ReplicaSet；StatefulSet 提供稳定身份/存储顺序；Job/CronJob 管理完成型任务。',
            [
              '应用副本保持无状态或把状态放外部持久系统。',
              'PDB 和 topology spread 改善维护与故障域分布。',
              '批任务有幂等、并发、重试和截止时间。',
            ],
            'StatefulSet 提供稳定身份，不自动让数据库复制或故障转移正确。',
          ),
          t(
            '服务网络',
            'Service 为动态 Pod 集合提供稳定虚拟地址，EndpointSlice 记录后端；Ingress 或 Gateway API 管理外部 L7 路由。',
            [
              'readiness 失败的 Pod 从服务端点移除。',
              'NetworkPolicy 默认拒绝后按依赖开放。',
              'DNS 缓存、连接复用和 Pod 终止配合。',
            ],
            'Service 可达不代表应用 ready，且 NetworkPolicy 是否生效取决于网络实现。',
          ),
          t(
            '配置与秘密',
            'ConfigMap/Secret 可作为环境或文件挂载；更新传播方式和应用刷新行为不同。Secret 对象的 base64 只是编码。',
            [
              '开启静态加密、RBAC 和外部秘密管理。',
              '配置带 schema 和版本，发布可回滚。',
              'Pod 不拥有读取整个 namespace secrets 的权限。',
            ],
            '把秘密放 Kubernetes Secret 仍需要 etcd 加密、访问审计和轮换。',
          ),
          t(
            '资源与探针',
            'scheduler 使用 requests 放置 Pod，limits 由运行时执行；startup/liveness/readiness 分别处理启动、重启和接流量。',
            [
              'CPU limit 可能节流，内存超限会 OOM kill。',
              'preStop、terminationGracePeriod 和服务摘流完成优雅终止。',
              '滚动发布设置 maxUnavailable/maxSurge 和 readiness gate。',
            ],
            'liveness 依赖数据库会在数据库故障时重启全部服务，扩大事故。',
          ),
        ],
        `\`\`\`mermaid
flowchart LR
  D["Deployment"] --> P1["Pod ready"]
  D --> P2["Pod not ready"]
  P1 --> S["Service/EndpointSlice"]
  P2 -. "不接流量" .-> S
  S --> G["Gateway/Ingress"]
  C["Config/Secret"] --> P1
  H["startup/readiness/liveness"] --> P1
\`\`\``,
        [
          '部署 3 副本应用，验证 readiness 摘流和滚动升级。',
          '设置 requests/limits 并观察 CPU throttling 与 OOM。',
          '写默认拒绝 NetworkPolicy 和最小依赖规则。',
        ],
        [
          '能选工作负载控制器。',
          '能解释 Service 到 Pod。',
          '能安全使用 Secret。',
          '能设计三种探针和优雅终止。',
        ],
        [
          ref.kubernetes,
          [
            'Kubernetes Services',
            'https://kubernetes.io/docs/concepts/services-networking/service/',
          ],
          [
            'Kubernetes Probes',
            'https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/',
          ],
        ],
      ),
      d(
        '03-CICD发布数据库迁移与回滚.md',
        'CI/CD、发布策略、数据库迁移与回滚',
        '可靠交付把同一受验证制品从构建推进到环境，通过自动门禁、渐进流量和可执行回滚降低变更风险。',
        [
          'CI 验证与制品',
          'CD 环境晋级',
          'rolling/blue-green/canary',
          '数据库兼容迁移与回滚',
        ],
        [
          t(
            'CI 与制品',
            '每次提交执行格式、静态检查、单元/集成/安全测试，构建一次不可变制品并附 SBOM、签名和 commit。',
            [
              '缓存只加速且不改变依赖结果。',
              '分支保护和评审按风险设置。',
              '失败日志脱敏并保留足够定位信息。',
            ],
            '在每个环境重新构建会导致测试制品与生产制品不一致。',
          ),
          t(
            '环境晋级',
            'CD 按相同 digest 从测试、预发推进生产，配置差异来自受控环境声明。批准可以自动基于策略或人工处理高风险变更。',
            [
              '部署前检查容量、依赖和迁移兼容。',
              '部署后执行 smoke/关键 SLI 验证。',
              '发布记录关联变更、责任人和运行指标。',
            ],
            '环境完全相同不现实，关键是差异显式、版本化并可测试。',
          ),
          t(
            '渐进发布',
            'rolling 逐批替换；blue-green 切换整套环境；canary 逐步扩大真实流量。选择取决于容量、状态、成本和路由能力。',
            [
              '按错误率、延迟和业务指标自动停止。',
              'canary 样本量和用户分群避免误判。',
              '回滚包括应用、配置、路由和消费者版本。',
            ],
            '流量切回旧版本不自动撤销新版本写入的数据或外部副作用。',
          ),
          t(
            '数据迁移',
            'expand/contract 先添加兼容结构和双读/双写或回填，再切换读取，最后在旧版本退出后删除旧结构。',
            [
              '迁移锁和耗时在生产规模副本上测试。',
              '回填可暂停、重入、限速和校验。',
              '删除列/事件字段经过消费者兼容窗口。',
            ],
            '破坏性 DDL 常缺少即时回滚；应设计前向修复和数据备份验证。',
          ),
        ],
        `\`\`\`mermaid
flowchart LR
  A["Commit"] --> B["Test/Scan"]
  B --> C["Build once + Sign"]
  C --> D["Test Env"]
  D --> E["Canary"]
  E --> F{"SLI/业务门禁"}
  F -->|通过| G["全量"]
  F -->|失败| H["停流/回滚/前向修复"]
\`\`\``,
        [
          '设计可兼容两个应用版本的字段迁移。',
          '为 canary 设置错误率、p99 和业务转化门禁。',
          '演练应用回滚但数据已由新版本写入的处理。',
        ],
        [
          '能实现 build once。',
          '能选择发布策略。',
          '能设自动停止条件。',
          '能设计 expand/contract。',
        ],
        [
          ['GitHub Actions', 'https://docs.github.com/en/actions'],
          ['Argo Rollouts', 'https://argo-rollouts.readthedocs.io/'],
          ref.flyway,
        ],
      ),
      d(
        '04-OpenTelemetry-SLO与故障响应.md',
        'OpenTelemetry、SLO、告警与故障响应',
        '可观测性从服务目标和诊断问题出发，用日志、指标、追踪和 profile 提供证据，再以告警和 runbook 驱动响应。',
        [
          'Telemetry 与 context propagation',
          'RED/USE 与业务指标',
          'SLI/SLO/error budget',
          '告警、事故指挥和复盘',
        ],
        [
          t(
            'OpenTelemetry',
            'OTel 提供 API、SDK、语义约定、OTLP 和 Collector，把 trace、metric、log 上下文跨进程关联。',
            [
              '自动 instrumentation 与手工业务 span 配合。',
              'resource 标识 service/version/environment。',
              'collector 负责批量、重试、过滤和导出，设有界队列。',
            ],
            '采集成功不代表数据有用；span 名、属性基数和业务语义需要设计。',
          ),
          t(
            '指标和关联',
            '入口用 Rate/Errors/Duration，资源用 Utilization/Saturation/Errors，关键业务状态另设指标。trace id 连接日志与调用链。',
            [
              '标签只用有界枚举，不用 userId/orderId。',
              'histogram 桶与 SLO 阈值对齐。',
              '日志记录决策和异常，metric 负责聚合趋势。',
            ],
            '百分位不能通过实例百分位取平均得到全局百分位，使用可聚合直方图。',
          ),
          t(
            'SLI/SLO 与错误预算',
            'SLI 是用户可感知测量，SLO 是目标，错误预算表示目标窗口允许的不良事件。多窗口 burn-rate 告警兼顾速度和置信。',
            [
              '从成功率、可用性、正确性、延迟和新鲜度选 SLI。',
              '计划停机是否计入由产品承诺决定。',
              '预算消耗影响发布速度和可靠性投资。',
            ],
            'SLO 不是 100%；不可实现的目标会导致告警疲劳和错误优先级。',
          ),
          t(
            '事故响应',
            '告警应可行动，包含影响、仪表盘、变更和 runbook。事故中明确指挥、沟通、操作和记录角色，恢复后做无责复盘。',
            [
              '先限制影响，再恢复，再找根因。',
              '操作带时间线、审批和回滚。',
              '复盘产出有所有者/期限的系统改进。',
            ],
            '复盘只写“加强注意”不会降低复发概率；行动应修改系统、测试、门禁或监控。',
          ),
        ],
        `\`\`\`mermaid
flowchart LR
  A["用户请求"] --> B["Trace/Metric/Log"]
  B --> C["Collector"]
  C --> D["SLI Dashboard"]
  D --> E{"Error budget burn"}
  E -->|快/慢窗口超阈值| F["可行动告警"]
  F --> G["Runbook/响应/复盘"]
\`\`\``,
        [
          '为登录服务定义可用性和延迟 SLI/SLO。',
          '接入 OTel 并验证 HTTP、数据库和消息 context。',
          '写一份含停止条件、回滚和沟通的故障 runbook。',
        ],
        [
          '能控制属性基数。',
          '能定义用户导向 SLI。',
          '能使用错误预算。',
          '能运行可复盘事故响应。',
        ],
        [
          ref.otel,
          [
            'OpenTelemetry Semantic Conventions',
            'https://opentelemetry.io/docs/specs/semconv/',
          ],
          [
            'Google SRE Workbook: Alerting on SLOs',
            'https://sre.google/workbook/alerting-on-slos/',
          ],
        ],
      ),
    ],
  },
  {
    folder: '12-前端与全栈交付',
    title: '前端基础与全栈交付',
    intro:
      'Java 后端开发者需理解浏览器、TypeScript 和现代前端交付边界，以便设计契约、认证、错误、上传下载和实时通信。',
    refs: [
      ref.vue,
      ref.typescript,
      ['MDN Web Docs', 'https://developer.mozilla.org/zh-CN/'],
    ],
    docs: [
      d(
        '01-Web-HTML-CSS-JavaScript与TypeScript基础.md',
        'Web、HTML、CSS、JavaScript 与 TypeScript 基础',
        '浏览器通过 HTML 语义、CSS 布局和 JavaScript 事件/异步模型呈现应用；TypeScript 在构建期提供类型检查。',
        [
          'HTTP 与浏览器安全模型',
          '语义 HTML 与可访问性',
          'CSS 布局与响应式',
          'JavaScript/TypeScript 模块、事件循环和类型',
        ],
        [
          t(
            '浏览器和 HTTP',
            '导航和 fetch 经过 DNS、连接、TLS、HTTP、缓存、cookie 和同源策略；前端看到的错误可能来自任一层。',
            [
              'DevTools Network 检查方法、状态、header、timing 和缓存。',
              '正确使用语义状态码和内容类型。',
              'CSP、同源、CORS 与 cookie 属性共同约束脚本和请求。',
            ],
            'CORS 由浏览器执行，服务器间调用不受其保护；后端仍需认证授权。',
          ),
          t(
            'HTML 与可访问性',
            '使用 heading、nav、main、form、label、button、table 等语义元素，让键盘和辅助技术理解结构。',
            [
              '表单控件有 label、错误关联和焦点管理。',
              '按钮执行动作，链接导航。',
              '图片提供适当 alt，装饰图为空 alt。',
            ],
            '给 div 添加 click 不会自动获得按钮的键盘、焦点和语义行为。',
          ),
          t(
            'CSS 布局',
            'box model、normal flow、Flexbox、Grid、container/media query 构成现代布局；设计 token 管理颜色、间距和字体。',
            [
              '移动优先并测试缩放、长文本和暗色模式。',
              '避免固定高度截断动态内容。',
              '颜色对比和 focus-visible 可验证。',
            ],
            '响应式不是按设备品牌写断点，而是按内容在可用空间中的布局需求。',
          ),
          t(
            'JavaScript 与 TypeScript',
            '事件循环协调 task/microtask；Promise/async 处理异步。TypeScript 用 union、generic、narrowing 和 strict mode 在编译期约束数据。',
            [
              'API 响应仍在运行时验证，类型声明不会验证网络 JSON。',
              'ES modules 显式导入导出，避免全局变量。',
              '取消请求和组件卸载清理订阅。',
            ],
            'TypeScript 类型在运行时被擦除，`as` 断言不会转换或验证对象。',
          ),
        ],
        `\`\`\`mermaid
flowchart LR
  A["用户事件"] --> B["Event Loop"]
  B --> C["组件状态"]
  C --> D["DOM/CSS 渲染"]
  C --> E["fetch API"]
  E --> F["Java 后端契约"]
  F --> E
  E --> C
\`\`\``,
        [
          '构建可键盘操作、带校验错误关联的表单。',
          '用 DevTools 解释一次缓存命中和一次 CORS 预检。',
          '为网络响应写 TypeScript 类型与运行时 schema 校验。',
        ],
        [
          '能解释同源/CORS。',
          '能使用语义元素。',
          '能选择 Flex/Grid。',
          '能区分 TS 静态类型和运行时数据。',
        ],
        [
          ['MDN HTTP', 'https://developer.mozilla.org/en-US/docs/Web/HTTP'],
          ref.typescript,
          [
            'Web Content Accessibility Guidelines',
            'https://www.w3.org/WAI/standards-guidelines/wcag/',
          ],
        ],
      ),
      d(
        '02-Vue3-TypeScript与后台管理界面.md',
        'Vue 3、TypeScript 与后台管理界面',
        '后台界面以组件、状态和 API 契约组织表格、表单、分页、对话框和权限反馈，重点是可维护状态流与可访问交互。',
        [
          'Composition API 与响应式',
          '组件和状态',
          '表格/表单/分页/对话框',
          '路由、权限与错误体验',
        ],
        [
          t(
            '响应式和组件',
            '`ref/reactive/computed/watch` 表达状态、派生值和副作用；props 向下、event 向上，composable 复用有生命周期的逻辑。',
            [
              'computed 保持纯粹，watch 处理受控副作用。',
              '列表 key 使用稳定业务 id。',
              '组件卸载时清理 timer、listener 和 request。',
            ],
            '解构 reactive 对象可能丢失响应连接；按 Vue 规则使用 toRefs 或直接访问。',
          ),
          t(
            '服务端状态',
            '请求状态包含 loading、data、empty、error、stale 和 retry，不能只用一个数组。缓存 key 包含过滤、页码、排序和租户。',
            [
              '请求竞态使用 abort 或序列号丢弃旧响应。',
              '乐观更新有回滚和冲突反馈。',
              'Pinia 保存跨页面客户端状态，不复制所有服务端数据。',
            ],
            '后返回的旧请求覆盖新筛选结果是常见竞态，必须主动处理。',
          ),
          t(
            '管理组件',
            '表单 schema、前后端校验、字段错误与提交状态统一；表格服务端分页/排序；对话框处理 focus trap、Esc、确认和异步关闭。',
            [
              '分页使用稳定排序并显示总数语义。',
              '导入显示逐行错误和可下载报告。',
              '危险操作二次确认并明确对象和影响。',
            ],
            '前端校验用于体验，服务端仍执行完整校验和授权。',
          ),
          t(
            '路由和权限',
            '路由 meta 可控制菜单和进入体验，权限指令控制显示；最终授权由后端业务动作决定。',
            [
              '401 引导登录，403 说明权限不足，409 表示冲突，422/400 显示字段问题。',
              '动态菜单来源需验证并有兜底路由。',
              '错误边界和全局通知避免静默失败。',
            ],
            '隐藏菜单、按钮或路由守卫都不是安全边界。',
          ),
        ],
        `\`\`\`mermaid
flowchart LR
  A["Route"] --> B["Page State"]
  B --> C["Filter/Page/Sort"]
  C --> D["Typed API Client"]
  D --> E["Java REST API"]
  E --> F["Data/Error"]
  F --> B
  B --> G["Table/Form/Dialog"]
\`\`\``,
        [
          '实现带筛选、服务端排序、分页和竞态取消的列表。',
          '实现表单 400/409/403 错误映射。',
          '用键盘完整操作对话框和表格动作。',
        ],
        [
          '能管理请求状态。',
          '能防旧响应覆盖。',
          '能构建可访问管理组件。',
          '能区分 UI 权限和后端授权。',
        ],
        [ref.vue, ref.typescript, ['Pinia Documentation', 'https://pinia.vuejs.org/']],
      ),
      d(
        '03-全栈契约认证上传下载WebSocket与Nginx.md',
        '全栈交付：契约、认证、上传下载、WebSocket 与 Nginx',
        '完整产品链路需要前后端对齐 API、身份、代理、文件和实时连接，并能以 HTTPS 和自动化部署交付。',
        [
          'OpenAPI 与错误模型',
          'Cookie/BFF 与 token',
          '文件导入导出',
          'WebSocket/SSE、Nginx 与 HTTPS',
        ],
        [
          t(
            '契约协作',
            'OpenAPI 定义输入、响应、错误和安全方案，生成客户端类型但仍保留运行时校验和兼容测试。',
            [
              '分页、时间、金额、枚举和空值语义统一。',
              '错误含稳定 code、message、fieldErrors 和 requestId。',
              '版本演进添加优先，弃用有观测和期限。',
            ],
            '只共享 Java DTO 源码会把内部模型和外部契约耦合，且不能替代 HTTP 语义。',
          ),
          t(
            '浏览器认证',
            '同站 Web 应用可使用 HttpOnly Secure SameSite cookie/BFF；跨域资源服务器使用 OAuth token。CSRF、CORS 和 XSS 分别处理。',
            [
              '代理后正确配置 trusted proxy 和外部 scheme。',
              'cookie domain/path 最小化。',
              '登出撤销服务端会话/refresh token。',
            ],
            '把长期 token 放 localStorage 会扩大 XSS 窃取后果，应按架构评估更安全的 BFF/cookie。',
          ),
          t(
            '文件导入导出',
            '上传采用 multipart/分片或对象存储直传，服务端校验大小、类型、权限和内容。大导出使用异步任务和临时签名下载。',
            [
              '导入结果按行给出成功、错误和幂等标识。',
              '文件名使用 Content-Disposition RFC 兼容编码。',
              '下载授权在生成和读取时都检查，URL 短期有效。',
            ],
            '把大文件完整读入 JVM 堆会造成内存峰值，使用流式、配额和背压。',
          ),
          t(
            '实时通信与代理',
            'SSE 适合服务端单向事件，WebSocket 适合双向低延迟。Nginx/网关配置 Upgrade、超时、buffering、连接数和 TLS。',
            [
              '连接建立时认证，长连接期间处理权限变化和 token 过期。',
              '消息有序号、心跳、重连和断线补偿。',
              'HTTPS 自动续期并启用现代 TLS 配置。',
            ],
            'WebSocket 建连成功后连接可能随时中断，可靠业务仍需持久状态和重同步。',
          ),
        ],
        `\`\`\`mermaid
flowchart LR
  B["Browser/Vue"] --> N["Nginx HTTPS"]
  N --> A["Spring Boot API"]
  N --> W["WebSocket/SSE"]
  A --> O["Object Storage"]
  A --> D["Database"]
  A --> S["Session/OAuth"]
\`\`\``,
        [
          '生成 OpenAPI TypeScript 客户端并写兼容测试。',
          '实现流式导入、逐行错误报告和异步导出。',
          '通过 Nginx 发布 HTTPS 与 WebSocket，验证重连和权限失效。',
        ],
        [
          '能维护契约。',
          '能选择浏览器认证。',
          '能安全流式处理文件。',
          '能运营实时连接和代理。',
        ],
        [
          ['OpenAPI Specification', 'https://spec.openapis.org/oas/latest.html'],
          [
            'MDN Server-sent events',
            'https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events',
          ],
          ['NGINX WebSocket Proxying', 'https://nginx.org/en/docs/http/websocket.html'],
        ],
      ),
    ],
  },
  {
    folder: '13-项目阶梯',
    title: 'Java 后端项目阶梯',
    intro:
      '项目按复杂度逐步引入能力，每一级都要求可运行、可测试、可部署、可观测和可复盘，而非只堆技术名词。',
    refs: [
      ['The Twelve-Factor App', 'https://12factor.net/'],
      ['Spring Guides', 'https://spring.io/guides'],
      ['CNCF Cloud Native Landscape', 'https://landscape.cncf.io/'],
    ],
    docs: [
      d(
        '01-项目一模块化单体任务系统.md',
        '项目一：模块化单体任务系统',
        '以任务/知识管理为业务，练习 Java、Spring Boot、SQL、认证、测试和容器的完整单体交付。',
        [
          '领域与模块边界',
          'REST/校验/错误',
          '数据库事务与查询',
          '认证、测试、容器和观测',
        ],
        [
          t(
            '领域建模',
            '用户、项目、任务、标签和审计形成明确聚合；状态迁移由领域服务维护，不允许控制器直接随意写状态。',
            [
              '写状态机和不变量表。',
              '数据库约束与领域校验双层保护。',
              '模块通过公开服务接口交互。',
            ],
            '模块化单体不是按 controller/service/repository 横向分包，而是先按业务能力分模块。',
          ),
          t(
            '数据与 API',
            '使用版本化迁移、事务、索引和稳定分页。API 有 OpenAPI、统一错误、幂等创建和对象级授权。',
            ['对列表查看执行计划。', '并发更新用版本列。', '审计记录关键状态变化。'],
            '只完成 CRUD 不足以验证后端能力，必须包含并发、错误和权限路径。',
          ),
          t(
            '质量',
            '领域单元测试、数据库 Testcontainers、Web 集成测试和少量浏览器旅程组成测试组合。',
            ['CI 阻止失败构建。', '测试数据独立。', '覆盖跨租户和越权。'],
            '覆盖率达到阈值仍可能遗漏关键不变量，应以风险清单验收。',
          ),
          t(
            '交付',
            'Docker Compose 启动应用和数据库，Actuator、结构化日志、指标和 trace 支持诊断。',
            [
              'README 一条命令启动。',
              '示例数据和演示账号可重建。',
              '备份、迁移、回滚和 runbook 齐全。',
            ],
            '能启动不等于可运营；必须演示一次错误定位和恢复。',
          ),
        ],
        `\`\`\`mermaid
flowchart TD
  UI["Vue 管理界面"] --> API["Spring Boot 模块化单体"]
  API --> AUTH["认证授权"]
  API --> DB["PostgreSQL/MySQL"]
  API --> OBS["Logs/Metrics/Traces"]
  TEST["JUnit/Testcontainers/Playwright"] --> API
\`\`\``,
        [
          '完成状态机、权限矩阵、ER 图和 API 契约。',
          '加入并发更新、幂等和跨租户测试。',
          '演示 Compose 部署、迁移、观测和回滚。',
        ],
        [
          '模块边界清晰。',
          '数据和权限有测试。',
          '构建部署可重复。',
          '有诊断与恢复证据。',
        ],
        [
          ['Spring Modulith', 'https://docs.spring.io/spring-modulith/reference/'],
          [
            'Spring REST Docs',
            'https://docs.spring.io/spring-restdocs/docs/current/reference/htmlsingle/',
          ],
          ref.testcontainers,
        ],
      ),
      d(
        '02-项目二事件驱动订单与库存系统.md',
        '项目二：事件驱动订单、库存与支付系统',
        '在明确业务不变量后拆分订单、库存、支付和通知，练习事件、幂等、Outbox、Saga、缓存与故障治理。',
        ['服务和数据所有权', 'Outbox/消息/幂等', 'Saga 与对账', '容量、故障和可观测'],
        [
          t(
            '边界与不变量',
            '订单拥有订单状态，库存拥有可售数量，支付拥有资金状态；跨服务通过命令/事件和显式查询协作。',
            [
              '禁止共享业务表。',
              '每个状态迁移有前置条件和版本。',
              '定义重复、乱序、延迟和缺失事件处理。',
            ],
            '按技术层拆服务会造成高耦合分布式单体。',
          ),
          t(
            '可靠事件',
            '本地事务写业务与 outbox，发布到 Kafka/RabbitMQ/RocketMQ，消费者以 event id 和状态条件幂等。',
            [
              'schema version 和契约测试。',
              '重试/死信/replay 可审计。',
              '监控 lag 与最老事件。',
            ],
            '消息 broker 的持久化不覆盖数据库双写一致性。',
          ),
          t(
            'Saga 和对账',
            '下单编排库存预留、支付确认和发货，失败执行释放/退款等补偿，并为未知状态建立查询和人工流程。',
            ['状态机持久化。', '补偿幂等。', '定期对账订单、支付和库存。'],
            '补偿是新业务动作，可能失败或不可逆，不能写成简单反向函数。',
          ),
          t(
            '韧性与观测',
            '网关限流，调用传播 deadline，依赖熔断；trace 关联 HTTP 和消息，SLO 覆盖下单成功与最终完成时间。',
            [
              '故障演练 broker/数据库/单服务延迟。',
              '容量测试识别分区和热点。',
              'canary 有自动停止。',
            ],
            '只看 HTTP 延迟会遗漏异步业务完成的用户体验。',
          ),
        ],
        `\`\`\`mermaid
flowchart LR
  O["Order"] --> OB["Outbox"]
  OB --> MQ["Broker"]
  MQ --> I["Inventory"]
  MQ --> P["Payment"]
  I --> MQ
  P --> MQ
  MQ --> S["Saga State"]
  S --> R["Reconcile/Compensate"]
\`\`\``,
        [
          '写出不变量、事件目录和 Saga 状态图。',
          '注入消息重复、乱序和发布器崩溃。',
          '演示异步 SLO、lag 告警和对账修复。',
        ],
        ['数据所有权明确。', '事件链路可重放。', 'Saga 可恢复。', '异步体验可观测。'],
        [
          ref.kafka,
          ref.rabbit,
          ['Microservices Patterns', 'https://microservices.io/patterns/'],
        ],
      ),
      d(
        '03-项目三云原生高可用平台.md',
        '项目三：云原生高可用服务平台',
        '把前两个项目部署到 Kubernetes，加入渐进发布、OpenTelemetry、SLO、安全供应链和故障演练，形成生产级交付证据。',
        ['Kubernetes 与资源治理', 'CI/CD 与迁移', '可观测/SLO/值班', '安全与灾难恢复'],
        [
          t(
            '平台部署',
            '使用不可变签名镜像、Deployment/Stateful 依赖、Service/Gateway、Secret、NetworkPolicy 和 autoscaling。',
            ['多可用区分布。', 'requests/limits 和连接预算。', '探针与优雅停机。'],
            '副本数增加不等于高可用，下游、控制面和故障域仍需设计。',
          ),
          t(
            '发布和数据',
            '流水线 build once，自动测试扫描，canary 按 SLI 晋级；数据库使用 expand/contract，事件 schema 兼容。',
            ['制品可追溯。', '发布有回滚/前向修复。', '迁移可暂停和重入。'],
            '镜像回滚不能撤销 schema 和外部副作用。',
          ),
          t(
            'SRE 闭环',
            'OTel 收集日志、指标和 trace，SLO/error budget 驱动告警与发布；runbook、演练和复盘改进系统。',
            ['业务与技术 SLI。', '多窗口 burn-rate。', '事故角色和时间线。'],
            '仪表盘多不代表可运营，关键是用户导向目标和可行动告警。',
          ),
          t(
            '安全与恢复',
            'OIDC、最小权限、secret rotation、SBOM/签名、备份恢复和跨区域策略构成纵深防护。',
            [
              '定期恢复演练验证 RPO/RTO。',
              '审计不可由业务管理员篡改。',
              '依赖漏洞和密钥泄露有流程。',
            ],
            '有备份文件不等于可恢复，必须执行恢复和数据一致性验证。',
          ),
        ],
        `\`\`\`mermaid
flowchart LR
  G["Git"] --> CI["Test/Scan/Build/Sign"]
  CI --> REG["Registry"]
  REG --> K["Kubernetes Canary"]
  K --> O["OTel/SLO"]
  O -->|门禁| K
  K --> DR["Backup/Restore/Runbook"]
\`\`\``,
        [
          '用 IaC/manifest 从空环境部署。',
          '执行 canary 自动回滚和兼容迁移。',
          '演练节点故障、密钥轮换和数据库恢复并记录 RTO/RPO。',
        ],
        ['环境可重建。', '发布可渐进和停止。', 'SLO 可行动。', '恢复经过实际验证。'],
        [
          ref.kubernetes,
          ref.otel,
          ['SLSA', 'https://slsa.dev/'],
          [
            'Kubernetes Security Checklist',
            'https://kubernetes.io/docs/concepts/security/security-checklist/',
          ],
        ],
      ),
      d(
        '04-作品集验收与面试证据.md',
        '作品集验收、文档与面试证据',
        '高质量作品集展示决策、正确性、测试、性能和运营证据，而不是只列框架名和截图。',
        [
          'README 与架构记录',
          '测试和质量证据',
          '性能与故障报告',
          '演示、复盘和面试表达',
        ],
        [
          t(
            '可复现 README',
            'README 写出问题、架构、版本、前置条件、一条命令启动、配置、测试、演示账号、限制和许可证。',
            ['锁定工具版本。', '提供架构图、ER 图和关键序列图。', '敏感配置使用模板。'],
            '只有 API 列表而没有业务目标和运行步骤，评审者难以验证能力。',
          ),
          t(
            'ADR 与权衡',
            'Architecture Decision Record 记录背景、选项、选择、后果和复审条件，例如数据库、消息、缓存和一致性方案。',
            [
              '保留被拒方案及理由。',
              '结论关联基准/文档/实验。',
              '过期决策由新 ADR supersede。',
            ],
            '事后把现状包装成唯一正确方案，不是有效架构决策记录。',
          ),
          t(
            '证据包',
            'CI 报告、覆盖的风险清单、执行计划、JFR/压测、SLO、故障时间线、恢复演练和安全扫描形成可核验材料。',
            ['数据脱敏。', '报告含环境和版本。', '失败和改进同样保留。'],
            '单张“QPS 很高”截图缺少负载、正确性和资源信息，结论不可复现。',
          ),
          t(
            '表达方法',
            '用“问题—约束—选项—决策—验证—结果—后续”讲项目；被追问时能下钻到协议、事务、线程和 SQL。',
            [
              '准备一次 5 分钟演示和一次 30 分钟深挖。',
              '明确自己负责部分。',
              '诚实说明边界和未完成项。',
            ],
            '背诵术语而讲不出失败模式、指标和代码位置，难以证明掌握。',
          ),
        ],
        `\`\`\`mermaid
flowchart LR
  A["业务问题"] --> B["约束/选项"]
  B --> C["ADR 决策"]
  C --> D["代码/测试"]
  D --> E["性能/故障/安全证据"]
  E --> F["可复现演示"]
  F --> G["复盘与下一步"]
\`\`\``,
        [
          '为项目写一份完整 README 和两份 ADR。',
          '整理可匿名复现的测试、性能和故障证据包。',
          '录制 5 分钟部署与故障恢复演示并按清单复盘。',
        ],
        [
          '他人能独立启动。',
          '决策有证据。',
          '质量和性能可复现。',
          '能清晰表达边界与改进。',
        ],
        [
          ['Architecture Decision Records', 'https://adr.github.io/'],
          ['C4 Model', 'https://c4model.com/'],
          ['Semantic Versioning', 'https://semver.org/'],
        ],
      ),
    ],
  },
]

export const foundationReading = {
  title: 'Java 基础推荐阅读',
  intro:
    '基础部分按“语言规范与教程 → API → JVM/工具 → 课件实践”的顺序学习。JDK 25 LTS 用作主线，JDK 26 用于核验最新标准 API 与功能版本差异。',
  refs: [
    ['Dev.java Learn', 'https://dev.java/learn/'],
    ['Java SE 26 API', 'https://docs.oracle.com/en/java/javase/26/docs/api/'],
    [
      'Java Language Specification 26',
      'https://docs.oracle.com/javase/specs/jls/se26/html/',
    ],
    [
      'Java Virtual Machine Specification 26',
      'https://docs.oracle.com/javase/specs/jvms/se26/html/',
    ],
    [
      'Java SE 26 Core Libraries Guide',
      'https://docs.oracle.com/en/java/javase/26/core/java-core-libraries1.html',
    ],
    ['OpenJDK JDK 25', 'https://openjdk.org/projects/jdk/25/'],
  ],
}

export const overviewMarkdown = `# Java 后端学习路线总览（2026）

> 主线版本：JDK 25 LTS。JDK 26 用于学习最新功能版本及 API；框架与依赖按项目兼容矩阵选择。路线整合本地 14 份 Java 课件、JavaDevelop 笔记、官方文档、roadmap.sh 与 JavaGuide 的学习顺序，并排除了与 Java 后端主线无关的内容。

## 1. 路线目标

完成本路线后，应能从语言和 JVM 基础出发，独立完成数据库建模、Spring Boot 服务、认证授权、缓存和消息、测试、容器化、可观测与生产发布；每一阶段都以可运行代码、测试、诊断证据和交付文档验收。

## 2. 版本基线

- **Java：** JDK 25 是当前最新 LTS，JDK 26 是当前最新功能版本。长期项目优先使用经过供应商支持的 LTS 补丁线。
- **Spring：** 新项目核对 Spring Framework 7 与 Spring Boot 4 的 Java/Servlet/Jakarta 基线；已有项目按 Spring Boot 3.5、4.0 等维护线的兼容矩阵升级。
- **构建：** Maven/Gradle Toolchain 固定编译 JDK，依赖由 BOM、版本目录或锁文件统一管理。
- **数据：** MySQL/PostgreSQL、Redis、消息系统和搜索引擎均以官方当前维护版本为准，并保留迁移与回滚测试。

## 3. 学习顺序

\`\`\`mermaid
flowchart TD
  A["01 Java 基础：语法/OOP/API/集合/IO/JDBC/并发/网络"] --> B["02 工程工具与 Linux"]
  B --> C["03 数据库、Redis 与搜索"]
  C --> D["04 Spring Framework"]
  D --> E["05 Spring Boot 与 Web"]
  E --> F["06 MyBatis/JPA/事务/迁移"]
  F --> G["07 分布式与微服务"]
  G --> H["08 性能、缓存与消息队列"]
  H --> I["09 安全认证与授权"]
  I --> J["10 测试与质量工程"]
  J --> K["11 云原生、DevOps 与可观测性"]
  K --> L["12 前端与全栈交付"]
  L --> M["13 项目阶梯与验收"]
\`\`\`

### 阶段一：语言与标准库

逐章完成 14 份课件对应文档。重点不是背 API，而是类型系统、对象模型、异常契约、集合复杂度、资源生命周期、JDBC 事务、Java Memory Model、线程协调和网络协议。

### 阶段二：单体服务工程能力

掌握 Git、Maven/Gradle、Linux、Docker、SQL、索引、事务、Redis；用 Spring Framework、Spring Boot、MVC、MyBatis/JPA 构建结构清晰、可测试的模块化单体。

### 阶段三：生产与分布式能力

先学习部分失败、CAP/一致性和幂等，再引入服务发现、RPC、网关、限流、消息队列、分布式事务、缓存和分片。每次拆分都需说明组织边界、数据所有权和运维收益。

### 阶段四：质量和交付

以测试金字塔、契约测试、Testcontainers、性能测试、安全验证、容器、Kubernetes、CI/CD、OpenTelemetry 和 SLO 形成上线闭环。

## 4. 每阶段统一验收

1. **知识：** 能解释术语、前提、失败模式和技术边界。
2. **代码：** 有最小示例、自动化测试、静态检查和可重复构建。
3. **数据：** 有 schema、迁移、执行计划、事务和恢复设计。
4. **运行：** 有配置、日志、指标、trace、health、容量和告警。
5. **安全：** 有身份、授权、输入、秘密、依赖和审计检查。
6. **交付：** 有镜像、部署、回滚、runbook 和故障演练证据。

## 5. 推荐学习节奏

| 周期 | 内容 | 可验证交付 |
|---|---|---|
| 1–6 周 | Java 基础、集合、IO、JDBC、并发、网络 | 命令行工具、并发任务器、JDBC 小项目 |
| 7–10 周 | 工具、Linux、数据库、Redis | 可复现构建、SQL 调优报告、缓存实验 |
| 11–16 周 | Spring、Boot、Web、MyBatis/JPA | 模块化 REST 服务与集成测试 |
| 17–22 周 | 分布式、网关、消息、高性能 | Outbox、幂等消费、容量与故障报告 |
| 23–26 周 | 安全、测试、云原生、可观测 | OIDC 服务、K8s 部署、SLO 仪表盘 |
| 持续 | 项目阶梯 | 可演示、可部署、可复盘的作品集 |

## 6. 正确性校验方法

- 语言规则以 JLS/JVMS 和 Java API 为准；框架行为以当前 reference 与源码测试为准。
- 数据库结论使用真实 schema、数据分布和 \`EXPLAIN ANALYZE\` 验证。
- 分布式结论必须声明故障模型、超时、重试、交付和一致性范围。
- 性能结论给出环境、负载、分位数、资源和剖析证据。
- 安全结论转成越权、重放、注入、泄露和依赖测试。

## 参考路线

- [Oracle Java Downloads](https://www.oracle.com/java/technologies/downloads/)
- [Spring Boot Reference](https://docs.spring.io/spring-boot/reference/)
- [roadmap.sh Backend Roadmap](https://roadmap.sh/backend)
- [roadmap.sh Spring Boot Roadmap](https://roadmap.sh/spring-boot)
- [JavaGuide Java 学习路线](https://javaguide.cn/roadmap/java-roadmap.html)
`
