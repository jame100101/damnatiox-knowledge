# Java 核心 API：字符串、系统、数学、时间、包装类与正则表达式

> 课件来源：《第6章 Java API.pptx》。本文逐项覆盖课件目录，并依据 Java SE 26、JDK 25 LTS 及相关官方文档补充现代工程实践。

本章逐项覆盖 String/StringBuffer、System/Runtime、Math/Random、BigInteger/BigDecimal、日期时间、格式化、包装类和正则表达式，并明确旧 API 与现代 API 的选择。

## 1. 学习目标

- 理解字符串不可变性、池化与构建策略。
- 正确处理精确数值、随机数、日期时间与时区。
- 掌握包装类、装箱拆箱和正则 API。
- 识别 `finalize`、Date/Calendar/SimpleDateFormat 等旧用法风险。

## 2. 知识结构

```mermaid
flowchart LR
  A["外部文本/数值/时间"] --> B["显式解析"]
  B --> C["强类型值对象"]
  C --> D["业务运算"]
  D --> E["显式格式化"]
  E --> F["日志/API/UI"]
```

## 3. 逐项详解

### 1. String 不可变性与字符串池

String 对象内容创建后不变，便于共享、缓存 hash 和安全使用。字符串字面量通常驻留池中，`new String(...)` 会创建额外对象；内容比较使用 equals。

**工程理解：** API 参数和返回值优先 String；敏感口令若需要擦除可考虑受控 char[]，但仍需完整威胁模型。

**常见误区：** 用 `==` 比较内容，或在热循环中反复拼接产生大量临时对象。

### 2. StringBuilder 与 StringBuffer

StringBuilder 为可变字符序列、非线程安全；StringBuffer 方法同步、开销更高。编译器会优化简单单表达式拼接，但循环或复杂构建应显式使用 builder。

**工程理解：** builder 通常局部使用，无需同步；跨线程共享可变字符串本身通常是设计问题。

**常见误区：** 因为“线程安全”默认选择 StringBuffer，或错误共享同一个 StringBuilder。

### 3. System 与 Runtime

System 提供标准流、系统属性、环境访问、数组复制和时间源；Runtime 表示当前 JVM 与宿主环境交互，可注册 shutdown hook。`currentTimeMillis` 是墙上时间，测耗时优先 `nanoTime`。

**工程理解：** 启动子进程优先 ProcessBuilder；系统退出和 shutdown hook 要考虑并发、超时和幂等。

**常见误区：** 用 Runtime.exec 拼接用户输入，或认为 shutdown hook 一定完成。

### 4. Math、Random 与安全随机

Math 提供纯数学函数和精确整数运算。`Random`/`ThreadLocalRandom` 适合普通模拟，`SplittableRandom` 适合可拆分并行算法；密码学令牌使用 SecureRandom。

**工程理解：** 测试中注入确定种子，生产安全标识使用足够熵的 SecureRandom。

**常见误区：** 用 `Math.random()` 生成验证码、重置令牌或会话密钥。

### 5. BigInteger 与 BigDecimal

BigInteger 支持任意精度整数；BigDecimal 支持任意精度十进制并保留 scale。字符串构造最可预测，除法等非终止结果必须指定舍入模式。

**工程理解：** 金额统一货币、scale 和 rounding policy；比较数值常用 compareTo，equals 同时比较 scale。

**常见误区：** 使用 `new BigDecimal(0.1)` 引入二进制浮点误差，或忽略除法舍入。

### 6. 旧 Date/Calendar 与现代 java.time

Date 表示时间线瞬时但旧 API 设计有限；Calendar 可变且月份等规则易错。现代代码使用 Instant、LocalDate、LocalTime、LocalDateTime、ZonedDateTime、OffsetDateTime 和 ZoneId。

**工程理解：** 数据库/事件存绝对时间用 Instant，业务“某地某天某时”保留时区语义；跨边界明确 UTC 和格式。

**常见误区：** 把 LocalDateTime 当作全球唯一时间点，或用系统默认时区解析外部数据。

### 7. Duration、Period 与时间运算

Duration 表示基于秒/纳秒的时间量，适合耗时；Period 表示年月日，适合日历周期。夏令时切换使“一天”等于 24 小时的假设在 ZonedDateTime 上并不总成立。

**工程理解：** 超时用 Duration，账期用 Period；测试注入 Clock 以控制当前时间。

**常见误区：** 用毫秒 long 传播所有时间语义，导致单位和日历规则混乱。

### 8. DateTimeFormatter 与数字格式化

DateTimeFormatter 不可变且线程安全；SimpleDateFormat 可变且非线程安全。NumberFormat 用于本地化显示，机器接口应使用明确、稳定格式。

**工程理解：** ISO-8601 用于跨系统时间文本；用户界面格式随 Locale；解析采用严格 ResolverStyle。

**常见误区：** 把一个 SimpleDateFormat 放进 static 字段供多线程共享。

### 9. 包装类与自动装箱

Integer 等包装类让基本值进入泛型和集合。装箱可能分配对象，拆箱 null 会抛 NPE；部分小整数缓存使 `==` 表现不一致。

**工程理解：** 计算密集路径使用基本类型；可空语义显式处理；包装类型内容比较用 equals。

**常见误区：** 依赖 Integer 缓存范围用 `==` 比较，或忽略拆箱 null。

### 10. 正则 Pattern 与 Matcher

Pattern 是编译后的正则，可复用；Matcher 保存一次匹配状态。`matches` 匹配整个输入，`find` 查找子串。复杂回溯表达式可能导致灾难性性能。

**工程理解：** 固定表达式预编译；对不受信输入限制长度和复杂度；结构化协议优先专用解析器。

**常见误区：** 用正则解析完整 HTML/JSON，或在循环中重复编译同一表达式。



## 4. 现代 Java 校准

- 日期时间首选 `java.time`；Date/Calendar/SimpleDateFormat 仅用于遗留接口适配。
- `System.runFinalizersOnExit` 与对象 `finalize` 路线已经退出现代实践。
- JDK 17 起增强的随机数生成器 API 可按算法需求选择，安全用途仍用 SecureRandom。
- 格式化与解析必须明确 Locale、ZoneId、Charset 和舍入模式。

## 5. 实践任务

1. 实现跨时区会议时间转换，覆盖夏令时边界。
2. 实现 Money 值对象，统一 BigDecimal scale、舍入和货币。
3. 基准比较循环字符串 `+` 与 StringBuilder，并用 JFR 观察分配。

## 6. 掌握检查

- [ ] 能说明 String 不可变与 StringBuilder 的使用边界。
- [ ] 能选择正确随机数 API。
- [ ] 能区分 Instant、LocalDateTime 与 ZonedDateTime。
- [ ] 能指出包装类拆箱和正则回溯风险。

## 参考资料

- [Java SE 26 API](https://docs.oracle.com/en/java/javase/26/docs/api/)
- [Java SE 26 Core Libraries Guide](https://docs.oracle.com/en/java/javase/26/core/java-core-libraries1.html)
- [Date-Time API](https://docs.oracle.com/en/java/javase/26/docs/api/java.base/java/time/package-summary.html)
- [Random Generator API](https://docs.oracle.com/en/java/javase/26/docs/api/java.base/java/util/random/package-summary.html)
