# TypeScript 与 C++：类型擦除、模板实例化、内存和对象模型

两者都能写类、泛型样式代码，但一个主要描述 JavaScript 应用，另一个直接参与本机对象布局、资源生命周期和代码生成。语法相似处的语义距离很大。

## 1. 编译产物

- TypeScript 通常擦除类型并输出 JavaScript，由浏览器/Node 等 host 执行。
- C++ 编译器把翻译单元生成目标文件，再由链接器形成本机程序或库。
- TS 的 `target` 是 JavaScript 语法输出目标，不是 CPU 架构或 ABI。

## 2. 数值与内存布局

```typescript
type Pixel = { r: number; g: number; b: number }
```

```cpp
#include <cstdint>

struct Pixel {
    std::uint8_t r;
    std::uint8_t g;
    std::uint8_t b;
};
```

TS `number` 不保证 8 位字段，也不定义对象内存布局。需要二进制协议时使用 `ArrayBuffer`、`DataView`/TypedArray 并显式处理端序；C++ 仍要注意 padding、alignment、endianness 与 ABI，不能直接把任意 struct 内存当稳定网络格式。

## 3. 泛型 vs 模板

```typescript
function max<T>(left: T, right: T, compare: (a: T, b: T) => number): T {
  return compare(left, right) >= 0 ? left : right
}
```

```cpp
#include <concepts>

template<std::totally_ordered T>
const T& max_value(const T& left, const T& right) {
    return left < right ? right : left;
}
```

- TS 泛型通常被擦除，运行时只有一个 JS 函数。
- C++ 模板通常按实参实例化，可内联、特化、接受非类型参数，并影响编译时间与二进制大小。
- TS 条件/映射类型生成的是静态类型关系；C++ 模板元编程/`constexpr` 可影响生成本机代码和常量求值。

## 4. 值语义、引用与复制

JavaScript 对象赋值复制引用，primitive 按值；C++ 对象默认有值语义，并有引用、指针、复制/移动构造等明确机制。

```typescript
const left = { count: 1 }
const right = left
right.count += 1
console.log(left.count) // 2
```

在 C++ 中 `auto right = left;` 通常复制对象，`auto& right = left;` 才绑定引用，具体由类型的特殊成员函数决定。

## 5. 资源生命周期

C++ RAII 让栈对象离开作用域时确定性执行析构，适合锁、文件、内存等资源。JavaScript/TypeScript 主要由 GC 管理内存，外部资源通常用 `try/finally`、显式 `close` 或显式资源管理协议。

```typescript
const handle = await openHandle()
try {
  await handle.write(data)
} finally {
  await handle.close()
}
```

GC 只管理可达性相关内存，不保证及时释放文件描述符或事务。

## 6. 继承与多态

- TS/JS 是原型链和动态对象；TS 类型默认结构兼容。
- C++ 类决定布局，可有多继承、虚函数表、静态/动态多态和对象切片等问题。
- TS 交叉类型不是 C++ 多继承；它只描述一个值同时具备多组成员。

## 7. 并发

C++ 标准定义线程、原子和内存序，可直接面对数据竞争与未定义行为。TypeScript 的主线程 JS 代码通常遵循 run-to-completion 事件循环，但 Worker、SharedArrayBuffer 和 Atomics 引入真实并行；Node 原生扩展/底层线程池也影响行为。

## 8. TypeScript 有而 C++ 通常没有的部分

- 与动态 JavaScript 对象和 npm/browser host 的直接互操作。
- 对象键的映射类型、模板字面量类型、开放接口声明合并。
- `undefined`、可选属性和结构化鸭子类型作为主流 API 模型。
- 同一源码跨浏览器和多种 JS host 的生态部署。

## 9. C++ 有而 TypeScript 没有的部分

- 确定性析构、RAII、手动/自定义分配器、裸指针与智能指针。
- 明确对象布局、对齐、值类别、移动语义、操作符重载。
- 模板实例化、概念、非类型模板参数和编译期常量求值。
- 直接生成本机代码、控制 ABI、SIMD 与硬件级并发。
- 语言级未定义行为和相应的内存安全责任；TS 运行时风险类型不同。

参考：[ISO C++ FAQ: Templates](https://isocpp.org/wiki/faq/templates)、[ISO C++ FAQ: RAII](https://isocpp.org/wiki/faq/exceptions)、[TypeScript Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)。

