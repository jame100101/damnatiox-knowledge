# 映射类型、条件类型、模板字面量类型与 infer

高级类型适合表达库 API 中可机械推导的关系。先写清业务真相，再用类型计算消除重复；不要为了“炫技”把简单契约变成递归谜题。

## 1. 映射类型

```typescript
type Flags<T> = {
  [K in keyof T]: boolean
}

type Mutable<T> = {
  -readonly [K in keyof T]-?: T[K]
}
```

映射类型遍历属性键，可用 `readonly`、`?` 及 `-` 增减修饰符。

### 键重映射

```typescript
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
}

type Model = { name: string; age: number }
type ModelGetters = Getters<Model>
// { getName(): string; getAge(): number }
```

## 2. 条件类型

```typescript
type ElementOf<T> = T extends readonly (infer Item)[] ? Item : T

type A = ElementOf<string[]> // string
type B = ElementOf<number>   // number
```

条件类型判断的是类型可赋值关系，不是运行时 `if`。

## 3. `infer` 提取结构

```typescript
type AsyncResult<T> = T extends (...args: never[]) => Promise<infer R>
  ? R
  : never

type Head<T> = T extends readonly [infer First, ...unknown[]]
  ? First
  : never
```

`infer` 只能出现在条件类型的 `extends` 模式中，用来给待提取部分命名。

## 4. 分布式条件类型

```typescript
type ToArray<T> = T extends unknown ? T[] : never
type Distributed = ToArray<string | number> // string[] | number[]

type ToSingleArray<T> = [T] extends [unknown] ? T[] : never
type NotDistributed = ToSingleArray<string | number> // (string | number)[]
```

当被检查位置是裸类型参数时，条件类型会对联合逐项分布；用元组包裹两侧可关闭分布。

## 5. 模板字面量类型

```typescript
type Entity = "user" | "order"
type Action = "created" | "deleted"
type DomainEvent = `${Entity}:${Action}`

const event: DomainEvent = "user:created"
```

它适合路由、事件名、CSS 尺寸和对象派生 API。超大联合会造成类型爆炸，官方建议对非常大的字符串集合使用预生成代码。

## 6. 类型安全事件总线

```typescript
type Events = {
  "user:created": { id: string }
  "order:paid": { orderId: string; amount: number }
}

class EventBus<TEvents extends Record<string, unknown>> {
  private readonly handlers = new Map<keyof TEvents, Set<(value: unknown) => void>>()

  on<K extends keyof TEvents>(key: K, handler: (event: TEvents[K]) => void): () => void {
    const set = this.handlers.get(key) ?? new Set()
    set.add(handler as (value: unknown) => void)
    this.handlers.set(key, set)
    return () => set.delete(handler as (value: unknown) => void)
  }

  emit<K extends keyof TEvents>(key: K, event: TEvents[K]): void {
    this.handlers.get(key)?.forEach((handler) => handler(event))
  }
}
```

实现内部因异构集合需要受控断言，公共 API 仍保证事件名与负载关联。真实系统还需处理异常隔离、异步顺序和退订生命周期。

## 7. 递归类型的性能与终止

```typescript
type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[]
```

递归类型应有明确基本分支。深层条件、巨大联合和互相递归会拖慢编辑器甚至触及实例化深度限制。先测量类型检查耗时，再决定是否简化或代码生成。

## 8. 类型级测试

```typescript
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2) ? true : false

type Expect<T extends true> = T
type Case = Expect<Equal<ElementOf<readonly string[]>, string>>
```

库项目可使用专门的类型测试工具，但核心是把预期兼容与预期错误都纳入 CI。

参考：[Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)、[Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)、[Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)。

