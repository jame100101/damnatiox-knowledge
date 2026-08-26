# TypeScript 独有能力与缺失能力清单

本清单从 TypeScript 视角集中回答“它特别擅长什么、它本身没有什么”。“没有”不等于生态做不到，而是需要 JavaScript host、库、构建器或不同语言机制完成。

## 1. TypeScript 特别独有/突出的能力

### 1.1 为现有 JavaScript 形状建立结构类型

无需要求运行时对象继承统一基类，即可描述对象、函数、构造器、模块与全局变量。这是 TypeScript 适配 JS 生态的核心。

### 1.2 类型查询与属性级计算

```typescript
const routes = {
  home: "/",
  users: "/users",
} as const

type RouteName = keyof typeof routes
type RoutePath = (typeof routes)[RouteName]
```

`keyof`、索引访问、映射类型、键重映射能从对象契约机械派生 API。

### 1.3 模板字面量类型

```typescript
type Resource = "user" | "order"
type Operation = "read" | "write"
type Permission = `${Resource}:${Operation}`
```

这类字符串模式类型在 Java、Python typing、C++ 中没有完全同构的日常机制。

### 1.4 条件类型与联合分布

可在类型层按可赋值关系选择结果，并对联合逐项变换，适合高度通用的库 API。

### 1.5 `.d.ts` 描述未用 TypeScript 编写的库

声明文件可以在不修改 JavaScript 实现的前提下提供静态契约、自动补全和跨模块类型传播。

### 1.6 渐进边界

同一项目可同时容纳 `.js`、JSDoc 检查、`.ts`、严格模块和临时 `any` 隔离层，适合大型 JavaScript 迁移。

## 2. TypeScript 本身没有的运行时能力

| 缺失项 | 实际由谁提供 |
| --- | --- |
| 执行引擎 | 浏览器、Node.js、Deno、Bun 等 JavaScript host |
| 文件、网络、进程 API | host API |
| 运行时 schema 校验 | 手写解析器或验证库 |
| 深不可变 | 数据结构策略、拷贝/冻结库 |
| 数据库驱动 | npm 包/平台 SDK |
| UI 渲染 | DOM/框架/native bridge |
| 线程与调度器抽象 | Worker、host、库 |

## 3. 相比 Java 缺失或不同的能力

- 没有 JVM、类加载器、Java 字节码与相同的运行时反射生态。
- 没有固定位宽的整型 primitive 集合。
- 没有受检异常。
- 接口默认不是运行时值，也不建立名义实现身份。
- 没有 Java 线程/锁/内存模型作为 TypeScript 语言自身的一部分。

## 4. 相比 Python 缺失或不同的能力

- 类型注解通常不会作为普通运行时对象保留供反射。
- 没有 Python 元类、描述符与 `__dunder__` 数据模型。
- 没有由语言自身统一提供的文件、进程、数据科学标准库；取决于 JS host 和 npm。
- 没有 Python 式同步/异步上下文管理器语法模型的完全等价物，虽然现代 JS 有显式资源管理协议。

## 5. 相比 C++ 缺失或不同的能力

- 没有确定性析构、一般化 RAII 和对象值生命周期控制。
- 没有指针算术、自定义对象布局、栈/堆选择与 allocator 控制。
- 没有模板实例化生成专用本机代码、非类型模板参数和相同的 constexpr 模型。
- 没有运算符重载、多继承实现、ABI 与硬件级内存序控制。

## 6. 相比 JavaScript “没有”的内容是误命题

TypeScript 运行时就是 JavaScript，所以它不会替代 JS 的闭包、原型、Promise、模块和类型转换规则。TypeScript 可能拒绝某些 JS 程序，或用声明描述动态模式，但生成结果仍服从 JavaScript。

## 7. 容易被夸大的能力

### “编译通过就类型安全”

不成立。`any`、断言、外部输入、错误 `.d.ts`、有意不健全兼容规则和运行时副作用都可能导致错误。

### “readonly 就不可变”

不成立。它主要限制通过某个静态引用写入，而且通常是浅层。

### “interface 就像 Java interface”

只在描述成员契约这一点相似。TS interface 擦除、结构兼容、可声明合并，运行时无接口对象。

### “泛型和 C++ template 一样”

不成立。TS 泛型通常完全擦除；C++ 模板通常实例化并影响本机代码。

### “类型断言是强制转换”

不成立。`as T` 不改变值；真实转换要调用解析/构造逻辑。

## 8. 选择 TypeScript 的准确理由

选择它，是因为项目运行在 JavaScript 生态，同时需要大规模重构、跨模块契约、编辑器反馈和对动态对象模式的精确建模。若需求核心是确定性资源生命周期、JVM 平台整合、Python 数据生态或硬件级控制，应把运行时与生态要求放在语法偏好之前。

## 9. 最终自测

- [ ] 能解释一个 interface 为何不能用于 `instanceof`。
- [ ] 能展示 `as` 不改变 JSON 值。
- [ ] 能区分 `readonly` 与运行时冻结。
- [ ] 能解释 TS/Java 泛型擦除的共同点与对象模型差异。
- [ ] 能解释 Python 注解为何“运行时可见但默认不强制”。
- [ ] 能解释 C++ 模板为什么可能增加二进制代码，而 TS 泛型不会。
- [ ] 能为浏览器、Node、JVM、Python、native 场景选择正确运行时，而不是只比较语法。

