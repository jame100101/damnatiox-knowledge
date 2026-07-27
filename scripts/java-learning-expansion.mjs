function refs(items) {
  return items.map(([label, url]) => `- [${label}](${url})`).join('\n')
}

function stageCode(title) {
  if (title.includes('工程工具'))
    return `\`\`\`bash
./mvnw clean verify
java -jar target/app.jar
curl --fail http://localhost:8080/actuator/health
\`\`\``
  if (title.includes('数据库'))
    return `\`\`\`sql
BEGIN;
UPDATE inventory SET stock = stock - 1
WHERE sku_id = 42 AND stock > 0;
COMMIT;
\`\`\``
  if (title === 'Spring Framework')
    return `\`\`\`java
@Service
final class OrderService {
  private final OrderRepository repository;
  OrderService(OrderRepository repository) { this.repository = repository; }
}
\`\`\``
  if (title.includes('Spring Boot'))
    return `\`\`\`java
@RestController
class HealthController {
  @GetMapping("/ready")
  Map<String, String> ready() { return Map.of("status", "UP"); }
}
\`\`\``
  if (title.includes('数据访问'))
    return `\`\`\`java
@Transactional(readOnly = true)
public OrderView find(long id) {
  return repository.findViewById(id).orElseThrow(NotFoundException::new);
}
\`\`\``
  if (title.includes('分布式'))
    return `\`\`\`java
record Command(UUID idempotencyKey, long orderId) {}
// 接收端以 idempotencyKey 建唯一约束，重复请求返回首次结果。
\`\`\``
  if (title.includes('高性能'))
    return `\`\`\`java
Timer.Sample sample = Timer.start(registry);
try { return service.handle(command); }
finally { sample.stop(registry.timer("orders.handle")); }
\`\`\``
  if (title.includes('安全'))
    return `\`\`\`java
@PreAuthorize("hasRole('ADMIN') or #ownerId == authentication.name")
public OrderView find(String ownerId, long orderId) { return repository.require(orderId); }
\`\`\``
  if (title.includes('测试'))
    return `\`\`\`java
@Test
void amountMustBePositive() {
  assertThrows(IllegalArgumentException.class, () -> new Money("-0.01"));
}
\`\`\``
  if (title.includes('云原生'))
    return `\`\`\`yaml
readinessProbe:
  httpGet: { path: /actuator/health/readiness, port: 8080 }
livenessProbe:
  httpGet: { path: /actuator/health/liveness, port: 8080 }
\`\`\``
  if (title.includes('前端'))
    return `\`\`\`typescript
type LoadState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string }
\`\`\``
  return `\`\`\`java
record Acceptance(String scenario, boolean automated, String evidence) {}
\`\`\``
}

function guide(spec) {
  const glossary = spec.concepts
    .map(
      ([name, meaning, evidence], index) => `### ${index + 1}. ${name}

${meaning}

**学会的证据：** ${evidence}`,
    )
    .join('\n\n')

  return `# ${spec.title}：从零开始的阶段导学

> 这一页是本阶段的入口，不假设读者已经接触过对应框架。先建立“为什么需要它、它在链路中的位置、如何验证”的心智模型，再进入各专题。

## 1. 本阶段解决什么问题

${spec.purpose}

### 前置知识

${spec.prerequisites.map((item) => `- ${item}`).join('\n')}

## 2. 零基础词汇与心智模型

${glossary}

## 3. 建议学习顺序

${spec.order.map((item, index) => `${index + 1}. ${item}`).join('\n')}

## 4. 完整链路

\`\`\`mermaid
${spec.diagram}
\`\`\`

## 5. 最小代码切片

${stageCode(spec.title)}

## 6. 第一个可验证练习

${spec.exercise}

## 7. 初学者容易混淆的边界

${spec.pitfalls.map((item) => `- ${item}`).join('\n')}

## 8. 阶段验收

${spec.checks.map((item) => `- [ ] ${item}`).join('\n')}

## 参考资料

${refs(spec.refs)}
`
}

