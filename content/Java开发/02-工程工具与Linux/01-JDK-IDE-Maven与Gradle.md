# JDK、IDE、Maven 与 Gradle：可复现 Java 构建

本章把 JDK toolchain、IDE 导入、Maven 生命周期/依赖机制和 Gradle 任务图连成一条可复现构建链。

## 1. 本文覆盖范围

- JDK 25 LTS 与 JDK 26 的版本策略
- IDEA Project SDK、language level、模块和运行配置
- Maven POM、生命周期、scope、BOM、多模块与私服
- Gradle task、configuration、toolchain、version catalog 与多项目

## 2. 核心知识详解

### 1. 工具链与目标字节码

项目必须同时定义用于编译的 JDK、语言级别和目标 class 文件版本。Maven Compiler Plugin 的 `release` 与 Gradle Java Toolchains 能避免“编译机 API 太新、生产运行时太旧”。

- 构建记录 `java -version`、操作系统、架构和依赖锁定信息。
- preview 特性需要编译、测试、运行阶段一致启用，并与长期维护模块隔离。
- IDE 只导入构建模型，不作为依赖版本的唯一真实来源。

**正确性边界：** `source/target` 只限制语法和字节码时可能仍错误引用新 API，`--release` 同时约束标准 API 视图。

### 2. Maven 生命周期与坐标

Maven 按 validate、compile、test、package、verify、install、deploy 生命周期阶段执行绑定插件。依赖坐标由 groupId/artifactId/version/classifier/type 识别，scope 决定编译、测试和运行可见性。

- 使用 dependencyManagement/BOM 统一版本，真正使用仍需 dependencies 声明。
- 多模块 reactor 按模块依赖拓扑构建，parent POM 与 aggregator 可以重合也可以分离。
- 用 dependency:tree、dependency:analyze 和 Enforcer 定位冲突与未声明依赖。

**正确性边界：** Maven 的“nearest definition”版本仲裁不等于选择最新版本；关键依赖应显式受 BOM/management 控制。

### 3. Gradle 任务图与依赖管理

Gradle 配置阶段构造 task graph，执行阶段运行需要的任务。Java 插件建立标准 source set；configuration 决定依赖暴露边界，`implementation` 不向消费者泄漏。

- 版本目录和 platform 集中版本，dependency locking 提高重现性。
- 多项目通过声明 project dependency 建立构建顺序，避免跨项目直接读写任务内部状态。
- 配置缓存、构建缓存和增量任务要求准确声明 inputs/outputs。

**正确性边界：** Gradle 动态版本和 SNAPSHOT 会削弱可复现性；生产构建锁定版本和校验依赖来源。

### 4. 依赖供应链与私服

依赖解析不仅是“下载 jar”，还涉及仓库优先级、校验和、签名、许可证、漏洞和传递依赖。企业私服可代理公共仓库并托管内部构件。

- 减少仓库数量，避免把不可信仓库放在公共坐标前。
- 生成 SBOM，运行 SCA，设定升级和 CVE 响应流程。
- 构建产物带 commit、版本和 provenance，可从制品回溯源码。

**正确性边界：** 锁版本只解决漂移，不证明依赖可信；仍需来源、哈希、审计和发布权限控制。

## 3. 工程链路

```mermaid
flowchart LR
  A["源码 + 构建声明"] --> B["固定 JDK Toolchain"]
  B --> C["解析并校验依赖"]
  C --> D["compile / test / verify"]
  D --> E["可重复制品 + SBOM"]
  E --> F["制品仓库"]
```

## 4. 最小可运行示例

下面的示例只保留关键路径。把它放入对应版本的最小工程，先运行测试或命令确认行为，再逐步加入重试、超时、监控和异常分支。

```xml
<properties>
  <maven.compiler.release>25</maven.compiler.release>
  <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
</properties>
<dependencies>
  <dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
    <version>6.0.2</version>
    <scope>test</scope>
  </dependency>
</dependencies>
```

## 5. 实践与验证

1. 创建 Maven 多模块项目，使用 BOM 和 Enforcer 阻止依赖版本漂移。
2. 用 Gradle Toolchains 在本机缺少目标 JDK 时完成编译与测试。
3. 故意引入两个不同版本的日志依赖，分别用 Maven 和 Gradle 解释最终解析结果。

## 6. 掌握检查

- [ ] 能解释 Maven 生命周期与插件 goal 的关系。
- [ ] 能区分 dependencyManagement 与 dependencies。
- [ ] 能说明 Gradle configuration、task 和 source set。
- [ ] 能从干净机器复现同一构建。

## 参考资料

- [Maven Dependency Mechanism](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html)
- [Maven Lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
- [Gradle Java Projects](https://docs.gradle.org/current/userguide/building_java_projects.html)
- [Gradle Dependency Management](https://docs.gradle.org/current/userguide/core_dependency_management.html)
- [Oracle Java Downloads](https://www.oracle.com/java/technologies/downloads/)
