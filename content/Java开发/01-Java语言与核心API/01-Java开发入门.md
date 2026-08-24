# Java 开发入门：平台、JDK、编译运行与开发环境

> 课件来源：《第1章 Java开发入门.pptx》。本文逐项覆盖课件目录，并依据 Java SE 26、JDK 25 LTS 及相关官方文档补充现代工程实践。

这一章回答“Java 程序从源文件到运行结果经历了什么”。理解 JDK、JVM、字节码、类路径和工具链，比记住 IDE 菜单更重要。

## 1. 学习目标

- 区分 Java 语言、Java SE 平台、JDK、JVM 与具体发行版。
- 能从命令行完成编译、运行、打包、查看字节码和诊断版本。
- 理解 PATH、类路径和模块路径的边界。
- 建立可复现的 JDK 版本与项目目录约定。

## 2. 知识结构

```mermaid
flowchart LR
  A["Main.java 源码"] --> B["javac 编译"]
  B --> C["Main.class 字节码"]
  C --> D["类加载、验证与链接"]
  D --> E["解释执行 / JIT 编译"]
  E --> F["操作系统与硬件"]
```

## 3. 逐项详解

### 1. Java 平台与“一次编译，到处运行”

Java 源码由 `javac` 编译为 class 文件中的 JVM 字节码，再由目标机器上的 JVM 验证、链接并执行。可移植性来自统一的 class 文件格式和 Java SE API，而不是同一个本地机器码文件直接跨系统运行。

**工程理解：** 兼容性仍受 JDK 版本、第三方本地库、默认字符集、文件系统和时区影响；生产环境应固定运行时版本并在目标镜像中测试。

**常见误区：** 把 Java 语言、Oracle JDK、OpenJDK 和 JVM 当成同一个概念，或者认为字节码完全消除了平台差异。

### 2. JDK、JRE、JVM 与发行版

JVM 执行字节码；Java SE 定义语言和标准 API；JDK 在运行时之外提供 `javac`、`jar`、`javadoc`、`jcmd`、`jfr` 等开发诊断工具。现代 JDK 发行版通常已经包含完整运行时，不再以旧式独立 JRE 作为学习中心。

**工程理解：** 团队选择一个经过支持的发行版并固定大版本、补丁版本和 CPU 架构；构建机与生产镜像至少保证目标字节码和运行时兼容。

**常见误区：** 只记“JDK 包含 JRE”这句旧教材表述，却不了解模块化运行时、供应商支持周期和 `--release` 的作用。

### 3. 版本选择：JDK 25 LTS 与 JDK 26

截至 2026 年 7 月，JDK 26 是最新功能版本，JDK 25 是最新 LTS。学习和长期项目可优先使用 JDK 25 LTS；需要验证 HTTP/3 Client 等 JDK 26 特性时再建立独立实验分支。

**工程理解：** 生产升级要阅读 migration guide、扫描废弃 API、运行完整测试并观察 GC、启动时间和依赖兼容性。

**常见误区：** 把“最新版本”与“最适合长期生产维护的版本”混为一谈，或直接在核心项目启用 preview 特性。

### 4. 安装与目录

JDK 目录包含 `bin` 工具、`lib` 实现资源、`jmods` 模块文件和法律信息。`JAVA_HOME` 通常指向 JDK 根目录，PATH 追加其 `bin`；具体项目应由 Maven Toolchains、Gradle Toolchains 或 CI 镜像锁定版本。

**工程理解：** 执行 `java -version`、`javac -version` 和 `where java`/`which java`，确认终端实际使用的工具链。

**常见误区：** IDE 使用一个 JDK，终端和 CI 使用另一个 JDK，最终出现“本机通过、流水线失败”。

### 5. 第一个程序与入口方法

`public static void main(String[] args)` 是传统应用入口；类名、文件名和包结构必须符合规则。JDK 25 还正式提供紧凑源文件与实例 main 方法用于入门和脚本式程序，但大型项目仍应保持清晰包结构。

**工程理解：** 理解编译单元、全限定类名与包目录后，再让 IDE 自动生成项目，才能定位类加载和打包错误。

**常见误区：** 只会点 IDE 的运行按钮，不知道它背后传入的 classpath、主类和 JVM 参数。

### 6. 编译、运行和 class 文件

`javac -d out src/.../Main.java` 产生 class 文件，`java -cp out package.Main` 启动 JVM。`javap -c -p` 可查看字段、方法和字节码，帮助理解重载、装箱、字符串拼接与编译器生成代码。

**工程理解：** 构建系统负责增量编译、依赖解析、测试和打包；命令行练习用于建立正确心智模型。

**常见误区：** 把 classpath 当作源码目录，或把 jar 文件复制到任意位置后期待 JVM 自动发现。

### 7. PATH、CLASSPATH 与模块路径

PATH 用于让操作系统找到 `java` 等可执行文件；classpath 用于让类加载器找到类和资源；module-path 服务于 JPMS 模块。现代项目一般由构建工具生成 classpath，少用全局 `CLASSPATH` 环境变量。

**工程理解：** 依赖应声明在 `pom.xml` 或 `build.gradle(.kts)`，避免机器级隐式配置。

**常见误区：** 把 PATH 和 classpath 互换，或者把依赖冲突归因于“JDK 没装好”。

### 8. IDEA 项目与调试

IDEA 的 Project SDK、语言级别、模块依赖和运行配置分别控制不同层面。断点调试应掌握 step over、step into、条件断点、异常断点、变量求值和线程视图。

**工程理解：** 项目配置以构建文件为真实来源，IDE 负责导入；不要只在 IDE 模块设置中手工添加依赖。

**常见误区：** 提交 `.idea` 中的个人路径和临时运行配置，或用“Invalidate Caches”代替理解依赖问题。

## 3.9 最小命令行闭环

```bash
javac --release 25 -d out src/com/example/Main.java
java -cp out com.example.Main
javap -classpath out -c -p com.example.Main
jar --create --file app.jar --main-class com.example.Main -C out .
java -jar app.jar
```


## 4. 现代 Java 校准

- JDK 26 已在 2026-03-17 发布；JDK 25 是当前最新 LTS。
- Applet API 已在 JDK 26 移除；JSP/Applet 不属于现代 Java 后端学习主线。
- 全局 `CLASSPATH` 不适合作为项目依赖管理方案。
- 实验 preview 特性时必须同时在编译和运行阶段使用 `--enable-preview`，并隔离于长期维护代码。

## 5. 实践任务

1. 不用 IDE 编译一个带 package 的两类程序，并打成可执行 jar。
2. 故意配置错误 PATH、classpath 和主类名，记录三种错误消息的差异。
3. 使用 `javap` 对比普通字符串拼接和循环中的 `StringBuilder` 字节码。

## 6. 掌握检查

- [ ] 能解释源码、字节码、JVM 与本地机器码的关系。
- [ ] 能说明 JDK 25 LTS 和 JDK 26 的选择依据。
- [ ] 能独立定位 IDE、终端和 CI 使用不同 JDK 的问题。
- [ ] 能从命令行完成 compile → run → package → inspect。

## 参考资料

- [Java SE 26 API](https://docs.oracle.com/en/java/javase/26/docs/api/)
- [Oracle Java Downloads](https://www.oracle.com/java/technologies/downloads/)
- [OpenJDK JDK 25](https://openjdk.org/projects/jdk/25/)
- [JDK 26 Release Notes](https://www.oracle.com/java/technologies/javase/26-relnotes.html)
- [Dev.java Learn](https://dev.java/learn/)
