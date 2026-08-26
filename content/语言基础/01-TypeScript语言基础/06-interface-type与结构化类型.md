# interface、type 与结构化类型系统

`interface` 与 `type` 有大面积重叠，但它们并非互为任意替代。选择标准应来自语义与扩展方式，而不是团队口号。

## 1. 两种命名对象类型方式

```typescript
interface User {
  id: string
  name: string
}

type UserRecord = {
  id: string
  name: string
}
```

两者都能扩展对象：

```typescript
interface Admin extends User {
  permissions: readonly string[]
}

type AuditedAdmin = Admin & {
  createdAt: Date
}
```

## 2. `type` 能表达的非对象组合

```typescript
type Identifier = string | number
type Pair = readonly [string, number]
type Loader = (url: URL) => Promise<Uint8Array>
type EventName = `user:${"created" | "deleted"}`
```

类型别名能直接命名联合、交叉、元组、函数、原始类型和类型级计算结果。

## 3. `interface` 的声明合并

```typescript
interface PluginRegistry {
  logger: { log(message: string): void }
}

interface PluginRegistry {
  metrics: { increment(name: string): void }
}
```

同名接口会合并。这对库的模块增强很有用，对应用领域模型却可能让定义被意外扩展。需要封闭语义时使用 `type`；明确希望消费者扩展的公共对象契约可用 `interface`。

## 4. 结构化兼容

```typescript
interface Named {
  name: string
}

class FileEntry {
  constructor(public name: string, public size: number) {}
}

const named: Named = new FileEntry("notes.md", 128)
```

`FileEntry` 没有显式 `implements Named` 也能赋值，因为成员结构满足要求。这贴合 JavaScript 的对象组合方式，与 Java 的名义接口实现不同。

### 私有与受保护成员的例外

类实例类型含 `private`/`protected` 成员时，兼容对象必须包含来自同一声明来源的成员。因此不同继承体系中“看起来一样”的类也可能不兼容。

## 5. 品牌类型：在结构系统中模拟名义约束

```typescript
declare const userIdBrand: unique symbol
declare const orderIdBrand: unique symbol

type UserId = string & { readonly [userIdBrand]: "UserId" }
type OrderId = string & { readonly [orderIdBrand]: "OrderId" }

function parseUserId(value: string): UserId {
  if (!/^usr_[a-z0-9]+$/.test(value)) throw new Error("Invalid UserId")
  return value as UserId
}
```

品牌本身在运行时被擦除，因此只能在经过验证的构造函数中断言，不能让调用方随意 `as UserId`。

## 6. `implements` 的真实含义

```typescript
interface Clock {
  now(): Date
}

class SystemClock implements Clock {
  now(): Date {
    return new Date()
  }
}
```

`implements` 只检查类实例满足接口，不改变方法体的推断、不复制默认实现，也不会创建运行时接口对象。

## 7. 交叉类型不是类多继承

```typescript
type Timestamped = { createdAt: Date }
type Owned = { ownerId: string }
type Asset = Timestamped & Owned
```

交叉类型要求一个值同时满足所有成员。属性同名但不兼容时可能得到 `never`，它不会自动解决实现冲突、构造顺序或基类状态，因此不能类比 C++ 多继承。

## 8. 选择规则

| 需求 | 建议 |
| --- | --- |
| 可被第三方声明增强的对象 API | `interface` |
| 联合、元组、函数或类型计算 | `type` |
| 封闭领域模型 | 通常 `type` |
| 类契约 | 两者均可，`interface` 常更直观 |
| 同名属性冲突 | 不要依赖合并“解决”，重新建模 |

参考：[Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html)、[Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)、[Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)。

