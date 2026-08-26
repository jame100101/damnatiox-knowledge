# 装饰器、JSX、枚举、namespace 与特殊语法边界

这些特性容易受编译目标、框架或历史配置影响。使用前先确认是 ECMAScript 运行语义、现代 TypeScript 支持，还是 legacy 转换。

## 1. 现代装饰器与 legacy 装饰器

TypeScript 5.0 起支持符合较新 ECMAScript 提案语义的装饰器；早期 `experimentalDecorators` 页面描述的是另一套 Stage 2 实现，两者签名、执行细节和元数据生态不同。

```typescript
function loggedMethod<This, Args extends unknown[], Return>(
  original: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
) {
  const methodName = String(context.name)
  return function (this: This, ...args: Args): Return {
    console.log(`enter ${methodName}`)
    return original.call(this, ...args)
  }
}

class Greeter {
  @loggedMethod
  greet(name: string): string {
    return `Hello ${name}`
  }
}
```

框架若依赖 `experimentalDecorators` 与 `emitDecoratorMetadata`，不要直接把现代示例套入。先查框架支持矩阵与迁移指南。

## 2. 装饰器的设计约束

- 装饰器在类定义相关阶段执行，不是每次都由依赖注入容器神秘调用。
- 替换方法必须保持 `this`、参数、返回值和属性描述符语义。
- 元数据不是运行时输入验证。
- 隐式副作用会降低可测试性；能用显式组合函数完成时优先组合。

## 3. JSX / TSX

```tsx
type ButtonProps = {
  label: string
  disabled?: boolean
  onClick(): void
}

export function Button(props: ButtonProps) {
  return (
    <button disabled={props.disabled} onClick={props.onClick}>
      {props.label}
    </button>
  )
}
```

`.tsx` 中尖括号会被 JSX 解析占用，因此类型断言统一使用 `as`。JSX 类型来源与转换模式由框架及 `jsx` 配置决定；React、Vue JSX 等并非同一运行时。

## 4. `enum` 的取舍

```typescript
const Status = {
  Draft: "draft",
  Published: "published",
} as const

type Status = (typeof Status)[keyof typeof Status]
```

普通 `enum` 通常生成运行时对象，数值 enum 还可能带反向映射。若只需要封闭字符串集合，上述对象 + 联合方式更接近 JavaScript，并可直接枚举运行时值。确实需要 enum 互操作或命名空间式值时再使用。

`const enum` 可能被内联，在跨包、版本不一致和只做语法转换的工具链中有额外风险。

## 5. `namespace`

```typescript
namespace Geometry {
  export function area(radius: number): number {
    return Math.PI * radius ** 2
  }
}
```

`namespace` 可生成封装对象，也可用于声明合并。现代应用代码通常优先 ESM；命名空间主要见于旧脚本、全局库类型声明和特定增强模式。

## 6. `declare` 与环境声明

```typescript
declare const BUILD_SHA: string
```

`declare` 告诉检查器“运行时由别处提供”，它不创建值。构建器若没有真实注入 `BUILD_SHA`，运行仍会出现 `ReferenceError`。

## 7. `using` 与显式资源管理

现代 JavaScript 支持显式资源管理协议时，TypeScript 可检查 `using`/`await using`。是否能运行取决于目标 host 或转换支持，且资源必须实现约定的 dispose symbol。它与 C++ RAII 有相似目标，但 JS 的对象生命周期和垃圾回收模型仍不同。

## 8. 选择前检查

1. 语法是否产生运行时代码？
2. 所有转换器都支持吗？
3. 目标 Node/浏览器支持生成结果吗？
4. 框架使用现代还是 legacy 装饰器？
5. `.d.ts` 消费者看到的公共 API 是否稳定？

参考：[TypeScript 5.0 Decorators](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#decorators)、[Legacy Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)、[JSX](https://www.typescriptlang.org/docs/handbook/jsx.html)、[Enums](https://www.typescriptlang.org/docs/handbook/enums.html)。