export const stageGuides = [
  {
    folder: '02-工程工具与Linux',
    content: guide({
      title: '工程工具与 Linux',
      purpose:
        '把“写出一段 Java 代码”升级为“任何团队成员都能以相同方式构建、测试、运行和发布”。这一阶段关注可重复性：JDK 版本、依赖、命令、目录、提交记录与运行环境都应被明确描述，而不是隐藏在某台电脑的 IDE 设置里。',
      prerequisites: [
        '会编译和运行简单 Java 类',
        '理解文件、目录、进程和环境变量的基本含义',
      ],
      concepts: [
        [
          '构建',
          '构建是把源代码、资源和依赖变成可运行产物的可重复过程，通常包含编译、测试、静态检查、打包和校验。Maven/Gradle 是构建系统，IDE 是使用这些系统的客户端之一。',
          '关闭 IDE 后仍能用 Wrapper 命令完成 clean build。',
        ],
        [
          '依赖与仓库',
          '依赖坐标确定一个不可变组件；仓库保存组件及其元数据。直接复制 jar 会丢失传递依赖、校验和与版本治理信息。',
          '能解释依赖树、scope/configuration 与版本冲突来源。',
        ],
        [
          '版本控制',
          'Git 保存内容快照与提交图。分支是指向提交的可移动引用，merge 与 rebase 改变历史图的方式不同。',
          '能从冲突中辨认双方意图并运行测试后提交。',
        ],
        [
          '进程与权限',
          'Linux 进程拥有 PID、用户、文件描述符、环境和资源限制；权限由 owner/group/other 与读写执行位共同决定。',
          '能定位监听端口、查看日志并以最小权限启动服务。',
        ],
      ],
      order: [
        '用 Maven Wrapper 建立项目，固定 JDK release、编码、依赖和测试插件。',
        '学习 Git 工作区、暂存区、提交、分支、冲突与可审查的小提交。',
        '在 Linux 终端练习文件、管道、退出码、进程、端口、权限和日志。',
        '最后用容器封装运行时，但仍需理解容器中的进程、信号和文件系统。',
      ],
      diagram: `flowchart LR
  A["源代码与构建描述"] --> B["Wrapper 解析依赖"]
  B --> C["编译与自动化测试"]
  C --> D["可追踪制品"]
  D --> E["Linux 进程或容器"]
  E --> F["日志、指标与退出码验证"]`,
      exercise:
        '创建只有一个 HTTP 接口的最小项目；执行 `./mvnw clean verify`，运行 jar，用 `curl` 验证接口，再用 `git log --oneline --graph` 检查提交。故意改坏一个测试，确认构建以非零退出码停止。',
      pitfalls: [
        '“IDE 能运行”不代表命令行、CI 和生产环境能重现。',
        '容器不是虚拟机；容器主进程退出，容器生命周期也结束。',
        'Git rebase 会重写提交身份；协作分支是否重写要遵循团队约定。',
      ],
      checks: [
        '能解释完整构建生命周期',
        '能排查 JDK 与依赖版本漂移',
        '能用 Linux 工具定位端口、进程和权限问题',
      ],
      refs: [
        ['Maven Getting Started', 'https://maven.apache.org/guides/getting-started/'],
        ['Git Reference', 'https://git-scm.com/docs'],
        ['Linux man-pages', 'https://www.kernel.org/doc/man-pages/'],
      ],
    }),
  },
  {
    folder: '03-数据库缓存与搜索',
    content: guide({
      title: '数据库、缓存与搜索',
      purpose:
        '学习数据如何持久保存、并发修改、按条件检索与加速访问。关系数据库是事实来源的常见选择；Redis 适合低延迟数据结构和协调场景；Elasticsearch 面向全文检索。三者的数据模型、一致性保证和失败语义不同。',
      prerequisites: [
        '会使用集合表达一组对象',
        '理解请求可能并发到达且服务可能中途失败',
      ],
      concepts: [
        [
          '表、行与约束',
          '表描述关系；主键标识行，外键、唯一、非空和检查约束把业务不变量放到最终写入边界。',
          '能用 DDL 表达“订单号唯一且金额非负”。',
        ],
        [
          '事务',
          '事务把多个读写组织成一个原子单位。ACID 分别描述原子性、一致性、隔离性和持久性；隔离级别决定并发可见性，不等同于业务正确性。',
          '能复现丢失更新并用锁或版本号修正。',
        ],
        [
          '索引',
          '索引以额外空间和写放大换取查询路径。联合索引是否有效取决于谓词、排序、选择性和实际执行计划。',
          '能用 EXPLAIN 验证，而非仅凭“最左前缀”口诀。',
        ],
        [
          '缓存',
          '缓存保存派生副本，命中时更快，失效时必须回到事实来源。过期、淘汰、穿透、击穿和一致性都需要明确策略。',
          '能解释 cache-aside 的读写时序与短暂不一致窗口。',
        ],
        [
          '倒排索引',
          '全文搜索把词项映射到文档集合，适合相关性、分词、聚合与模糊检索；它通常不是强事务事实库。',
          '能设计数据库到搜索索引的可重放同步链路。',
        ],
      ],
      order: [
        'SQL 与数据建模',
        '事务、锁、MVCC 与索引执行计划',
        'Redis 数据结构与缓存模式',
        '全文搜索、映射、分析器与同步',
      ],
      diagram: `flowchart LR
  A["业务命令"] --> B["关系数据库事实写入"]
  B --> C["提交日志/Outbox"]
  C --> D["缓存失效"]
  C --> E["搜索索引更新"]
  F["查询"] --> G{"命中缓存?"}
  G -->|是| H["返回副本"]
  G -->|否| B`,
      exercise:
        '实现商品查询：数据库保存商品事实，Redis 采用 cache-aside，更新时先提交数据库再失效缓存。记录一次并发更新和一次缓存失效失败，说明系统会看到什么以及如何补偿。',
      pitfalls: [
        '给每列建索引会增加写成本且未必帮助查询',
        'Redis 单条命令原子不代表跨系统事务原子',
        '搜索索引刷新成功时间与数据库提交时间通常不同',
      ],
      checks: [
        '能读基础执行计划',
        '能说明隔离级别和锁的边界',
        '能为缓存与搜索同步设计失败恢复',
      ],
      refs: [
        [
          'PostgreSQL Tutorial',
          'https://www.postgresql.org/docs/current/tutorial.html',
        ],
        ['MySQL Reference Manual', 'https://dev.mysql.com/doc/refman/8.4/en/'],
        ['Redis Documentation', 'https://redis.io/docs/latest/'],
        [
          'Elasticsearch Reference',
          'https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html',
        ],
      ],
    }),
  },
  {
    folder: '04-Spring Framework',
    content: guide({
      title: 'Spring Framework',
      purpose:
        '理解 Spring 如何创建对象、连接依赖、在方法调用边界织入事务等基础设施，并通过事件、资源、校验、缓存和调度支持应用。重点是容器与代理的真实边界，而不是背注解。',
      prerequisites: ['熟悉接口、继承、注解、反射与异常', '会用 JDBC 完成事务'],
      concepts: [
        [
          'IoC 容器',
          '容器读取配置并创建、装配和管理对象。依赖注入是 IoC 的一种实现，使对象通过构造器声明需要的协作者。',
          '能用纯 Java 配置装配两个组件并写替身测试。',
        ],
        [
          'Bean 生命周期',
          'Bean 从定义、实例化、依赖注入、初始化回调到销毁回调经历多个阶段；作用域决定实例共享边界。',
          '能解释 singleton Bean 为何不应保存请求可变状态。',
        ],
        [
          '代理与 AOP',
          'Spring 常用代理包裹目标对象，在调用前后执行横切逻辑。只有经过代理的调用才会被拦截。',
          '能复现同类自调用导致事务注解未生效。',
        ],
        [
          '声明式事务',
          '事务拦截器依据传播、隔离、只读和回滚规则控制底层资源事务。数据库事务不会自动覆盖远程调用。',
          '能划分短事务边界并说明异常回滚规则。',
        ],
      ],
      order: [
        '先手写对象装配，再学习容器与构造器注入',
        '理解 Bean 定义和生命周期',
        '观察代理对象与真实对象',
        '最后学习事务、事件、缓存和调度',
      ],
      diagram: `flowchart LR
  A["配置元数据"] --> B["ApplicationContext"]
  B --> C["创建与注入 Bean"]
  C --> D["BeanPostProcessor/代理"]
  D --> E["调用目标方法"]
  E --> F["事务、缓存、观测等拦截器"]`,
      exercise:
        '实现 `OrderService` 与内存 `OrderRepository`，先手工构造，再交给 Spring；加入事务方法与同类自调用，对比代理类型、日志与数据库提交结果。',
      pitfalls: [
        '依赖注入不是服务定位器',
        'AOP 代理不是修改了目标类源码',
        '声明式事务不跨线程自动传播',
      ],
      checks: [
        '能画出 Bean 生命周期',
        '能解释 JDK/CGLIB 代理选择',
        '能定位事务注解未生效的常见原因',
      ],
      refs: [
        [
          'Spring Core Technologies',
          'https://docs.spring.io/spring-framework/reference/core.html',
        ],
        [
          'Spring Transaction Management',
          'https://docs.spring.io/spring-framework/reference/data-access/transaction.html',
        ],
      ],
    }),
  },
  {
    folder: '05-Spring Boot与Web',
    content: guide({
      title: 'Spring Boot 与 Web',
      purpose:
        '从浏览器发出 HTTP 请求开始，理解连接如何进入服务器、经过 Servlet 容器和 Spring MVC，最终被控制器、业务层与异常处理器转换为稳定响应；再学习 Boot 如何约定并自动配置这一链路。',
      prerequisites: [
        '理解 Spring 容器和依赖注入',
        '掌握 HTTP 方法、状态码、头与消息体的基本概念',
      ],
      concepts: [
        [
          '自动配置',
          'Boot 根据 classpath、属性和已有 Bean 的条件创建合理默认组件；用户定义通常可以覆盖默认值。',
          '能用条件评估报告说明某个配置为何生效。',
        ],
        [
          '嵌入式服务器',
          'Tomcat 等服务器监听端口、解析 HTTP 并把请求交给 Servlet；线程、连接、请求体和超时都有资源上限。',
          '能区分连接超时、读取超时和业务处理超时。',
        ],
        [
          'DispatcherServlet',
          '它是 Spring MVC 前端控制器，借助映射、适配器、参数解析器、消息转换器和异常解析器完成请求分派。',
          '能按顺序描述一次 JSON 请求。',
        ],
        [
          'REST 契约',
          '契约包括 URI、方法、状态码、输入输出 schema、鉴权、幂等、分页、错误与兼容策略。',
          '能为创建、查询、更新和冲突设计可测试接口。',
        ],
      ],
      order: [
        '用最小 Boot 应用观察启动报告',
        '跟踪 Servlet/MVC 请求链路',
        '设计 DTO、校验和错误契约',
        '接入 Actuator、日志、指标和追踪',
      ],
      diagram: `sequenceDiagram
  participant C as 客户端
  participant S as Web服务器
  participant D as DispatcherServlet
  participant H as Controller
  participant A as ApplicationService
  C->>S: HTTP 请求
  S->>D: Servlet 调用
  D->>H: 映射、绑定、校验
  H->>A: 业务命令
  A-->>H: 结果
  H-->>C: 状态码 + JSON`,
      exercise:
        '创建一个订单 REST 接口，覆盖合法请求、字段缺失、资源不存在、版本冲突和服务器异常；用 MockMvc 测试状态码、响应头与 Problem Details。',
      pitfalls: [
        'Controller 不应承担长事务和领域规则',
        '返回 200 并在 JSON 中放错误码会削弱 HTTP 语义',
        '自动配置是条件化代码，不是运行时魔法',
      ],
      checks: ['能解释请求分派链路', '能设计统一错误响应', '能安全暴露健康检查与指标'],
      refs: [
        ['Spring Boot Reference', 'https://docs.spring.io/spring-boot/reference/'],
        [
          'Spring MVC',
          'https://docs.spring.io/spring-framework/reference/web/webmvc.html',
        ],
        ['HTTP Semantics RFC 9110', 'https://www.rfc-editor.org/rfc/rfc9110'],
      ],
    }),
  },
  {
    folder: '06-数据访问与ORM',
    content: guide({
      title: '数据访问与 ORM',
      purpose:
        '把对象与关系数据之间的读写变成可测试、可调优、可迁移的工程链路。学习 JDBC 的真实资源边界后，再理解 MyBatis 的显式 SQL、JPA/Hibernate 的对象状态管理和 Spring Data 的仓库抽象。',
      prerequisites: ['掌握 SQL、索引、事务和 JDBC', '理解对象标识、集合关系与异常'],
      concepts: [
        [
          '映射',
          '映射把结果集列转换为对象字段。MyBatis 让开发者控制 SQL；ORM 还维护实体身份、关联和状态变化。',
          '能识别列名、空值和一对多结果展开问题。',
        ],
        [
          '持久化上下文',
          'JPA 在一个上下文中保证同一实体标识对应同一受管理实例，并在 flush 时执行脏检查生成 SQL。',
          '能区分 persist、merge、flush 与 commit。',
        ],
        [
          'N+1 查询',
          '先查 N 个主体，再为每个主体额外查关联，导致请求数随数据量线性增长。',
          '能用日志/指标发现并用 join fetch、实体图或批量查询修复。',
        ],
        [
          '连接池与迁移',
          '连接池复用有限数据库会话；迁移工具按版本执行可审计的 schema 变更。',
          '能估算池大小并写前向兼容的两阶段变更。',
        ],
      ],
      order: [
        '先观察 JDBC 连接、事务和结果集',
        '学习 MyBatis 显式映射',
        '学习 JPA 实体生命周期',
        '加入连接池、迁移、监控和决策标准',
      ],
      diagram: `flowchart LR
  A["Repository 调用"] --> B["MyBatis/JPA"]
  B --> C["连接池借出连接"]
  C --> D["数据库事务与SQL"]
  D --> E["结果映射/实体状态"]
  E --> F["提交或回滚"]
  F --> G["归还连接"]`,
      exercise:
        '分别用 MyBatis 和 JPA 实现订单列表，记录 SQL 数量、分页语句和事务边界；制造 N+1，再用批量查询修复并通过集成测试验证。',
      pitfalls: [
        'ORM 不会消除 SQL 与索引知识',
        'Open Session in View 会把懒加载和连接占用扩散到 Web 层',
        '连接池越大并不必然吞吐越高',
      ],
      checks: [
        '能选择 MyBatis/JPA',
        '能解释 flush 与事务提交',
        '能通过 SQL 证据定位 N+1',
      ],
      refs: [
        ['MyBatis Documentation', 'https://mybatis.org/mybatis-3/'],
        [
          'Jakarta Persistence Specification',
          'https://jakarta.ee/specifications/persistence/',
        ],
        ['Spring Data JPA', 'https://docs.spring.io/spring-data/jpa/reference/'],
      ],
    }),
  },
  {
    folder: '07-分布式与微服务',
    content: guide({
      title: '分布式系统与微服务',
      purpose:
        '理解网络分区、延迟、重复、乱序和局部失败为何让远程调用不同于本地方法，并据此设计服务边界、发现、配置、网关、容错、事务与观测链路。先掌握失败语义，再学习组件。',
      prerequisites: [
        '能独立开发和测试模块化单体',
        '理解数据库事务、HTTP 与消息队列基础',
      ],
      concepts: [
        [
          '局部失败',
          '调用方、网络和被调方可处于不同状态；超时只说明在期限内未收到响应，不证明操作未执行。',
          '能为写操作设计幂等键与状态查询。',
        ],
        [
          '服务发现',
          '实例动态上下线时，注册中心维护可用地址元数据，客户端或代理据此选择实例。',
          '能处理健康检查、缓存和注册中心短暂失联。',
        ],
        [
          '熔断与隔离',
          '超时限制等待，舱壁限制资源，熔断在高失败率时暂缓请求；重试只适用于可重试且具备幂等性的失败。',
          '能给出总 deadline 下的超时与重试预算。',
        ],
        [
          '最终一致性',
          '跨服务业务常用本地事务、可靠事件、幂等消费与补偿收敛，而非假设一个数据库事务覆盖所有资源。',
          '能画出 Outbox 发布和消费去重链路。',
        ],
      ],
      order: [
        '先用模块化单体明确边界',
        '理解超时、幂等、重试与一致性',
        '再学习发现、配置、网关和 RPC',
        '最后实践分布式事件、治理与追踪',
      ],
      diagram: `flowchart LR
  A["客户端"] --> B["网关"]
  B --> C["服务发现/负载均衡"]
  C --> D["订单服务"]
  D --> E["本地数据库"]
  D --> F["Outbox"]
  F --> G["消息代理"]
  G --> H["库存服务幂等消费"]
  D -. "Trace Context" .-> H`,
      exercise:
        '把单体订单系统中的库存模块抽成独立进程；为调用设置 deadline、幂等键和状态查询，并在响应丢失、重复投递与消费者重启三个场景验证结果。',
      pitfalls: [
        '微服务不是按技术层拆进程',
        '重试会放大拥塞，层层重试形成乘法效应',
        'CAP 不表示任意时刻只能从一致性、可用性和分区容忍三选二',
      ],
      checks: [
        '能区分本地调用与远程调用',
        '能设计幂等和可靠事件',
        '能解释网关、注册、配置、限流、熔断的职责',
      ],
      refs: [
        ['Spring Cloud', 'https://docs.spring.io/spring-cloud-reference/'],
        ['Spring Cloud Alibaba', 'https://sca.aliyun.com/en/'],
        ['gRPC Documentation', 'https://grpc.io/docs/'],
      ],
    }),
  },
  {
    folder: '08-高性能与消息队列',
    content: guide({
      title: '高性能与消息队列',
      purpose:
        '以测量为起点改善吞吐、延迟和资源效率，并用消息队列解耦峰值与处理节奏。性能优化不是替换名词；必须定义负载、基线、瓶颈、变更和回归。',
      prerequisites: ['理解 JVM 并发、数据库索引和 HTTP', '会编写可重复自动化测试'],
      concepts: [
        [
          '吞吐与延迟',
          '吞吐是单位时间完成量，延迟是单次耗时分布；平均值会隐藏长尾，通常观察 p50/p95/p99。',
          '能在固定并发和数据集下报告分位数与错误率。',
        ],
        [
          '排队',
          '到达速率接近服务能力时，队列与等待时间会快速增长；异步只移动等待位置，不创造算力。',
          '能同时观测队列深度、消费速率和积压年龄。',
        ],
        [
          '至少一次投递',
          '消息系统常通过重投保证不轻易丢消息，因此消费者必须预期重复。',
          '能用业务幂等键或去重表处理重复。',
        ],
        [
          '背压',
          '下游饱和时，上游需要限速、拒绝、降级或排队上限，否则内存和延迟会失控。',
          '能定义队列容量与过载策略。',
        ],
      ],
      order: [
        '建立负载模型和基线',
        '使用 JFR/指标定位瓶颈',
        '学习可靠消息语义与幂等消费',
        '再做缓存、分片和热点治理',
      ],
      diagram: `flowchart LR
  A["负载模型"] --> B["基准与观测"]
  B --> C["定位 CPU/内存/IO/锁"]
  C --> D["最小优化"]
  D --> E["回归验证"]
  E --> F["容量模型与SLO"]`,
      exercise:
        '对一个数据库写接口进行阶梯加压，记录吞吐、p95、错误率、连接池等待和 GC；加入消息队列削峰后，再报告端到端完成延迟，而非只报告接口接收延迟。',
      pitfalls: [
        '微基准结果不能直接代表完整服务',
        '发送成功不等于业务消费成功',
        '缓存命中率高也可能存在热点键与尾延迟',
      ],
      checks: [
        '能读基本 JFR 证据',
        '能说明消息确认与重投',
        '能用数据验证优化而非凭感觉',
      ],
      refs: [
        ['Java Flight Recorder', 'https://docs.oracle.com/en/java/javase/25/jfapi/'],
        ['Kafka Documentation', 'https://kafka.apache.org/documentation/'],
        ['RabbitMQ Tutorials', 'https://www.rabbitmq.com/tutorials'],
      ],
    }),
  },
  {
    folder: '09-安全认证与授权',
    content: guide({
      title: '安全、认证与授权',
      purpose:
        '建立从身份、会话、权限到输入输出、秘密、依赖和审计的分层安全模型。认证回答“是谁”，授权回答“允许做什么”；两者都应在可信服务端执行。',
      prerequisites: [
        '理解 HTTP cookie、header、TLS 与服务端会话',
        '能编写 Spring MVC 接口和数据库查询',
      ],
      concepts: [
        [
          '认证',
          '认证校验主体身份，可基于密码、多因素、会话或外部身份提供方。密码应使用专用慢哈希并采用合适参数。',
          '能实现登录失败限速与会话失效。',
        ],
        [
          '授权',
          '授权依据主体、资源、动作与上下文做决策；仅隐藏前端按钮不构成授权。',
          '能在方法/资源层验证对象归属。',
        ],
        [
          'OAuth 2.0 与 OIDC',
          'OAuth 2.0 是委托授权框架；OIDC 在其上定义身份层和 ID Token。Access Token 的受众是资源服务器。',
          '能区分授权码、ID Token 与 Access Token。',
        ],
        [
          '纵深防御',
          '校验、编码、最小权限、秘密管理、依赖治理、审计和监控相互补充，单一过滤器不足以覆盖完整风险。',
          '能用威胁模型列出资产、信任边界和滥用途径。',
        ],
      ],
      order: [
        '先理解会话认证与密码存储',
        '学习 URL/方法/对象级授权',
        '再学习 OAuth2/OIDC/JWT',
        '最后覆盖输入、秘密、供应链与审计',
      ],
      diagram: `sequenceDiagram
  participant U as 用户
  participant I as 身份服务
  participant C as 客户端
  participant R as 资源服务
  U->>I: 身份验证
  I-->>C: 授权码
  C->>I: 换取令牌
  I-->>C: Access Token
  C->>R: Bearer Token
  R->>R: 验签、issuer、audience、权限检查`,
      exercise:
        '实现“用户只能查看自己的订单、管理员可查看全部订单”，覆盖匿名、普通用户越权、过期会话与管理员成功四类测试。',
      pitfalls: [
        'JWT 签名不等于内容保密',
        'CORS 不是服务端授权机制',
        'CSRF 与 XSS 的攻击条件和防护重点不同',
      ],
      checks: [
        '能区分认证与授权',
        '能校验令牌 issuer/audience/expiry',
        '能进行资源级授权测试',
      ],
      refs: [
        [
          'Spring Security Reference',
          'https://docs.spring.io/spring-security/reference/',
        ],
        [
          'OAuth 2.0 Security Best Current Practice',
          'https://www.rfc-editor.org/rfc/rfc9700',
        ],
        [
          'OWASP ASVS',
          'https://owasp.org/www-project-application-security-verification-standard/',
        ],
      ],
    }),
  },
  {
    folder: '10-测试与质量工程',
    content: guide({
      title: '测试与质量工程',
      purpose:
        '用不同层级的可执行证据降低变更风险。单元测试快速验证局部规则；集成测试验证真实边界；契约与端到端测试验证协作；性能和稳定性测试验证非功能目标。',
      prerequisites: ['会写 Java 方法与异常处理', '理解构建生命周期和 Git 协作'],
      concepts: [
        [
          '测试替身',
          'stub 提供预设输入，fake 提供简化实现，mock 验证交互；替身类型应由测试目的决定。',
          '能优先断言可观察结果而非内部调用细节。',
        ],
        [
          '测试隔离',
          '测试应能独立、可重复运行，不依赖执行顺序、共享可变数据或真实时钟。',
          '能使用固定时钟、临时目录和独立数据库。',
        ],
        [
          '集成测试',
          '集成测试验证数据库、消息、HTTP 或框架配置的真实协作。Testcontainers 可启动接近生产的短生命周期依赖。',
          '能验证真实迁移、约束和序列化。',
        ],
        [
          '质量门禁',
          '门禁把编译、测试、静态检查、安全扫描和覆盖策略放入 CI；覆盖率只是信号，不证明断言质量。',
          '能让失败证据可定位且构建可重复。',
        ],
      ],
      order: [
        '先测试纯领域规则',
        '再测试数据库和框架边界',
        '加入 API/契约与少量关键 E2E',
        '最后做性能、故障与发布验证',
      ],
      diagram: `flowchart TB
  A["大量快速单元测试"] --> B["组件/集成测试"]
  B --> C["契约/API测试"]
  C --> D["少量关键端到端测试"]
  D --> E["性能与故障演练"]`,
      exercise:
        '为转账规则写单元测试，为数据库仓库写 Testcontainers 集成测试，为 REST 接口写契约测试；故意改变字段类型，确认哪一层最先给出清晰失败。',
      pitfalls: [
        '只 mock 自己不理解的框架会得到脆弱测试',
        '用生产共享环境做所有测试会导致不稳定',
        '追求 100% 覆盖率可能挤压有效边界测试',
      ],
      checks: ['能选择测试层级', '能控制时间和外部依赖', '能从失败日志快速定位原因'],
      refs: [
        ['JUnit User Guide', 'https://docs.junit.org/current/user-guide/'],
        ['Testcontainers for Java', 'https://java.testcontainers.org/'],
        [
          'Spring Testing',
          'https://docs.spring.io/spring-framework/reference/testing.html',
        ],
      ],
    }),
  },
  {
    folder: '11-云原生DevOps与可观测性',
    content: guide({
      title: '云原生、DevOps 与可观测性',
      purpose:
        '让同一不可变制品从 CI 进入运行平台，并在发布、扩缩容、故障和回滚过程中保持可观察、可控制。重点不是记 YAML，而是理解镜像、调度、网络、配置、健康、遥测和 SLO 的契约。',
      prerequisites: [
        '能构建可运行 jar 和容器镜像',
        '理解进程、端口、HTTP 与数据库迁移',
      ],
      concepts: [
        [
          '不可变制品',
          '同一提交生成带摘要的镜像，环境差异通过外部配置注入，不在部署时重新编译。',
          '能从运行实例追溯到提交、构建和镜像摘要。',
        ],
        [
          '声明式编排',
          'Kubernetes 控制器持续把实际状态收敛到期望状态；Pod 是可替换实例，不应保存唯一持久数据。',
          '能解释 Deployment 滚动更新和 Service 选择器。',
        ],
        [
          '探针与优雅停机',
          'readiness 决定是否接流量，liveness 判断是否需重启；终止时先停止接流量再完成在途请求。',
          '能验证 SIGTERM、宽限期和连接排空。',
        ],
        [
          '可观测性与 SLO',
          '日志、指标和 trace 是回答未知问题的遥测；SLO 用用户可感知指标定义可靠性目标和错误预算。',
          '能从告警跳到仪表盘、trace、日志与 runbook。',
        ],
      ],
      order: [
        '构建小型安全镜像',
        '学习 Pod/Deployment/Service/配置/探针',
        '建立 CI/CD 与数据库迁移策略',
        '接入 OpenTelemetry、SLO 和故障响应',
      ],
      diagram: `flowchart LR
  A["Commit"] --> B["CI测试与扫描"]
  B --> C["不可变镜像"]
  C --> D["部署控制器"]
  D --> E["灰度/滚动发布"]
  E --> F["指标日志Trace"]
  F --> G{"SLO满足?"}
  G -->|否| H["回滚/止损/复盘"]`,
      exercise:
        '将服务容器化并部署到本地集群；配置 readiness/liveness，滚动更新时持续请求，观察是否出现失败；随后让数据库不可用，验证探针和告警行为。',
      pitfalls: [
        'liveness 依赖所有下游会造成重启风暴',
        'latest 标签不提供不可变版本',
        '有仪表盘但没有可执行告警与 runbook 不等于可运维',
      ],
      checks: [
        '能解释控制器收敛',
        '能设计安全发布和回滚',
        '能用遥测定位一次跨服务慢请求',
      ],
      refs: [
        ['Kubernetes Concepts', 'https://kubernetes.io/docs/concepts/'],
        ['OpenTelemetry Documentation', 'https://opentelemetry.io/docs/'],
        [
          'Spring Boot Container Images',
          'https://docs.spring.io/spring-boot/reference/packaging/container-images/',
        ],
      ],
    }),
  },
  {
    folder: '12-前端与全栈交付',
    content: guide({
      title: '前端基础与全栈交付',
      purpose:
        '让后端学习者理解浏览器如何解析 HTML、应用 CSS、执行 JavaScript、调用 API 并维护界面状态。学习目标是构建可访问、响应式、类型安全、可测试的管理界面，并准确处理认证、错误、上传下载与实时连接。',
      prerequisites: [
        '理解 HTTP、JSON 与 REST API',
        '掌握变量、函数、集合和异常等通用编程概念',
      ],
      concepts: [
        [
          '语义 HTML',
          'HTML 描述文档结构与控件语义，正确元素为键盘、读屏器、搜索与默认交互提供基础。',
          '能用 label、button、nav、main 和表格语义构建页面。',
        ],
        [
          'CSS 级联与布局',
          '选择器、来源、层叠层、优先级和源码顺序共同决定样式；Flexbox 与 Grid 解决不同维度的布局。',
          '能在不堆叠 `!important` 的情况下解释计算样式。',
        ],
        [
          'JavaScript 运行模型',
          '浏览器在事件循环中执行任务；Promise 回调进入微任务队列，DOM、网络和计时器由 Web API 协作。',
          '能解释 await 前后执行顺序和取消过期请求。',
        ],
        [
          '响应式状态',
          'Vue 用 ref/reactive/computed 描述状态与派生值，用组件 props/emit 形成单向数据流。',
          '能避免把可计算值重复存储并正确清理副作用。',
        ],
      ],
      order: [
        'HTML 语义、表单和可访问性',
        'CSS 盒模型、级联、Flex/Grid 和响应式',
        'JavaScript 类型、函数、DOM、模块和异步',
        'TypeScript 与 Vue 组件',
        '接口契约、测试、性能和部署',
      ],
      diagram: `sequenceDiagram
  participant U as 用户
  participant D as DOM事件
  participant V as Vue状态
  participant A as API
  U->>D: 点击/输入
  D->>V: 更新状态
  V->>A: fetch + AbortSignal
  A-->>V: JSON/错误
  V-->>U: 响应式渲染与反馈`,
      exercise:
        '实现可键盘操作的订单列表：包含筛选表单、加载/空/错误状态、分页、取消旧请求和响应式布局；用浏览器开发工具检查网络、可访问树和布局。',
      pitfalls: [
        '`div` 加点击事件不自动具备 button 的键盘语义',
        'TypeScript 类型不会在运行时自动校验服务器 JSON',
        '把所有状态放全局会增加耦合和生命周期问题',
      ],
      checks: [
        '能构建语义表单和响应式布局',
        '能解释事件循环与 Promise',
        '能设计类型化 Vue 组件和 API 状态',
      ],
      refs: [
        [
          'MDN Learn Web Development',
          'https://developer.mozilla.org/en-US/docs/Learn_web_development',
        ],
        [
          'JavaScript Guide',
          'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
        ],
        ['Vue Guide', 'https://vuejs.org/guide/introduction.html'],
      ],
    }),
  },
  {
    folder: '13-项目阶梯',
    content: guide({
      title: 'Java 后端项目阶梯',
      purpose:
        '把零散知识组织成逐步增加约束的可运行系统。每个项目都要求需求、架构、代码、测试、运行、观测、发布与复盘证据；下一阶段只在当前阶段可验证后增加复杂度。',
      prerequisites: [
        '完成 Java 基础和至少一个 Spring Boot CRUD 服务',
        '会使用 Git、构建工具和自动化测试',
      ],
      concepts: [
        [
          '垂直切片',
          '按一个可交付用户场景贯穿接口、业务、数据和测试，而不是先把所有 controller 或表一次写完。',
          '每个迭代都有端到端可演示结果。',
        ],
        [
          '模块化单体',
          '在单一部署单元内保持清晰模块边界，减少分布式复杂度并为未来拆分提供证据。',
          '模块依赖可被架构测试验证。',
        ],
        [
          '验收标准',
          '验收标准是可观察且可测试的成功条件，应覆盖正常、边界、错误与非功能目标。',
          '需求条目能映射到自动化测试或演示脚本。',
        ],
        [
          '工程证据',
          'README、架构决策、测试报告、迁移、仪表盘、发布记录和复盘比技术名词列表更能证明能力。',
          '陌生人可按文档在新环境运行项目。',
        ],
      ],
      order: [
        '模块化单体任务系统',
        '事件驱动订单与库存',
        '云原生高可用平台',
        '整理作品集与可复现证据',
      ],
      diagram: `flowchart LR
  A["需求与验收标准"] --> B["最小垂直切片"]
  B --> C["自动化测试"]
  C --> D["可观测运行"]
  D --> E["部署与演示"]
  E --> F["复盘与下一迭代"]`,
      exercise:
        '选择“创建任务并按状态查询”作为第一条切片，提交 API 契约、数据库迁移、领域测试、集成测试、容器启动命令和演示脚本。',
      pitfalls: [
        '一次堆入过多中间件会掩盖核心设计',
        '只有截图没有复现步骤不构成工程证据',
        '项目复杂度应由需求和失败模式驱动',
      ],
      checks: [
        '能把需求拆成垂直切片',
        '能提供一键验证路径',
        '能解释每个组件为何存在及删除它的影响',
      ],
      refs: [
        ['Spring Petclinic', 'https://github.com/spring-projects/spring-petclinic'],
        ['The Twelve-Factor App', 'https://12factor.net/'],
        ['C4 Model', 'https://c4model.com/'],
      ],
    }),
  },
]

