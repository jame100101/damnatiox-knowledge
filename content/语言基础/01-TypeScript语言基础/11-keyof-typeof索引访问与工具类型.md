# keyof、typeof、索引访问与标准工具类型

类型操作符用于从已有契约推导新契约，减少并行维护。它们只在类型空间计算，不会遍历运行时对象。

## 1. `keyof`

```typescript
type User = {
  id: string
  age: number
}

type UserKey = keyof User // "id" | "age"

function read<T extends object, K extends keyof T>(target: T, key: K): T[K] {
  return target[key]
}
```

若类型具有字符串索引签名，`keyof` 可能包含 `string | number`，因为 JavaScript 对象数值键会转为字符串。

## 2. 类型位置的 `typeof`

```typescript
const defaults = {
  retry: 3,
  mode: "safe",
} as const

type Defaults = typeof defaults
type Mode = Defaults["mode"] // "safe"
```

类型 `typeof` 查询一个值的静态类型；运行时 `typeof value` 返回字符串标签，二者语法相同但发生阶段不同。

## 3. 索引访问类型

```typescript
type ApiResponse = {
  data: Array<{ id: string; title: string }>
}

type Row = ApiResponse["data"][number]
type RowId = Row["id"]
```

`T[number]` 取得数组/元组所有元素类型的联合。

## 4. 常用工具类型分类

### 属性变换

```typescript
type DraftUser = Partial<User>
type CompleteUser = Required<DraftUser>
type PublicUser = Readonly<Pick<User, "id" | "age">>
type WithoutAge = Omit<User, "age">
type UserMap = Record<string, User>
```

### 联合过滤

```typescript
type Value = string | number | null | undefined
type Present = NonNullable<Value>        // string | number
type Text = Extract<Value, string>       // string
type NonText = Exclude<Value, string>    // number | null | undefined
```

### 函数与构造器

```typescript
function load(id: string, refresh = false) {
  return Promise.resolve({ id, refresh })
}

type LoadArgs = Parameters<typeof load>
type LoadPromise = ReturnType<typeof load>
type Loaded = Awaited<LoadPromise>
```

`ReturnType` 对重载函数只保留最后一个签名的推导视角，不能自动得到所有重载返回联合。

## 5. `NoInfer`

当某参数应被检查但不应参与类型参数推断时，可用 `NoInfer<T>`：

```typescript
function choose<C extends string>(
  options: readonly C[],
  defaultValue?: NoInfer<C>,
): C {
  return defaultValue ?? options[0]!
}

choose(["red", "yellow", "green"] as const, "red")
// choose([...], "blue") // blue 不应扩宽 C
```

## 6. 工具类型是浅层的

`Readonly<User>` 只把第一层属性标成只读；`Partial<User>` 也只让第一层属性可选。需要递归版本时必须定义清楚数组、函数、集合和内建对象的行为，避免一个万能 `DeepPartial` 在不同领域产生错误语义。

## 7. 从值生成类型，而非重复抄写

```typescript
const roles = ["reader", "editor", "admin"] as const
type Role = (typeof roles)[number]

function isRole(value: string): value is Role {
  return (roles as readonly string[]).includes(value)
}
```

这里运行时白名单和类型来自同一来源，减少漂移。若只写 `type Role = ...`，运行时仍需要另一份数据。

## 8. 可读性边界

导出的公共类型应有业务名称。把五层工具类型直接写在函数参数上会让错误信息和文档难读；可先定义中间别名，并为类型级逻辑写编译期断言测试。

参考：[Keyof](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html)、[Typeof](https://www.typescriptlang.org/docs/handbook/2/typeof-types.html)、[Indexed Access](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)、[Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)。

