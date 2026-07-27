const fenced = (language, code) => `\`\`\`${language}
${code.trim()}
\`\`\``

const java = (code) => fenced('java', code)

export function codeExampleForTitle(title) {
  if (/面向对象上/.test(title)) {
    return java(
      `record Money(BigDecimal amount, Currency currency) {
  Money {
    Objects.requireNonNull(amount);
    Objects.requireNonNull(currency);
    if (amount.signum() < 0) throw new IllegalArgumentException("amount < 0");
  }
}

final class Order {
  private final List<OrderLine> lines = new ArrayList<>();
  void addLine(OrderLine line) { lines.add(Objects.requireNonNull(line)); }
  List<OrderLine> lines() { return List.copyOf(lines); }
}`,
    )
  }
  if (/面向对象下/.test(title)) {
    return java(
      `sealed interface PaymentResult permits Paid, Rejected {}
record Paid(String transactionId) implements PaymentResult {}
record Rejected(String reason) implements PaymentResult {}

static String message(PaymentResult result) {
  return switch (result) {
    case Paid paid -> "已支付：" + paid.transactionId();
    case Rejected rejected -> "已拒绝：" + rejected.reason();
  };
}`,
    )
  }
  if (/核心API/.test(title)) {
    return java(
      `Instant createdAt = Instant.now();
ZonedDateTime local = createdAt.atZone(ZoneId.of("Asia/Taipei"));
String normalized = "  Java  ".strip().toLowerCase(Locale.ROOT);
BigDecimal total = new BigDecimal("19.90")
    .multiply(BigDecimal.valueOf(3))
    .setScale(2, RoundingMode.HALF_UP);`,
    )
  }
  if (/集合框架/.test(title)) {
    return java(
      `Map<String, Long> counts = orders.stream()
    .collect(Collectors.groupingBy(
        Order::status,
        LinkedHashMap::new,
        Collectors.counting()));

List<Order> newest = orders.stream()
    .sorted(Comparator.comparing(Order::createdAt).reversed())
    .limit(20)
    .toList();`,
    )
  }
  if (/并发与多线程/.test(title)) {
    return java(
      `try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
  List<Future<String>> futures = endpoints.stream()
      .map(uri -> executor.submit(() -> client.fetch(uri)))
      .toList();
  for (Future<String> future : futures) {
    System.out.println(future.get(2, TimeUnit.SECONDS));
  }
}`,
    )
  }
  if (/网络编程/.test(title)) {
    return java(
      `HttpClient client = HttpClient.newBuilder()
    .connectTimeout(Duration.ofSeconds(2))
    .build();
HttpRequest request = HttpRequest.newBuilder(URI.create("https://example.test/health"))
    .timeout(Duration.ofSeconds(3))
    .header("Accept", "application/json")
    .GET()
    .build();
HttpResponse<String> response =
    client.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));`,
    )
  }
  if (/Maven|Gradle/.test(title)) {
    return fenced(
      'xml',
      `<properties>
  <maven.compiler.release>25</maven.compiler.release>
  <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
</properties>
<dependencies>
  <dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
    <version>6.0.2</version>
    <scope>test</scope>
  </dependency>
</dependencies>`,
    )
  }
  if (/Git/.test(title)) {
    return fenced(
      'bash',
      `git switch -c feature/order-query
git add src test
git commit -m "feat: add cursor based order query"
git fetch origin
git rebase origin/main
git push --set-upstream origin feature/order-query`,
    )
  }
  if (/Linux|Docker/.test(title)) {
    return fenced(
      'bash',
      `set -euo pipefail
readonly APP_JAR="\${1:-app.jar}"
test -f "$APP_JAR"
exec java -XX:MaxRAMPercentage=75 -jar "$APP_JAR"`,
    )
  }
  if (/SQL|数据库原理/.test(title)) {
    return fenced(
      'sql',
      `CREATE TABLE orders (
  id BIGINT PRIMARY KEY,
  customer_id BIGINT NOT NULL,
  status VARCHAR(24) NOT NULL,
  created_at TIMESTAMP NOT NULL
);
CREATE INDEX idx_orders_customer_created
  ON orders(customer_id, created_at DESC, id DESC);

SELECT id, status, created_at
FROM orders
WHERE customer_id = ? AND (created_at, id) < (?, ?)
ORDER BY created_at DESC, id DESC
FETCH FIRST 20 ROWS ONLY;`,
    )
  }
  if (/MySQL|InnoDB/.test(title)) {
    return fenced(
      'sql',
      `START TRANSACTION;
SELECT stock
FROM inventory
WHERE sku_id = 42
FOR UPDATE;

UPDATE inventory
SET stock = stock - 1
WHERE sku_id = 42 AND stock > 0;
COMMIT;`,
    )
  }
  if (/PostgreSQL|MongoDB/.test(title)) {
    return fenced(
      'sql',
      `EXPLAIN (ANALYZE, BUFFERS)
SELECT tenant_id, status, count(*)
FROM orders
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY tenant_id, status;`,
    )
  }
  if (/Redis|缓存工程|Caffeine|多级缓存/.test(title)) {
    return java(
      `String key = "product:" + productId;
Product cached = redisTemplate.opsForValue().get(key);
if (cached != null) return cached;

Product loaded = repository.findById(productId)
    .orElseThrow(NotFoundException::new);
redisTemplate.opsForValue().set(
    key, loaded, Duration.ofMinutes(5).plusSeconds(ThreadLocalRandom.current().nextInt(30))
);
return loaded;`,
    )
  }
  if (/Elasticsearch/.test(title)) {
    return fenced(
      'json',
      `POST /products/_search
{
  "query": {
    "bool": {
      "must": [{"match": {"name": "机械键盘"}}],
      "filter": [{"term": {"available": true}}]
    }
  },
  "sort": [{"score": "desc"}, {"_id": "asc"}]
}`,
    )
  }
  if (/IoC|依赖注入|Bean/.test(title)) {
    return java(
      `@Service
final class CheckoutService {
  private final OrderRepository orders;
  private final PaymentPort payments;

  CheckoutService(OrderRepository orders, PaymentPort payments) {
    this.orders = orders;
    this.payments = payments;
  }
}`,
    )
  }
  if (/AOP|代理|事务/.test(title)) {
    return java(
      `@Service
class TransferService {
  @Transactional
  public void transfer(long from, long to, BigDecimal amount) {
    accounts.debit(from, amount);
    accounts.credit(to, amount);
  }
}

// 事务方法应从代理外部调用；同类自调用不会经过代理拦截。`,
    )
  }
  if (/资源|事件|校验|调度/.test(title)) {
    return java(
      `record OrderCreated(long orderId) {}

@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
public void on(OrderCreated event) {
  notificationQueue.enqueue(event.orderId());
}

@Scheduled(cron = "0 */5 * * * *", zone = "Asia/Taipei")
void reconcilePendingOrders() { /* 幂等扫描 */ }`,
    )
  }
  if (/自动配置|启动/.test(title)) {
    return java(
      `@AutoConfiguration
@ConditionalOnClass(HttpClient.class)
@EnableConfigurationProperties(ClientProperties.class)
class ClientAutoConfiguration {
  @Bean
  @ConditionalOnMissingBean
  HttpClient client(ClientProperties p) {
    return HttpClient.newBuilder().connectTimeout(p.timeout()).build();
  }
}`,
    )
  }
  if (/Servlet|Tomcat|MVC/.test(title)) {
    return java(
      `@RestController
@RequestMapping("/api/orders")
final class OrderController {
  @GetMapping("/{id}")
  OrderView find(@PathVariable long id) {
    return service.find(id);
  }
}`,
    )
  }
  if (/REST|API校验|版本/.test(title)) {
    return java(
      `record CreateOrderRequest(
    @NotBlank String customerCode,
    @NotEmpty List<@Valid OrderLineRequest> lines) {}

@PostMapping
ResponseEntity<OrderView> create(
    @RequestHeader("Idempotency-Key") String key,
    @Valid @RequestBody CreateOrderRequest request) {
  OrderView created = service.create(key, request);
  return ResponseEntity.created(URI.create("/api/orders/" + created.id())).body(created);
}`,
    )
  }
  if (/Actuator|日志|指标|追踪/.test(title)) {
    return fenced(
      'yaml',
      `management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus
  endpoint:
    health:
      probes:
        enabled: true
  tracing:
    sampling:
      probability: 0.1`,
    )
  }
  if (/MyBatis-Plus/.test(title)) {
    return java(
      `LambdaQueryWrapper<UserEntity> query = Wrappers.lambdaQuery();
query.eq(UserEntity::getTenantId, tenantId)
     .likeRight(UserEntity::getName, keyword)
     .orderByDesc(UserEntity::getId)
     .last("LIMIT 20");
List<UserEntity> users = userMapper.selectList(query);`,
    )
  }
  if (/MyBatis/.test(title)) {
    return fenced(
      'xml',
      `<select id="findPage" resultType="OrderRow">
  SELECT id, customer_id, status, created_at
  FROM orders
  WHERE tenant_id = #{tenantId}
  <if test="status != null">AND status = #{status}</if>
  ORDER BY created_at DESC, id DESC
  LIMIT #{limit}
</select>`,
    )
  }
  if (/JPA|Hibernate|Spring-Data/.test(title)) {
    return java(
      `@Entity
class PurchaseOrder {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Version
  private long version;

  @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
  private final List<OrderLine> lines = new ArrayList<>();
}`,
    )
  }
  if (/连接池|迁移|数据访问决策/.test(title)) {
    return fenced(
      'sql',
      `-- V3__add_order_version.sql
ALTER TABLE orders ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
CREATE INDEX idx_orders_status_created
  ON orders(status, created_at DESC);`,
    )
  }
  if (/CAP|BASE|共识/.test(title)) {
    return java(
      `record VersionedValue(String value, long version) {}

VersionedValue update(VersionedValue current, String next, long expectedVersion) {
  if (current.version() != expectedVersion) throw new ConflictException();
  return new VersionedValue(next, current.version() + 1);
}`,
    )
  }
  if (/RPC|OpenFeign|Dubbo|gRPC|Netty/.test(title)) {
    return fenced(
      'proto',
      `syntax = "proto3";
service InventoryService {
  rpc Reserve(ReserveRequest) returns (ReserveReply);
}
message ReserveRequest {
  string request_id = 1;
  int64 sku_id = 2;
  int32 quantity = 3;
}
message ReserveReply { bool accepted = 1; }`,
    )
  }
  if (/Nacos/.test(title)) {
    return fenced(
      'yaml',
      `spring:
  application:
    name: order-service
  cloud:
    nacos:
      discovery:
        server-addr: \${NACOS_ADDR}
        namespace: \${NACOS_NAMESPACE}
      config:
        import-check:
          enabled: true`,
    )
  }
  if (/网关|限流|熔断|重试|Sentinel/.test(title)) {
    return java(
      `Retry retry = Retry.of("inventory",
    RetryConfig.custom()
      .maxAttempts(3)
      .waitDuration(Duration.ofMillis(100))
      .retryExceptions(IOException.class)
      .build());

Supplier<Reservation> call = Retry.decorateSupplier(retry, inventory::reserve);
return call.get(); // 只重试具备幂等键的操作`,
    )
  }
  if (/分布式ID|可靠事件|Seata/.test(title)) {
    return fenced(
      'sql',
      `BEGIN;
INSERT INTO orders(id, status) VALUES (?, 'CREATED');
INSERT INTO outbox(id, aggregate_id, event_type, payload, published)
VALUES (?, ?, 'OrderCreated', ?, FALSE);
COMMIT;

-- 独立发布器带锁读取 outbox，发送成功后标记 published。`,
    )
  }
  if (/JVM诊断|JVM内存|类加载|字节码|GC/.test(title)) {
    return fenced(
      'bash',
      `jcmd <pid> VM.version
jcmd <pid> GC.heap_info
jcmd <pid> Thread.print
jcmd <pid> JFR.start name=incident duration=120s filename=incident.jfr`,
    )
  }
  if (/消息队列基础|可靠消费/.test(title)) {
    return java(
      `@Transactional
public void consume(OrderCreated event) {
  if (processedEventRepository.existsById(event.eventId())) return;
  projection.apply(event);
  processedEventRepository.save(new ProcessedEvent(event.eventId()));
}
// 业务写入与去重记录处于同一数据库事务。`,
    )
  }
  if (/Kafka/.test(title)) {
    return fenced(
      'properties',
      `enable.idempotence=true
acks=all
max.in.flight.requests.per.connection=5
key.serializer=org.apache.kafka.common.serialization.StringSerializer
value.serializer=org.apache.kafka.common.serialization.ByteArraySerializer`,
    )
  }
  if (/RabbitMQ|RocketMQ/.test(title)) {
    return java(
      `rabbitTemplate.convertAndSend("orders.exchange", "orders.created", event,
    message -> {
      message.getMessageProperties().setMessageId(event.eventId().toString());
      message.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
      return message;
    });`,
    )
  }
  if (/缓存CDN|分库分表|热点/.test(title)) {
    return fenced(
      'http',
      `GET /assets/app.3f82a1.js HTTP/1.1
Host: static.example.com

HTTP/1.1 200 OK
Cache-Control: public, max-age=31536000, immutable
ETag: "3f82a1"`,
    )
  }
  if (/Security过滤链|方法授权/.test(title)) {
    return java(
      `@Bean
SecurityFilterChain api(HttpSecurity http) throws Exception {
  return http
      .csrf(csrf -> csrf.ignoringRequestMatchers("/api/**"))
      .authorizeHttpRequests(auth -> auth
          .requestMatchers("/actuator/health").permitAll()
          .requestMatchers(HttpMethod.DELETE, "/api/**").hasRole("ADMIN")
          .anyRequest().authenticated())
      .build();
}`,
    )
  }
  if (/OAuth2|OIDC|JWT|API安全/.test(title)) {
    return fenced(
      'json',
      `{
  "iss": "https://id.example.com",
  "sub": "user-42",
  "aud": ["order-api"],
  "exp": 1785000000,
  "scope": "orders:read orders:write"
}`,
    )
  }
  if (/应用安全|秘密|供应链|审计/.test(title)) {
    return fenced(
      'yaml',
      `permissions:
  contents: read
jobs:
  build:
    steps:
      - uses: actions/checkout@v5
      - run: ./mvnw -B verify
      - run: syft . -o cyclonedx-json=sbom.json
      - run: cosign attest --predicate sbom.json "$IMAGE"`,
    )
  }
  if (/测试策略|JUnit|Mockito/.test(title)) {
    return java(
      `@Test
void rejectsTransferWhenBalanceIsInsufficient() {
  Account account = new Account("A", new BigDecimal("10.00"));

  assertThrows(InsufficientBalanceException.class,
      () -> account.debit(new BigDecimal("10.01")));
  assertEquals(new BigDecimal("10.00"), account.balance());
}`,
    )
  }
  if (/Testcontainers|契约测试|Spring集成/.test(title)) {
    return java(
      `@Testcontainers
@SpringBootTest
class OrderRepositoryIT {
  @Container
  static PostgreSQLContainer<?> postgres =
      new PostgreSQLContainer<>("postgres:18-alpine");

  @DynamicPropertySource
  static void database(DynamicPropertyRegistry r) {
    r.add("spring.datasource.url", postgres::getJdbcUrl);
  }
}`,
    )
  }
  if (/API-UI|自动化|测试平台/.test(title)) {
    return fenced(
      'typescript',
      `import { test, expect } from '@playwright/test'

test('管理员可创建订单', async ({ page }) => {
  await page.goto('/orders/new')
  await page.getByLabel('客户编号').fill('C-001')
  await page.getByRole('button', { name: '创建' }).click()
  await expect(page.getByText('创建成功')).toBeVisible()
})`,
    )
  }
  if (/性能稳定性|故障演练/.test(title)) {
    return fenced(
      'javascript',
      `import http from 'k6/http'
import { check } from 'k6'

export const options = { thresholds: { http_req_duration: ['p(95)<300'] } }
export default function () {
  const response = http.get(__ENV.BASE_URL + '/api/products/42')
  check(response, { 'status is 200': r => r.status === 200 })
}`,
    )
  }
  if (/Docker镜像|Compose|供应链/.test(title)) {
    return fenced(
      'dockerfile',
      `FROM eclipse-temurin:25-jre-alpine
RUN addgroup -S app && adduser -S -G app app
WORKDIR /app
COPY --chown=app:app target/app.jar app.jar
USER app
ENTRYPOINT ["java","-XX:MaxRAMPercentage=75","-jar","app.jar"]`,
    )
  }
  if (/Kubernetes/.test(title)) {
    return fenced(
      'yaml',
      `readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8080
  initialDelaySeconds: 10
livenessProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 8080
  failureThreshold: 3`,
    )
  }
  if (/CICD|发布|回滚/.test(title)) {
    return fenced(
      'yaml',
      `- name: Verify
  run: ./mvnw -B verify
- name: Build image
  run: docker build --tag "$IMAGE:$GIT_SHA" .
- name: Deploy immutable image
  run: helm upgrade --install app chart --set image.tag="$GIT_SHA" --atomic`,
    )
  }
  if (/OpenTelemetry|SLO|故障响应/.test(title)) {
    return fenced(
      'yaml',
      `receivers:
  otlp:
    protocols: { grpc: {}, http: {} }
processors:
  batch: {}
exporters:
  otlphttp:
    endpoint: \${OBSERVABILITY_ENDPOINT}
service:
  pipelines:
    traces: { receivers: [otlp], processors: [batch], exporters: [otlphttp] }`,
    )
  }
  if (/Web-|HTML|CSS|JavaScript|TypeScript/.test(title)) {
    return fenced(
      'html',
      `<form id="search">
  <label for="keyword">关键字</label>
  <input id="keyword" name="keyword" required minlength="2">
  <button type="submit">搜索</button>
</form>
<script type="module">
  const form = document.querySelector('#search')
  form.addEventListener('submit', event => {
    event.preventDefault()
    const data = new FormData(form)
    console.log(data.get('keyword'))
  })
</script>`,
    )
  }
  if (/Vue3|后台管理/.test(title)) {
    return fenced(
      'vue',
      `<script setup lang="ts">
import { computed, ref } from 'vue'
const query = ref('')
const props = defineProps<{ rows: readonly string[] }>()
const visible = computed(() =>
  props.rows.filter(row => row.toLowerCase().includes(query.value.toLowerCase())),
)
</script>

<template>
  <input v-model.trim="query" aria-label="筛选">
  <ul><li v-for="row in visible" :key="row">{{ row }}</li></ul>
</template>`,
    )
  }
  if (/全栈契约|上传下载|WebSocket|Nginx/.test(title)) {
    return fenced(
      'nginx',
      `location /api/ {
  proxy_pass http://backend;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-Proto $scheme;
}
location /ws/ {
  proxy_pass http://backend;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
}`,
    )
  }
  if (/项目/.test(title)) {
    return fenced(
      'java',
      `public sealed interface Command permits CreateOrder {}
public record CreateOrder(UUID requestId, long customerId) implements Command {}

public interface CommandHandler<C extends Command, R> {
  R handle(C command);
}`,
    )
  }
  return java(
    `public final class Example {
  private Example() {}

  public static <T> List<T> immutableCopy(Collection<? extends T> source) {
    Objects.requireNonNull(source, "source");
    return List.copyOf(source);
  }
}`,
  )
}
