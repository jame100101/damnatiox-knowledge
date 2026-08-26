# TypeScript 与 Java：结构类型、JVM 与泛型擦除的差异

二者都提供类、接口、泛型和静态检查，因此最容易被错误类比。关键区别是：TypeScript 描述 JavaScript 值的结构；Java 的类/接口身份、JVM 字节码与运行时模型更强地参与程序语义。

## 1. 类型关系：结构式 vs 名义式

```typescript
interface Named {
  name: string
}

class Robot {
  constructor(public name: string) {}
}

const named: Named = new Robot("R2") // 不需显式 implements
```

```java
interface Named { String name(); }

record Robot(String name) implements Named {}
```

Java 需要声明实现关系；TypeScript 主要比较成员形状。TS 类若含 private/protected 成员会出现来源约束，但整体仍不是 Java 式名义系统。

## 2. 数值与基础类型

| TypeScript | Java |
| --- | --- |
| `number` 通常对应 JS 双精度数 | `byte/short/int/long/float/double/char` 有不同宽度 |
| `bigint` 是 JS 任意精度整数原始类型 | `BigInteger` 是标准库类，`long` 固定 64 位 |
| `boolean` | `boolean` |
| `string` 为 JS primitive 类型视图 | `String` 是不可变引用类 |

TS 中金额不能因写成 `number` 就得到十进制定点保证；Java `double` 同样不适合精确货币，通常使用 `BigDecimal` 或整数最小单位。

## 3. 泛型都“擦除”，但不可简单等同

Java 编译器通常把类型参数擦除为边界/`Object`，插入转换并可能生成 bridge method。TypeScript 则把泛型类型语法从 JavaScript 输出中移除。

```typescript
function first<T>(values: readonly T[]): T | undefined {
  return values[0]
}
```

```java
static <T> Optional<T> first(List<T> values) {
  return values.isEmpty() ? Optional.empty() : Optional.of(values.getFirst());
}
```

差异：

- Java 基本类型不能直接作为泛型参数，需要装箱类型；TS `number` 本来就是 JS 值类型分类。
- Java 泛型有通配符和 PECS；TS 更多依赖结构兼容、联合、条件/映射类型和函数变型。
- Java 擦除后仍在 JVM 名义类体系中；TS 输出进入动态 JS 对象世界。

## 4. 空值与异常

- TypeScript 严格模式用 `T | null | undefined` 明确缺失，但可被断言/`any` 绕过。
- Java 引用通常可为 `null`，语言本身未把所有引用默认建模为非空；注解和静态分析工具可增强。
- Java 有受检异常与未受检异常的区分；TypeScript 函数签名不列出 `throws`，任何 JS 值都可被抛出。

## 5. 类、接口和数据模型

Java 的 record、sealed class/interface 与模式匹配提供名义封闭层级。TypeScript 常用可辨识联合模拟代数数据类型：

```typescript
type Payment =
  | { kind: "card"; last4: string }
  | { kind: "wallet"; provider: "apple" | "google" }
```

两者都能穷尽检查，但封闭机制、反射和运行时表示不同。

## 6. 并发与异步

- TypeScript 在浏览器/Node 常以事件循环、Promise 和异步 I/O 为主；CPU 密集任务需 Worker/子进程等。
- Java 直接拥有线程、锁、原子类、并发集合、虚拟线程和 JVM 内存模型。
- `async/await` 不是 Java 线程的同义词；一个 Promise 也不代表独占线程。

## 7. TypeScript 有而 Java 通常没有的部分

- 基于对象形状的自动兼容。
- 联合/交叉类型作为日常一等类型组合。
- 映射类型、模板字面量类型、`keyof` 与广泛的类型级属性变换。
- 与 JavaScript 原型、动态对象、npm/浏览器生态无缝互操作。

## 8. Java 有而 TypeScript 没有的部分

- JVM 字节码验证、类加载器和成熟的 JVM 运行时工具体系。
- 原生语言级多线程内存模型和同步原语。
- 受检异常、方法重载的独立运行时/字节码签名语义（TS 重载只是一组静态调用签名）。
- 固定位宽整数原始类型、真正的 nominal 类/接口关系。
- 注解与反射生态的运行时可见模型；TS 装饰器/元数据不能直接等同。

参考：[Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)、[Java Generics Type Erasure](https://docs.oracle.com/javase/tutorial/java/generics/erasure.html)、[Java Language Specification](https://docs.oracle.com/javase/specs/)。

