# TypeScript 与 JavaScript：增加了什么、没有改变什么

TypeScript 是 JavaScript 的带类型超集和工具层。任何有效 JavaScript 在迁移策略允许时通常可以逐步进入 TypeScript，但 TypeScript 新语法并不都属于 ECMAScript。

## 1. TypeScript 增加的主要能力

### 静态类型标注与推断

```typescript
function total(prices: readonly number[]): number {
  return prices.reduce((sum, price) => sum + price, 0)
}
```

JavaScript 同一函数只有运行时行为，编辑器可依赖 JSDoc/推断提供部分检查，但没有 `.ts` 中完整的类型语法与配置门禁。

### 结构化契约

```typescript
interface HasId {
  id: string
}

function indexById<T extends HasId>(items: readonly T[]): Map<string, T> {
  return new Map(items.map((item) => [item.id, item]))
}
```

### 联合、收窄和穷尽检查

```typescript
type Event =
  | { type: "open"; path: string }
  | { type: "close"; code: number }
```

### 类型级编程

`keyof`、索引访问、映射类型、条件类型、模板字面量类型、`infer` 和标准工具类型只服务检查器。

### 声明文件

`.d.ts` 可以为 JavaScript 库描述公共 API，形成跨包的静态契约和编辑器体验。

## 2. TypeScript 没有改变的 JavaScript 事实

- `number` 仍主要是 IEEE 754 双精度数，不会变成 Java `int`。
- 对象仍通过原型链继承，类是该模型上的语法。
- `===`、闭包、提升、事件循环、Promise 和模块运行规则仍是 JavaScript。
- `typeof null` 仍为 `"object"`。
- 数组仍可变且运行时不记元素泛型。
- 类型断言、`readonly`、接口和类型别名不会自动验证/冻结值。

```typescript
const value = JSON.parse('{"count":"3"}') as { count: number }
console.log(value.count + 1) // 运行得到 "31"
```

## 3. TypeScript 独有而 JavaScript 没有的语法

| 类别 | 例子 | 是否通常进入 JS 产物 |
| --- | --- | --- |
| 纯类型 | `interface`, `type`, `T`, `keyof`, `as` | 否 |
| 类修饰 | `public/private/protected`, `abstract`, `implements` | 大部分擦除，参数属性等可产生代码 |
| 类型导入 | `import type` | 否 |
| TS enum/namespace | `enum`, `namespace` | 通常是 |
| 声明 | `declare`, `.d.ts` | 否 |

现代 Node 的类型剥离或第三方快速转换器可能只支持“可擦除语法”；使用 enum、namespace、参数属性等前核对工具支持。

## 4. JavaScript 有而 TypeScript 不会消除的动态能力

```javascript
const key = Math.random() > 0.5 ? "left" : "right"
const object = {}
object[key] = 1
```

TypeScript 可以用索引签名/联合描述动态属性，但若 key 来自任意输入，精确静态建模可能变得宽泛。Proxy、动态原型修改、反射和 `eval` 也会削弱静态可知性。

## 5. 渐进迁移差异

```json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "strict": true,
    "noEmit": true
  }
}
```

迁移不是“改后缀后用 `any` 清零”。正确顺序是：启用 JS 检查、补边界 JSDoc、从纯模块迁移、把外部输入改为 `unknown`、最后逐步收紧配置。

## 6. 选择建议

- 小型一次性脚本、无构建浏览器示例：JavaScript 足够直接。
- 长期维护、多人协作、公共库、复杂状态和重构频繁：TypeScript 的静态契约收益明显。
- 即使使用 TypeScript，也必须学习 JavaScript；运行时问题只能靠理解 JS 解决。

参考：[TypeScript for JavaScript Programmers](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)、[MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)、[MDN Data Types](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures)。

