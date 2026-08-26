# 函数签名、重载、this、回调与可调用对象

函数类型是 TypeScript API 设计的核心。好的签名表达输入输出关系，避免靠宽泛联合与断言把责任推给实现者。

## 1. 参数、返回值与上下文类型

```typescript
function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0)
}

const doubled = [1, 2, 3].map((value) => value * 2)
// value 从 map 的上下文推断为 number
```

公共函数建议显式写返回类型，以稳定 API 并及时发现实现漂移；短小局部函数可依赖推断。

## 2. 可选参数、默认参数和剩余参数

```typescript
function connect(
  host: string,
  port = 443,
  ...protocols: readonly string[]
): URL {
  const protocol = protocols[0] ?? "https"
  return new URL(`${protocol}://${host}:${port}`)
}
```

可选参数在函数体中是 `T | undefined`。不要把“调用方可省略”误写成仅允许显式 `undefined`。

## 3. 类型别名、调用签名与构造签名

```typescript
type Predicate<T> = (value: T, index: number) => boolean

interface Counter {
  (step?: number): number
  reset(): void
  readonly value: number
}

interface Constructor<T> {
  new (...args: never[]): T
}
```

可调用对象在 JavaScript 中是带属性的函数，接口可以同时描述调用签名和成员。

## 4. 重载的正确使用

```typescript
function parse(value: string): URL
function parse(value: URL): URL
function parse(value: string | URL): URL {
  return typeof value === "string" ? new URL(value) : value
}
```

调用方只能看到重载签名，看不到实现签名。若不同输入只是同一返回类型，联合参数通常更简单：

```typescript
function normalize(value: string | readonly string[]): string[] {
  return typeof value === "string" ? [value] : [...value]
}
```

重载适合“输入形状决定输出形状”的 API；泛型或条件类型有时更能保留关系。

## 5. `this` 参数与箭头函数

```typescript
interface User {
  name: string
}

function greet(this: User, punctuation: string): string {
  return `${this.name}${punctuation}`
}

const user = { name: "Ada", greet }
console.log(user.greet("!"))
```

伪参数 `this` 只用于检查，不进入生成的 JavaScript 参数列表。箭头函数捕获词法 `this`，普通函数的 `this` 由调用形式决定。将方法作为回调裸传递常会丢失接收者，可用 `.bind` 或箭头包装。

## 6. 回调返回 `void` 的特殊规则

目标回调类型 `() => void` 表示调用方忽略返回值，并不要求实现绝对不返回值：

```typescript
const values: number[] = []
const pushValue: (value: number) => void = (value) => values.push(value)
```

但显式声明为 `function f(): void` 的函数体不能返回具体值。这两种情境要区分。

## 7. 泛型函数应保留关系

```typescript
function first<T>(items: readonly T[]): T | undefined {
  return items[0]
}

function mapValue<T, U>(value: T, transform: (input: T) => U): U {
  return transform(value)
}
```

若类型参数只出现一次，往往没有建立关系，可能无需泛型：

```typescript
// 不必写 function log<T>(value: T): void
function log(value: unknown): void {
  console.log(value)
}
```

## 8. 变型与回调安全直觉

开启 `strictFunctionTypes` 后，普通函数属性的参数更严格地按逆变方向检查；方法语法为兼容既有 JavaScript 模式保留更宽松行为。API 若依赖精确回调安全，优先使用函数属性并通过测试验证边界。

```typescript
type Animal = { name: string }
type Dog = Animal & { bark(): void }

type Handler<T> = (value: T) => void

const dogOnly: Handler<Dog> = (dog) => dog.bark()
// const animalHandler: Handler<Animal> = dogOnly
// 不安全：调用方可能传入没有 bark 的 Animal
```

参考：[More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html)、[Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)。

