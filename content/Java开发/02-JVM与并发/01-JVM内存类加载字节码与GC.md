# JVM 内存、类加载、字节码与垃圾收集

JVM 主题把 Java 源码、class 文件、运行时数据区、对象分配、方法执行、JIT 与垃圾收集连接起来。学习目标是能解释和诊断，而不是背诵某个收集器的旧默认参数。

## 1. 学习目标

- 理解 class 文件与类加载生命周期
- 区分堆、栈、方法区语义和本地内存
- 理解可达性、分代假设、停顿与并发收集
- 会用 jcmd/JFR 建立诊断证据

## 2. 核心概念

### 1. class 文件与执行

`javac` 生成包含常量池、字段、方法和字节码指令的 class 文件。JVM 加载、验证、准备、解析和初始化类；解释器先执行热点代码，JIT 可基于运行时信息编译和优化。

**正确边界：** 源代码的一行不一定对应一条字节码；JIT 还可能内联、逃逸分析并去优化。

### 2. 类加载器与初始化

类身份由二进制类名和定义它的类加载器共同确定。父加载委派减少核心类型重复。初始化在首次主动使用时执行 `<clinit>`，失败会影响后续使用。

**正确边界：** “同名 class”不保证是同一类型；插件、应用服务器和热部署常涉及多个加载器。

### 3. 运行时内存

堆通常保存对象；每线程 Java 栈包含栈帧、局部变量和操作数栈；方法区是规范概念，HotSpot 用 Metaspace 等实现类元数据；直接缓冲、线程栈、代码缓存也消耗本地内存。

**正确边界：** 进程内存大于 Java 堆很正常；只看 `-Xmx` 不能解释容器 OOM。

### 4. GC 与诊断

GC 从根集合做可达性分析并回收不可达对象。不同收集器在吞吐、停顿、并发开销和内存余量间权衡。诊断应从 GC 日志、JFR、类直方图、线程和堆转储建立时间线。

**正确边界：** `System.gc()` 是建议且通常不是泄漏修复；高 GC 可能是分配速率、存活集或内存上限问题。

## 3. 运行链路

```mermaid
flowchart LR
  A[".java"] --> B["javac"]
  B --> C["class 字节码"]
  C --> D["加载/验证/链接/初始化"]
  D --> E["解释器"]
  E --> F["热点探测与JIT"]
  F --> G["优化机器码"]
  H["对象分配"] --> I["可达性分析"]
  I --> J["回收/复制/整理"]
```

## 4. 最小示例

```bash
javac --release 25 Demo.java
javap -c -v Demo
jcmd <pid> VM.flags
jcmd <pid> GC.heap_info
jcmd <pid> GC.class_histogram
jcmd <pid> JFR.start name=baseline duration=60s filename=baseline.jfr
```

## 5. 练习与验证

1. 用 javap 比较字符串拼接与循环代码
2. 创建受控内存增长并观察 JFR/类直方图
3. 改变堆上限但保持负载不变，比较吞吐和停顿

## 6. 常见误区

- 把方法区等同于某个永久实现名词
- 只凭一次堆转储断言泄漏
- 未经基准复制旧版本 GC 参数

## 7. 掌握检查

- [ ] 能不用术语堆砌，向初学者解释本主题解决的问题。
- [ ] 能运行示例并观察正常、边界和失败分支。
- [ ] 能说明该能力在完整 Java 后端链路中的位置和替换边界。
- [ ] 能以测试、执行计划、指标或规范条款验证关键结论。

## 参考资料

- [JVM Specification 25](https://docs.oracle.com/javase/specs/jvms/se25/html/)
- [HotSpot GC Tuning Guide](https://docs.oracle.com/en/java/javase/25/gctuning/)
- [JDK Mission Control](https://docs.oracle.com/en/java/javase/25/jmc/)
