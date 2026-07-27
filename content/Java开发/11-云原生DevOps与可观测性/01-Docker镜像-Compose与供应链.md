# Docker：镜像、容器、Compose 与供应链

容器是受隔离和资源限制的进程；镜像应可复现、最小、非 root，并能回溯到源码和依赖。

## 1. 本文覆盖范围

- OCI 镜像与容器
- Java 多阶段构建
- Compose 本地依赖
- SBOM、签名与运行时限制

## 2. 核心知识详解

### 1. 镜像与容器

镜像由只读层和配置组成，容器增加可写层并运行进程。持久数据进入 volume/外部服务，配置和秘密在运行时注入。

- 固定 base image digest 或受控版本。
- 一个主进程正确响应 SIGTERM 并优雅退出。
- 日志写 stdout/stderr，临时文件有配额。

**正确性边界：** 删除 Dockerfile 后续层中的秘密不会从早期层移除；构建秘密使用 BuildKit secret。

### 2. Java 镜像

多阶段构建将编译工具与运行镜像分离，可使用 layered jar、jlink 或 CDS 优化下载与启动，但先保证调试和补丁能力。

- 以非 root 用户运行并使用只读根文件系统。
- 容器内存/CPU 限制纳入 JVM heap、native memory 和线程预算。
- 健康检查与应用 readiness 一致。

**正确性边界：** 只设置 `-Xmx` 未覆盖 metaspace、direct buffer、线程栈和本地库内存。

### 3. Compose

Compose 声明应用、数据库、Redis、broker 的网络、volume、health 和依赖，适合本地及 CI 集成环境。

- depends_on 的启动顺序不等于应用 ready，使用 health/重试。
- 数据卷和网络命名隔离不同项目。
- 示例环境变量提供非生产默认值。

**正确性边界：** Compose 不是生产编排器的完整等价物，仍需在目标平台验证。

### 4. 供应链和运行限制

流水线生成 SBOM、扫描 OS/JAR 依赖、签名镜像并记录 provenance；运行时限制 capability、seccomp、网络和文件系统。

- 镜像按不可变 digest 部署。
- 漏洞有例外、所有者和修复期限。
- registry 权限区分推送、发布和拉取。

**正确性边界：** 没有已知 CVE 不代表镜像安全，仍需最小权限、配置和运行时检测。

## 3. 工程链路

```mermaid
flowchart LR
  A["源码 + Lock"] --> B["Builder Stage"]
  B --> C["测试"]
  C --> D["最小 Runtime Image"]
  D --> E["SBOM/Scan/Sign"]
  E --> F["Registry Digest"]
  F --> G["受限容器运行"]
```

## 4. 实践与验证

1. 为 Spring Boot 服务写多阶段、非 root、只读根镜像。
2. 用 Compose 启动数据库和 Redis 并等待 readiness。
3. 生成 SBOM，验证镜像 digest 与 commit 关联。

## 5. 掌握检查

- [ ] 能解释镜像层。
- [ ] 能预算容器 JVM 内存。
- [ ] 能写健康依赖。
- [ ] 能建立镜像供应链证据。

## 参考资料

- [Docker Documentation](https://docs.docker.com/)
- [OCI Image Specification](https://github.com/opencontainers/image-spec)
- [Spring Boot Container Images](https://docs.spring.io/spring-boot/reference/packaging/container-images/)