function supplement({
  title,
  intro,
  objectives,
  concepts,
  diagram,
  code,
  practice,
  pitfalls,
  sources,
}) {
  return `# ${title}

${intro}

## 1. 学习目标

${objectives.map((item) => `- ${item}`).join('\n')}

## 2. 核心概念

${concepts
  .map(
    ({ name, detail, boundary }, index) => `### ${index + 1}. ${name}

${detail}

**正确边界：** ${boundary}`,
  )
  .join('\n\n')}

## 3. 运行链路

\`\`\`mermaid
${diagram}
\`\`\`

## 4. 最小示例

${code}

## 5. 练习与验证

${practice.map((item, index) => `${index + 1}. ${item}`).join('\n')}

## 6. 常见误区

${pitfalls.map((item) => `- ${item}`).join('\n')}

## 7. 掌握检查

- [ ] 能不用术语堆砌，向初学者解释本主题解决的问题。
- [ ] 能运行示例并观察正常、边界和失败分支。
- [ ] 能说明该能力在完整 Java 后端链路中的位置和替换边界。
- [ ] 能以测试、执行计划、指标或规范条款验证关键结论。

## 参考资料

${refs(sources)}
`
}

export const supplementaryDocuments = [
  {
    folder: '02-工程工具与Linux',
    file: '04-数据结构算法复杂度与刷题方法.md',
    content: supplement({
      title: '数据结构、算法复杂度与工程化解题方法',
      intro:
        '数据结构决定数据如何组织，算法决定如何变换数据。后端开发并非每天手写红黑树，但需要用复杂度判断集合选择、分页、缓存、调度和热点路径是否会随数据量失控。',
      objectives: [
        '掌握时间/空间复杂度与摊还分析',
        '理解线性表、栈、队列、哈希、树、堆、图',
        '掌握排序、查找、递归、回溯、贪心和动态规划的适用边界',
      ],
      concepts: [
        {
          name: '复杂度与输入规模',
          detail:
            '大 O 描述输入规模增长时资源消耗的上界增长级别，忽略常数与低阶项；Ω 描述下界，Θ 描述紧确界。复杂度必须说明 n 的含义。哈希表平均查找接近 O(1)，但碰撞、扩容和恶意输入会改变成本。',
          boundary:
            '复杂度不是实际毫秒数；性能决策还要用真实数据、缓存局部性、分配和 I/O 基准验证。',
        },
        {
          name: '线性结构与哈希',
          detail:
            '数组支持 O(1) 随机访问但中间插入需移动；链表定位第 k 项为 O(n)；栈遵循后进先出，队列遵循先进先出；哈希表用散列函数定位桶并处理冲突。Java 的 ArrayList、ArrayDeque、HashMap 是常用实现。',
          boundary:
            'Java 的 Stack 是较旧同步类，栈/队列通常优先 ArrayDeque；HashMap 不保证业务所需顺序。',
        },
        {
          name: '树、堆与图',
          detail:
            '二叉搜索树维持有序关系，平衡树控制高度；堆只保证根为最小/最大，适合优先队列；图用顶点和边表达网络、依赖与路径，可用 BFS 求无权最短层数、DFS 做遍历与环检测。',
          boundary: '堆不是全排序结构；从 PriorityQueue 迭代得到的顺序不保证有序。',
        },
        {
          name: '解题模式',
          detail:
            '双指针和滑动窗口减少重复扫描；前缀和换取区间查询；二分要求单调判定；回溯枚举决策树；动态规划需要定义状态、转移、初值和计算顺序；贪心需要交换论证或不变量。',
          boundary:
            '看到“最优”不代表一定使用动态规划或贪心，先证明重叠子问题、最优子结构或贪心选择性质。',
        },
      ],
      diagram: `flowchart TD
  A["明确输入、输出、约束"] --> B["写朴素正确解"]
  B --> C["分析时间与空间复杂度"]
  C --> D["寻找不变量与数据结构"]
  D --> E["覆盖边界与随机测试"]
  E --> F["基准验证工程收益"]`,
      code: `\`\`\`java
static int[] twoSum(int[] values, int target) {
  Map<Integer, Integer> seen = new HashMap<>();
  for (int i = 0; i < values.length; i++) {
    int needed = target - values[i];
    Integer j = seen.get(needed);
    if (j != null) return new int[] {j, i};
    seen.putIfAbsent(values[i], i);
  }
  return new int[0];
}
\`\`\`

该实现一次扫描，平均时间 O(n)、额外空间 O(n)。\`putIfAbsent\` 保留重复值场景中的较早位置；仍需测试空数组、无解、负数和溢出边界。`,
      practice: [
        '实现 LRU 缓存并证明 get/put 的复杂度',
        '用 BFS 求网格最短路径并记录访问集合',
        '为排序实现做随机差分测试',
      ],
      pitfalls: [
        '背题型而不写不变量',
        '只写平均复杂度而忽略最坏情况',
        '递归未考虑栈深度和重复计算',
      ],
      sources: [
        [
          'Java Collections Framework',
          'https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/doc-files/coll-overview.html',
        ],
        ['Princeton Algorithms', 'https://algs4.cs.princeton.edu/home/'],
      ],
    }),
  },
  {
    folder: '02-工程工具与Linux',
    file: '05-设计原则UML与常用设计模式.md',
    content: supplement({
      title: '设计原则、UML 与常用设计模式',
      intro:
        '设计的目标是让变化被限制在清晰边界内。原则帮助评审权衡，UML 提供沟通记号，模式记录反复出现的设计结构；三者都服务于具体问题，而不是为了增加类数量。',
      objectives: [
        '理解高内聚、低耦合与 SOLID',
        '能读写必要的类图和时序图',
        '掌握工厂、策略、适配器、装饰器、观察者、模板方法、责任链',
      ],
      concepts: [
        {
          name: 'SOLID 与依赖方向',
          detail:
            '单一职责关注变化原因；开闭原则鼓励扩展而非散布修改；里氏替换要求子类型保持父类型可观察契约；接口隔离避免客户端依赖无关方法；依赖倒置让高层策略依赖稳定抽象。',
          boundary:
            '原则会冲突且有成本，应结合变化频率、测试和理解成本权衡，不是每个类都必须套接口。',
        },
        {
          name: 'UML 的最小集合',
          detail:
            '类图表达类型、关联、组合、继承和依赖；时序图表达参与者之间随时间发生的消息；状态图表达状态、事件、守卫与迁移。工程文档只画支撑决策的层级。',
          boundary: '图应与代码和运行事实同步；过度精细的全量类图很快过期。',
        },
        {
          name: '创建与结构模式',
          detail:
            '工厂集中对象创建与选择；适配器把既有接口转换为所需端口；装饰器保持接口同时叠加行为；外观为复杂子系统提供窄入口。',
          boundary: '依赖注入容器可以管理创建，但不会自动决定正确的领域抽象。',
        },
        {
          name: '行为模式',
          detail:
            '策略把可替换算法封装为统一接口；观察者广播事件但要处理顺序与失败；责任链让多个处理器依次判断；模板方法固定骨架并允许步骤变化。',
          boundary:
            '进程内观察者与可靠消息不是同一保证；异常、线程和事务传播需要明确。',
        },
      ],
      diagram: `classDiagram
  class PricingService {
    -DiscountPolicy policy
    +price(Order) Money
  }
  class DiscountPolicy {
    <<interface>>
    +apply(Order) Money
  }
  class VipDiscount
  class CampaignDiscount
  PricingService --> DiscountPolicy
  DiscountPolicy <|.. VipDiscount
  DiscountPolicy <|.. CampaignDiscount`,
      code: `\`\`\`java
interface DiscountPolicy {
  BigDecimal apply(Order order);
}

final class PricingService {
  private final DiscountPolicy policy;
  PricingService(DiscountPolicy policy) { this.policy = policy; }

  BigDecimal finalPrice(Order order) {
    return order.total().subtract(policy.apply(order)).max(BigDecimal.ZERO);
  }
}
\`\`\``,
      practice: [
        '把多分支支付逻辑重构为策略并比较修改面',
        '为一次下单画组件时序图',
        '识别一个不必要的模式并简化',
      ],
      pitfalls: [
        '把“一个类只做一件事”机械等同于单一职责',
        '用继承复用实现却破坏替换契约',
        '模式名称先于问题分析',
      ],
      sources: [
        [
          'Refactoring.Guru Design Patterns',
          'https://refactoring.guru/design-patterns',
        ],
        ['PlantUML Class Diagram', 'https://plantuml.com/class-diagram'],
      ],
    }),
  },
  {
    folder: '02-工程工具与Linux',
    file: '06-JVM内存类加载字节码与GC.md',
    content: supplement({
      title: 'JVM 内存、类加载、字节码与垃圾收集',
      intro:
        'JVM 主题把 Java 源码、class 文件、运行时数据区、对象分配、方法执行、JIT 与垃圾收集连接起来。学习目标是能解释和诊断，而不是背诵某个收集器的旧默认参数。',
      objectives: [
        '理解 class 文件与类加载生命周期',
        '区分堆、栈、方法区语义和本地内存',
        '理解可达性、分代假设、停顿与并发收集',
        '会用 jcmd/JFR 建立诊断证据',
      ],
      concepts: [
        {
          name: 'class 文件与执行',
          detail:
            '`javac` 生成包含常量池、字段、方法和字节码指令的 class 文件。JVM 加载、验证、准备、解析和初始化类；解释器先执行热点代码，JIT 可基于运行时信息编译和优化。',
          boundary:
            '源代码的一行不一定对应一条字节码；JIT 还可能内联、逃逸分析并去优化。',
        },
        {
          name: '类加载器与初始化',
          detail:
            '类身份由二进制类名和定义它的类加载器共同确定。父加载委派减少核心类型重复。初始化在首次主动使用时执行 `<clinit>`，失败会影响后续使用。',
          boundary:
            '“同名 class”不保证是同一类型；插件、应用服务器和热部署常涉及多个加载器。',
        },
        {
          name: '运行时内存',
          detail:
            '堆通常保存对象；每线程 Java 栈包含栈帧、局部变量和操作数栈；方法区是规范概念，HotSpot 用 Metaspace 等实现类元数据；直接缓冲、线程栈、代码缓存也消耗本地内存。',
          boundary: '进程内存大于 Java 堆很正常；只看 `-Xmx` 不能解释容器 OOM。',
        },
        {
          name: 'GC 与诊断',
          detail:
            'GC 从根集合做可达性分析并回收不可达对象。不同收集器在吞吐、停顿、并发开销和内存余量间权衡。诊断应从 GC 日志、JFR、类直方图、线程和堆转储建立时间线。',
          boundary:
            '`System.gc()` 是建议且通常不是泄漏修复；高 GC 可能是分配速率、存活集或内存上限问题。',
        },
      ],
      diagram: `flowchart LR
  A[".java"] --> B["javac"]
  B --> C["class 字节码"]
  C --> D["加载/验证/链接/初始化"]
  D --> E["解释器"]
  E --> F["热点探测与JIT"]
  F --> G["优化机器码"]
  H["对象分配"] --> I["可达性分析"]
  I --> J["回收/复制/整理"]`,
      code: `\`\`\`bash
javac --release 25 Demo.java
javap -c -v Demo
jcmd <pid> VM.flags
jcmd <pid> GC.heap_info
jcmd <pid> GC.class_histogram
jcmd <pid> JFR.start name=baseline duration=60s filename=baseline.jfr
\`\`\``,
      practice: [
        '用 javap 比较字符串拼接与循环代码',
        '创建受控内存增长并观察 JFR/类直方图',
        '改变堆上限但保持负载不变，比较吞吐和停顿',
      ],
      pitfalls: [
        '把方法区等同于某个永久实现名词',
        '只凭一次堆转储断言泄漏',
        '未经基准复制旧版本 GC 参数',
      ],
      sources: [
        [
          'JVM Specification 25',
          'https://docs.oracle.com/javase/specs/jvms/se25/html/',
        ],
        [
          'HotSpot GC Tuning Guide',
          'https://docs.oracle.com/en/java/javase/25/gctuning/',
        ],
        ['JDK Mission Control', 'https://docs.oracle.com/en/java/javase/25/jmc/'],
      ],
    }),
  },
  {
    folder: '04-Spring Framework',
    file: '04-Spring异步定时任务Quartz与Batch.md',
    content: supplement({
      title: 'Spring 异步、任务调度、Quartz 与 Spring Batch',
      intro:
        '后台任务需要明确触发方式、并发模型、幂等、持久状态、重试和可观测性。`@Async`、`@Scheduled`、Quartz 与 Spring Batch 分别解决不同复杂度，不应混为一个“定时器”。',
      objectives: [
        '理解线程池和上下文传播',
        '掌握固定频率、固定延迟和 cron',
        '理解 Quartz 持久触发与集群协调',
        '理解 Batch 的 Job/Step/Reader/Processor/Writer 与重启',
      ],
      concepts: [
        {
          name: '异步执行',
          detail:
            '`@Async` 通过代理把方法提交给 Executor。需要设置有界队列、线程数、拒绝策略、异常处理与关闭等待，并明确安全上下文、MDC 和事务不会自然跨线程。',
          boundary: '异步返回并不等于任务可靠持久化；进程崩溃时内存队列任务可能丢失。',
        },
        {
          name: '轻量调度',
          detail:
            '`@Scheduled` 适合单应用内可重入任务。fixedDelay 从上次完成后计时，fixedRate 按计划频率触发，cron 按日历表达并应明确时区。',
          boundary:
            '多实例部署会各自触发；需用分布式锁、单独调度实例或外部调度器协调。',
        },
        {
          name: 'Quartz',
          detail:
            'Quartz 将 Job 与 Trigger 分离，可持久化触发状态，支持 misfire 策略和数据库集群。Job 应无状态或显式管理并发，业务动作仍要幂等。',
          boundary: '调度器保证触发管理，不自动保证外部业务只执行一次。',
        },
        {
          name: 'Spring Batch',
          detail:
            'Batch 将批处理拆成 Job 和 Step；chunk 模式按块读、处理、写并提交，元数据记录执行状态以支持重启。大文件/大表需流式读取、稳定游标和失败跳过策略。',
          boundary: 'skip/retry 必须限定异常和上限；盲目跳过会静默丢失业务数据。',
        },
      ],
      diagram: `flowchart LR
  A["Trigger"] --> B["Job/Task"]
  B --> C["读取检查点"]
  C --> D["Reader"]
  D --> E["Processor"]
  E --> F["Writer"]
  F --> G["提交块与更新检查点"]
  G --> H{"还有数据?"}
  H -->|是| D
  H -->|否| I["完成与指标"]`,
      code: `\`\`\`java
@Bean
Job importOrders(JobRepository jobs, Step importStep) {
  return new JobBuilder("importOrders", jobs)
      .start(importStep)
      .build();
}

@Bean
Step importStep(JobRepository jobs, PlatformTransactionManager tx,
    ItemReader<OrderRow> reader, ItemWriter<OrderRow> writer) {
  return new StepBuilder("importOrders.csv", jobs)
      .<OrderRow, OrderRow>chunk(200, tx)
      .reader(reader)
      .processor(row -> row.validated())
      .writer(writer)
      .build();
}
\`\`\``,
      practice: [
        '比较 fixedRate/fixedDelay 在慢任务下的时间线',
        '让批任务在第三个 chunk 失败并验证重启点',
        '为多实例 Quartz 任务验证幂等',
      ],
      pitfalls: [
        '用无界线程池掩盖背压',
        '在定时任务中长时间占据数据库事务',
        '每次重启都使用相同 JobParameters 导致实例冲突',
      ],
      sources: [
        [
          'Spring Task Execution and Scheduling',
          'https://docs.spring.io/spring-framework/reference/integration/scheduling.html',
        ],
        ['Quartz Documentation', 'https://www.quartz-scheduler.org/documentation/'],
        ['Spring Batch Reference', 'https://docs.spring.io/spring-batch/reference/'],
      ],
    }),
  },
  {
    folder: '05-Spring Boot与Web',
    file: '05-OpenAPI文件处理邮件与WebSocket.md',
    content: supplement({
      title: 'OpenAPI、文件处理、邮件与 WebSocket',
      intro:
        '真实 Web 服务除 JSON CRUD 外，还需要契约文档、文件流、异步通知和双向通信。每类能力都有独立的资源限制、安全边界与失败模型。',
      objectives: [
        '用 OpenAPI 描述与验证接口',
        '安全处理上传下载和大文件流',
        '理解邮件提交与投递结果',
        '掌握 WebSocket 握手、会话、心跳和背压',
      ],
      concepts: [
        {
          name: 'OpenAPI 契约',
          detail:
            'OpenAPI 描述路径、参数、schema、响应和安全方案，可生成文档、客户端与契约测试。契约应纳入版本控制并在 CI 检查破坏性变更。',
          boundary: '自动生成文档不替代业务语义和示例；运行时输入仍需校验。',
        },
        {
          name: '上传与下载',
          detail:
            'multipart 上传需要限制请求/单文件大小、文件数、媒体类型和文件名；内容应流式处理、生成服务端对象名并进行扫描。下载需设置正确 Content-Type、Content-Disposition、长度与缓存头。',
          boundary:
            '不要把客户端文件名直接拼接为文件系统路径；扩展名也不能证明真实内容。',
        },
        {
          name: '邮件',
          detail:
            '应用通常把邮件任务写入可靠队列，由发送器使用 SMTP/API 提交。提交成功只表示上游接受，不保证最终送达；退信、投诉、重试和模板版本需要记录。',
          boundary: '数据库事务内直接调用邮件服务会延长事务且难以处理提交后失败。',
        },
        {
          name: 'WebSocket',
          detail:
            'WebSocket 从 HTTP Upgrade 建立全双工连接。服务端需认证握手、限制消息、维护心跳/超时、处理慢消费者，并在多实例间用消息层广播。',
          boundary:
            '连接建立时认证成功不代表永久授权；长期会话需处理权限变化和令牌到期。',
        },
      ],
      diagram: `flowchart LR
  A["HTTP/JSON"] --> B["OpenAPI校验"]
  C["multipart上传"] --> D["限额/扫描/对象存储"]
  E["业务事件"] --> F["Outbox/队列"]
  F --> G["邮件发送器"]
  H["WebSocket握手"] --> I["认证会话"]
  I --> J["心跳/消息/背压"]`,
      code: `\`\`\`java
@PostMapping(path = "/files", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
ResponseEntity<FileView> upload(@RequestPart MultipartFile file) throws IOException {
  if (file.isEmpty() || file.getSize() > 10 * 1024 * 1024) {
    throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE);
  }
  String objectKey = UUID.randomUUID().toString();
  try (InputStream input = file.getInputStream()) {
    storage.put(objectKey, input, file.getSize(), file.getContentType());
  }
  return ResponseEntity.status(HttpStatus.CREATED)
      .body(new FileView(objectKey, file.getOriginalFilename()));
}
\`\`\``,
      practice: [
        '对 OpenAPI 做破坏性 diff',
        '上传伪造扩展名和超限文件并验证拒绝',
        '模拟慢 WebSocket 消费者并验证队列上限',
      ],
      pitfalls: [
        '把完整上传读入 byte[] 导致堆峰值',
        '把 SMTP 250 当作用户已读',
        'WebSocket 自动获得 HTTP 接口的全部限流与授权',
      ],
      sources: [
        ['OpenAPI Specification', 'https://spec.openapis.org/oas/latest.html'],
        [
          'Spring Multipart Forms',
          'https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/multipart-forms.html',
        ],
        [
          'Spring WebSocket',
          'https://docs.spring.io/spring-framework/reference/web/websocket.html',
        ],
      ],
    }),
  },
  {
    folder: '06-数据访问与ORM',
    file: '04-MyBatis-Plus工程实践.md',
    content: supplement({
      title: 'MyBatis-Plus 工程实践',
      intro:
        'MyBatis-Plus 在 MyBatis 上提供通用 Mapper、条件构造器、分页和插件，以减少重复 CRUD。它保留 MyBatis 的 SQL 模型，复杂查询、索引与事务仍需开发者负责。',
      objectives: [
        '掌握 BaseMapper 与 LambdaWrapper',
        '理解分页、乐观锁、逻辑删除与多租户插件',
        '避免字段泄漏、SQL 注入和无条件更新',
      ],
      concepts: [
        {
          name: '实体与 Mapper',
          detail:
            '`@TableName`、`@TableId`、`@TableField` 描述映射，`BaseMapper` 提供常用单表方法。DTO、领域对象和数据库实体职责不同，外部请求不应直接控制实体全部字段。',
          boundary: '通用 CRUD 只减少样板，不应让 Controller 直接暴露 Mapper。',
        },
        {
          name: '条件构造器',
          detail:
            'LambdaWrapper 用方法引用表达列，降低字符串列名重构风险。动态条件应显式控制，排序字段使用白名单，禁止把客户端片段传给 `last`/`apply`。',
          boundary: '参数值通常会绑定，但原样拼接 SQL 片段仍可能形成注入。',
        },
        {
          name: '插件',
          detail:
            '分页插件改写 count 和 page SQL；乐观锁插件依赖 version 条件更新；逻辑删除用标记替代物理删除；多租户插件注入 tenant 条件。插件顺序和不适用语句需测试。',
          boundary:
            '逻辑删除不能自动满足隐私擦除；多租户插件也不能替代数据库权限与测试。',
        },
        {
          name: '批量与性能',
          detail:
            '批量写需要控制批大小、事务长度、驱动选项和失败定位。分页 count 对复杂查询可能昂贵；大数据滚动使用稳定唯一排序的游标。',
          boundary:
            '`saveBatch` 不保证所有数据库/驱动场景都生成单条批语句，应以日志和指标验证。',
        },
      ],
      diagram: `flowchart LR
  A["DTO"] --> B["应用服务"]
  B --> C["LambdaWrapper/自定义SQL"]
  C --> D["MyBatis-Plus拦截器链"]
  D --> E["MyBatis参数绑定"]
  E --> F["数据库约束与索引"]`,
      code: `\`\`\`java
Page<UserEntity> page = new Page<>(1, 20, true);
LambdaQueryWrapper<UserEntity> query = Wrappers.lambdaQuery();
query.eq(UserEntity::getTenantId, tenantId)
    .eq(status != null, UserEntity::getStatus, status)
    .likeRight(keyword != null, UserEntity::getName, keyword)
    .orderByDesc(UserEntity::getId);

IPage<UserEntity> result = userMapper.selectPage(page, query);
\`\`\``,
      practice: [
        '验证乐观锁冲突时受影响行数',
        '对复杂分页检查 count SQL',
        '测试租户条件覆盖查询、更新和删除',
      ],
      pitfalls: [
        '从请求接收任意排序字段并拼接',
        '忽略批量事务过大与失败定位',
        '把逻辑删除当作自动数据归档',
      ],
      sources: [
        ['MyBatis-Plus Introduction', 'https://baomidou.com/en/introduce/'],
        [
          'Persistence Layer Interface',
          'https://baomidou.com/en/guides/data-interface/',
        ],
        ['MyBatis-Plus Plugins', 'https://baomidou.com/en/plugins/'],
      ],
    }),
  },
  {
    folder: '07-分布式与微服务',
    file: '06-Spring-Cloud与Spring-Cloud-Alibaba组件图.md',
    content: supplement({
      title: 'Spring Cloud 与 Spring Cloud Alibaba 组件图',
      intro:
        'Spring Cloud 提供分布式常见模式的一组抽象与实现；Spring Cloud Alibaba 集成 Nacos、Sentinel 等生态能力。选型先从需求和失败模型出发，再核对发行列车与 Spring Boot 兼容矩阵。',
      objectives: [
        '理解配置、发现、负载均衡、网关和声明式客户端',
        '掌握 Spring Cloud Alibaba 常见组件职责',
        '会核对版本兼容与最小依赖',
      ],
      concepts: [
        {
          name: '发行列车与兼容',
          detail:
            'Spring Cloud 以 release train 管理一组项目版本，必须与 Spring Boot 代际兼容。BOM 统一版本，避免逐个填写组件版本。',
          boundary: '“最新组件版本”混搭不保证二进制和自动配置兼容。',
        },
        {
          name: '发现、配置与调用',
          detail:
            'DiscoveryClient 提供实例列表，LoadBalancer 选择实例，OpenFeign 生成 HTTP 客户端代理，Config/Nacos Config 管理外部配置。调用仍需 timeout、连接池、幂等和可观测性。',
          boundary: '服务发现解决地址变化，不解决 API 契约兼容和业务授权。',
        },
        {
          name: '网关',
          detail:
            'Spring Cloud Gateway 在入口做路由、TLS 终止、认证协作、限流和观测。业务资源级授权仍在服务内执行，避免网关成为所有领域规则的单点。',
          boundary: '网关过滤器不应执行长事务或直接写各服务数据库。',
        },
        {
          name: 'Alibaba 生态',
          detail:
            'Nacos 提供注册发现与配置；Sentinel 提供流量治理；RocketMQ 支持消息；Seata 提供分布式事务模式。每个组件都需要独立高可用、数据持久化和故障演练。',
          boundary: '加入组件会增加运行成本，不是系统可靠性的自动开关。',
        },
      ],
      diagram: `flowchart LR
  A["客户端"] --> B["Spring Cloud Gateway"]
  B --> C["LoadBalancer/OpenFeign"]
  C --> D["业务服务"]
  E["Nacos Discovery"] -. "实例" .-> C
  F["Nacos Config"] -. "配置" .-> D
  G["Sentinel"] -. "限流/熔断规则" .-> B
  G -.-> D
  D --> H["RocketMQ"]
  D --> I["数据库"]`,
      code: `\`\`\`yaml
spring:
  application:
    name: order-service
  config:
    import:
      - optional:nacos:order-service.yaml?group=DEFAULT_GROUP
  cloud:
    nacos:
      server-addr: \${NACOS_ADDR}
      discovery:
        namespace: \${NACOS_NAMESPACE}
\`\`\``,
      practice: [
        '按官方矩阵建立最小 BOM',
        '让注册中心短暂失联并观察缓存实例行为',
        '验证网关与服务端双层授权',
      ],
      pitfalls: [
        '只设置连接超时而无响应超时',
        '配置刷新破坏不变量且无审计',
        '将所有内部流量都强制绕公网网关',
      ],
      sources: [
        [
          'Spring Cloud Supported Versions',
          'https://github.com/spring-cloud/spring-cloud-release/wiki/Supported-Versions',
        ],
        ['Spring Cloud Reference', 'https://docs.spring.io/spring-cloud-reference/'],
        ['Spring Cloud Alibaba', 'https://sca.aliyun.com/en/'],
      ],
    }),
  },
  {
    folder: '07-分布式与微服务',
    file: '07-Seata-Sentinel-SkyWalking实战边界.md',
    content: supplement({
      title: 'Seata、Sentinel 与 SkyWalking 实战边界',
      intro:
        '这三个组件分别聚焦分布式事务、流量治理与可观测性。它们解决的是不同问题：事务一致性、过载保护和运行证据不能相互替代。',
      objectives: [
        '比较 Seata AT/TCC/Saga/XA',
        '理解 Sentinel 资源、规则和降级',
        '理解 SkyWalking 探针、后端与存储链路',
      ],
      concepts: [
        {
          name: 'Seata 模式选择',
          detail:
            'AT 通过数据源代理、undo log 和全局锁协调关系数据库；TCC 要求业务实现 Try/Confirm/Cancel；Saga 用一系列本地事务与补偿处理长流程；XA 依赖数据库 XA 能力。',
          boundary: '任何模式都需处理空回滚、悬挂、幂等、补偿失败和协调器可用性。',
        },
        {
          name: 'Sentinel 流量治理',
          detail:
            'Sentinel 把调用路径或业务操作定义为资源，按 QPS、并发线程、关联/链路等规则限流，并基于慢调用或异常熔断。规则应通过控制面持久化并灰度发布。',
          boundary: '限流阈值需由容量测试和 SLO 得出；复制示例数值会造成误拒绝或过载。',
        },
        {
          name: 'SkyWalking 可观测链路',
          detail:
            '探针采集 trace/metric/profile 数据，OAP 聚合分析并写入存储，UI 用于查询。服务名、实例名、采样、保留期和敏感数据策略需统一。',
          boundary:
            '追踪展示调用相关性，不自动证明根因；仍要结合日志、指标、变更和代码。',
        },
        {
          name: '组合使用',
          detail:
            'trace 可识别慢依赖，容量证据形成 Sentinel 规则；事务链路用 trace 关联 Seata XID；规则变更和事务补偿都写审计与业务指标。',
          boundary: '观测组件失效不应阻塞主业务；治理控制面也需要降级策略。',
        },
      ],
      diagram: `flowchart LR
  A["入口请求"] --> B["Sentinel资源与规则"]
  B --> C["业务服务"]
  C --> D["Seata全局事务/本地事务"]
  D --> E["数据库A"]
  D --> F["数据库B"]
  G["SkyWalking Java 探针"] -. "Trace/Metrics" .-> B
  G -.-> C
  G --> H["OAP与存储"]`,
      code: `\`\`\`java
try (Entry entry = SphU.entry("order.create")) {
  return orderService.create(command);
} catch (BlockException blocked) {
  throw new TooManyRequestsException("系统繁忙，请稍后重试");
}
\`\`\``,
      practice: [
        '对 AT 模式制造二阶段失败并观察补偿',
        '用阶梯压测确定 Sentinel 阈值',
        '从 trace 定位一次慢 SQL 并用数据库证据交叉验证',
      ],
      pitfalls: [
        '把分布式事务当成本地事务无成本放大',
        '熔断后的 fallback 返回伪造成功',
        '采集全部 trace 却未估算存储与敏感字段',
      ],
      sources: [
        ['Seata Documentation', 'https://seata.apache.org/docs/'],
        [
          'Sentinel Documentation',
          'https://sentinelguard.io/en-us/docs/introduction.html',
        ],
        ['Apache SkyWalking', 'https://skywalking.apache.org/docs/'],
      ],
    }),
  },
  {
    folder: '08-高性能与消息队列',
    file: '06-Caffeine本地缓存与多级缓存.md',
    content: supplement({
      title: 'Caffeine 本地缓存与多级缓存',
      intro:
        'Caffeine 是高性能 JVM 进程内缓存。它省去网络往返，适合热点只读/可重算数据；但每个实例拥有独立副本，容量、过期、加载并发和跨实例失效必须设计。',
      objectives: [
        '理解 size/time/reference eviction',
        '掌握同步与异步加载及统计',
        '设计本地+Redis+数据库多级缓存',
      ],
      concepts: [
        {
          name: '淘汰与过期',
          detail:
            '`maximumSize/maximumWeight` 控制容量；`expireAfterWrite` 从写入计时，`expireAfterAccess` 从最近访问计时，`refreshAfterWrite` 允许读取旧值并触发刷新。淘汰维护通常在读写时摊还执行。',
          boundary: 'refresh 不是强制失效；加载失败时可能继续返回旧值，需按业务定义。',
        },
        {
          name: '加载与并发',
          detail:
            'LoadingCache 将同一键加载合并以降低击穿；AsyncLoadingCache 返回 CompletableFuture。加载函数不应递归访问同一键，且需设置下游超时和失败策略。',
          boundary: '缓存不会修复慢且无界的加载器；异步加载仍占用线程和连接。',
        },
        {
          name: '多级缓存',
          detail:
            'L1 Caffeine 最快但实例私有，L2 Redis 跨实例共享，数据库是事实来源。读路径逐级回源，写路径通常先提交数据库，再通过事件失效 L2 与各实例 L1。',
          boundary: '多级缓存扩大不一致组合，应为版本、失效丢失和重放定义行为。',
        },
        {
          name: '观测',
          detail:
            '记录 hit/miss/load success/load failure/eviction、加载耗时和估算大小，按业务命中收益而非单一命中率判断。',
          boundary: '高命中率可能来自低价值小对象，同时真正昂贵键仍未缓存。',
        },
      ],
      diagram: `flowchart LR
  A["查询"] --> B{"L1 Caffeine"}
  B -->|miss| C{"L2 Redis"}
  C -->|miss| D["数据库"]
  D --> C
  C --> B
  E["数据库提交"] --> F["失效事件"]
  F --> C
  F --> B`,
      code: `\`\`\`java
LoadingCache<Long, Product> products = Caffeine.newBuilder()
    .maximumSize(10_000)
    .expireAfterWrite(Duration.ofMinutes(5))
    .refreshAfterWrite(Duration.ofMinutes(1))
    .recordStats()
    .build(productRepository::requireById);

Product product = products.get(productId);
\`\`\``,
      practice: [
        '压测同一热点键并验证加载合并',
        '模拟失效事件丢失并用版本/TTL 收敛',
        '比较 L1 命中前后尾延迟与堆占用',
      ],
      pitfalls: [
        '缓存无限增长',
        '缓存 null 却没有短 TTL',
        '在每个实例手工失效而无可靠广播',
      ],
      sources: [
        ['Caffeine Wiki', 'https://github.com/ben-manes/caffeine/wiki'],
        [
          'Caffeine Javadoc',
          'https://www.javadoc.io/doc/com.github.ben-manes.caffeine/caffeine/latest/',
        ],
      ],
    }),
  },
  {
    folder: '12-前端与全栈交付',
    file: '04-HTML语义表单媒体与可访问性.md',
    content: supplement({
      title: 'HTML：语义结构、表单、媒体与可访问性',
      intro:
        'HTML 定义内容和交互控件的语义。浏览器据此构建 DOM 和可访问树，并提供表单、链接、媒体、焦点与键盘默认行为。语义正确的页面通常更容易测试、维护和被辅助技术使用。',
      objectives: [
        '掌握文档骨架和语义分区',
        '掌握表单控件、校验与提交',
        '理解图片、音视频与响应式资源',
        '掌握键盘、焦点、名称和 ARIA 基础',
      ],
      concepts: [
        {
          name: '文档结构与语义元素',
          detail:
            '`<!doctype html>` 启用标准模式；`html/head/body` 构成骨架。`header/nav/main/article/section/aside/footer` 表达区域角色，标题层级描述内容大纲。`button`、`a`、列表和表格应按真实语义选择。',
          boundary:
            '`section` 通常需要可识别标题；用于布局的无语义容器可使用 `div`，但不要用 `div` 模拟原生按钮。',
        },
        {
          name: '表单与浏览器校验',
          detail:
            '`form` 通过 method/action/encoding 定义提交。每个控件用 `label for` 获得可访问名称，`name` 决定 FormData 键；`required`、`min/max`、`minlength`、`pattern` 提供约束。服务端必须再次校验。',
          boundary:
            'placeholder 不是 label；disabled 控件不提交，readonly 控件通常仍提交。',
        },
        {
          name: '媒体与性能',
          detail:
            '`img` 需要反映用途的 `alt`；装饰图可用空 alt。`picture/srcset/sizes` 让浏览器按视口和像素密度选择资源，显式 width/height 减少布局偏移。音视频应提供字幕和替代信息。',
          boundary: '不要把重要文字只放进图片；懒加载首屏主图可能延迟最大内容绘制。',
        },
        {
          name: '可访问性',
          detail:
            '可访问名称来自 label、文本或 ARIA；焦点顺序通常遵循 DOM。先使用原生语义，ARIA 仅补充缺失语义。动态错误用文本关联，模态框需管理初始焦点、焦点约束和关闭后的焦点恢复。',
          boundary: 'ARIA 不会自动加入键盘行为、状态管理和视觉样式。',
        },
      ],
      diagram: `flowchart TD
  A["HTML源文本"] --> B["DOM树"]
  B --> C["CSS渲染树"]
  B --> D["可访问树"]
  E["键盘/鼠标/触摸"] --> B
  B --> F["表单校验与提交"]
  F --> G["HTTP请求"]`,
      code: `\`\`\`html
<main>
  <h1>创建账号</h1>
  <form id="signup">
    <div>
      <label for="email">邮箱</label>
      <input id="email" name="email" type="email"
             autocomplete="email" required
             aria-describedby="email-help email-error">
      <p id="email-help">用于登录和接收通知。</p>
      <p id="email-error" role="alert" hidden></p>
    </div>
    <button type="submit">创建</button>
  </form>
</main>
\`\`\`

\`\`\`javascript
const form = document.querySelector('#signup')
form.addEventListener('submit', event => {
  event.preventDefault()
  if (!form.reportValidity()) return
  const payload = Object.fromEntries(new FormData(form))
  console.log(payload)
})
\`\`\``,
      practice: [
        '只用键盘完成表单',
        '用浏览器可访问树检查控件名称',
        '为图片选择正确 alt 与尺寸',
      ],
      pitfalls: [
        '点击文字不能聚焦输入框',
        '标题仅按字号选择导致层级跳跃',
        '客户端校验被当作安全边界',
      ],
      sources: [
        [
          'MDN Structuring content with HTML',
          'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content',
        ],
        [
          'MDN Web forms',
          'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms',
        ],
        ['WAI-ARIA Authoring Practices', 'https://www.w3.org/WAI/ARIA/apg/'],
      ],
    }),
  },
  {
    folder: '12-前端与全栈交付',
    file: '05-CSS级联盒模型布局响应式与动画.md',
    content: supplement({
      title: 'CSS：级联、盒模型、布局、响应式与动画',
      intro:
        'CSS 是一套声明式约束系统。浏览器为每个元素计算属性，再执行布局、绘制与合成。理解级联和布局算法，比不断增加选择器优先级更可靠。',
      objectives: [
        '掌握选择器、继承、级联层和自定义属性',
        '掌握盒模型、常规流与定位',
        '掌握 Flexbox、Grid 和容器/媒体查询',
        '理解过渡、动画、性能与减少动态偏好',
      ],
      concepts: [
        {
          name: '级联与值处理',
          detail:
            '同一属性冲突时，来源与重要性、cascade layer、选择器优先级、作用域接近度和源码顺序依次参与决策。部分属性继承。自定义属性保存 token 并在使用点通过 `var()` 解析。',
          boundary: '`!important` 参与级联但会提高覆盖成本；应先设计层级与组件边界。',
        },
        {
          name: '盒模型与格式化上下文',
          detail:
            'content、padding、border、margin 组成盒模型；`box-sizing:border-box` 让声明宽高包含内边距和边框。块级常规流、行内格式化、绝对定位和 stacking context 各有规则。',
          boundary:
            '`z-index` 只在相关层叠上下文内比较；增加极大数值不能跨越祖先上下文。',
        },
        {
          name: 'Flexbox 与 Grid',
          detail:
            'Flexbox 面向一个主轴分配空间，适合工具栏和一维组件；Grid 同时定义行列轨道，适合页面和二维卡片。`min-width:auto` 可能阻止 flex 子项收缩，可按需设 `min-width:0`。',
          boundary: '二者可组合，不存在 Grid 永远替代 Flexbox。',
        },
        {
          name: '响应式与动画',
          detail:
            '移动优先从窄布局开始，用媒体查询响应视口，用容器查询响应组件容器。相对单位、`clamp()`、Grid auto-fit 可形成流式布局。动画优先改变 transform/opacity，并尊重 `prefers-reduced-motion`。',
          boundary: '响应式不等于按设备型号列断点；断点应由内容开始失效的位置决定。',
        },
      ],
      diagram: `flowchart LR
  A["CSS规则"] --> B["匹配选择器"]
  B --> C["级联与继承"]
  C --> D["计算值"]
  D --> E["布局"]
  E --> F["绘制"]
  F --> G["合成"]`,
      code: `\`\`\`css
@layer reset, base, components, utilities;

@layer base {
  :root {
    --space: clamp(0.75rem, 2vw, 1.5rem);
    --surface: rgb(255 255 255 / 88%);
  }
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; font-family: system-ui, sans-serif; }
}

@layer components {
  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
    gap: var(--space);
  }
  .card {
    container-type: inline-size;
    padding: var(--space);
    background: var(--surface);
    backdrop-filter: blur(8px);
  }
  @container (min-width: 28rem) {
    .card__body { display: grid; grid-template-columns: 8rem 1fr; }
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto; animation-duration: 0.01ms !important; }
}
\`\`\``,
      practice: [
        '不用固定高度实现等高卡片',
        '检查一个 z-index 失效案例的层叠上下文',
        '在 320px 到宽屏连续测试布局',
      ],
      pitfalls: [
        '用 absolute 定位完成主要页面布局',
        '固定像素宽导致缩放溢出',
        '动画触发布局抖动且忽略减少动态偏好',
      ],
      sources: [
        [
          'MDN CSS Styling basics',
          'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics',
        ],
        [
          'MDN CSS layout',
          'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout',
        ],
        ['CSS Cascading Level 6', 'https://www.w3.org/TR/css-cascade-6/'],
      ],
    }),
  },
  {
    folder: '12-前端与全栈交付',
    file: '06-JavaScript基础类型函数集合DOM与事件.md',
    content: supplement({
      title: 'JavaScript 基础：类型、函数、集合、DOM 与事件',
      intro:
        'JavaScript 是动态类型、基于原型、拥有词法作用域和一等函数的语言。浏览器把它与 DOM、事件、网络和存储 API 组合成前端运行环境。',
      objectives: [
        '理解原始类型、对象、相等和类型转换',
        '掌握作用域、闭包、函数和 this',
        '掌握数组/对象不可变更新',
        '掌握 DOM 查询、事件传播和委托',
      ],
      concepts: [
        {
          name: '值、类型与相等',
          detail:
            '原始值包括 undefined、null、boolean、number、bigint、string、symbol；对象按引用比较。`===` 通常避免隐式转换，`Object.is` 对 NaN 和正负零语义不同。`null` 表示有意空值，`undefined` 常表示缺失。',
          boundary:
            '`typeof null` 历史上返回 `"object"`；数组用 `Array.isArray` 检查。',
        },
        {
          name: '作用域、闭包与 this',
          detail:
            '`let/const` 是块级词法作用域；闭包让函数保留定义位置的变量。普通函数的 `this` 由调用方式决定，箭头函数捕获外层 this 且没有自己的 arguments。',
          boundary: '闭包可能延长对象生命期；事件监听和计时器应在组件销毁时清理。',
        },
        {
          name: '数组与对象',
          detail:
            '`map/filter/reduce/find/some/every` 表达集合变换；spread 只做浅拷贝，嵌套对象仍共享引用。`Map` 支持任意键，`Set` 表达唯一集合。',
          boundary:
            '`sort()` 默认按字符串且原地修改；数字排序需比较器，保留原数组可用 `toSorted()`。',
        },
        {
          name: 'DOM 与事件',
          detail:
            'DOM 是节点树。事件先捕获到目标，再冒泡；事件委托把监听器放在稳定祖先，用 `closest` 找实际目标，适合动态列表。`preventDefault` 取消默认动作，`stopPropagation` 阻止传播。',
          boundary: '阻止默认动作不等于阻止冒泡；过度 stopPropagation 会破坏组合。',
        },
      ],
      diagram: `flowchart TD
  A["Window"] --> B["Document"]
  B --> C["祖先元素 捕获"]
  C --> D["目标元素"]
  D --> E["祖先元素 冒泡"]
  E --> F["委托处理器"]`,
      code: `\`\`\`javascript
const state = {
  orders: [
    { id: 1, status: 'PENDING' },
    { id: 2, status: 'PAID' },
  ],
}

const pending = state.orders
  .filter(order => order.status === 'PENDING')
  .map(order => ({ ...order, label: \`订单 #\${order.id}\` }))

document.querySelector('#orders').addEventListener('click', event => {
  const button = event.target.closest('button[data-order-id]')
  if (!button) return
  const id = Number(button.dataset.orderId)
  if (!Number.isSafeInteger(id)) return
  console.log('open', id)
})
\`\`\``,
      practice: [
        '用闭包实现计数器并解释变量生命周期',
        '比较浅拷贝与结构化克隆',
        '用事件委托实现可增删列表',
      ],
      pitfalls: [
        '使用 var 造成循环闭包混淆',
        '直接修改共享数组导致状态难追踪',
        '对可能不存在的 DOM 节点直接调用方法',
      ],
      sources: [
        [
          'MDN JavaScript Guide',
          'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
        ],
        [
          'MDN DOM Introduction',
          'https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction',
        ],
        [
          'MDN Event bubbling',
          'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling',
        ],
      ],
    }),
  },
  {
    folder: '12-前端与全栈交付',
    file: '07-JavaScript高级异步模块网络与性能.md',
    content: supplement({
      title: 'JavaScript 高级：异步、模块、网络与性能',
      intro:
        '高级前端的关键不是更多语法，而是正确管理并发、取消、错误、模块边界、缓存与主线程预算。浏览器事件循环保证一段 JavaScript 任务不会被另一段任务中途打断，但长任务会阻塞交互与渲染。',
      objectives: [
        '理解任务、微任务、Promise 和 async/await',
        '掌握 ES Modules 与动态导入',
        '正确使用 fetch、AbortController 与流',
        '理解渲染性能、Web Worker 和内存清理',
      ],
      concepts: [
        {
          name: '事件循环与 Promise',
          detail:
            '任务执行完后，浏览器清空微任务队列，再获得渲染机会。Promise 的 then/catch/finally 回调进入微任务。`async` 函数总返回 Promise，`await` 暂停该函数并把后续安排为微任务。',
          boundary:
            '`await` 不阻塞线程，但顺序 await 独立请求会串行；可用 Promise.all 并发并明确失败策略。',
        },
        {
          name: '模块',
          detail:
            'ES Modules 使用静态 import/export，模块默认严格模式并具有单例绑定语义。动态 `import()` 支持按需加载；循环依赖可能看到尚未初始化的绑定，应重构依赖方向。',
          boundary: '代码分割减少首包但增加网络请求和异步边界，需结合预加载与缓存。',
        },
        {
          name: 'Fetch、取消与错误',
          detail:
            'fetch 只有网络级失败才 reject，HTTP 404/500 仍返回 Response，必须检查 `ok/status`。AbortController 可取消过期请求；响应体是流且通常只能消费一次。',
          boundary: '取消客户端等待不保证服务端业务回滚；写请求仍需幂等和状态查询。',
        },
        {
          name: '性能与并行',
          detail:
            '长任务阻塞输入和渲染。先减少工作和 DOM 变更，再分块或把纯计算移入 Worker。Performance 面板、Long Tasks、Web Vitals 和内存快照用于建立证据。',
          boundary: 'Web Worker 不能直接访问 DOM，消息传递也有复制/转移成本。',
        },
      ],
      diagram: `flowchart LR
  A["执行一个任务"] --> B["清空微任务"]
  B --> C{"需要渲染?"}
  C -->|是| D["样式/布局/绘制"]
  C -->|否| E["下一个任务"]
  D --> E
  E --> A`,
      code: `\`\`\`typescript
type ApiError = { type: string; title: string; status: number; detail?: string }

async function requestJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal,
  })
  if (!response.ok) {
    const problem = (await response.json()) as ApiError
    throw new Error(\`\${problem.status}: \${problem.title}\`)
  }
  return (await response.json()) as T
}

let current: AbortController | undefined
async function search(keyword: string) {
  current?.abort()
  current = new AbortController()
  return requestJson<readonly string[]>(
    \`/api/search?q=\${encodeURIComponent(keyword)}\`,
    current.signal,
  )
}
\`\`\``,
      practice: [
        '预测任务/微任务日志顺序再运行验证',
        '同时请求两个独立接口并分别处理部分失败',
        '取消快速输入产生的旧搜索请求',
      ],
      pitfalls: [
        '认为 fetch 遇到 500 会自动抛错',
        '无 catch 的后台 Promise 产生未处理拒绝',
        '在主线程同步处理巨大 JSON/图片',
      ],
      sources: [
        [
          'MDN Asynchronous JavaScript',
          'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS',
        ],
        [
          'MDN Using Fetch',
          'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch',
        ],
        [
          'MDN JavaScript Modules',
          'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules',
        ],
      ],
    }),
  },
  {
    folder: '12-前端与全栈交付',
    file: '08-TypeScript-Vue工程化测试与性能.md',
    content: supplement({
      title: 'TypeScript、Vue 工程化、测试与性能',
      intro:
        'TypeScript 在编译期检查 JavaScript 程序，Vue 用响应式系统与组件组织界面，Vite 等工具完成开发服务器和生产构建。可靠前端还需要运行时数据校验、状态边界、路由、测试、可访问性和性能预算。',
      objectives: [
        '掌握联合类型、窄化、泛型与类型守卫',
        '掌握 Vue Composition API 与组件通信',
        '理解路由、状态、表单和请求状态',
        '建立单元、组件、E2E 与性能验证',
      ],
      concepts: [
        {
          name: 'TypeScript 类型系统',
          detail:
            '联合类型表达多个可能，判别字段帮助穷尽分支；泛型保留输入输出关系；`unknown` 迫使使用前缩小，优于 `any`；`satisfies` 检查约束同时保留具体推断。',
          boundary:
            '类型在编译后擦除，服务器 JSON、localStorage 和用户输入仍需运行时 schema 校验。',
        },
        {
          name: 'Vue 响应式',
          detail:
            '`ref/reactive` 保存源状态，`computed` 表达无副作用派生值，`watch/watchEffect` 用于副作用。组件通过 props 输入、emit 输出；slot 传递视图结构，provide/inject 适合跨层依赖。',
          boundary:
            'computed 不应发请求或修改其他状态；watch 创建的异步工作需要失效清理。',
        },
        {
          name: '应用状态与路由',
          detail:
            'URL 保存可分享的导航状态，本地组件保存短生命周期 UI 状态，Pinia 等全局 store 保存跨页面共享领域状态，服务器状态需要缓存、失效、加载和错误语义。',
          boundary: '不是所有 API 响应都应永久复制到全局 store。',
        },
        {
          name: '测试与性能',
          detail:
            'Vitest 测试纯逻辑，Vue Test Utils 测组件可观察行为，Playwright 覆盖关键用户流程。性能从 bundle、请求瀑布、渲染、长任务、图片和缓存建立预算。',
          boundary:
            '快照测试不能代替语义断言和可访问查询；E2E 数量过多会增加反馈时间与不稳定。',
        },
      ],
      diagram: `flowchart LR
  A["TypeScript源码"] --> B["Vite模块图"]
  B --> C["Vue SFC编译"]
  C --> D["开发HMR/生产Bundle"]
  E["Vitest组件测试"] --> B
  D --> F["浏览器"]
  G["Playwright"] --> F
  F --> H["性能与错误遥测"]`,
      code: `\`\`\`vue
<script setup lang="ts">
import { computed, onWatcherCleanup, ref, watch } from 'vue'

type LoadState<T> =
  | { status: 'idle' | 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string }

const query = ref('')
const state = ref<LoadState<readonly string[]>>({ status: 'idle' })
const canSearch = computed(() => query.value.trim().length >= 2)

watch(query, async value => {
  if (!canSearch.value) return
  const controller = new AbortController()
  onWatcherCleanup(() => controller.abort())
  state.value = { status: 'loading' }
  try {
    const response = await fetch(\`/api/search?q=\${encodeURIComponent(value)}\`, {
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(\`HTTP \${response.status}\`)
    state.value = { status: 'success', data: await response.json() }
  } catch (error) {
    if (!controller.signal.aborted) {
      state.value = { status: 'error', message: String(error) }
    }
  }
})
</script>
\`\`\`

\`\`\`typescript
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'
import SearchBox from './SearchBox.vue'

test('少于两个字符时不启用搜索', async () => {
  const wrapper = mount(SearchBox)
  await wrapper.get('input').setValue('a')
  expect(wrapper.get('button').attributes('disabled')).toBeDefined()
})
\`\`\``,
      practice: [
        '用判别联合覆盖加载状态',
        '测试 watch 清理旧请求',
        '设置 bundle 大小与关键页面性能预算',
      ],
      pitfalls: [
        '用类型断言隐藏真实不确定性',
        '解构 reactive 后丢失响应式连接',
        '只测组件内部实现而不测用户可见结果',
      ],
      sources: [
        [
          'TypeScript Handbook',
          'https://www.typescriptlang.org/docs/handbook/intro.html',
        ],
        ['Vue Guide', 'https://vuejs.org/guide/introduction.html'],
        ['Vue Watchers', 'https://vuejs.org/guide/essentials/watchers'],
        ['Vitest Guide', 'https://vitest.dev/guide/'],
        ['Playwright Documentation', 'https://playwright.dev/docs/intro'],
      ],
    }),
  },
]
